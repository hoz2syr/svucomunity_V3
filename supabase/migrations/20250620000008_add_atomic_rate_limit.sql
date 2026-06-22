-- supabase/migrations/20250620000008_add_atomic_rate_limit.sql
-- Adds an atomic rate-limit check/increment function to eliminate
-- the read-update race condition present in all Edge Functions.

create or replace function public.check_and_increment_rate_limit(
  p_key text,
  p_window_ms integer,
  p_max_attempts integer
)
returns table(
  allowed boolean,
  retry_after_ms integer
)
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_window_end timestamptz := v_now + (p_window_ms || ' milliseconds')::interval;
  v_existing record;
begin
  select count, reset_at into v_existing
  from public.rate_limits
  where key = p_key
  for update;

  if not found or v_existing.reset_at < v_now then
    insert into public.rate_limits (key, count, reset_at)
    values (p_key, 1, v_window_end)
    on conflict (key) do update set count = 1, reset_at = v_window_end;
    allowed := true;
    retry_after_ms := 0;
    return next;
    return;
  end if;

  if v_existing.count >= p_max_attempts then
    allowed := false;
    retry_after_ms := ceil(extract(epoch from (v_existing.reset_at - v_now)) * 1000)::integer;
    return next;
    return;
  end if;

  update public.rate_limits
  set count = count + 1
  where key = p_key;

  allowed := true;
  retry_after_ms := 0;
  return next;
end;
$$;

comment on function public.check_and_increment_rate_limit is
  'Atomically checks and increments a rate-limit counter. Returns allowed=true/false and retry_after_ms if blocked.';
