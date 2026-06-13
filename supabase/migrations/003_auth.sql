-- ════════════════════════════════════════════════════════════════
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

CREATE OR REPLACE FUNCTION services.get_user_roles(uid UUID)
RETURNS TABLE(is_admin BOOLEAN, is_active BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = services, public
AS $$
  SELECT u.is_admin, u.is_active
  FROM public.users u
  WHERE u.id = $1;
$$;

CREATE OR REPLACE FUNCTION services.assert_admin()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = services, public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND is_admin = true
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Forbidden: admin access required' USING errcode = '42501';
  END IF;
END;
$$;
