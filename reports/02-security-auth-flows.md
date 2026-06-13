# Security Audit Report — Auth Flows & Session Management

**Date:** 2026-06-12  
**Scope:** apps/web/src/js/modules/auth/, apps/web/src/js/modules/core.js, packages/supabase-client/src/, apps/schedule/src/services/supabase.ts

---

## Fix Status (2026-06-12)

| # | Finding | Original Status | Current Status | Notes |
|---|---------|----------------|----------------|-------|
| 1–5 | localStorage sessions (`core.js`, `session.js`, `config.js`, `auth-guard.js`) | Critical | ⏳ Pending | Requires `@supabase/ssr` migration; not yet implemented |
| 6 | `verifySessionWithServer` validates correctly via `getUser()` | High | ⏳ Pending | Rename to `getLocalSession()` until fixed |
| 7 | `clearUserSession` calls `db.auth.signOut()` | High | ⏳ Pending | Partial fix — server-side logout not yet wired |
| 8 | `withAuth` middleware uses `getUser()` | High | ⏳ Pending | Awaiting same SSR migration |
| 9 | `saveUserSession` client-controlled role flags | High | ⏳ Pending | Admin mutations now in Edge Function; localStorage roles are display-only |
| 10 | Admin app auth guard | High | ⏳ Pending | `apps/admin` not yet wired to auth |
| 11 | Username enumeration timing side-channel | Medium | ⏳ Pending | Pre-lookup query in `page-login.js` still present |
| 12 | `getCurrentUser()` ID mismatch check | Medium | ⏳ Pending | No sync check implemented |
| 17–19 | `console.error` production log leakage | Low | ⏳ Pending | No `import.meta.env.DEV` gating yet |

---

## Original Findings History (Pre-Fix)

### Critical Findings (Original)

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `apps/web/src/js/modules/core.js` | 18–41 | Session tokens stored in **localStorage** — no httpOnly, no Secure flag. XSS anywhere = full session theft. | Client-side-only persistence using localStorage instead of httpOnly cookies. | Move session tokens to httpOnly, Secure, SameSite cookies via Supabase `@supabase/ssr`. Remove the custom localStorage session entirely. |
| 2 | `apps/web/src/js/modules/auth/session.js` | 9–15 | `getSession/setSession` reads/writes raw JWT via localStorage. Trivially accessible to any JS. | `safeStorageGet/set` wraps `localStorage`. Confirmed in `core.js:18-41`. | Same as #1. Also: `session.js` should not touch storage directly — delegate to backend session cookie. |
| 3 | `apps/web/src/js/modules/config.js` | 98–107 | `verifySessionWithServer` is **misleadingly named** — only calls client SDK `getSession()`, which returns locally cached session. Never validates with Supabase server. | `getSession()` does not make a network call; reads from in-memory/SDK cache. | Replace with `db.auth.getUser()` which makes a server-side token validation call. Rename to `getLocalSession()` until fixed. |
| 4 | `apps/web/src/js/modules/config.js` | 57–68 | `initSupabase` uses `persistSession: false` + `detectSessionInUrl: true`. Session is NOT persisted natively, but tokens are stored manually in localStorage. `detectSessionInUrl=true` captures OAuth tokens from URL fragments, creating a referer-leak vector. | Disabling built-in persistence but implementing a less secure manual localStorage substitute. URL fragment tokens are also captured. | Set `persistSession: true` with cookie-based storage, and `detectSessionInUrl: false`. |
| 5 | `apps/web/src/js/modules/auth/auth-guard.js` | 43–44 | On ANY query error, user is redirected to `login.html`. A transient DB failure ≠ unauthenticated. Also leaks admin-route existence. | No error-type discrimination in catch block. | Route DB errors to `index.html` or an error page, not `login.html`. Log errors server-side. |

