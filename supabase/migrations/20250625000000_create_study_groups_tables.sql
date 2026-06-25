-- Migration: Create study groups tables
-- Created: 2025-06-25

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- Table: groups
-- Study groups for collaboration between students
create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  course_name text not null,
  course_code text not null,
  class_number text,
  doctor_name text,
  major text not null,
  max_members integer not null default 5,
  current_members integer not null default 1,
  whatsapp_link text not null,
  group_link text,
  is_full boolean not null default false,
  creator_id uuid not null references auth.users(id) on delete cascade,
  creator_name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for groups table
create index idx_groups_creator_id on public.groups(creator_id);
create index idx_groups_major on public.groups(major);
create index idx_groups_course_code on public.groups(course_code);
create index idx_groups_created_at on public.groups(created_at desc);

-- Table: group_members
-- Memberships linking users to groups
create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Indexes for group_members table
create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id on public.group_members(user_id);

-- Enable RLS on both tables
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- RLS Policies for groups table

-- Allow anyone to view all groups (for browsing)
create policy "groups_select_all"
  on public.groups
  for select
  using (true);

-- Allow authenticated users to create groups
create policy "groups_insert_authenticated"
  on public.groups
  for insert
  with check (auth.uid() is not null);

-- Allow creator to update their own group
create policy "groups_update_creator"
  on public.groups
  for update
  using (auth.uid() = creator_id);

-- Allow creator to delete their own group
create policy "groups_delete_creator"
  on public.groups
  for delete
  using (auth.uid() = creator_id);

-- RLS Policies for group_members table

-- Allow members to view group memberships
create policy "group_members_select"
  on public.group_members
  for select
  using (true);

-- Allow authenticated users to join groups (insert membership)
create policy "group_members_insert_authenticated"
  on public.group_members
  for insert
  with check (auth.uid() is not null);

-- Allow members to leave groups (delete their own membership)
create policy "group_members_delete_own"
  on public.group_members
  for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger update_groups_updated_at
  before update on public.groups
  for each row
  execute procedure public.update_updated_at();