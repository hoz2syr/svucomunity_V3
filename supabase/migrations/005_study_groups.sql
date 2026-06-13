-- ════════════════════════════════════════════════════════════════
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
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "study_groups_delete_own"
    ON public.study_groups
    FOR DELETE
    USING (creator_id = auth.uid());

CREATE TRIGGER study_groups_set_updated_at
    BEFORE UPDATE ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
