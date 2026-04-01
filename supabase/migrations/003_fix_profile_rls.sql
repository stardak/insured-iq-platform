-- ============================================================
-- 003_fix_profile_rls.sql
-- Allow users to always read their own profile row directly.
-- Fixes onboarding flow where the self-referencing subquery in
-- profiles_select_same_tenant fails for newly created users.
-- ============================================================

-- Users can always read their own profile row.
-- This does NOT break tenant isolation: it only allows a user
-- to see their own single row, not other profiles in the tenant.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());