### High Findings (Original)

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 6 | `apps/web/src/js/modules/auth/auth-guard.js` | 18–22 | Auth decision gates on `verifySessionWithServer` which does NOT validate server-side (see #3). Any valid-looking local session passes. | Same root cause as #3. | Fix `verifySessionWithServer` to call `db.auth.getUser()`. |
| 7 | `apps/web/src/js/modules/core.js` | 106–111 | `clearUserSession` clears 4 localStorage keys but **does not call `db.auth.signOut()`**. Supabase refresh token remains valid on server until expiry. Session only partially invalidated. | Manual localStorage cleanup without server-side sign-out. | Call `db.auth.signOut()` before clearing localStorage. |
| 8 | `packages/supabase-client/src/middleware.ts` | 1–7 | `withAuth` checks only `session` existence (same misleading pattern). No server-side token validation, no refresh failure handling. | Simplified middleware without server-side verification. | Use `supabase.auth.getUser()` instead of `getSession()`. Add proper 401 responses with `WWW-Authenticate` header. |
| 9 | `apps/web/src/js/modules/core.js` | 55–72 | `saveUserSession` stores client-controlled `userData` including `is_admin`, `is_active` flags in localStorage — no integrity check (no HMAC, no signature). An attacker can set `is_admin: true` in localStorage and bypass UI-only admin checks. | Client-side role storage with no server-side enforcement. | Never trust client-stored role flags. AuthZ must query the DB on every protected action. Client flags are for display only. |
| 10 | `apps/admin/src/App.tsx` | 1–35 | Admin app renders with **no auth guard**. `App.tsx` has no session check. `AuthLoader` is a generic spinner with no auth logic. | Admin not wired to auth yet. | Wrap `App.tsx` with `checkAdminAccess()` and render `<AuthLoader />` only during async checks. Block all routes until verified. |

### Medium Findings (Original)

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 11 | `apps/web/src/js/modules/page-login.js` | 110–127 | Username enumeration via timing side-channel: separate `users.select('email').eq('username', identifier)` before `signInWithPassword`. Response time reveals whether username exists. | Separate lookup before authentication. | Use `signInWithPassword` directly with the identifier. Remove the pre-lookup query. |
| 12 | `apps/web/src/js/modules/auth/auth-guard.js` | 24–28 | `getCurrentUser()` fallback after server validation doesn't check that it matches the Supabase session user. Could be stale or from a different account. | No sync check between `session.user.id` and `getCurrentUser()?.id`. | Compare IDs. If mismatch, clear session and redirect. |

### Low Findings (Original)

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 17 | `apps/web/src/js/modules/auth/auth-guard.js` | 42–46 | `console.error('[auth-guard] Admin check failed:', err)` logs raw Supabase errors to browser console in production — may expose table names/schema hints. | No log-level gating. | Wrap with `if (import.meta.env.DEV) console.error(...)`. |
| 18 | `apps/web/src/js/modules/config.js` | 72–73 | `console.warn('[Config] Supabase init error:', ...)` — same production log leakage issue. | Same. | Same fix. |
| 19 | `packages/supabase-client/src/index.ts` | 4–5 | `const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''` silently falls back. If env var is accidentally unset, the app boots with empty URL. | Defensive fallback masking config errors. | Remove the `|| ''` fallback. |

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `apps/web/src/js/modules/core.js` | 18–41 | Session tokens stored in **localStorage** — no httpOnly, no Secure flag. XSS anywhere = full session theft. | Client-side-only persistence using localStorage instead of httpOnly cookies. | Move session tokens to httpOnly, Secure, SameSite cookies via Supabase `@supabase/ssr`. Remove the custom localStorage session entirely. |
| 2 | `apps/web/src/js/modules/auth/session.js` | 9–15 | `getSession/setSession` reads/writes raw JWT via localStorage. Trivially accessible to any JS. | `safeStorageGet/set` wraps `localStorage`. Confirmed in `core.js:18-41`. | Same as #1. Also: `session.js` should not touch storage directly — delegate to backend session cookie. |
| 3 | `apps/web/src/js/modules/config.js` | 98–107 | `verifySessionWithServer` is **misleadingly named** — only calls client SDK `getSession()`, which returns locally cached session. Never validates with Supabase server. | `getSession()` does not make a network call; reads from in-memory/SDK cache. | Replace with `db.auth.getUser()` which makes a server-side token validation call. Rename to `getLocalSession()` until fixed. |
| 4 | `apps/web/src/js/modules/config.js` | 57–68 | `initSupabase` uses `persistSession: false` + `detectSessionInUrl: true`. Session is NOT persisted natively, but tokens are stored manually in localStorage. `detectSessionInUrl=true` captures OAuth tokens from URL fragments, creating a referer-leak vector. | Disabling built-in persistence but implementing a less secure manual localStorage substitute. URL fragment tokens are also captured. | Set `persistSession: true` with cookie-based storage, and `detectSessionInUrl: false`. |
| 5 | `apps/web/src/js/modules/auth/auth-guard.js` | 43–44 | On ANY query error, user is redirected to `login.html`. A transient DB failure ≠ unauthenticated. Also leaks admin-route existence. | No error-type discrimination in catch block. | Route DB errors to `index.html` or an error page, not `login.html`. Log errors server-side. |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 6 | `apps/web/src/js/modules/auth/auth-guard.js` | 18–22 | Auth decision gates on `verifySessionWithServer` which does NOT validate server-side (see #3). Any valid-looking local session passes. | Same root cause as #3. | Fix `verifySessionWithServer` to call `db.auth.getUser()`. |
| 7 | `apps/web/src/js/modules/core.js` | 106–111 | `clearUserSession` clears 4 localStorage keys but **does not call `db.auth.signOut()`**. Supabase refresh token remains valid on server until expiry. Session only partially invalidated. | Manual localStorage cleanup without server-side sign-out. | Call `db.auth.signOut()` before clearing localStorage. |
| 8 | `packages/supabase-client/src/middleware.ts` | 1–7 | `withAuth` checks only `session` existence (same misleading pattern). No server-side token validation, no refresh failure handling. | Simplified middleware without server-side verification. | Use `supabase.auth.getUser()` instead of `getSession()`. Add proper 401 responses with `WWW-Authenticate` header. |
| 9 | `apps/web/src/js/modules/core.js` | 55–72 | `saveUserSession` stores client-controlled `userData` including `is_admin`, `is_active` flags in localStorage — no integrity check (no HMAC, no signature). An attacker can set `is_admin: true` in localStorage and bypass UI-only admin checks. | Client-side role storage with no server-side enforcement. | Never trust client-stored role flags. AuthZ must query the DB on every protected action. Client flags are for display only. |
| 10 | `apps/admin/src/App.tsx` | 1–35 | Admin app renders with **no auth guard**. `App.tsx` has no session check. `AuthLoader` is a generic spinner with no auth logic. | Admin not wired to auth yet. | Wrap `App.tsx` with `checkAdminAccess()` and render `<AuthLoader />` only during async checks. Block all routes until verified. |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 11 | `apps/web/src/js/modules/page-login.js` | 110–127 | Username enumeration via timing side-channel: separate `users.select('email').eq('username', identifier)` before `signInWithPassword`. Response time reveals whether username exists. | Separate lookup before authentication. | Use `signInWithPassword` directly with the identifier. Remove the pre-lookup query. |
| 12 | `apps/web/src/js/modules/auth/auth-guard.js` | 24–28 | `getCurrentUser()` fallback after server validation doesn't check that it matches the Supabase session user. Could be stale or from a different account. | No sync check between `session.user.id` and `getCurrentUser()?.id`. | Compare IDs. If mismatch, clear session and redirect. |

## Low Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 17 | `apps/web/src/js/modules/auth/auth-guard.js` | 42–46 | `console.error('[auth-guard] Admin check failed:', err)` logs raw Supabase errors to browser console in production — may expose table names/schema hints. | No log-level gating. | Wrap with `if (import.meta.env.DEV) console.error(...)`. |
| 18 | `apps/web/src/js/modules/config.js` | 72–73 | `console.warn('[Config] Supabase init error:', ...)` — same production log leakage issue. | Same. | Same fix. |
| 19 | `packages/supabase-client/src/index.ts` | 4–5 | `const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''` silently falls back. If env var is accidentally unset, the app boots with empty URL. | Defensive fallback masking config errors. | Remove the `|| ''` fallback. |

## Recommendations

1. **Migrate session storage to httpOnly cookies** using `@supabase/ssr`. Single change mitigates XSS session theft and enables SameSite CSRF protection.
2. **Fix `verifySessionWithServer` to use `db.auth.getUser()`** — the correct server-side validation.
3. **Never store role/privilege flags client-side.** AuthZ always queries the DB. Client flags are for UX display only.
4. **Implement real logout** calling `db.auth.signOut()` server-side — not just localStorage cleanup.
5. **Fix auth-guard error redirect** — DB errors must not go to `login.html`.
6. **Add CSRF tokens** for all mutation operations if moving to cookie-based sessions.
