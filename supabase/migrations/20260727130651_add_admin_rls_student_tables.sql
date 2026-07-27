-- Migration: Add admin RLS policies for student_semesters and student_semester_courses
-- Created: 2026-07-27
-- Purpose: Allow admins to view all student semester data in admin panel

-- ============================================================================
-- RLS Policies for admin read access on student_semesters
-- ============================================================================
create policy "Admins view all student semesters"
  on public.student_semesters
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin read access on student_semester_courses
-- ============================================================================
create policy "Admins view all student semester courses"
  on public.student_semester_courses
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
