-- ════════════════════════════════════════════════════════════════
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

DROP POLICY IF EXISTS "users_read_own"   ON public.users;
DROP POLICY IF EXISTS "users_read_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_read_own"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "users_read_admin"
    ON public.users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users AS admins
            WHERE admins.id = auth.uid()
              AND admins.is_admin = true
        )
    );

CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
