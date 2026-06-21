-- 20250620000005_add_username_unique_constraint.sql
-- Adds UNIQUE constraint on profiles.username to prevent duplicate usernames

alter table public.profiles
  add constraint unique_username unique (username);
