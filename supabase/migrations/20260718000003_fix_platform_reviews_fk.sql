alter table public.platform_reviews
  drop constraint if exists platform_reviews_user_id_fkey,
  add constraint platform_reviews_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
