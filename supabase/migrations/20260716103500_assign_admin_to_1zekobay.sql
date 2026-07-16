-- 20260716103500_assign_admin_to_1zekobay.sql
-- One-time admin role assignment for 1zekobay@gmail.com via CI
--
-- Note: The prevent_role_change trigger blocks role changes when auth.uid() IS NULL,
-- which is the case during migration execution. We temporarily disable the trigger,
-- perform the assignment, then restore it exactly as defined in 005_security_hardening.sql.

-- Temporarily disable the role change prevention trigger
drop trigger if exists prevent_role_change on public.profiles;

-- Assign admin role to the specified email
-- This is idempotent: running it multiple times is safe
update public.profiles
set role = 'admin'
where email = '1zekobay@gmail.com';

-- Restore the prevent_role_change trigger exactly as defined in 005_security_hardening.sql
create or replace function public.prevent_role_change()
returns trigger as $$
begin
  if old.role is distinct from new.role
     and auth.uid() IS NULL
  then
    raise exception 'Role changes are only allowed via admin actions';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_change();
