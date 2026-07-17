-- Migration: Add semester_code and is_archived to groups
-- Created: 2026-07-17
-- Purpose: Track which semester each group belongs to and support archiving

-- Add columns
alter table public.groups
  add column if not exists semester_code text not null default 'S25',
  add column if not exists is_archived boolean not null default false;

-- Backfill semester_code from creator's profile (only rows still holding the default)
update public.groups g
set semester_code = coalesce(
  (select p.current_semester from public.profiles p where p.id = g.creator_id),
  'S25'
)
where g.semester_code = 'S25';

-- Indexes
create index if not exists idx_groups_semester_code on public.groups(semester_code);
create index if not exists idx_groups_is_archived on public.groups(is_archived);

-- Drop the old permissive policy before creating the new ones
drop policy if exists "groups_select_all" on public.groups;

-- RLS policy: allow anyone to view non-archived groups
create policy "groups_select_non_archived"
  on public.groups
  for select
  using (is_archived = false);

-- RLS policy: allow creator to view their own archived groups
create policy "groups_select_own_archived"
  on public.groups
  for select
  using (auth.uid() = creator_id and is_archived = true);

-- RLS policy: allow group members to view archived groups they belong to
create policy "groups_select_member_archived"
  on public.groups
  for select
  using (
    is_archived = true
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );
