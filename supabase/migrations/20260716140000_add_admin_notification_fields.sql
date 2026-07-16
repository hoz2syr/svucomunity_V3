alter table public.notifications
  add column if not exists type text not null default 'user',
  add column if not exists created_by uuid references auth.users on delete set null,
  add column if not exists priority text not null default 'normal';

create policy "Admins can view all notifications"
  on public.notifications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert notifications for any user"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update any notification"
  on public.notifications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete any notification"
  on public.notifications for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
