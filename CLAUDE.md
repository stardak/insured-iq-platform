# Insured IQ Platform — CLAUDE.md

## What this is
A multi-tenant white-label insurance platform. Brands (our clients) sign up and get their own fully branded insurance company front end — custom domain, logo, colours, fonts — powered by our underwriting backend (IM Insured). Their customers never see Insured IQ branding anywhere.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui (Nova preset, Radix)
- Supabase (Postgres + Auth + Row Level Security + Storage)
- Prisma ORM
- Stripe (SaaS billing for our clients)
- Resend (transactional email)
- Recharts (analytics dashboards)
- Vercel (hosting)

## Architecture

### Multi-tenancy is the foundation of everything
Every database table that contains client or customer data MUST have a tenant_id column. No exceptions. Supabase Row Level Security enforces tenant isolation at the database level. Never query across tenants.

### Three user types
1. Super admin - us (Insured IQ team). Can see all tenants, manage products, payouts, compliance.
2. Tenant user - our client's team members. Scoped entirely to their tenant. Role-based (owner / sales / finance / marketing / viewer).
3. End customer - the tenant's customers. Access only the branded self-service portal for their policies.

### Folder structure
src/
  app/
    (super-admin)/
    (tenant)/
    (customer)/
    api/
  components/
    ui/
    shared/
    super-admin/
    tenant/
    customer/
  lib/
    supabase/
    stripe/
    resend/
  types/
  hooks/

### Auth
- Supabase Auth handles all authentication
- Middleware checks session on every request
- Role is stored on the user profile record in the DB, not in the JWT
- Never trust client-side role claims

### Database conventions
- All tables have: id uuid DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
- Snake case for all column names
- RLS enabled on every table - default deny, explicit allow policies
- Soft deletes: deleted_at timestamptz column

### API routes
- Always validate the session at the start of every route
- Always validate tenant context before any DB operation
- Return consistent error shapes: { error: string, code: string }
- Never expose internal error messages to the client

## Core data models

### tenants
id, name, slug, custom_domain, plan, status, brand_config (jsonb), stripe_customer_id, stripe_subscription_id, stripe_plan_status, current_period_end, created_at

### profiles
id (matches auth.users.id), tenant_id, role, first_name, last_name, email, created_at

### products
id, tenant_id, type (car/pet/life/bike/home/health), enabled, config (jsonb), created_at

### policies
id, tenant_id, customer_id, product_type, status, premium, start_date, end_date, metadata (jsonb)

### customers
id, tenant_id, email, first_name, last_name, created_at

## What NOT to do
- Do not create any UI without checking if a shadcn component already exists for it
- Do not write raw SQL - use Prisma for all queries
- Do not skip RLS policies - every table needs them before it is used
- Do not put business logic in components - it goes in server actions or API routes
- Do not hardcode tenant IDs anywhere
- Do not use any in TypeScript
- Do not commit .env files

## Current build phase
Phase 1 ✅ — Completed:
1. Supabase schema and RLS policies for core tables
2. Auth middleware (session check and tenant routing)
3. Basic tenant dashboard shell with sidebar nav
4. Tenant config page (brand settings)
5. Product toggle page

Phase 2 — In progress:
1. Customer self-service portal shell (`/portal`) ✅
2. Portal login page (`/portal/login`) — separate from tenant auth ✅
3. Branded portal layout using tenant `brand_config` (zero Insured IQ branding) ✅
4. Policies list page with placeholder data ✅
5. Stripe SaaS billing — migration, webhook, checkout, billing page ✅
6. Tenant billing management page (`/dashboard/billing`) ✅
7. Analytics dashboard with KPIs and charts (`/dashboard/analytics`) ✅
8. Public customer quoting flow — branded landing pages at `/{slug}` and `/{slug}/{product}`
