-- ════════════════════════════════════════════════════════════════
-- 006_resources.sql
-- مخطط جدول موارد المقررات
-- ════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- جدول موارد المقررات
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_resources (
    id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id      UUID      NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_code    TEXT      NOT NULL,
    course_name    TEXT      NOT NULL,
    major          TEXT      NOT NULL,
    title          TEXT      NOT NULL,
    url            TEXT      NOT NULL,
    description    TEXT,
    resource_type  TEXT      NOT NULL DEFAULT 'رابط',
    uploader_id    UUID,                          -- FK to auth.users (optional)
    uploader_name  TEXT      NOT NULL,
    votes          INTEGER   NOT NULL DEFAULT 0  CHECK (votes >= 0),
    is_active      BOOLEAN   NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_resources_course_id   ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_course_code ON public.course_resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON public.course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_active      ON public.course_resources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_resources_created_at  ON public.course_resources(created_at DESC);

-- Row Level Security
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can read active resources
CREATE POLICY "resources_read_active"
    ON public.course_resources
    FOR SELECT
    USING (is_active = true);

-- Authenticated users can insert resources (uploader_name set from client)
CREATE POLICY "resources_insert_auth"
    ON public.course_resources
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Uploader or admin can update
CREATE POLICY "resources_update_auth"
    ON public.course_resources
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (uploader_id IS null OR uploader_id = auth.uid())
    );

-- Uploader or admin can delete
CREATE POLICY "resources_delete_auth"
    ON public.course_resources
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND (uploader_id IS null OR uploader_id = auth.uid())
    );

-- Votes: anyone can increment, authenticated can decrement (handled in app)
-- Resource_type whitelist enforced at DB level via CHECK
ALTER TABLE public.course_resources
    ADD CONSTRAINT valid_resource_type
    CHECK (resource_type IN ('PDF', 'فيديو', 'رابط', 'كود', 'شرائح'));
