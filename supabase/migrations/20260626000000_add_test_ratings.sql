-- Migration: Add test_ratings table for one-rating-per-user enforcement
-- Created: 2026-06-26

create table if not exists public.test_ratings (
  test_id uuid not null references public.tests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz default now() not null,
  primary key (test_id, user_id)
);

comment on table public.test_ratings is
  'Tracks which users have rated which tests to enforce one rating per user';

alter table public.test_ratings enable row level security;

create policy "Service role only: manage test ratings"
  on public.test_ratings for all
  using (auth.uid() IS NULL);

create policy "Users can insert own rating"
  on public.test_ratings for insert
  with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own rating"
  on public.test_ratings for update
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can view ratings for published tests"
  on public.test_ratings for select
  using (
    auth.uid() IS NOT NULL
    AND exists (select 1 from public.tests where tests.id = test_ratings.test_id and tests.published = true)
  );
