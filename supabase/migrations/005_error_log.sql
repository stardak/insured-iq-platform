-- ============================================================
-- 005_error_log.sql
-- Error log table for the super admin system page
-- ============================================================

create table public.error_logs (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'error',
  message    text not null,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_error_logs_created_at on public.error_logs(created_at desc);
create index idx_error_logs_type on public.error_logs(type);

-- RLS — only service role should access this table
alter table public.error_logs enable row level security;

-- Super admins can read all error logs
create policy "error_logs_select_super_admin"
  on public.error_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Allow inserts from any authenticated user (for logging errors)
create policy "error_logs_insert_any"
  on public.error_logs for insert
  to authenticated
  with check (true);
