-- Migration: Add admin RLS policies for CRM access
-- Created: 2026-07-16
-- Purpose: Allow admins to view all raw_extractions and extracted_courses for CRM

-- ============================================================================
-- RLS Policies for admin read access on raw_extractions
-- ============================================================================
create policy "Admins view all raw extractions"
  on public.raw_extractions
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin read access on extracted_courses
-- ============================================================================
create policy "Admins view all extracted courses"
  on public.extracted_courses
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin read access on profiles (for user management)
-- ============================================================================
create policy "Admins view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin update on profiles (for role management)
-- ============================================================================
create policy "Admins update profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin read access on admin_audit_log
-- ============================================================================
create policy "Admins view all audit logs"
  on public.admin_audit_log
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for admin insert on admin_audit_log
-- ============================================================================
create policy "Admins insert audit logs"
  on public.admin_audit_log
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
