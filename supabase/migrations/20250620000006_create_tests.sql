-- supabase/migrations/006_create_tests.sql
-- Adds the tests table for the exam feature, aligned with
-- src/features/exam/src/services/exam.supabase.ts and BACKEND_SCHEMA.md.

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  settings jsonb not null default '{}',
  questions jsonb not null default '[]',
  rating integer,
  published boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_tests_user_id
  on public.tests (user_id);

create index if not exists idx_tests_published
  on public.tests (published)
  where published = true;

alter table public.tests enable row level security;

create policy "Users can view own tests"
  on public.tests for select
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Public can view published tests"
  on public.tests for select
  using (published = true);

create policy "Users can insert own tests"
  on public.tests for insert
  with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own tests"
  on public.tests for update
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own tests"
  on public.tests for delete
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);
