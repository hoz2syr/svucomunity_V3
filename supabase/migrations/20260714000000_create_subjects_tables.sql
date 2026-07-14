-- Migration: Create subjects feature tables
-- Created: 2026-07-14

-- Table: subject_references
-- Community-submitted references for courses (videos, links, notes)
create table public.subject_references (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('video','reference','link')),
  title text not null,
  url text not null,
  description text,
  created_at timestamptz default now()
);

-- Indexes for subject_references
create index idx_subject_references_course_code on public.subject_references(course_code);
create index idx_subject_references_user_id on public.subject_references(user_id);
create index idx_subject_references_created_at on public.subject_references(created_at desc);

-- Table: user_course_progress
-- Cloud sync for simulator passed/carried state
create table public.user_course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_code text not null,
  status text not null check (status in ('passed','carried')),
  updated_at timestamptz default now(),
  primary key (user_id, course_code)
);

-- Index for user_course_progress
create index idx_user_course_progress_user_id on public.user_course_progress(user_id);

-- Enable RLS on both tables
alter table public.subject_references enable row level security;
alter table public.user_course_progress enable row level security;

-- RLS Policies for subject_references

-- Anyone can view references
create policy "subject_references_select_all"
  on public.subject_references
  for select
  using (true);

-- Authenticated users can insert references (their own)
create policy "subject_references_insert_own"
  on public.subject_references
  for insert
  with check (auth.uid() = user_id);

-- Users can update own references
create policy "subject_references_update_own"
  on public.subject_references
  for update
  using (auth.uid() = user_id);

-- Users can delete own references
create policy "subject_references_delete_own"
  on public.subject_references
  for delete
  using (auth.uid() = user_id);

-- RLS Policies for user_course_progress

-- Users can view own progress
create policy "user_course_progress_select_own"
  on public.user_course_progress
  for select
  using (auth.uid() = user_id);

-- Users can upsert own progress
create policy "user_course_progress_insert_own"
  on public.user_course_progress
  for insert
  with check (auth.uid() = user_id);

-- Users can update own progress
create policy "user_course_progress_update_own"
  on public.user_course_progress
  for update
  using (auth.uid() = user_id);

-- Users can delete own progress
create policy "user_course_progress_delete_own"
  on public.user_course_progress
  for delete
  using (auth.uid() = user_id);
