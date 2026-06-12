-- ════════════════════════════════════════════════════════════════
-- 004_courses.sql
-- مخطط جدول المقررات الدراسية
-- ════════════════════════════════════════════════════════════════

-- تفعيل امتداد UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- جدول المقررات
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        TEXT      NOT NULL UNIQUE,
    name        TEXT      NOT NULL,
    name_ar     TEXT,
    major       TEXT      NOT NULL,
    description TEXT,
    is_active   BOOLEAN   NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- فهارس للأداء
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_code   ON public.courses(code);
CREATE INDEX        IF NOT EXISTS idx_courses_major  ON public.courses(major);
CREATE INDEX        IF NOT EXISTS idx_courses_active ON public.courses(is_active) WHERE is_active = true;

-- Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can read active courses
CREATE POLICY "courses_read_active"
    ON public.courses
    FOR SELECT
    USING (is_active = true);

-- Authenticated users can manage courses
CREATE POLICY "courses_insert_auth"
    ON public.courses
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "courses_update_auth"
    ON public.courses
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "courses_delete_auth"
    ON public.courses
    FOR DELETE
    USING (auth.role() = 'authenticated');
