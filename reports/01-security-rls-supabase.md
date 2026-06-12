# Security Audit Report — RLS & Supabase Schema

**Project:** SVU Community v3.0.0  
**Date:** 2026-06-12  
**Scope:** supabase/migrations/, supabase/functions/, packages/supabase-client/src/, apps/*/src/services/

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `.env.example` | 7 | `SUPABASE_SERVICE_ROLE_KEY` exposed as a `VITE_`-prefixed variable — bundling service_role into client JS completely bypasses RLS | Any build/deploy that prefixes this key as `VITE_SUPABASE_SERVICE_ROLE_KEY` exposes full DB access to all browser users | Remove `SUPABASE_SERVICE_ROLE_KEY` from any client-accessible `.env` file. It must **only** appear in server-side `.env` (used by `packages/supabase-client/src/server.ts`). Add CI check that forbids `VITE_SUPABASE_SERVICE_ROLE_KEY`. |
| 2 | `supabase/migrations/004_courses.sql` | 38–51 | All write policies (INSERT/UPDATE/DELETE) use `auth.role() = 'authenticated'` — any authenticated user can modify/delete all courses | Admin enforcement is only client-side at `apps/web/src/js/modules/admin/auth.js:32`. No admin-only DB policies exist. | Change write policies to require `is_admin = true`: `USING (auth.uid() IS NOT NULL AND (SELECT is_admin FROM public.users WHERE id = auth.uid()))`. Create a `has_role('admin')` SQL function with `SECURITY DEFINER`. |
| 3 | `supabase/migrations/006_resources.sql` | 51–66 | UPDATE/DELETE policies use `(uploader_id IS null OR uploader_id = auth.uid())` — when `uploader_id` is NULL, **any authenticated user** can update/delete that row | `uploader_id` column allows NULL. The OR condition short-circuits to true for NULL values. | Make `uploader_id NOT NULL DEFAULT auth.uid()`, or add a trigger on INSERT to auto-populate it. Then policy simplifies to `uploader_id = auth.uid()`. |
| 4 | `supabase/migrations/006_resources.sql` | 51 | UPDATE policy lacks `WITH CHECK` clause — RLS UPDATE requires both USING (read filter) and WITH CHECK (write filter) to prevent privilege escalation | Policy only has `USING`. PostgreSQL requires separate `WITH CHECK`. Without it, a user can change any column including `uploader_id` to claim ownership of someone else's resource. | Add `WITH CHECK (uploader_id = auth.uid())` to the UPDATE policy. |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 5 | `supabase/migrations/002_users.sql` | — | **File is empty (0 bytes)** — no `users` table schema or RLS policies exist | Migration was never authored. The `users` table is referenced everywhere but never created. Without RLS, any authenticated user can read/update all user records including `is_admin`. | Create `users` table with `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`, add `is_admin BOOLEAN DEFAULT false`, `is_active BOOLEAN DEFAULT true`, then `ALTER TABLE users ENABLE ROW LEVEL SECURITY`. Add policies: `users_read_own` (`auth.uid() = id`), `users_read_admin` (`auth.uid() IN (SELECT id FROM users WHERE is_admin)`). |
| 6 | `supabase/migrations/003_auth.sql` | — | **File is empty (0 bytes)** — no auth schema, policies, or triggers defined | No auto-user-creation trigger exists. New `auth.users` rows won't automatically create `public.users` profile rows. | Add trigger function: `CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.users (id, email, ...) VALUES (NEW.id, NEW.email, ...); RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;` + `AFTER INSERT ON auth.users` trigger. |
| 7 | `supabase/migrations/005_study_groups.sql` | — | **File is empty (0 bytes)** — `study_groups` table has no schema or RLS | App queries `study_groups` at runtime but no table exists. Without RLS, any user can create groups, inject arbitrary `creator_id`, or see all private group members. | Create `study_groups` with `creator_id UUID NOT NULL REFERENCES public.users(id)`, `members UUID[] DEFAULT '{}'`, enable RLS. Policies: read all (public), insert authenticated with `creator_id = auth.uid()`, update/delete only `creator_id = auth.uid()`. |
| 8 | `apps/web/src/js/modules/auth/session.js` | 8–19 | Session token stored in plain-text `localStorage` with no server-side binding — vulnerable to XSS theft and token replay | `setSession()` stores bare JWT in `svu_session_token`. No `httpOnly`, `Secure`, `SameSite` cookie is used. | Move session management entirely to Supabase's built-in `persistSession: true`. Remove custom localStorage session. Use `supabase.auth.getSession()` exclusively. |
| 9 | `apps/schedule/src/services/supabase.ts` | 8–24 | Duplicate Supabase client initialization bypasses the shared `@svu-community/supabase-client` package | Each app initializes its own Supabase client with same env vars, causing auth config drift. Same issue in `apps/courses/src/services/supabase.ts`. | Replace both files with `export { supabase } from '@svu-community/supabase-client';`. Remove local `createClient` calls. |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 10 | `.env.example` | 5 | `VITE_GEMINI_API_KEY` and `VITE_RESEND_API_KEY` are bundled into client JS — exposes paid API keys to every browser | `VITE_` prefixed vars are embedded in the client bundle in any Vite project. Gemini key gives access to paid AI; Resend key allows sending emails from the project domain. | Remove these from `.env.example`. Keys must only live in server-side `.env` (Edge Function secrets). API calls to Gemini/Resend must go through Supabase Edge Functions. |
| 11 | `apps/web/src/js/modules/admin/auth.js` | 1–41 | Admin access check is purely client-side — a user can bypass it by calling `window.adminPanel.makeAdmin(db, anyUserId)` in DevTools | Admin mutations are exposed on `window.adminPanel` with no server-side enforcement. RLS on `users` is missing, so any authenticated user can modify `is_admin`. | Move all admin mutations to Supabase Edge Functions that verify `auth.uid() has is_admin = true` using `SECURITY DEFINER` SQL functions. Remove direct table access from frontend admin panel. |
| 12 | `apps/web/src/js/modules/auth/session.js` | 12 | `verifySessionWithServer` calls `db.auth.getSession()` which is **client-side only** — never validates with Supabase server | Misleading function name. `getSession()` reads from local SDK cache, not from the auth server. A tampered localStorage payload passes as "valid". | Replace with `db.auth.getUser()` which makes a server-side token validation call. Rename to `getLocalSession` until fixed. |
| 13 | `apps/schedule/src/hooks/useStudyGroups.ts` | 157 | Realtime subscription filter built via string interpolation of `course_code` values — potential SQL injection through `.in()` filter | Line 157: ``filter: `course_code=in.(${uniqueCourseCodes.map((c) => `"${c}"`).join(',')})` `` passes raw strings. A malicious `courseCode` value could break out of the quoted context. | Sanitize course codes with regex `/^[A-Z0-9-]+$/i` before constructing the filter. Add a CHECK constraint on `study_groups.course_code` at the DB level. |
| 14 | `packages/supabase-client/src/server.ts` | 3–4 | Service role key has empty-string fallback — silent failure if env var is missing | If `SUPABASE_SERVICE_ROLE_KEY` is not set, the client silently gets `''` and creates a client with invalid credentials. | Fail fast at module load: `if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in server environment');` |

## Low Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 15 | `supabase/migrations/004_courses.sql` | 46 | UPDATE policy missing `WITH CHECK` clause | Same issue as Critical #4 but for courses table | Add `WITH CHECK (auth.role() = 'authenticated')` |
| 16 | `packages/supabase-client/src/index.ts` | 4–5 | Empty-string fallback for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — client initializes with empty credentials silently | No early-explicit failure for missing config | Remove the `|| ''` fallback. Let the explicit check in `client.ts` catch it. |
| 17 | `apps/schedule/src/services/supabase.ts` | 14–16 | Error message in dev mode says "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local" — would leak infrastructure details if shown to end users | No DEV vs production gating on error messages | Wrap the check: `if (import.meta.env.DEV) throw new Error('Missing...');` — in production throw a generic error. |

## Recommendations

1. **Fail fast everywhere:** Never silently fall back to empty strings or null for credentials/API keys. Every security-critical `env` read should throw at module load.
2. **Implement `has_role()` SQL helper:** Create `CREATE OR REPLACE FUNCTION has_role(role TEXT) RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER` and use it in all RLS policies. Makes policy changes a single function edit, not per-table migration rewrites.
3. **Complete empty migrations:** 5 of 7 migrations are empty (001_init, 002_users, 003_auth, 005_study_groups, 007_catalog). The schema is undocumented and unreproducible. Fill them or remove them and re-number.
4. **Move admin mutations to Edge Functions:** All admin logic in `apps/web/src/js/modules/admin/actions.js` must move server-side with `SECURITY DEFINER` checks. Client-side authZ is not a security boundary.
5. **Replace localStorage sessions with httpOnly cookies:** Use `@supabase/ssr` for cookie-based storage. This mitigates XSS session theft and enables SameSite CSRF protection.
6. **Add integration tests** verifying: (a) non-admin cannot INSERT/UPDATE/DELETE on `courses`, (b) non-uploader cannot UPDATE `course_resources`, (c) users cannot read other users' rows, (d) admin Edge Functions reject non-admin callers.
