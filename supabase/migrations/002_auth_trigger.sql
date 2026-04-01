-- ============================================================
-- 002_auth_trigger.sql
-- Auto-create profile + placeholder tenant on user sign-up
-- ============================================================

-- ============================================================
-- 1. Function: handle_new_user
--    Runs after a row is inserted into auth.users.
--    Creates a placeholder tenant and an owner profile.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  placeholder_tenant_id uuid;
begin
  -- Create a placeholder tenant for the new user
  insert into public.tenants (name, slug, status)
  values (
    'Onboarding',
    'onboarding-' || left(new.id::text, 8),
    'active'
  )
  returning id into placeholder_tenant_id;

  -- Create the user profile with role 'owner'
  insert into public.profiles (id, tenant_id, role, email)
  values (
    new.id,
    placeholder_tenant_id,
    'owner',
    new.email
  );

  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 2. Trigger: on_auth_user_created
-- ============================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. Additional RLS policies for the onboarding flow
-- ============================================================

-- Allow authenticated users to insert a tenant (for onboarding)
create policy "tenants_insert_onboarding"
  on public.tenants for insert
  to authenticated
  with check (true);

-- Allow authenticated users to delete their own placeholder tenant
create policy "tenants_delete_placeholder"
  on public.tenants for delete
  to authenticated
  using (
    id in (
      select p.tenant_id from public.profiles p
      where p.id = auth.uid() and p.role = 'owner'
    )
    and name = 'Onboarding'
  );

-- Allow the trigger function to insert profiles (via service role)
-- The handle_new_user function runs as SECURITY DEFINER so it
-- bypasses RLS, but we also need authenticated users to be able
-- to read their own profile during onboarding.
-- (The existing profiles_select_same_tenant policy already covers this.)
