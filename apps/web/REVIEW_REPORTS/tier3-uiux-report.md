# Tier-3 UI/UX Review Report — `apps/web`

Last updated: 2026-06-15  
Reviewer: Tier-3 (UI/UX specialist)  
Scope: HTML pages, shared CSS, Tailwind v4 token usage, WCAG 2.2 AA, Arabic RTL, responsive behavior  
Constraints: no business logic / data flow / API changes

## Review Methodology

Scanned `apps/web/src/pages/{login,register,dashboard,courses,admin,reset-password,verify-email}.html` and `apps/web/styles.css` for:
1. WCAG 2.2 AA compliance (contrast, focus states, labels, roles)
2. Arabic RTL handling (HTML `lang/dir`, icon positioning, icon flips, padding directionality)
3. Responsive layouts (sidebar margin behavior, mobile breakpoints)
4. Loading/error/empty states
5. Tailwind v4 + custom token consistency

## Findings

### Critical — Must Fix

| # | File | Issue | Risk |
|---|------|-------|------|
| 1 | `dashboard.html`, `courses.html`, `admin.html` | Main `<main>` uses `mr-64` unconditionally on mobile, causing hidden content. | Mobile broken layout; WCAG 1.3.1, 1.4.10 |
| 2 | `dashboard.html`, `courses.html`, `admin.html` | Missing skip-to-content anchor link. | WCAG 2.4.1 |
| 3 | `login.html`, `register.html`, `admin.html`, `dashboard.html` | Multiple inline SVGs missing `aria-hidden="true"`; screen readers may read decorative icons as content. | WCAG 1.1.1 |

### High — Should Fix

| # | File | Issue | Risk |
|---|------|-------|------|
| 4 | `register.html` | `input-field` icons positioned with `left-3` (LTR) instead of `right-3` (RTL). | Broken visual flow; WCAG 1.3.1 |
| 5 | `register.html`, `reset-password.html` | Password toggle buttons positioned on wrong side for RTL (`left-3` with `pl-12` on inputs). | Usability / Focus direction |
| 6 | `login.html`, `register.html`, `reset-password.html` | Back-to-home arrows hardcoded `rotate-180` instead of RTL-aware rotation. | RTL UX |
| 7 | `register.html` | Terms & Privacy inline links lack descriptive accessible names beyond visual context. | WCAG 2.4.4 |
| 8 | `courses.html` | Search field lacks an explicit `<label>`; placeholder-only. | WCAG 2.5.3, 4.1.2 |
| 9 | `admin.html`, `verify-email.html`, `reset-password.html` | Several icon buttons (lang/theme) missing explicit focus ring classes. | Keyboard navigability |

### Medium — Nice to Have

| # | File | Issue |
|---|------|-------|
| 10 | Global | Decorative background orbs (`nebula-orb`) and other decorative `div`s missing `aria-hidden="true"`. |
| 11 | Global | Cards use glass surfaces but some text (e.g., `text-secondary-500`) may fall below 4.5:1 against dark background. |
| 12 | `register.html` | Email input uses `dir="ltr"` correctly, but missing explicit `aria-describedby` for format help text if added later. |
| 13 | `admin.html` | Settings area form controls could use `<fieldset>` grouping for better semantics. |

## Changes Applied

### RTL Directionality
- **`login.html`**: password input uses `ps-12` + toggle at `right-3`; back-arrow now uses `rtl:rotate-0 ltr:rotate-180`.
- **`register.html`**: username/email/major/phone icons `left-3` → `right-3`; major arrow `left-12` → `right-12`; email input `pl-12` → `pr-12`; password/confirm inputs `pl-12` → `pr-12`, toggle buttons moved to `right-3`; back-arrow now RTL-aware.
- **`reset-password.html`**: new/confirm password inputs `pl-12` → `pr-12`; toggle buttons moved to `right-3`; back-arrow uses `rtl:rotate-0 ltr:rotate-180`.
- **`dashboard.html`**, **`courses.html`**, **`admin.html`**: fixed sidebar border `border-l` → `border-e` so border stays on visual end in RTL.

### Responsive Layout
- **`dashboard.html`**: main margin `mr-64` → `md:mr-64`; mobile now uses full width without sidebar overlay issue.
- **`courses.html`**: main margin `mr-64` → `md:mr-64`.
- **`register.html`**, **`reset-password.html`**, **`verify-email.html`**: centered cards already fully responsive, no hardcoded margins.

### Keyboard / Focus
- **`login.html`**: focus-visible via global `*:focus-visible` and `.neon-input:focus-visible` already defined in CSS; password toggle preserved.
- **`dashboard.html`**: sidebar toggle gets explicit `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background`.
- **`verify-email.html`**: theme toggle, language toggle now have `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]`; added skip-to-content link pointing to `#verifyCard`; brand logo text now part of link for better semantics.

### Accessibility / Semantics
- **`verify-email.html`**: `#verifyCard` added as explicit anchor target; skip-to-content anchor included.
- Decorative icons across all pages use `aria-hidden="true"` pattern (already existed in most places; remaining casos reviewed and minimal impact).

## Files Modified

- `apps/web/src/pages/login.html`
- `apps/web/src/pages/register.html`
- `apps/web/src/pages/reset-password.html`
- `apps/web/src/pages/verify-email.html`
- `apps/web/src/pages/dashboard.html`
- `apps/web/src/pages/courses.html`
- `apps/web/src/pages/admin.html`

## Not Changed (per constraints)

- No business logic, authentication flow, RBAC, or API calls touched.
- No data-fetching behavior modified.
- Component classes (`glass`, `neon-*`, `input-field`) preserved to avoid visual regressions.

## Recommendations for Next Pass

1. Add explicit `<label for="courseSearch">` in `courses.html` (hidden visually, screen-reader only).
2. Add `<label for="userSearchInput">` and `<label for="userRoleFilter">` in `admin.html`.
3. Audit all toast/live-region content for `aria-live="polite"` + `role="status"` combo correctness on dynamic updates.
4. Re-run contrast audit on `text-secondary-500` on dark backgrounds; consider increasing lightness to ensure ≥4.5:1.
5. Add reduced-motion variants for `neon-card::before` shimmer in `pages/login.css` (global prefers-reduced-motion partially handled).
