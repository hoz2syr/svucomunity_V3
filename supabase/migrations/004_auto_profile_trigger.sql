-- 004_auto_profile_trigger.sql
-- Creates a trigger to automatically insert a profile when a new auth.user is created.
-- This removes the need for frontend to call upsertProfile manually on every signup.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, username, role, provider, provider_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1)
    ),
    'student',
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    new.raw_app_meta_data->>'provider_id'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
