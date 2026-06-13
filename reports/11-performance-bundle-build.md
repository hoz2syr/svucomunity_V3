# Performance Audit Report — Bundle Size & Build Config

**Date:** 2026-06-12  
**Scope:** apps/*/package.json, apps/*/vite.config.ts, apps/*/src/ (imports), packages/ui/src/

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| C1–C3 | Courses app: no build optimizations, `@xyflow/react` statically imported | ⏳ Pending | `vite.config.ts` still bare-minimum; no `manualChunks` |
| H1–H2 | Admin React 18 + Tailwind v3 | ⏳ Pending | Admin not yet upgraded |
| H3 | `packages/ui/src/index.ts` barrel export pattern | ⏳ Pending | No subpath exports added |
| H4 | 40+ shadcn components not audited for usage | ⏳ Pending | No pruning audit yet |

---

## Critical Findings

| # | App/File | Issue | Root Cause | Fix |
|---|-----------|-------|-----------|-----|
| C1 | `apps/courses/vite.config.ts` | **No build optimizations** — no `rollupOptions`, no `chunkSizeWarningLimit`, no code splitting | Config is bare-bones (7 lines, plugins only) | Add `build.rollupOptions.output.manualChunks` for splitting React Flow/motion into vendor chunks |
| C2 | `apps/courses/src/components/interactive-map/InteractiveMap.tsx:2` | **@xyflow/react (React Flow, ~500KB) statically imported at top level** | Direct top-level import forces entire flow library into initial bundle | Use `React.lazy(() => import('@xyflow/react'))` or move to dynamic `import()` |
| C3 | `apps/courses/src/App.tsx:6-7` | **InteractiveMap and course grid eagerly imported** — map tab uses React Flow but is bundled with courses tab | `InteractiveMap` imported statically even though it's on a separate tab | Lazy-load with `React.lazy` + `Suspense` |

## High Findings

| # | App/File | Issue | Root Cause | Fix |
|---|-----------|-------|-----------|-----|
| H1 | `apps/admin/package.json` | **React version mismatch** — admin uses React 18, courses/schedule use React 19 | Outdated dependencies | Upgrade admin to React 19 and Vite 6 to match the rest |
| H2 | `apps/admin/package.json` | **Tailwind CSS v3 + PostCSS** while others use v4.x + `@tailwindcss/vite` | Locked on legacy pipeline | Migrate to `@tailwindcss/vite` v4.x |
| H3 | `packages/ui/src/index.ts` | **Barrel export pattern** — re-exports all 25+ components into every consumer | Barrel file pulls everything | Have consumers import from specific paths |
| H4 | `packages/ui/` | **40+ shadcn/ui components may exceed actual usage** — copy-paste registry install without pruning | No audit of actual consumption | Audit imports and remove unused components |

## Medium Findings

| # | App/File | Issue | Root Cause | Fix |
|---|-----------|-------|-----------|-----|
| M1 | `apps/courses/src/App.tsx:2` | All Radix UI primitives are top-level imports (13 packages) | Direct imports | Radix is tree-shakeable via individual packages — ensure they aren't bundled from a barrel file |
| M2 | `apps/courses/src/App.tsx:9` | `lucide-react` imported statically with 12+ icon names | Static import | Should be tree-shaken; verify with bundle analyzer |
| M3 | `apps/admin/vite.config.ts`, `courses/vite.config.ts`, `schedule/vite.config.ts` | No `build.sourcemap: false` explicitly set | No explicit sourcemap config | Add `build.sourcemap: false` for production |
| M4 | `apps/courses/package.json` | Mixed exact vs caret dependency versions | Inconsistent versioning strategy | Use `^` consistently |

## Low Findings

| # | App/File | Issue | Root Cause | Fix |
|---|-----------|-------|-----------|-----|
| L1 | `apps/web/vite.config.ts` | Vite config missing (only has vitest.config.ts) | Web app has no build config file | Add minimal `vite.config.ts` with proper build behavior |
| L2 | `apps/courses/src/components/interactive-map/lib/layoutUtils.ts:2` | Small extra @xyflow/react import (Node, Edge, Position types) | Separate type imports | Move all @xyflow/react imports to single location |
| L3 | `apps/courses/package.json` | `tw-animate-css` (~10KB) bundled — may overlap with Tailwind v4 animations | Tailwind v4 can generate animations | Verify if styles are actually used; remove if redundant |

## Recommendations

1. **Lazy-load InteractiveMap** in courses app: `const InteractiveMap = React.lazy(() => import('./components/interactive-map/InteractiveMap'))`
2. **Add manualChunks to all apps' vite.config.ts** to split vendor React, UI, and motion into separate chunks
3. **Audit unused UI components** in `packages/ui/src/components/ui/` and remove anything not imported
4. **Align Vite versions** across all apps to a single minor (e.g., 6.x)
5. **Use subpath exports** in `packages/ui` instead of barrel re-exports to reduce bundle size
