import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

/**
 * Shared Stripe server-side client.
 * Only use in server actions, API routes, and webhooks — never on the client.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});
