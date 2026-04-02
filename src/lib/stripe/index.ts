import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Shared Stripe server-side client (lazy-initialised).
 * Only use in server actions, API routes, and webhooks — never on the client.
 * Lazy init avoids crashing the build when STRIPE_SECRET_KEY isn't set yet.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead — kept for backward compat */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
