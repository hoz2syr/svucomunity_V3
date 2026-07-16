-- Migration: Add admin verification RLS policies
-- Created: 2026-07-16
-- Purpose: Allow admins to verify/unverify discovered courses and instructors

-- ============================================================================
-- Add role column to profiles if not exists
-- ============================================================================
alter table public.profiles
  add column if not exists role text default 'user';

-- ============================================================================
-- Indexes for is_verified on discovered tables
-- ============================================================================
create index idx_discovered_courses_is_verified
  on public.discovered_courses (is_verified);

create index idx_discovered_instructors_is_verified
  on public.discovered_instructors (is_verified);

-- ============================================================================
-- RLS Policies for admin updates on discovered_courses
-- ============================================================================
-- Admins can update discovered courses (verification fields)
create policy "Admins update discovered courses"
  on public.discovered_courses
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin updates on discovered_instructors
-- ============================================================================
-- Admins can update discovered instructors (verification fields)
create policy "Admins update discovered instructors"
  on public.discovered_instructors
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
