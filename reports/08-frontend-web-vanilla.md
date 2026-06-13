# Frontend Audit Report — Web App (Vanilla JS)

**Date:** 2026-06-12  
**Scope:** apps/web/src/ (all JS/CSS files) + apps/web/package.json

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1–3 | `feedback.js` unhandled promise, `core.js` missing id guard, `initializeTheme` memory leak | ⏳ Pending | None yet addressed |
| 4 | `config.js` empty-string fallbacks | ⏳ Pending | Still `|| ''` fallbacks present |
| 5 | `shared.js` `enrichCreators` silent error swallowing | ⏳ Pending | Empty catch still present |
| 9 | Hardcoded `30 * 60 * 1000` auth timeout | ⏳ Pending | Diverges from `SECURITY_CONFIG.sessionTimeout` |
| 11–13 | `helpers.js` duplicates `shared.js` utilities | ⏳ Pending | No consolidation yet |
| 14 | `constants.js` hardcoded localhost fallback | ⏳ Pending | Production env guard not added |

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `src/js/modules/feedback.js` | 262–276 | **Unhandled promise rejection** — `db.from(...).insert(...).then(...)` has no `.catch()`. Fire-and-forget Supabase insert; any DB error becomes unhandled rejection. | Missing error handler. | Add `.catch(err => console.warn('[feedback]', err))` or awaited try/catch. |
| 2 | `src/js/modules/core.js` | 55–63 | `saveUserSession` stores `userData.id` as `SESSION_KEY` value even when userData has no `id` field. No guard `if (!userData?.id) throw`. | Missing validation. | Validate `userData.id` exists before storing. |
| 3 | `src/js/modules/core.js` | 317–322 | **Memory leak** — `window.matchMedia` listener in `initializeTheme` is never removed. SPA navigation accumulates listeners. | No cleanup mechanism. | Store listener reference; expose `disposeTheme()` cleanup function. |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 4 | `src/js/modules/config.js` | 10–12 | `SUPABASE_CONFIG` exports `url: ''` and `anonKey: ''` as empty strings — consumers can't distinguish "not configured" from "empty value falsy". | Fallback masks missing config. | Use `null`/`undefined` as fallback. |
| 5 | `src/js/modules/feedback.js` | 258–264 | User attribution from `localStorage` (`svu_user_data`) — manually tampered localStorage yields wrong `user_id`. No re-verification with Supabase. | Trusts client-side storage for auth identity. | Use `getCurrentUser()` from core or pass user from caller. |
| 6 | `src/js/modules/core.js` | 74–103 | `isLoggedIn` is purely client-side — no server-side token revocation check. Only checks localStorage timestamp. | Custom session management without server sync. | Call `verifySessionWithServer` inside `isLoggedIn` or use `db.auth.onAuthStateChange` subscription. |
| 7 | `src/js/modules/core.js` | 106–111 | `clearUserSession` only clears localStorage — **Supabase server session persists**. No `db.auth.signOut()` call. | Partial cleanup only. | Import `getDb` and call `db.auth.signOut()` before clearing storage. |
| 8 | `src/js/modules/shared.js` | 156–187 | `enrichCreators` silently swallows all errors (empty `catch` block). Hides API failures. | Defensive error suppression. | At minimum log: `catch (err) { console.error('[enrichCreators]', err); }`. |
| 9 | `src/js/modules/auth/auth-guard.js` | 12 | `getDb() || initSupabase()` can return `null` after first `initSupabase()` fails, causing guard bypass on re-check. | `getDb()` may return `initSupabase()` directly which can return `null`. | Separate "already failed" state from "not yet initialized". |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 11 | `src/js/modules/core.js` | 79–80 | Auth timeout hardcoded to `30 * 60 * 1000` in `isLoggedIn` — diverges from `SECURITY_CONFIG.sessionTimeout` (also 15 min, but duplicated). | Hardcoded constant instead of referencing `AUTH_CONFIG.SESSION_TIMEOUT`. | Use `AUTH_CONFIG.SESSION_TIMEOUT`. |
| 12 | `src/js/modules/utils/helpers.js` | 1–3 | `formatDate` duplicates `shared.js:134-146` with different formatting (en-US vs time-ago logic). | Two separate utility files with overlapping concerns. | Consolidate into `shared.js` or clearly document purpose. |
| 13 | `src/js/modules/utils/helpers.js` | 5–11 | `debounce` duplicates `shared.js:256-262` verbatim. | Code duplication. | Re-export from `shared.js`. |
| 14 | `src/js/modules/utils/constants.js` | 1 | `API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'` — hardcoded localhost fallback leaks internal URL to production. | No production guard on missing env var. | Validate env at startup and fail loudly if missing in production. |
| 15 | `src/styles/utilities.css` | 1–2 | `.hidden` utility conflicts with Tailwind's built-in `hidden` class. | Custom CSS overriding Tailwind utility. | Rename to `.visually-hidden` or remove. |
| 16 | `src/styles/components.css` | 1–7 | Global `button` selector applies styles to ALL buttons including within modals, nav, and tooltips. CSS specificity conflict with Tailwind variants. | Overly broad selector. | Scope with `.btn-primary` class or remove global selector. |

## Recommendations

1. **Add a single source of truth for API base URL** — consolidate `src/services/api.js` and `src/js/modules/utils/constants.js` into `config.js`.
2. **Wire up Supabase auth state listener** — `core.js` has no `db.auth.onAuthStateChange` subscription; add it to keep localStorage in sync with server-side changes.
3. **Clean up `initializeTheme` listener** — export `disposeTheme()` that removes the `matchMedia` listener.
4. **Remove duplicate `.hidden` rule** and scope the global `button` CSS selector.
5. **Add proper error handling** to all async service calls in `gemini.js` and `email.js`.
6. **Add `dispose`/`destroy` pattern** for modules (feedback, theme) to clean up event listeners and DOM nodes.
