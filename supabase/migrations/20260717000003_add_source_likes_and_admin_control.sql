-- Migration: Add likes system and admin control for subject references
-- Created: 2026-07-17
-- Purpose: Enable heart rating, user edits, and full admin management of sources

-- ============================================================================
-- Add new columns to subject_references
-- ============================================================================
alter table public.subject_references
  add column if not exists likes integer default 0,
  add column if not exists is_approved boolean default true;

-- ============================================================================
-- Create subject_reference_likes table
-- ============================================================================
create table if not exists public.subject_reference_likes (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.subject_references(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(reference_id, user_id)
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================
create index if not exists idx_subject_references_likes
  on public.subject_references(likes desc);
create index if not exists idx_subject_references_is_approved
  on public.subject_references(is_approved);
create index if not exists idx_subject_reference_likes_reference_id
  on public.subject_reference_likes(reference_id);
create index if not exists idx_subject_reference_likes_user_id
  on public.subject_reference_likes(user_id);

-- ============================================================================
-- Enable RLS on likes table
-- ============================================================================
alter table public.subject_reference_likes enable row level security;

-- ============================================================================
-- RLS Policies for subject_reference_likes
-- ============================================================================
drop policy if exists "Anyone can view likes" on public.subject_reference_likes;
create policy "Anyone can view likes"
  on public.subject_reference_likes
  for select
  using (true);

drop policy if exists "Authenticated users can insert own likes" on public.subject_reference_likes;
create policy "Authenticated users can insert own likes"
  on public.subject_reference_likes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on public.subject_reference_likes;
create policy "Users can delete own likes"
  on public.subject_reference_likes
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Admin RLS Policies for subject_references
-- ============================================================================
drop policy if exists "Admins update any reference" on public.subject_references;
create policy "Admins update any reference"
  on public.subject_references
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins delete any reference" on public.subject_references;
create policy "Admins delete any reference"
  on public.subject_references
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
