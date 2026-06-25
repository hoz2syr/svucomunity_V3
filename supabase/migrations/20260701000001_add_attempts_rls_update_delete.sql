-- supabase/migrations/20260701000001_add_attempts_rls_update_delete.sql
-- Adds UPDATE and DELETE RLS policies for test_attempts.

alter table public.test_attempts enable row level security;

create policy "Users can update own attempts"
  on public.test_attempts for update
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own attempts"
  on public.test_attempts for delete
  using (auth.uid() IS NOT NULL AND auth.uid() = user_id);
