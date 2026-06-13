-- ════════════════════════════════════════════════════════════════
-- supabase-setup.sql
-- Aggregate schema setup — run top-to-bottom in a fresh DB
-- ════════════════════════════════════════════════════════════════

-- 001_init.sql
-- Extensions, base types, and shared trigger function
-- ════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 002_users.sql
-- public.users table linked to auth.users
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.users (
    id          UUID      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT      NOT NULL,
    username    TEXT      NOT NULL UNIQUE,
    is_admin    BOOLEAN   NOT NULL DEFAULT false,
    is_active   BOOLEAN   NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "users_read_admin"
    ON public.users
    FOR SELECT
    USING (is_admin = true);

CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 003_auth.sql
-- Auth helpers: auto-profile creation + role check
-- ════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.email, NEW.id::text)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.has_role(check_role TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND is_admin = true
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- 004_courses.sql
-- جدول المقررات
-- ════════════════════════════════════════════════════════════════

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

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_code   ON public.courses(code);
CREATE INDEX        IF NOT EXISTS idx_courses_major  ON public.courses(major);
CREATE INDEX        IF NOT EXISTS idx_courses_active ON public.courses(is_active) WHERE is_active = true;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_read_active"
    ON public.courses
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "courses_insert_auth"
    ON public.courses
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "courses_update_auth"
    ON public.courses
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "courses_delete_auth"
    ON public.courses
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- 005_study_groups.sql
-- study_groups table for collaborative study sessions
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.study_groups (
    id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code TEXT      NOT NULL,
    creator_id  UUID      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    members     UUID[]    NOT NULL DEFAULT '{}',
    is_private  BOOLEAN   NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_course_code ON public.study_groups(course_code);
CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON public.study_groups(creator_id);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_groups_read_all"
    ON public.study_groups
    FOR SELECT
    USING (true);

CREATE POLICY "study_groups_insert_auth"
    ON public.study_groups
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "study_groups_update_own"
    ON public.study_groups
    FOR UPDATE
    USING (creator_id = auth.uid());

CREATE POLICY "study_groups_delete_own"
    ON public.study_groups
    FOR DELETE
    USING (creator_id = auth.uid());

CREATE TRIGGER study_groups_set_updated_at
    BEFORE UPDATE ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

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
    resource_type  TEXT      NOT NULL DEFAULT 'رابط',
    uploader_id    UUID      NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
    uploader_name  TEXT      NOT NULL,
    votes          INTEGER   NOT NULL DEFAULT 0  CHECK (votes >= 0),
    is_active      BOOLEAN   NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_course_id   ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_course_code ON public.course_resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON public.course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_active      ON public.course_resources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_resources_created_at  ON public.course_resources(created_at DESC);

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_read_active"
    ON public.course_resources
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "resources_insert_auth"
    ON public.course_resources
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "resources_update_auth"
    ON public.course_resources
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (uploader_id = auth.uid())
    );

CREATE POLICY "resources_delete_auth"
    ON public.course_resources
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND (uploader_id = auth.uid())
    );

ALTER TABLE public.course_resources
    ADD CONSTRAINT valid_resource_type
    CHECK (resource_type IN ('PDF', 'فيديو', 'رابط', 'كود', 'شرائح'));
