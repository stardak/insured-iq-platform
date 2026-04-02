/**
 * SaaS plan definitions for Insured IQ.
 * Stripe Price IDs are read from environment variables.
 * In development, these can be left empty — the billing page will
 * still render with plan info from the database.
 */

export type PlanTier = "free" | "pro" | "enterprise";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number; // in GBP
  features: string[];
  stripePriceId: string | undefined;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    description: "Get started with basic features",
    monthlyPrice: 0,
    features: [
      "1 product type",
      "Up to 50 customers",
      "Basic branding",
      "Email support",
    ],
    stripePriceId: undefined, // No charge
  },
  pro: {
    tier: "pro",
    name: "Pro",
    description: "Everything you need to grow",
    monthlyPrice: 99,
    features: [
      "All 6 product types",
      "Unlimited customers",
      "Custom domain",
      "Full branding control",
      "Priority support",
      "API access",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    description: "For large teams and custom needs",
    monthlyPrice: 299,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "White-glove onboarding",
      "Advanced analytics",
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
};

/**
 * Look up a plan tier from a Stripe Price ID.
 */
export function getPlanFromPriceId(priceId: string): PlanTier {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) {
      return tier as PlanTier;
    }
  }
  return "free";
}
