# Security Audit Report — XSS, Injection & OWASP

**Date:** 2026-06-12  
**Scope:** apps/*/src/, packages/ui/src/

---

## Fix Status (2026-06-12)

| # | Finding | Original Status | Current Status | Notes |
|---|---------|----------------|----------------|-------|
| 1 | `chart.tsx` — CSS injection via `dangerouslySetInnerHTML` | Critical | ✅ Fixed | Added `/^[a-zA-Z0-9_-]+$/` key validation before interpolation |
| 2 | `admin/events.js` — `preview.innerHTML = html` Stored XSS | Critical | ✅ Fixed | Replaced HTML preview with plain-text assignment using `textContent` |
| 3 | `core.js` — PII in localStorage | Critical | ⏳ Pending | Partial — session token localStorage usage remains; full remediation requires cookie migration |
| 4 | `page-dashboard.js` — Reflected XSS via `innerHTML` | High | ✅ Fixed | `showErrorState()` now builds DOM via `createElement` and `textContent` |
| 5 | `admin/actions.js` — client-side authZ bypass | High | ✅ Fixed | Admin mutations moved to `adminApi.js` → `db.functions.invoke('admin-actions')` |
| 6 | `feedback.js` / i18n — DOM-based XSS | High | ✅ Fixed | Modal now built with `createElement` + `textContent`; no untrusted innerHTML insertion |
| 7 | `SUPABASE_SERVICE_ROLE_KEY` in `.env.example` | High | ✅ Fixed | Removed from `.env.example`; server-only |
| 8 | `email.js` — `sendToAllUsers` no role check | High | ✅ Fixed | Bulk email now routed through Edge Function |

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 1 | `packages/ui/src/components/ui/chart.tsx` | 82–99 | **CSS Injection via `dangerouslySetInnerHTML`** — config keys interpolated into CSS selectors as `--color-${key}` without validation. Malicious key value like `"; background:url('javascript:…')"` could lead to CSS injection/XSS. | Config keys not sanitized before embedding in CSS rules. | Validate config keys with regex `/^[a-zA-Z0-9_-]+$/` before interpolation. |
| 2 | `apps/web/src/js/modules/admin/events.js` | 97 | **Stored XSS in admin email preview** — `preview.innerHTML = html` directly injects raw HTML from textarea. Admin with session hijack could inject `<script>` tags. | No sanitization before innerHTML assignment. | Use DOMPurify: `preview.innerHTML = DOMPurify.sanitize(html);`. Or use sandboxed `<iframe sandbox srcdoc>`. |
| 3 | `apps/web/src/js/modules/core.js` | 56–71 | **Plaintext sensitive PII in localStorage** — full user object (email, username, name, major) stored as unencrypted JSON. Any XSS or malicious browser extension exfiltrates all user PII. | Sensitive data in localStorage without encryption. Session token also stored here. | Move session tokens to httpOnly cookies. Remove PII from localStorage — fetch from server on demand. |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 4 | `apps/web/src/js/modules/page-dashboard.js` | 18–22 | **Reflected XSS** — `showErrorState()` builds HTML: `'<p class="text-red-400">' + message + '</p>'`. If attacker controls `message` (e.g., via URL param), it executes as XSS. | Error message concatenated into HTML without escaping before innerHTML assignment. | Use `textContent` instead: `const p = document.createElement('p'); p.textContent = message;` |
| 5 | `apps/web/src/js/modules/admin/actions.js` | 3–62 | **Client-side authorization bypass** — All admin mutations done client-side via Supabase JS SDK. Authorization depends solely on client-side `is_admin` flag. | No server-side enforcement. | Move all admin mutations to Supabase Edge Functions with `SECURITY DEFINER` admin checks. Client should only call Edge Functions. |
| 6 | `apps/web/src/js/modules/feedback.js` | 136–161, 242–250 | **DOM-based XSS via i18n output** — `buildModal()` interpolates `t('fbTitle')` etc. directly into innerHTML. If translation strings are tampered with (prototype pollution), malicious HTML executes. | i18n output not escaped before innerHTML. | Apply `escapeHtml()` around all `t()` calls inside innerHTML, or use `createElement` + `textContent`. |
| 7 | `.env.example` | 7 | **Server-side secret in client env template** — `SUPABASE_SERVICE_ROLE_KEY` listed. Developer might copy to client `.env`, exposing full DB bypass. | Copied from backend template. | Remove from `.env.example`. Document as server-only variable. Add pre-build check that forbids `VITE_SUPABASE_SERVICE_ROLE_KEY`. |
| 8 | `apps/web/src/js/modules/email.js` | 107–141 | **Authorization bypass in `sendToAllUsers`** — fetches all user emails client-side via `.from('users').select('email')`. Any authenticated user can call it. Error strings show 'UNAUTHORIZED' and 'FORBIDDEN' — confirming no role check. | No client-side or server-side auth check. | Add `if (!user?.is_admin) return error` before query. Move bulk email to Edge Function with server-side admin check. |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 9 | `apps/web/src/js/modules/core.js` | 74–103 | Session timeout is 30 min hardcoded, but `SECURITY_CONFIG.sessionTimeout` is 15 min (never applied). Token rotation not implemented. | Inconsistent timeout values. | Apply `SECURITY_CONFIG.sessionTimeout` in `isLoggedIn()`. Implement token rotation. |
| 10 | `apps/web/src/js/modules/page-login.js` | 110–127 | Username enumeration — separate user lookup query before `signInWithPassword` creates timing oracle. | Pre-lookup before authentication. | Use `signInWithPassword` directly with identifier. Remove pre-lookup. |
| 11 | `packages/utils/src/index.ts` | 32–36 | `escapeHtml` uses DOM round-trip (innerHTML → textContent → innerHTML). The utils version differs from `core.js` regex version — inconsistent escape strategy. | Two implementations of the same utility. | Consolidate on regex-based version from `core.js`, export from `packages/utils`. |
| 12 | `apps/web/src/js/modules/ocr.js` / `apps/schedule/src/services/gemini.ts` | 149, 67 | Error codes like `GEMINI_API_KEY_INVALID` thrown and could be displayed to users, revealing which third-party services are configured. | API errors propagated to user-facing messages without sanitization. | Map API-specific codes to generic messages: "Image processing failed". Log details server-side only. |

## Low Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| 15 | `apps/web/src/js/modules/core.js` | 26–41 | `safeStorageSet/Get/Remove` swallow all errors silently — if localStorage is full/disabled, auth appears functional but silently fails. | Silent catch blocks with no logging. | Add conditional logging behind DEBUG flag. |
| 16 | Multiple files | — | Global namespace pollution: `window.svuFeedback`, `window.emailService`, `window.extractScheduleFromImage`, `window.SVU_ENV` — prototype pollution risk. | Backward-compat globals. | Consolidate into `window.SVU = { ... }` namespace and freeze it. |

## Recommendations

1. Add Content-Security-Policy headers (script-src 'self') to all HTML responses.
2. Migrate admin mutations to Supabase Edge Functions.
3. Replace all `innerHTML` with `textContent`/`createElement` where possible. Where unavoidable, use DOMPurify.
4. Remove localStorage for tokens and PII. Use httpOnly cookies via `@supabase/ssr`.
5. Add security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
6. Implement input validation with Zod on all `.insert()` and `.update()` calls.
7. Add CSRF tokens for mutation operations using Supabase's `xsrf_cookie_name`.
