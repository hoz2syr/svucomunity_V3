alter table public.notifications
  add constraint notifications_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
