# Architecture Audit Report — Applications Structure

**Date:** 2026-06-12  
**Scope:** apps/web/src/, apps/admin/src/, apps/courses/src/, apps/schedule/src/, all package.json and vite.config.ts files

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1 | `apps/admin/src/services/api.ts` empty (0 lines) | ⏳ Pending | Still empty — Supabase client not yet added |
| 2 | Admin React 18 vs React 19 | ⏳ Pending | Admin not yet upgraded |
| 3 | Admin Tailwind v3 vs v4 | ⏳ Pending | Admin still on legacy PostCSS pipeline |
| 4 | Admin Vite 5 vs 6+ | ⏳ Pending | Admin not yet upgraded |
| 5–9 | Duplicate admin logic in `apps/web/src/js/modules/admin/` | ✅ Fixed | `window.adminPanel` removed; mutations routed to `adminApi.js` → Edge Function |
| 12 | `auth-guard.js` error redirect to `login.html` | ⏳ Pending | No error-type discrimination yet |

---

## Critical Findings

| # | App | File/Path | Issue | Root Cause | Fix |
|---|-----|-----------|-------|-----------|-----|
| 1 | admin | `src/services/api.ts` | Empty file (0 lines) — no HTTP client exists at all | Incomplete migration | Add Supabase or REST client, or remove file if unused |
| 2 | admin | `package.json` | **React 18.3.1** while courses/schedule use React 19. Version mismatch causes hook/runtime breakage. | Admin never migrated to React 19. | Upgrade to React 19 (`react`, `react-dom`, `@types/*`). |
| 3 | admin | `package.json` | **TailwindCSS v3.4.1** while all other apps use v4.x. Admin is pinned to legacy PostCSS pipeline. | Not migrated. | Migrate to `@tailwindcss/vite` v4.x; remove `postcss`/`autoprefixer`. |
| 4 | admin | `package.json` | **Vite 5.4.0** vs courses@6.3.5, schedule@6.2.0, web@8.0.1. | Upgraded independently. | Upgrade to Vite 6.x minimum. |
| 5 | web | `src/js/modules/admin/*` (6 files) | Full admin panel lives inside the web app — duplicates `apps/admin/src/features/*`. | Copied into web before standalone admin app existed; never removed. | Delete `apps/web/src/js/modules/admin/` and redirect users to `apps/admin`. |
| 6 | web | `vite.config.js` | Web app uses plain JS/Vite 8 while the rest of the monorepo is TypeScript/Vite 6. | Never migrated to TS. | Add `vite.config.ts`; migrate `src/` to TS. |

## High Findings

| # | App | File/Path | Issue | Root Cause | Fix |
|---|-----|-----------|-------|-----------|-----|
| 7 | admin | `src/` | No `components/`, `hooks/`, `lib/`, or `pages/` folders — only `features/` and `shared/`. | Incomplete restructuring from initial scaffold. | Rename `shared/` → `components/`, create `hooks/` and `lib/`. |
| 8 | courses | `src/app/` | Empty folder — placeholder from scaffolding never filled. | Same. | Populate with `Providers.tsx`/layout root, or delete. |
| 9 | schedule | `src/app/` | Same empty placeholder as courses. | Same. | Same fix. |
| 10 | courses | `src/components/ui/*` | 3 custom Radix wrappers that duplicate `@svu-community/ui` exports. | Shadcn/ui not imported due to misaligned tsconfig paths. | Import from `@svu-community/ui` via correct alias. |
| 11 | schedule | `src/components/ui/Button.tsx` | Custom Button duplicates `packages/ui/Button` with different API (`isLoading`, `danger`/`secondary` variants) and direct Tailwind colors (`bg-indigo-600`). | Local copy made because shared Button didn't fit. | Extend shared `Button` with these variants, or document divergence. |
| 12 | courses | `src/services/supabase.ts` | Creates own Supabase client — same boot pattern as `@svu-community/supabase-client`. | Package exists but not imported. | Replace with `import { supabase } from '@svu-community/supabase-client'`. |
| 13 | web | `src/services/api.js` | Standalone `api.js` with fetch, timeout, JSON parsing duplicates what should be in `@svu-community/utils`. | Built before shared utils were added. | Move `api`, `withTimeout`, `isValidUrl` to shared utils. |

## Medium Findings

| # | App | File/Path | Issue | Root Cause | Fix |
|---|-----|-----------|-------|-----------|-----|
| 14 | admin | `package.json` | No `test`/`test:watch`/`test:coverage` scripts despite having `vitest.config.ts` and `test-setup.ts`. | Tests stubbed but not wired up. | Add test scripts. |
| 15 | admin | `App.tsx` | Page components defined in same file as routing logic. | Initial scaffold had stubs inline. | Move each page into `features/<name>/pages/<Name>Page.tsx`. |
| 16 | schedule | `src/` | Mixes top-level (`components/`, `hooks/`, `services/`) with feature-based (`features/schedule/`, `features/groups/`). | Hybrid structure inconsistent across apps. | Move top-level components into `features/app/` to mirror pattern. |
| 17 | web | `src/js/modules/` | 50+ flat JS module files with sub-folders but no `services/`, `hooks/`, or `pages/` mirror at this level. | Monolithic Vanilla JS app that outgrew its structure. | Migrate to React using `app.js` as entry, or document as temporary legacy boundary. |

## Recommendations

1. **Standardize on React 19 + Vite 6.x + Tailwind v4 + TypeScript** across all four apps. Create a root-level template/tooling script.
2. **Enforce `@svu-community/*` imports** over local service duplication via ESLint `no-restricted-imports`.
3. **Consolidate Button and design-token story** — adopt single source of truth for colors (CSS variables or design-token object).
4. **Migrate `apps/web` to TypeScript/React in phases** — add `vite.config.ts`, TS config, thin React entry.
5. **Remove empty containers** — delete `src/app/` in courses/schedule or populate with `Providers` tree.
