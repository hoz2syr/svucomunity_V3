-- ════════════════════════════════════════════════════════════════
-- 006_resources.sql
-- course_resources table for study materials
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.course_resources (
    id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id      UUID      NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code    TEXT      NOT NULL,
    course_name    TEXT      NOT NULL,
    major          TEXT      NOT NULL,
    title          TEXT      NOT NULL,
    url            TEXT      NOT NULL,
    description    TEXT,
    resource_type  TEXT      NOT NULL DEFAULT 'link' CHECK (resource_type IN ('pdf', 'video', 'link', 'code', 'slides')),
    uploader_id    UUID      NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
    uploader_name  TEXT      NOT NULL,
    votes          INTEGER   NOT NULL DEFAULT 0  CHECK (votes >= 0),
    is_active      BOOLEAN   NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_course_id   ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_course_code ON public.course_resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON public.course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_active      ON public.course_resources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_resources_created_at  ON public.course_resources(created_at DESC);

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_read_active"   ON public.course_resources;
DROP POLICY IF EXISTS "resources_insert_auth"   ON public.course_resources;
DROP POLICY IF EXISTS "resources_update_auth"   ON public.course_resources;
DROP POLICY IF EXISTS "resources_delete_auth"   ON public.course_resources;

CREATE POLICY "resources_read_active"
    ON public.course_resources
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "resources_insert_auth"
    ON public.course_resources
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
              AND is_active = true
        )
    );

CREATE POLICY "resources_update_auth"
    ON public.course_resources
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
              AND is_active = true
        )
        AND uploader_id = auth.uid()
    )
    WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "resources_delete_auth"
    ON public.course_resources
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
              AND is_active = true
        )
        AND uploader_id = auth.uid()
    );

CREATE TRIGGER resources_set_updated_at
    BEFORE UPDATE ON public.course_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
