-- ============================================================
-- 001_initial_schema.sql
-- Core tables + RLS for Insured IQ multi-tenant platform
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- Helper: auto-update updated_at on row modification
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. tenants
-- ============================================================
create table public.tenants (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  custom_domain text,
  plan         text not null default 'free',
  status       text not null default 'active',
  brand_config jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create trigger set_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

-- RLS --
alter table public.tenants enable row level security;

-- Default deny is implicit once RLS is enabled.

-- Authenticated users can read their own tenant.
create policy "tenants_select_own"
  on public.tenants for select
  to authenticated
  using (
    id in (
      select tenant_id from public.profiles
      where id = auth.uid()
    )
  );

-- Only super-admins (role = 'super_admin') can insert tenants.
create policy "tenants_insert_super_admin"
  on public.tenants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Tenant owners can update their own tenant.
create policy "tenants_update_owner"
  on public.tenants for update
  to authenticated
  using (
    id in (
      select tenant_id from public.profiles
      where id = auth.uid() and role in ('super_admin', 'owner')
    )
  )
  with check (
    id in (
      select tenant_id from public.profiles
      where id = auth.uid() and role in ('super_admin', 'owner')
    )
  );

-- Super-admins can read all tenants.
create policy "tenants_select_super_admin"
  on public.tenants for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- ============================================================
-- 2. profiles
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  role         text not null default 'viewer',
  first_name   text,
  last_name    text,
  email        text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_profiles_tenant_id on public.profiles(tenant_id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS --
alter table public.profiles enable row level security;

-- Users can read profiles within their own tenant.
create policy "profiles_select_same_tenant"
  on public.profiles for select
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid()
    )
  );

-- Users can update their own profile.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Owners / super-admins can insert profiles into their tenant.
create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner')
    )
  );

-- Super-admins can read all profiles.
create policy "profiles_select_super_admin"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ============================================================
-- 3. products
-- ============================================================
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  type         text not null,
  enabled      boolean not null default false,
  config       jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,

  constraint products_type_check check (
    type in ('car', 'pet', 'life', 'bike', 'home', 'health')
  ),
  constraint products_tenant_type_unique unique (tenant_id, type)
);

create index idx_products_tenant_id on public.products(tenant_id);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- RLS --
alter table public.products enable row level security;

-- Authenticated users can read products within their tenant.
create policy "products_select_same_tenant"
  on public.products for select
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid()
    )
  );

-- Owners / super-admins can insert products.
create policy "products_insert_admin"
  on public.products for insert
  to authenticated
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner')
    )
  );

-- Owners / super-admins can update products within their tenant.
create policy "products_update_admin"
  on public.products for update
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner')
    )
  )
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner')
    )
  );

-- ============================================================
-- 4. customers
-- ============================================================
create table public.customers (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  email        text not null,
  first_name   text,
  last_name    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index idx_customers_tenant_id on public.customers(tenant_id);
create unique index idx_customers_tenant_email on public.customers(tenant_id, email)
  where deleted_at is null;

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- RLS --
alter table public.customers enable row level security;

-- Tenant users can read customers in their tenant.
create policy "customers_select_same_tenant"
  on public.customers for select
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid()
    )
  );

-- Tenant users with appropriate roles can insert customers.
create policy "customers_insert_tenant_user"
  on public.customers for insert
  to authenticated
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  );

-- Tenant users with appropriate roles can update customers.
create policy "customers_update_tenant_user"
  on public.customers for update
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  )
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  );

-- ============================================================
-- 5. policies
-- ============================================================
create table public.policies (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  customer_id   uuid not null references public.customers(id) on delete cascade,
  product_type  text not null,
  status        text not null default 'draft',
  premium       numeric(12, 2) not null default 0,
  start_date    date,
  end_date      date,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,

  constraint policies_product_type_check check (
    product_type in ('car', 'pet', 'life', 'bike', 'home', 'health')
  ),
  constraint policies_status_check check (
    status in ('draft', 'pending', 'active', 'cancelled', 'expired', 'claimed')
  )
);

create index idx_policies_tenant_id on public.policies(tenant_id);
create index idx_policies_customer_id on public.policies(customer_id);

create trigger set_policies_updated_at
  before update on public.policies
  for each row execute function public.set_updated_at();

-- RLS --
alter table public.policies enable row level security;

-- Tenant users can read policies in their tenant.
create policy "policies_select_same_tenant"
  on public.policies for select
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid()
    )
  );

-- Tenant users with appropriate roles can insert policies.
create policy "policies_insert_tenant_user"
  on public.policies for insert
  to authenticated
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  );

-- Tenant users with appropriate roles can update policies.
create policy "policies_update_tenant_user"
  on public.policies for update
  to authenticated
  using (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  )
  with check (
    tenant_id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin', 'owner', 'sales')
    )
  );
