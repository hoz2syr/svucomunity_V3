create extension if not exists "uuid-ossp";

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);
