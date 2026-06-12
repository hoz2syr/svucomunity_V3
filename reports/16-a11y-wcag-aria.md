# A11y Audit Report — WCAG 2.2

**Date:** 2026-06-12  
**Scope:** apps/web/src/, apps/admin/src/, apps/courses/src/, apps/schedule/src/, packages/ui/src/

---

## Critical Findings

| # | File | Line | Issue | WCAG Criterion | Fix |
|---|------|------|-------|---------------|-----|
| 1 | `apps/web/src/js/modules/feedback.js` | 131-166, 170-227 | **Feedback modal lacks `role="dialog"`, `aria-modal`, `aria-labelledby`** — no Escape close handler, no focus trap, rating stars are `<span>` with click handlers (not keyboard accessible) | 2.1.1, 2.1.2, 4.1.2 | Add dialog semantics, Escape handler, focus trap, make stars `<button>` with `aria-label` and keyboard support |
| 2 | `apps/web/src/pages/register.html` | 62, 84, 90, 96 | **Labels missing `for` attribute** — not programmatically associated with inputs | 1.3.1 | Add `for="username"` etc. to all labels |
| 3 | `apps/courses/src/components/interactive-map/InteractiveMap.tsx` | 242-265 | **ReactFlow canvas has no ARIA description/label** — no accessible alternative for the graph | 1.1.1, 4.1.2 | Add `aria-label` to ReactFlow wrapper; provide off-screen summary |

## High Findings

| # | File | Line | Issue | WCAG Criterion | Fix |
|---|------|------|-------|---------------|-----|
| 4 | `apps/web/src/pages/register.html` | 139-143, 168-180 | **Custom combobox/listbox lacks full keyboard navigation** (arrow keys, Home/End, type-ahead) | 2.1.1 | Implement WAI-ARIA combobox authoring practices |
| 5 | `apps/web/src/pages/login.html` | 126-155 | **Forgot password modal** — missing `aria-describedby`, no focus trap, no Escape close handler | 2.1.2, 2.4.3 | Add focus trap and Escape handler |
| 6 | `apps/web/src/js/modules/feedback.js` | 43-72 | **Inactive stars use `rgba(255,255,255,.2)`** — fails AA (normal text requires 4.5:1 contrast on dark background) | 1.4.3 | Adjust star inactive opacity to ≥50% |
| 7 | `apps/web/src/pages/register.html` | 215-221 | **Password strength meter** — visual bars with no `aria-live` or `role="progressbar"` — screen readers cannot perceive changes | 4.1.3 | Add `aria-live="polite"` region announcing strength level |
| 8 | `apps/web/src/pages/verify-email.html` | 67 | **Duplicate `<h1>`** inside logo section AND header container | 1.3.1 | Remove duplicate `<h1>` |
| 9 | `apps/admin/src/shared/layout/AdminLayout.tsx` | 11 | **Empty `<aside>` fallback** has no accessible name (`aria-label`) | 2.4.1, 4.1.2 | Add `aria-label="Admin sidebar"` or render `<nav aria-label="Admin">` |

## Medium Findings

| # | File | Line | Issue | WCAG Criterion | Fix |
|---|------|------|-------|---------------|-----|
| 11 | `apps/web/src/pages/login.html` | 21 | **Skip link text** missing `id` target `<main>` — uses `#main-content` on div without matching id | 2.4.1 | Ensure `id="main-content"` exists on target element |
| 12 | `apps/web/src/pages/dashboard.html` | 16 | **No landmarks** — uses generic `<div>` and `<section>` instead of `<header>`, `<nav>`, `<footer>` | 1.3.1 | Replace with semantic landmarks or add `role`/`aria-label` |
| 13 | `apps/web/src/pages/register.html` | 59 | Form uses `novalidate` but no `aria-invalid` or `aria-live` on error summaries | 3.3.1, 4.1.3 | Add `aria-live="assertive"` for validation errors |
| 14 | `packages/ui/src/components/ui/dialog.tsx` | 65-89 | `DialogContent` does not pass `aria-labelledby` — apps must manually provide via `DialogTitle` | 4.1.2 | Document requirement; enforce via lint rule |
| 15 | `apps/courses/src/components/course-modal/index.tsx` | 69-74 | `DialogContent` has `aria-label` but no internal `<DialogTitle>` for `aria-labelledby` | 4.1.2 | Replace `<h2>` with `<DialogTitle>` component |
| 16 | `apps/schedule/src/components/ResultsTab.tsx` | 145 | `role="alert"` on empty state for no groups — this is informational, not an error | 4.1.3 | Change to `role="status"` or remove role |
| 17 | `packages/ui/src/components/ui/checkbox.tsx` | 17 | **Checkbox `size-4` (16px) below WCAG 2.2 target size minimum of 24x24px** | 2.5.8 | Increase to `size-6` or add touch target padding |

## Recommendations

1. **Add global skip links** to every auth and main app page
2. **Replace generic `<div>` wrappers** with `<header>`, `<nav>`, `<main>`, `<footer>` landmarks on all pages
3. **Refactor feedback modal module** — add dialog semantics, focus trap, Escape handler, keyboard-activatable stars
4. **Implement combobox/listbox keyboard support** per WAI-ARIA APG for major/country selectors
5. **Add `aria-live` regions** for dynamic content (verify-email, reset-password, password strength)
6. **Audit heading hierarchy** — remove duplicate `<h1>` tags
7. **Fix interactive map accessibility** — add `aria-label`/`aria-describedby`, provide keyboard-navigable alternative
8. **Remove duplicate `<link rel="icon">` tags** in reset-password, account-locked, verify-email pages
