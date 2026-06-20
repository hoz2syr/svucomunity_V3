-- 003m_add_profile_constraints.sql
-- Adds CHECK constraints and UNIQUE constraints to profiles table

alter table public.profiles
  add constraint check_role
  check (role in ('student', 'admin'));

alter table public.profiles
  add constraint check_provider
  check (provider in ('email', 'google'));
