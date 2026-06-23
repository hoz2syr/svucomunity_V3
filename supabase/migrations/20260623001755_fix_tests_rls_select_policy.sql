DROP POLICY IF EXISTS "Users can view own tests" ON public.tests;
DROP POLICY IF EXISTS "Public can view published tests" ON public.tests;
DROP POLICY IF EXISTS "select_tests" ON public.tests;

CREATE POLICY "select_tests"
  ON public.tests FOR SELECT
  USING (
    published = true
    OR auth.uid() = user_id
  );
