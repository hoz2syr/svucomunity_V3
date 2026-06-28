-- Migration: Add atomic rate_test RPC to prevent duplicate ratings
-- Created: 2026-06-26

create or replace function public.rate_test_atomic(
  p_test_id uuid,
  p_user_id uuid,
  p_rating integer
)
returns table(new_rating integer)
language plpgsql
as $$
declare
  v_existing_rating integer;
  v_existing_count integer;
  v_new_rating numeric;
begin
  if exists (
    select 1 from public.test_ratings
    where test_id = p_test_id and user_id = p_user_id
    for update
  ) then
    raise exception 'User has already rated this test';
  end if;

  select rating, rating_count into v_existing_rating, v_existing_count
  from public.tests
  where id = p_test_id
  for update;

  if v_existing_rating is null then
    v_new_rating := p_rating;
  else
    v_new_rating := round((v_existing_rating * v_existing_count + p_rating)::numeric / (v_existing_count + 1));
  end if;

  update public.tests
  set rating = v_new_rating::integer,
      rating_count = v_existing_count + 1,
      updated_at = now()
  where id = p_test_id
  returning rating into new_rating;

  insert into public.test_ratings (test_id, user_id, rating)
  values (p_test_id, p_user_id, p_rating);
end;
$$;
