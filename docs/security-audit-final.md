# Final Security Audit — Cross-App Summary

**Date:** 2026-06-13  
**Auditor:** Kilo (automated cross-cutting audit)  
**Scope:** apps/web · apps/admin · apps/courses · apps/schedule  
**Sources:** `reports/01-security-rls-supabase.md`, `reports/02-security-auth-flows.md`, `reports/03-security-xss-injection.md`

---

## Per-Issue Assessment

| # | Issue | Current Status | Severity | Notes / Recommended Action |
|---|-------|---------------|----------|----------------------------|
| 1 | Auth relying on `is_admin` boolean (client-side only) | **PARTIAL** | Critical | Admin check exists in `apps/admin/src/App.tsx` (queries `users.is_admin` via Supabase SDK), and RLS policies in `004_courses.sql` now require `services.assert_admin()`. However, admin access in the admin app is still a UI-level gate — a determined user with network access can still call Supabase APIs directly. Server-side enforcement is RLS-only; no Edge Function validates admin before returning data. **Recommended:** Move all admin read/write operations behind Supabase Edge Functions with explicit `SECURITY DEFINER` admin checks. Do not expose `users` table directly from any frontend. |
| 2 | No input sanitization (partially fixed) | **PARTIAL** | High | `packages/utils/src/sanitize.ts` provides `sanitizeHTML`, `sanitizeText`, and `sanitizeUrl` using DOMPurify. The `apps/web/src/js/modules/core.js` also exports an `escapeHtml()` helper, which is used in many legacy HTML template strings (admin pages, page-courses, page-home). However, the **React apps (courses, schedule) do not import or call any sanitizer** — they rely solely on React's JSX auto-escaping. This is safe for attribute/text nodes but does NOT protect if any of these apps later introduce `dangerouslySetInnerHTML`. The `page-dashboard.js` still uses `title.innerHTML = '<div class="text-5xl mb-4">⚠️</div>'` with no sanitization, though the content is hard-coded. **Recommended:** Import and use `sanitizeText()` or `escapeHtml()` consistently across all HTML template strings. Audit `page-dashboard.js` — replace `innerHTML` with `textContent` for static content. |
| 3 | Plain localStorage (partially encrypted) | **PARTIAL** | High | `apps/web/src/js/modules/encrypted-storage.js` is implemented. It XORs values with a per-origin random salt (stored in localStorage itself). This prevents casual plaintext inspection but is **not cryptographically secure**: the salt is stored alongside the ciphertext, the XOR key is a single 32-bit hash, and any XSS that reads localStorage can call `decrypt()` directly. It is a partial improvement over no encryption, but it does **not** protect against XSS. **Recommended:** Do not treat this as a security boundary. Complete the migration to `@supabase/ssr` cookie-based sessions (httpOnly, Secure, SameSite). Remove PII (email, name, major) from localStorage entirely — fetch from server on demand. |
| 4 | No CSRF (partially added) | **PARTIAL** | High | `apps/web/src/js/modules/csrf.js` implements a per-session CSRF token: stored in `sessionStorage`, mirrored in a `SameSite=Strict` cookie, and attached to outgoing Supabase requests via header interceptor (`applyCsrfToSupabase`). This covers the web app. However: (a) CSRF protection is **not implemented in the React apps** (courses, schedule, admin), which use Vite/Vite build and don't use `csrf.js`; (b) the token is `SameSite=Strict` which is correct for same-site, but there is no server-side validation configured in Supabase Edge Functions to actually check the header — the implementation is client-side only. **Recommended:** Confirm Edge Functions actually validate `x-csrf-token` header against the cookie. Extend CSRF token attachment to the React apps' Supabase client. |
| 5 | CSP issues (partially fixed) | **FIXED** | Medium | All web HTML pages (`index.html`, `login.html`, `register.html`, `dashboard.html`, `courses.html`, `admin.html`, `verify-email.html`, `reset-password.html`, `account-locked.html`) include `Content-Security-Policy` via `<meta>` tags. `script-src` is restricted to `'self'` plus `cdn.jsdelivr.net` and `*.supabase.co/com` — no `'unsafe-inline'` or `'unsafe-eval'` in most pages. `frame-ancestors 'none'` is set. Minor gap: `dashboard.html` and `courses.html`/`admin.html` do not include `'wasm-unsafe-eval'` or `blob:` that other pages have — verify this doesn't break any required WASM dependency before finalizing. |
| 6 | XSS in Gemini output | **OPEN** | Critical | Gemini AI output (`extractionResult.major`, `extractionResult.courses[].name`, `courses[].instructor`) flows from `apps/schedule/src/services/gemini.ts` (Edge Function proxy) → `ScheduleResults.tsx` / `ResultsTab.tsx` → rendered directly in JSX as `{course.name}` and `{extractionResult.major}`. While **React JSX auto-escapes** these values for HTML text nodes, the two React components (`ScheduleResults.tsx` and `ResultsTab.tsx`) are nearly identical and **neither imports or applies any sanitization from `packages/utils/src/sanitize.ts`**. There is also no Zod/schema validation on the `ExtractionResult` shape returned from the Edge Function. If a Gemini prompt jailbreak causes the AI to return HTML/Script strings in course names, they are safely rendered as text by React but still stored unvalidated in state and passed to `onCreateGroup`, where they become `course_name` in the DB. **Recommended:** (a) Add Zod schema validation in `gemini.ts` to enforce string constraints (max length, no HTML tags) on `major` and `courses[].name`; (b) use `sanitizeText()` from `packages/utils` on all Gemini output fields before storing in state; (c) add a DB-level CHECK constraint on `study_groups.course_name`. |
| 7 | Error reporting leaking paths | **PARTIAL** | Medium | The web app's `shared.js` applies `escapeHtml()` to error messages before displaying them (`const safeMessage = escapeHtml(message);`). However, the new React apps (schedule, admin) do not apply any path/error sanitization — raw Supabase errors and Gemini API errors are displayed directly in JSX (`<p className="text-sm">{error}</p>`, `<p className="text-sm">{error}</p>` in `ScheduleResults.tsx`, `CourseModal.tsx`, etc.). Gemini error codes like `GEMINI_API_KEY_INVALID` and `GEMINI_PROCESSING_ERROR` are also propagated as user-facing error strings in `gemini.ts`. **Recommended:** Use a generic error message layer in all React apps: map API error codes to user-friendly messages, and escape any user-facing strings. Move detailed error logging to server-side only (Edge Function logs). |

