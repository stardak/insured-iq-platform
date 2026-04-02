-- ============================================================
-- 006_nullable_tenant_for_admins.sql
-- Allow super admins to exist without a tenant
-- ============================================================

-- Make tenant_id nullable on profiles
ALTER TABLE public.profiles
  ALTER COLUMN tenant_id DROP NOT NULL;

-- Super admins with null tenant_id can still read all profiles
-- (The existing profiles_select_super_admin policy already handles this
--  since it checks the caller's role, not their tenant_id.)

-- Super admins with null tenant_id can still read all tenants
-- (The existing tenants_select_super_admin policy already handles this.)
