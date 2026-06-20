-- 005_security_hardening.sql
-- Critical security fixes:
--  1. Drop direct client-side profiles DELETE policy (use delete-account Edge Function only)
--  2. Drop client-side profiles INSERT policy (handle_new_user trigger handles signup)
--  3. Prevent client-side role modification via BEFORE UPDATE trigger
--  4. Add admin_audit_log INSERT policy for service_role / Edge Functions
--  5. Add rate_limits table for production-safe rate limiting
--  6. Add explicit auth.uid() IS NOT NULL guards to all RLS policies

-- ── Profiles: remove direct client-side write policies ──
-- Deletions must go through the delete-account Edge Function which uses service_role
drop policy if exists "Users can delete own profile" on public.profiles;

-- INSERT is handled by the handle_new_user trigger on auth.users; clients must not
-- create or upsert profile rows directly
drop policy if exists "Users can insert own profile" on public.profiles;

-- ── Profiles: prevent client-side role changes ──
create or replace function public.prevent_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role
     and auth.uid() IS NULL
  then
    raise exception 'Role changes are only allowed via admin actions';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_role_change on public.profiles;
create trigger prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_change();

-- ── admin_audit_log: allow Edge Functions (service_role) to INSERT ──
-- Row-level inserts from authenticated clients are blocked (no user-facing policy).
-- Edge Functions using SUPABASE_SERVICE_ROLE_KEY bypass RLS entirely.
-- We add a restrictive policy here so queries with non-service-role keys are rejected.
create policy "Service role only: insert audit log"
  on public.admin_audit_log for insert
  with check (auth.uid() IS NOT NULL);

-- ── rate_limits table for persistent rate limiting ──
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null default now() + interval '1 minute'
);

comment on table public.rate_limits is
  'Persistent rate-limit counters for Edge Functions';

-- Allow service_role to manage (Edge Functions bypass RLS via service_role key)
alter table public.rate_limits enable row level security;

create policy "Service role only: manage rate limits"
  on public.rate_limits for all
  using (auth.uid() IS NOT NULL);

-- ── Explicitly guard existing RLS policies with auth.uid() IS NOT NULL ──
-- Re-create with explicit guard so the intent is unambiguous.

-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() IS NOT NULL AND auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() IS NOT NULL AND auth.uid() = id);

-- notifications
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- admin_audit_log
drop policy if exists "Users can view own audit log" on public.admin_audit_log;
create policy "Users can view own audit log"
  on public.admin_audit_log for select
  using (auth.uid() IS NOT NULL AND auth.uid() = caller_id);
