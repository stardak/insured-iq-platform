import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for a tenant to subscribe to a plan.
 * Body: { planTier: "pro" | "enterprise" }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Get tenant context
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "No profile found", code: "NO_PROFILE" },
        { status: 404 }
      );
    }

    if (!["super_admin", "owner"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only owners can manage billing", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 3. Parse body
    const body = await request.json();
    const planTier = body.planTier as PlanTier;

    if (!planTier || !PLANS[planTier]) {
      return NextResponse.json(
        { error: "Invalid plan tier", code: "INVALID_PLAN" },
        { status: 400 }
      );
    }

    const plan = PLANS[planTier];
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: "This plan does not require payment", code: "FREE_PLAN" },
        { status: 400 }
      );
    }

    // 4. Get or create Stripe Customer
    const { data: tenant } = await admin
      .from("tenants")
      .select("id, name, stripe_customer_id")
      .eq("id", profile.tenant_id)
      .single();

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found", code: "TENANT_NOT_FOUND" },
        { status: 404 }
      );
    }

    let stripeCustomerId = tenant.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        email: user.email,
        metadata: {
          tenant_id: tenant.id,
        },
      });

      stripeCustomerId = customer.id;

      await admin
        .from("tenants")
        .update({ stripe_customer_id: customer.id })
        .eq("id", tenant.id);
    }

    // 5. Create checkout session
    const origin = request.headers.get("origin") || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/dashboard/billing?cancelled=true`,
      metadata: {
        tenant_id: tenant.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session", code: "CHECKOUT_ERROR" },
      { status: 500 }
    );
  }
}
