import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlanFromPriceId } from "@/lib/stripe/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

/**
 * Extract the customer ID string from a Subscription's customer field,
 * which can be a string, Customer, or DeletedCustomer.
 */
function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

/**
 * Extract current_period_end from the first subscription item.
 * In Stripe SDK v21+, this lives on items, not the top-level subscription.
 */
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

/**
 * Stripe webhook handler.
 * Verifies the signature, then processes subscription lifecycle events.
 *
 * Events handled:
 * - checkout.session.completed — link Stripe subscription to tenant
 * - customer.subscription.updated — plan changes, renewals, payment failures
 * - customer.subscription.deleted — cancellation
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header", code: "MISSING_SIGNATURE" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured", code: "CONFIG_ERROR" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature", code: "INVALID_SIGNATURE" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription && session.customer) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const customerId = getCustomerId(session.customer);

          // Fetch the subscription to get plan details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const firstItem = subscription.items.data[0];
          const priceId = firstItem?.price?.id ?? "";
          const planTier = getPlanFromPriceId(priceId);

          await admin
            .from("tenants")
            .update({
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              plan: planTier,
              stripe_plan_status: subscription.status,
              current_period_end: getPeriodEnd(subscription),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        const firstItem = subscription.items.data[0];
        const priceId = firstItem?.price?.id ?? "";
        const planTier = getPlanFromPriceId(priceId);

        await admin
          .from("tenants")
          .update({
            plan: planTier,
            stripe_plan_status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: getPeriodEnd(subscription),
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);

        await admin
          .from("tenants")
          .update({
            plan: "free",
            stripe_plan_status: "cancelled",
            stripe_subscription_id: null,
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error processing webhook event ${event.type}:`, message);
    return NextResponse.json(
      { error: "Webhook processing failed", code: "PROCESSING_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
