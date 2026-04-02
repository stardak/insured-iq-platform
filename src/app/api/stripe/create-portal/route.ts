import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/stripe/create-portal
 *
 * Creates a Stripe Billing Portal session so the tenant owner can
 * manage their subscription (update payment method, change plan, cancel).
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

    // 3. Get Stripe Customer ID
    const { data: tenant } = await admin
      .from("tenants")
      .select("stripe_customer_id")
      .eq("id", profile.tenant_id)
      .single();

    if (!tenant?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first.", code: "NO_CUSTOMER" },
        { status: 400 }
      );
    }

    // 4. Create portal session
    const origin = request.headers.get("origin") || "http://localhost:3001";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Portal session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session", code: "PORTAL_ERROR" },
      { status: 500 }
    );
  }
}
