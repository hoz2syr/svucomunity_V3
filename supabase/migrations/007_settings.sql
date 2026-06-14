-- ════════════════════════════════════════════════════════════════
-- 007_settings.sql
-- Global key/value settings table for admin configuration
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.settings (
    key       TEXT      PRIMARY KEY,
    value     JSONB     NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_admin" ON public.settings;
DROP POLICY IF EXISTS "settings_update_admin" ON public.settings;

CREATE POLICY "settings_read_admin"
    ON public.settings
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.is_admin = true
        )
    );

CREATE POLICY "settings_update_admin"
    ON public.settings
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.is_admin = true
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
              AND users.is_admin = true
        )
    );

CREATE TRIGGER settings_set_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
