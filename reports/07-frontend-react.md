# Frontend Audit Report — React Applications

**Date:** 2026-06-12  
**Scope:** apps/admin/src/, apps/courses/src/, apps/schedule/src/ (.tsx/.ts files)

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin React 18.3.1 vs React 19 | ⏳ Pending | Admin not yet upgraded |
| 2 | `useSchedule.js` broken `@svu-community/supabase-client` import | ⏳ Pending | Still imports from `@svu-community/supabase-client` (broken alias) |
| 3 | `admin/App.tsx` references undefined page components | ⏳ Pending | Pages still missing |
| 4–5 | Empty feature files in admin | ⏳ Pending | Still 0-byte placeholders |
| 9 | `useGroupActions` stale closure race | ⏳ Pending | Not yet refactored |
| 13 | Retry logic duplicated in `useCourseResources` | ⏳ Pending | Shared hook not yet extracted |

---

## Critical Findings

| # | App | File | Line | Issue | Root Cause | Fix |
|---|-----|------|------|-------|-----------|-----|
| 1 | admin | `package.json` | 19 | **React 18.3.1** while courses/schedule use React 19. Version mismatch causes hook/runtime breakage. | Admin never migrated. | Align all apps to React 19. |
| 2 | schedule | `features/schedule/hooks/useSchedule.ts` | 2 | `supabase` imported from `@svu-community/supabase-client` — package exists but actual client lives in `src/services/supabase.ts`. Broken alias. | Two Supabase client files with different configs. | Change to `import { supabase } from '../../services/supabase';`. |
| 3 | admin | `App.tsx` | 37–71 | Imports `DashboardPage`, `UsersPage` etc. — **none of these are imported nor exported** at the top of the file. References to undefined components. | Pages referenced without declarations; will throw `ReferenceError` at runtime. | Import from their feature files, or define before `renderPage`. |
| 4 | admin | `features/*/components/*.tsx` | — | Five feature files are **empty** (0 bytes): `api.ts`, `SettingsPanel.tsx`, `CourseManager.tsx`, `UserTable.tsx`, `StatsCard.tsx`. | Placeholder scaffolding. | Implement or remove imports in `App.tsx`. |

## High Findings

| # | App | File | Line | Issue | Root Cause | Fix |
|---|-----|------|------|-------|-----------|-----|
| 5 | schedule | `services/supabase.ts` | 1–24 | Full Supabase client duplicated in each app instead of shared via `packages/ui`/`packages/supabase`. | No shared layer adoption. | Extract to `packages/supabase-client` and import from there. |
| 6 | courses | `App.tsx` | 40–35 | `getTabTriggerClass` recreated every render as a new function reference; Radix Tabs passes it as `className` causing per-render allocation. | Missing `useCallback` + derived string outside component. | Move to stable class map object outside component. |
| 7 | schedule | `hooks/useSchedule.ts` | 23 | `fetchSchedule` defined **inside useEffect** — also exposed as `refetch` via hook return. `refetch` can't access updated logic because effect closure is stale. | Function scope inside effect. | Lift `fetchSchedule` to module level with `useCallback`. |
| 8 | courses | `components/ErrorBoundary/index.tsx` | 39–57 | `componentDidCatch` calls async `this.reportError` — errors in reporting are silently swallowed by empty `catch {}`. | No failure path for reporting itself. | Log reporting failures or surface via prop callback. |
| 9 | schedule | `hooks/useGroupActions.ts` | 40–58 | `joinGroup` guards with `if (isJoining) return` — but `isJoining` is stale inside `useCallback` closure because it reads initial render value. | Closure captures stale state. | Remove guard and rely on disabled state, or use a ref to track latest loading state. |

## Medium Findings

| # | App | File | Line | Issue | Root Cause | Fix |
|---|-----|------|------|-------|-----------|-----|
| 10 | schedule | `App.tsx` | 5 | Imports `ErrorBoundary` from `@/components/ErrorBoundary` but file is at `components/ErrorBoundary.tsx` without `/index.ts`. | Works via TS extension resolution but inconsistent with courses pattern. | Add `components/ErrorBoundary/index.ts` re-export. |
| 11 | schedule | `lib/utils.ts` | 1 | `export { cn } from '@svu-community/ui';` — indirect re-export of a single utility; fragile if package path changes. | Can drift from actual `cn` source. | Import directly from packages/ui or inline `clsx`+`tailwind-merge`. |
| 12 | schedule | `components/AppTabs.tsx` | 17 | Only `aria-selected` set on tab buttons; missing `aria-controls` linking to tab panels. | Incomplete ARIA. | Add `aria-controls` + match `id` on corresponding content panels. |
| 13 | courses | `hooks/useCourseResources.ts` | 31–57 | Retry-logic block (exponential backoff) is **copied verbatim** from `useCourses.ts`. | No shared abstraction for retry-with-backoff. | Extract to generic `useRetryableQuery` hook in shared packages. |
| 14 | courses | `components/course-modal/index.tsx` | 40–66 | Modal state resets on close but `useCourseResources` subscription persists until unmount. No cancellation on close; wasted Supabase calls on rapid reopen. | No cleanup tied to `course.code`. | Cancel resource fetch in `useEffect` cleanup. |

## Low Findings

| # | App | File | Line | Issue | Root Cause | Fix |
|---|-----|------|------|-------|-----------|-----|
| 19 | admin | `main.tsx` | 1 | Imports `React` directly on React 18 where JSX transform still needs it. | Cross-version diff. | Remove if React 19 `react-jsx`; keep for 18. |
| 20 | courses | `components/course-grid/index.tsx` | 2 | Imports `Course` type from `@/hooks/useCourses` — couples grid to data-access layer. | Grid should receive shape, not source. | Accept `Course` type from `types.ts`. |
| 21 | schedule | `features/` | — | `GroupSchedule.tsx` and `ScheduleGrid.tsx` are **empty** (0 bytes). | Incomplete scaffolding. | Remove imports or provide stub implementations. |
| 22 | schedule | `shared/components/Calendar.tsx` | — | File is **empty** (0 bytes) but path suggests cross-cutting shared component. | Incomplete stub. | Implement or mark as TODO. |

## Recommendations

1. **React version unification** — Update admin to React 19 to match courses/schedule.
2. **Broken import fix** — `useSchedule.ts:2` must import from `../../services/supabase`.
3. **Stale closure refactor** — Move `fetchSchedule` outside `useEffect` with `useCallback`.
4. **Extract shared retry hook** — Both `useCourses.ts` and `useCourseResources.ts` implement identical exponential-backoff. Extract to reusable package.
5. **Consolidate Supabase clients** — Move to single `packages/supabase-client` import everywhere. Fix broken `@svu-community/supabase-client` import.
6. **Shared ErrorBoundary** — Move one copy to `packages/ui` so all apps import from `@svu-community/ui`.
