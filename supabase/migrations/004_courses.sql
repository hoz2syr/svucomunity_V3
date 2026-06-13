-- ════════════════════════════════════════════════════════════════
-- 004_courses.sql
-- courses table
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        TEXT      NOT NULL UNIQUE,
    name        TEXT      NOT NULL,
    name_ar     TEXT,
    major       TEXT      NOT NULL,
    description TEXT,
    is_active   BOOLEAN   NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_major  ON public.courses(major);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active) WHERE is_active = true;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_read_active"    ON public.courses;
DROP POLICY IF EXISTS "courses_insert_admin"   ON public.courses;
DROP POLICY IF EXISTS "courses_update_admin"   ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin"   ON public.courses;

CREATE POLICY "courses_read_active"
    ON public.courses
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "courses_insert_admin"
    ON public.courses
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.is_admin = true
        )
    );

CREATE POLICY "courses_update_admin"
    ON public.courses
    FOR UPDATE
    USING (services.assert_admin() IS NULL)
    WITH CHECK (services.assert_admin() IS NULL);

CREATE POLICY "courses_delete_admin"
    ON public.courses
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.is_admin = true
        )
    );

CREATE TRIGGER courses_set_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
