-- ============================================================
-- 004_stripe_fields.sql
-- Add Stripe billing columns to tenants table
-- ============================================================

-- Stripe Customer ID (created when tenant first subscribes)
alter table public.tenants
  add column if not exists stripe_customer_id text unique;

-- Stripe Subscription ID (the active subscription)
alter table public.tenants
  add column if not exists stripe_subscription_id text unique;

-- Subscription status: trialing, active, past_due, cancelled, inactive
alter table public.tenants
  add column if not exists stripe_plan_status text not null default 'inactive';

-- End of the current billing period (for "next billing date")
alter table public.tenants
  add column if not exists current_period_end timestamptz;

-- Index for webhook lookups by stripe_customer_id
create index if not exists idx_tenants_stripe_customer_id
  on public.tenants(stripe_customer_id)
  where stripe_customer_id is not null;
