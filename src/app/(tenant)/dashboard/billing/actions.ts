"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanTier } from "@/lib/stripe/plans";

export interface BillingInfo {
  plan: PlanTier;
  planName: string;
  planStatus: string;
  monthlyPrice: number;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  hasSubscription: boolean;
  features: string[];
}

export async function getBillingInfo(): Promise<{
  data: BillingInfo | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { data: null, error: "No profile found" };
  }

  // Try to fetch with Stripe columns; fall back to basic query if migration not applied yet
  let tenantData: {
    plan: string;
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    stripe_plan_status?: string | null;
    current_period_end?: string | null;
  } | null = null;

  const { data: tenant, error } = await admin
    .from("tenants")
    .select("plan, stripe_customer_id, stripe_subscription_id, stripe_plan_status, current_period_end")
    .eq("id", profile.tenant_id)
    .single();

  if (error && error.message.includes("does not exist")) {
    // Stripe columns not applied yet — fall back to just plan
    const { data: basicTenant, error: basicError } = await admin
      .from("tenants")
      .select("plan")
      .eq("id", profile.tenant_id)
      .single();

    if (basicError || !basicTenant) {
      return { data: null, error: basicError?.message ?? "Tenant not found" };
    }
    tenantData = { plan: basicTenant.plan };
  } else if (error || !tenant) {
    return { data: null, error: error?.message ?? "Tenant not found" };
  } else {
    tenantData = tenant;
  }

  const planTier = (tenantData.plan as PlanTier) || "free";
  const planDef = PLANS[planTier] ?? PLANS.free;

  return {
    data: {
      plan: planTier,
      planName: planDef.name,
      planStatus: tenantData.stripe_plan_status || "inactive",
      monthlyPrice: planDef.monthlyPrice,
      currentPeriodEnd: tenantData.current_period_end ?? null,
      hasStripeCustomer: !!tenantData.stripe_customer_id,
      hasSubscription: !!tenantData.stripe_subscription_id,
      features: planDef.features,
    },
    error: null,
  };
}
