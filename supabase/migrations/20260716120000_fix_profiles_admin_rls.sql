-- Migration: Fix infinite recursion in profiles RLS admin policies
-- Created: 2026-07-16
-- Purpose: Replace recursive self-referencing policies on public.profiles
--          with a SECURITY DEFINER helper function to break the recursion.

-- ============================================================================
-- Helper function: returns true when the current caller is an admin.
-- Runs as SECURITY DEFINER so it bypasses RLS and cannot recurse.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;

-- ============================================================================
-- Drop the recursive policies on public.profiles
-- ============================================================================
drop policy if exists "Admins view all profiles" on public.profiles;
drop policy if exists "Admins update profiles" on public.profiles;

-- ============================================================================
-- Recreate admin policies on public.profiles using the helper function
-- ============================================================================
create policy "Admins view all profiles"
  on public.profiles
  for select
  using (public.is_admin());

create policy "Admins update profiles"
  on public.profiles
  for update
  using (public.is_admin());
