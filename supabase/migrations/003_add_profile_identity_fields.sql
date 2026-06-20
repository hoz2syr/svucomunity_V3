create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists role text not null default 'student',
  add column if not exists provider text not null default 'email',
  add column if not exists provider_id text;

create unique index if not exists profiles_email_key
  on public.profiles (email)
  where email is not null;

create unique index if not exists profiles_username_key
  on public.profiles (username)
  where username is not null;

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  payload jsonb default '{}'::jsonb,
  ip_address text default 'unknown',
  user_agent text default 'unknown',
  created_at timestamptz default now() not null
);

alter table public.admin_audit_log enable row level security;

create policy "Users can view own audit log"
  on public.admin_audit_log for select
  using (auth.uid() = caller_id);
