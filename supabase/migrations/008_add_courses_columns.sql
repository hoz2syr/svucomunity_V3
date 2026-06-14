-- ════════════════════════════════════════════════════════════════
-- 008_add_courses_columns.sql
-- Adds missing columns to courses table required by admin UI
-- ════════════════════════════════════════════════════════════════

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS instructor TEXT;

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS max_members INT NOT NULL DEFAULT 0;