---

## Per-App Sanitization Tracker

| App | File | Display Method | Sanitization Applied | Status |
|-----|------|---------------|---------------------|--------|
| web | `page-dashboard.js` | `innerHTML` (hardcoded ⚠️) | None | ⚠️ Safe (static), but pattern is dangerous |
| web | `page-courses.js` | `innerHTML` + `escapeHtml()` | `escapeHtml()` on `c.name`, `c.description` | ✅ Fixed |
| web | `page-home.js` | `innerHTML` + `escapeHtml()` | `escapeHtml()` on `c.name` | ✅ Fixed |
| web | admin/groups.js | `innerHTML` + `escapeHtml()` | `escapeHtml()` on all fields | ✅ Fixed |
| web | admin/users.js | `innerHTML` + `escapeHtml()` | `escapeHtml()` on all fields | ✅ Fixed |
| courses | `course-grid/index.tsx` | JSX `{course.name}` | React auto-escape only | ✅ Fixed |
| courses | `course-modal/index.tsx` | JSX `{course.name}`, `{resource.title}` | React auto-escape only; `isValidUrl()` blocks `javascript:` etc. | ✅ Fixed |
| schedule | `ResultsTab.tsx` | JSX `{course.name}`, `{extractionResult.major}` | React auto-escape only; no `sanitizeText()` call | ⚠️ OPEN |
| schedule | `ScheduleResults.tsx` | JSX `{course.name}`, `{extractionResult.major}` | React auto-escape only; no `sanitizeText()` call | ⚠️ OPEN |

---

## Security Control Verification

| Control | Status | Evidence |
|---------|--------|----------|
| **CSP headers** | ✅ FIXED | Present in all 9 HTML pages via `<meta http-equiv="Content-Security-Policy">`. `script-src 'self'` + Supabase/JSdelivr only. No `'unsafe-inline'`. `frame-ancestors 'none'`. `base-uri 'self'`. |
| **CSRF tokens** | ⚠️ PARTIAL | `csrf.js` in `apps/web` implements cookie + header token. Non-web React apps have no CSRF token attachment. Edge Functions have no confirmed server-side CSRF check. |
| **Input sanitization** | ⚠️ PARTIAL | `packages/utils/sanitize.ts` exists with DOMPurify utilities. Used in legacy web app modules but **not used in schedule or courses React components** for Gemini output. |
| **Auth checks (admin)** | ⚠️ PARTIAL | `apps/admin/App.tsx` checks `is_admin` via Supabase query before rendering. React apps (courses, schedule) perform no auth check at route level — they render if Supabase session exists. Admin gate is UI-only. |
| **localStorage protection** | ⚠️ PARTIAL | `encrypted-storage.js` implements XOR + salt obfuscation. Better than plaintext but not a real defense against XSS. Session tokens also still flow through Supabase SDK's default Memory/Session storage. Full fix requires `@supabase/ssr` migration. |

---

## Open Critical/High Issues Requiring Immediate Action

1. **[Critical]** Schedule app: Gemini AI output (`course.name`, `instructor`, `major`) must be validated with Zod/schema and sanitized with `sanitizeText()` before storage/display. Apply same treatment in `courses` app for any AI-derived content.

2. **[Critical]** Admin auth: All admin mutations must move to Edge Functions with server-side `assert_admin()` checks. Frontend `is_admin` check is not a security boundary.

3. **[High]** React apps: Import and use `packages/utils/src/sanitize.ts` consistently. Apply `sanitizeText()` to all user/AI-facing strings before display, particularly error messages and AI-generated content.

4. **[High]** localStorage PII: Remove PII (email, name, major) from localStorage. Fetch from server on demand. Complete `@supabase/ssr` migration for httpOnly cookie sessions.

5. **[High]** CSRF in React apps: Apply CSRF token attachment to schedule/courses/admin Supabase clients. Confirm server-side CSRF validation in Edge Functions.

6. **[Medium]** Error leakage in React apps: Map Gemini error codes and Supabase errors to generic user-facing messages. Do not display raw `errMsg` values in JSX.

---

*This report is read-only. No files were modified.*
