# Performance Audit Report — Runtime & Caching

**Date:** 2026-06-12  
**Scope:** apps/schedule/src/hooks/, apps/courses/src/hooks/, apps/web/src/js/, apps/*/vite.config.ts

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| C-1 | `apps/schedule/src/hooks/useStudyGroups.ts` | 31–73 | `loadMore` closure captures `offsets`, `hasMore`, `isLoadingMore` as stale reads | `useCallback` deps read from closure, not from functional-update state setter | Rewrite to use functional-update pattern: `setOffsets(prev => { const next = prev[courseCode] ?? 0; ...; return prev })`. Then deps become `[]`. |
| C-2 | `apps/schedule/src/hooks/useGroupActions.ts` | 40–77 | `isJoining || isLeaving || isCreating` gate is a stale-closure race per-action | Each callback reads its own loading flag from closure, not a ref | Store action flags in a single `useRef` object |
| C-3 | `apps/courses/src/hooks/useCourses.ts` | 42–45 | Retry `setTimeout` has no cancel on unmount — mutates state after component unmounted | No cleanup function in `useEffect` | Add `let cancelled = false;` in `useEffect`, set in cleanup, guard all setters |
| C-4 | `apps/web/src/js/shared.js` | 24–58 | `coursesData` is an in-memory module singleton with **zero invalidation** — fetched once forever | Module-level `let coursesData = null` is never reset | Add TTL (e.g. 5 min) and expose `invalidateCoursesCache()` |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| H-1 | `apps/courses/src/hooks/useCourseResources.ts` | 38 | `select('*')` on `course_resources` — fetches every column instead of ~6 actually shown | Over-fetching | Replace with explicit column list |
| H-2 | `apps/courses/src/hooks/useCourses.ts` | 26 | No pagination on `courses` table — fetches entire active catalog | No `.range()` call | Add `.range(0, 199)` and `hasMore`/`loadMore` pair |
| H-3 | `apps/schedule/src/hooks/useStudyGroups.ts` | 149–165 | Realtime channel fires full re-fetch on **any** table change, even if row not in `uniqueCourseCodes` | Handler calls `fetchGroups()` with no diff-merging | Debounce handler with 150–250ms timer |
| H-4 | `apps/web/src/js/modules/app.js` + HTML pages | dashboard.html line 86, index.html line 97 | Vanilla JS app loads **all** page modules upfront via static `<script>` tags | No bundling; all modules loaded eagerly | Consolidate shared runtime into single bundle via Vite/Rollup |
| H-5 | `apps/courses/src/components/course-modal/index.tsx` | 218–269 | `ResourceItem` recreated on every render; icon/color maps re-allocated per render | No memoization | Move maps to module scope; wrap `ResourceItem` in `React.memo` |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| M-1 | `apps/web/index.html` line 12 | CSP blocks `'self'` + external CDN for fonts — `wasm-unsafe-eval` permitted for no clear reason | WASM required by some dependencies but is a cost | Audit if `wasm-unsafe-eval` still needed; remove if not |
| M-2 | `apps/web/src/pages/dashboard.html` line 14 | Synchronous `<script src="vendor/supabase.min.js">` in `<head>` blocks parser | 100–200KB vendor script blocking LCP | Move to end of `<body>` or add `defer` |
| M-3 | `apps/courses/src/components/course-modal/index.tsx` | 160–193 | Search/filter state creates new objects on every keystroke causing full re-filter | `useMemo` deps include `searchQuery` | Wrap text input in `useDeferredValue` or debounce `setSearchQuery` |
| M-4 | `apps/web/src/js/modules/core.js` | 46–131 | `getCurrentUser` / `updateUserData` re-reads and re-parses localStorage on every call without caching | No module-level cache | Cache parsed user object with 1-second TTL |
| M-5 | `apps/courses/src/components/course-grid/index.tsx` | 9–61 | `CourseGrid` not memoized — every filter/major change re-renders all cards | Plain function component | Wrap with `React.memo` and custom comparator |

## Low Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| L-1 | `apps/web/index.html` + `dashboard.html` | Font `<link>` | No `<link rel="preconnect">` to Google Fonts — first visit has no TCP warm-up | Reduces font FCP by ~100–200ms | Add preconnect links before stylesheet |
| L-2 | `apps/courses/src/hooks/useCoursesApp.ts` | 61–72 | `state` and `actions` objects rebuilt on every render — shallow equality checks always fail | Aggregate return pattern | Memoize return value or return individual primitives |
| L-3 | `apps/web/src/js/modules/utils/helpers.js` | Various | No `loading="lazy"` on `<img>` tags in HTML | Missing lazy-loading attribute | Add `loading="lazy"` to off-fold images |

## Recommendations

1. **Migrate data fetching to React Query** — eliminates retry setTimeout bugs, stale closures, and manual caching
2. **Add `<link rel="preconnect">` to Supabase subdomain** in all HTML shells
3. **Add SWC/Brotli compression** in all apps' vite.config.ts
4. **Add service worker** for static asset caching via `vite-plugin-pwa`
5. **Debounce realtime handlers** — add 150-250ms debounce to `useStudyGroups` realtime callback
