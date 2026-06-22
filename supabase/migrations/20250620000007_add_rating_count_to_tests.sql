-- supabase/migrations/20250620000007_add_rating_count_to_tests.sql
-- Adds rating_count column for accurate average rating calculation.

alter table public.tests
  add column if not exists rating_count integer not null default 0;

create index if not exists idx_tests_rating_count
  on public.tests (rating_count);
