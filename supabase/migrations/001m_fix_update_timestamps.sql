-- 001m_fix_update_timestamps.sql
-- Adds automatic updated_at trigger function and attaches it to tables with updated_at

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  when (old.* is distinct from new.*)
  execute function public.set_updated_at();
