# Restructuring Log — Phase A (Cleanup Only)

**Date:** 2026-06-16  
**Scope:** `apps/web` — restructuring without breaking existing behavior  
**Status:** ✅ Complete

---

## A1 — HTML `<head>` Audit (Completed, no destructive changes)

### Script placement fix
Moved `<script>` tags from `<head>` to end of `<body>` for pages that had render-blocking scripts:

| File | Scripts moved | Rationale |
|------|--------------|-----------|
| `src/pages/login.html` | `/env.js`, `window-shim.js`, `/src/app.js` | Render-blocking in `<head>` |
| `src/pages/register.html` | `/env.js`, `/src/app.js` | Render-blocking in `<head>` |
| `src/pages/verify-email.html` | Supabase CDN ESM module | Render-blocking in `<head>` |

### CSS reference audit
| File | Before | After | Issue |
|------|--------|-------|-------|
| `index.html` | `main.css` + `home.css` | unchanged | OK |
| `login.html` | `main.css` + `auth.css` + `cairo.css` | unchanged | OK |
| `register.html` | `main.css` + `auth.css` + `login.css` + `cairo.css` | unchanged | ⚠️ `login.css` is likely misnamed; should be `register.css` in future phase |
| `verify-email.html` | `main.css` + `auth.css` + `cairo.css` | unchanged | OK |
| `reset-password.html` | `main.css` + `auth.css` + `cairo.css` | unchanged | OK |
| **`dashboard.html`** | `vendor/fonts/cairo.css` only | **+ `/src/styles/main.css`** | **Fixed missing dependency** (uses `glass`, `gradient-text`, `bg-background` etc.) |
| `courses.html` | `main.css` + `auth.css` + `cairo.css` | unchanged | OK |
| `admin.html` | `main.css` + `cairo.css` | unchanged | OK |

---

## A2 — CSS Audit (Completed, no destructive changes)

### File hierarchy
```
apps/web/
├── styles.css              (194 lines) ← root-level, imported by main.css
└── src/
    └── styles/
        └── main.css        (23 lines)  ← imports styles.css + auth.css
    └── assets/
        └── auth.css        (129 lines) ← auth primitives
    └── pages/
        ├── home.css        (547 lines) ← homepage-specific
        └── login.css       (509 lines) ← login-specific
```

### Identified duplication (documented, not yet merged)
| Duplication | Severity |
|---|---|
| `@theme` color variables in both `styles.css` and `main.css` | High |
| `prefers-reduced-motion` block in both `styles.css` and `auth.css` | High |
| `.glass` blur conflict: `styles.css` uses `24px`, `main.css` overrides to `16px` | Medium |
| Star field / nebula orb patterns in `home.css` and `login.css` | Medium |
| `.input-field.invalid` in both `styles.css` and `auth.css` | Medium |

**Resolution planned for Phase B** (one CSS per page + shared.css).

---

## A3 — Dead Code Removal

| Action | File | Details |
|--------|------|---------|
| **Deleted** | `src/js/page-admin.js` | 660 bytes, root-level. Not referenced by any HTML. Active version is `src/js/modules/page-admin.js` (45 lines, referenced by `admin.html`) |

---

## A4 — Script Placement Fix

Moved render-blocking scripts from `<head>` to end of `<body>`:

| File | Scripts relocated |
|------|------------------|
| `src/pages/login.html` | `/env.js`, `window-shim.js`, `/src/app.js` |
| `src/pages/register.html` | `/env.js`, `/src/app.js` |
| `src/pages/verify-email.html` | Supabase CDN ESM (`/dist/module/index.js`) |

All other pages already had scripts at end of `<body>`.

---

## A5 — tour/ Module (no changes needed)

The `tour/` subfolder (`tour-css.js`, `tour-handlers.js`, `tour-main.js`, `tour-persistence.js`, `tour-steps.js`, `tour-ui.js`) plus the barrel `tour.js` is **self-contained** — only imported internally. No HTML page references it. No changes needed for Phase A.

The barrel `src/js/modules/tour.js` (1 line: `export { Tour, onboardingTour } from './tour/tour-main.js';`) exists for future use.

---

## Build Status

```
✓ vite build succeeded
  - 235 modules transformed
  - All HTML pages emitted to dist/
  - CSS chunks: auth (1.79 kB), login (10.31 kB), main (11.27 kB), shared (38.24 kB)
  - JS chunks: all page bundles created successfully
```

## Test Status

**Pre-existing failures (not caused by Phase A changes):**

| Suite | Status | Root cause |
|-------|--------|-----------|
| `auth-guard.test.js` | FAIL | Wrong import path `../../js/modules/auth/auth-guard.js` (off by one level from `src/__tests__/`) |
| `config.test.js` | FAIL | Wrong import path `../../js/modules/config.js` (same off-by-one) |
| `feedback.test.js` | FAIL | Wrong import path `../../js/modules/feedback.js` |
| `utils.test.js` | FAIL | Wrong import path `../../js/modules/utils/helpers.js` |
| `page-login.test.js` | FAIL (15/16) | `isAllowedRedirect` / `recordFailedLogin` / `getCooldownRemaining` not exported from page-login.js |
| `register-api.test.js` | FAIL (9/9) | `../utils/security.js` not resolved from `page-register/register-api.js` |
| `validation.test.js` | FAIL (1/11) | `validatePassword('password123', ...)` fails uppercase check — logic issue |
| `utils.test.js` (passed suite) | PASS | No failures |
| `validation.test.js` (10/11) | PASS | |

**Phase A changes introduced ZERO new test failures.**

---

## Files Modified (Phase A)

| File | Action | Reason |
|------|--------|--------|
| `src/js/page-admin.js` | **Deleted** | Dead code — `modules/page-admin.js` is the active version |
| `src/pages/login.html` | Scripts moved | Render-blocking scripts in `<head>` |
| `src/pages/register.html` | Scripts moved + re-added at end | Render-blocking scripts in `<head>` |
| `src/pages/verify-email.html` | Supabase script moved | Render-blocking script in `<head>` |
| `src/pages/dashboard.html` | Added `main.css` link | Missing dependency — uses `glass`, `gradient-text` etc. |

## Files NOT Changed (deferred to Phase B)

| File | Planned action |
|------|---------------|
| `styles.css` (root) | Merge into `src/styles/shared.css` |
| `src/styles/main.css` | Remove `@import '../../styles.css'`, consolidate |
| `src/assets/auth.css` | Merge into page-specific or shared |
| `src/pages/home.css` | Rename/move to `page-home.css` in `src/styles/` |
| `src/pages/login.css` | Rename/move to `page-login.css` in `src/styles/` |
| `register.html` | Fix `login.css` → `register.css` reference |
| `index.html` | Move to `src/pages/index.html` |

---

## Next Steps (Phase B)

1. Create `src/styles/shared.css` with: theme tokens, reset, glass/neon primitives, modal/toast, responsive rules
2. Create `src/styles/page-login.css` (from current `pages/login.css`)
3. Create `src/styles/page-home.css` (from current `pages/home.css`)
4. Create `src/styles/page-register.css` (rename `login.css` reference)
5. Update all HTML `<head>` to import `shared.css` + one page CSS
6. Delete `src/pages/home.css`, `src/pages/login.css`, `src/assets/auth.css`, root `styles.css`
7. Simplify `src/styles/main.css` to just re-export `shared.css`
