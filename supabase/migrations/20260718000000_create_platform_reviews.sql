create extension if not exists "pgcrypto";

create table if not exists public.platform_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null default 'other',
  comment text not null,
  status text not null default 'pending',
  admin_response text,
  responded_by uuid references auth.users on delete set null,
  responded_at timestamptz,
  created_at timestamptz default now()
);

alter table public.platform_reviews enable row level security;

create policy "Users can create reviews"
  on public.platform_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can view own reviews"
  on public.platform_reviews for select
  using (auth.uid() = user_id);

create policy "Admins can view all reviews"
  on public.platform_reviews for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update any review"
  on public.platform_reviews for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete any review"
  on public.platform_reviews for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists idx_platform_reviews_user_id on public.platform_reviews(user_id);
create index if not exists idx_platform_reviews_status on public.platform_reviews(status);
create index if not exists idx_platform_reviews_created_at on public.platform_reviews(created_at);

alter table public.platform_reviews
  add constraint platform_reviews_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
