-- supabase/migrations/20260701000000_create_test_attempts.sql
-- Adds attempt tracking for exam results, aligned with
-- src/features/exam/BACKEND_SCHEMA.md and future PlayTest result persistence.

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null,
  user_id uuid,
  score integer not null,
  total integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz default now() not null
);

create index if not exists idx_test_attempts_test_id
  on public.test_attempts (test_id);

create index if not exists idx_test_attempts_user_id
  on public.test_attempts (user_id);

alter table public.test_attempts enable row level security;

create policy "Users can view own attempts"
  on public.test_attempts for select
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Guests can insert attempts for published tests"
  on public.test_attempts for insert
  with check (auth.uid() IS NOT NULL OR user_id IS NULL);
