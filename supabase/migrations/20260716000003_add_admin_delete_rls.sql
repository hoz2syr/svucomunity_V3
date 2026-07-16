-- Migration: Add missing admin RLS policies for discovered tables
-- Created: 2026-07-16
-- Purpose: Allow admins to delete discovered courses and instructors

-- ============================================================================
-- RLS Policies for admin delete on discovered_courses
-- ============================================================================
create policy "Admins delete discovered courses"
  on public.discovered_courses
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin delete on discovered_instructors
-- ============================================================================
create policy "Admins delete discovered instructors"
  on public.discovered_instructors
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
