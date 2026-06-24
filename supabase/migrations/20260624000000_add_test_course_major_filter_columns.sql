-- Add generated stored columns for major and courseCode to support indexed filtering on published tests.
-- Derived from src/features/exam/src/types.ts TestSettings.settings

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tests'
      AND column_name = 'major'
  ) THEN
    ALTER TABLE public.tests
      ADD COLUMN major text GENERATED ALWAYS AS (settings->>'major') STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tests'
      AND column_name = 'course_code'
  ) THEN
    ALTER TABLE public.tests
      ADD COLUMN course_code text GENERATED ALWAYS AS (settings->>'courseCode') STORED;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_tests_major
  ON public.tests(major);

CREATE INDEX IF NOT EXISTS idx_tests_course_code
  ON public.tests(course_code);
