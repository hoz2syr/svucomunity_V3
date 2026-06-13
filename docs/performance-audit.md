# Performance Audit Report

**Date:** 2026-06-13  
**Scope:** apps/web, apps/admin, apps/courses, apps/schedule  
**Type:** Research/read-only audit

---

## 1. apps/web

### Current State
- **Framework:** Vanilla JS (no React)
- **Entry points:** 7 HTML pages (`index.html`, `login`, `register`, `dashboard`, `verify-email`, `reset-password`, `account-locked`)
- **CSS:** Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Runtime deps:** `@supabase/supabase-js` (imported dynamically), `tailwindcss`

### vite.config.ts Analysis
```js
build: {
  minify: 'esbuild',      // ✅ enabled
  sourcemap: false,       // ✅ disabled for prod
  assetsInlineLimit: 4096,
  cssCodeSplit: true,     // ✅ CSS code splitting enabled
}
```
- **manualChunks:** None configured
- **tree-shaking:** Enabled by default via esbuild/Rollup
- **compression (gzip/brotli):** Not configured

### Identified Issues
1. **No page-level code splitting for JS modules** — `page-dashboard.js` and `page-courses.js` are loaded via dynamic `import()` in `app.js`, which is correct, but there are no Rollup manual chunks to further split vendor code (e.g., Supabase, i18n utilities) into separate chunks.
2. **No compression plugins** — no `vite-plugin-compression` or `rollup-plugin-brotli` configured. Production deployments will serve uncompressed `.js` files.
3. **Supabase client loaded per-page** — `getDb()` in `config.js` likely creates a singleton, but the dynamic import in `App.tsx:30` (admin) pattern is not present here; the Supabase import is statically referenced in `app.js`, meaning it's included even on pages that don't need auth (e.g., login, register).
4. **No `build.rollupOptions.output.manualChunks`** — vendor code isn't separated from app code.

### Estimated Bundle Size
- **Initial JS:** ~20–40 KB (vanilla, minimal)
- **Total (all pages lazy-loaded):** ~80–120 KB gzipped

### Recommended Optimizations (Prioritized)
| Priority | Action |
|----------|--------|
| P0 | Add `vite-plugin-compression` for gzip/brotli output |
| P1 | Add `manualChunks` to separate `node_modules` into a `vendor` chunk |
| P1 | Lazy-load Supabase client only on authenticated pages (dashboard) |
| P2 | Add `build.reportCompressedSize: true` for build-time bundle analysis |
| P2 | Configure `assetsInlineLimit` based on actual asset sizes |

---

## 2. apps/admin

### Current State
- **Framework:** React 19 + TypeScript
- **Pages:** 4 admin feature pages (Dashboard, Users, Courses, Settings)
- **UI lib:** `@svu-community/ui` (workspace monorepo dep), `motion`, `lucide-react`
- **Routing:** Custom lightweight router (`useRoute` / `registerRoute`), no React Router

### vite.config.ts Analysis
```ts
// Only 8 lines — NO build section at all
plugins: [tsconfigPaths(), react(), tailwindcss()]
```
- **minify:** Enabled by default in Vite 6 (`esbuild`)
- **manualChunks:** ❌ Not configured
- **tree-shaking:** Default Rollup tree-shaking applies, but without manual chunks everything bundles together
- **compression:** ❌ Not configured

### Identified Issues
1. **All pages eagerly imported** — `DashboardPage`, `UsersPage`, `CoursesPage`, `SettingsPage` are all statically imported in `App.tsx:5-8` and registered at module load time. This means the entire admin bundle (all 4 pages + all their sub-components) is loaded on every admin page visit.
   ```tsx
   import DashboardPage from './features/dashboard/DashboardPage';
   import UsersPage from './features/users/UsersPage';
   import CoursesPage from './features/courses/CoursesPage';
   import SettingsPage from './features/settings/SettingsPage';
   ```
2. **`motion` (framer-motion) bundled into admin** — `motion` is a heavy animation library (~60–100 KB gzipped). It is used in sidebar and page transitions but isn't split into its own chunk.
3. **No route-based code splitting** — Despite having a `useRoute()` hook that supports dynamic `Component` rendering, pages are not lazy-loaded. The pattern `const CurrentPage = useRoute().Component` exists but is never populated with a lazy-loaded component.
4. **`AdminLayout` + `Sidebar` always rendered** — Not a major issue, but combined with eager page imports, the entire admin bundle is monolithic.
5. **World's smallest vite.config** — Missing all build optimizations.

### Estimated Bundle Size
- **Initial JS:** ~150–250 KB gzipped (React 19 + all 4 admin pages + ui lib + motion)
- **Worst case (all pages):** Could reach ~400–600 KB if all feature code + tables are inlined

### Recommended Optimizations (Prioritized)
| Priority | Action |
|----------|--------|
| P0 | Lazy-load admin pages with `React.lazy()` + `Suspense` |
| P0 | Add `vite-plugin-compression` for gzip/brotli |
| P1 | Add `manualChunks` to separate React, motion, and @svu-community/ui |
| P1 | Remove `motion` if only used for simple transitions — replace with CSS transitions |
| P2 | Add `build.rollupOptions.output.manualChunks` config section |
| P2 | Consider `build.sourcemap: false` (already default in Vite 6) |

---

## 3. apps/courses

### Current State
- **Framework:** React 19 + TypeScript
- **Core feature:** Course grid + Interactive prerequisite map (ReactFlow)
- **Data:** Large static `iteData` object embedded in bundle
- **UI:** 12+ `@radix-ui/*` packages, `@xyflow/react`, `dagre`, `lucide-react`, `motion`, `tailwind-merge`

### vite.config.ts Analysis
```ts
// Only 7 lines — NO build section at all
plugins: [react(), tsconfigPaths()]
```
- **minify:** Enabled by default (esbuild)
- **manualChunks:** ❌ Not configured
- **tree-shaking:** Default applies, but 12 radix-ui packages are bundled together
- **compression:** ❌ Not configured

### Identified Issues
1. **`iteData` loaded eagerly into the main bundle** — `InteractiveMap.tsx:5` imports the entire ITE data object at the top level:
   ```tsx
   import { iteData } from './data/ite_data';
   ```
   The file `ite_data.ts` is 414+ lines of course data. This entire object is bundled into the main JS chunk even if the user never switches to the "map" tab.
2. **`@xyflow/react` (ReactFlow) loaded eagerly** — The entire ReactFlow library (~200–300 KB gzipped) is imported at the top of `InteractiveMap.tsx:2`:
   ```tsx
   import { ReactFlow, Background, Controls, MiniMap, ... } from '@xyflow/react';
   import '@xyflow/react/dist/style.css';
   ```
   ReactFlow includes dagre, complex SVG rendering, and interaction logic. This is loaded even on initial page render before any user navigates to the map tab.
3. **No lazy loading of the map tab** — `App.tsx:93-95` renders `<InteractiveMap />` inside a Radix Tabs tab, but it's not wrapped in `React.lazy()`:
   ```tsx
   <Tabs.Content value="map" className="h-[calc(100vh-180px)]">
     <InteractiveMap />
   </Tabs.Content>
   ```
4. **12 Radix UI packages all bundled together** — `@radix-ui/react-accordion`, `alert-dialog`, `avatar`, `checkbox`, `dialog`, `dropdown-menu`, `label`, `select`, `separator`, `slot`, `tabs`, `tooltip` are all in `node_modules` and bundled into the main chunk. While tree-shaking can help, having no manual chunks means they all share the same bundle.
5. **`dagre` bundled** — Used only for ReactFlow layout in `layoutUtils.ts`. Could be code-split with ReactFlow.
6. **No compression** — Same as other apps.

### Estimated Bundle Size
- **react + react-dom:** ~40 KB gzipped
- **@xyflow/react + dagre + styles:** ~200–300 KB gzipped  
- **12 radix-ui packages:** ~50–80 KB gzipped  
- **iteData (course data):** ~30–60 KB (embedded JSON)
- **lucide-react + motion + app code:** ~50–80 KB gzipped
- **Total estimate:** ~400–600 KB gzipped for the initial bundle

### Recommended Optimizations (Prioritized)
| Priority | Action |
|----------|--------|
| P0 | Lazy-load `<InteractiveMap />` with `React.lazy()` + `Suspense` — map is hidden behind a tab |
| P0 | Move `iteData` to a separate chunk or fetch it asynchronously from a JSON file |
| P1 | Move `@xyflow/react` and `dagre` to a `vendor-reactflow` manual chunk |
| P1 | Move all `@radix-ui/*` packages to a `vendor-radix` manual chunk |
| P1 | Add `vite-plugin-compression` for gzip/brotli |
| P2 | Consider importing specific lucide-react icons (tree-shaking issue if not already done) |
| P2 | Evaluate if `motion` is needed for all pages or can be deferred |

---

## 4. apps/schedule

### Current State
- **Framework:** React 19 + TypeScript
- **Features:** File upload (Google AI extraction), study group management, real-time Supabase subscriptions
- **Lazy loading:** Already using `React.lazy()` for `UploadTab` and `ResultsTab`
- **Heavy deps:** `@google/genai` (Google AI SDK), `motion`, `lucide-react`

### vite.config.ts Analysis
```ts
// Only 7 lines — NO build section at all
plugins: [react(), tsconfigPaths()]
```
- **minify:** Enabled by default (esbuild)
- **manualChunks:** ❌ Not configured
- **tree-shaking:** Default applies
- **compression:** ❌ Not configured

### Identified Issues

**A. Real-time subscription re-render storm (HIGH)**
`useStudyGroups.ts:79-188` sets up a Supabase realtime channel. The subscription callback calls `fetchGroups()` on every INSERT or DELETE event:
```ts
channel = supabase
  .channel(`study_groups_${safeCourseCodes.join(',')}`)
  .on('postgres_changes', { event: '*', ... }, (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
      fetchGroups();  // Re-fetches ALL groups for ALL courses
    }
  })
```
Problems:
- `fetchGroups()` re-queries the entire dataset for all course codes on every INSERT/DELETE — pagination offsets are reset because `setOffsets` is recalculated from the fresh data.
- The effect dependency `[uniqueCourseCodes, enabled, PAGE_SIZE]` means the channel is torn down and recreated whenever `courseCodes` change (i.e., after every file upload with new courses).
- `courseCodes` is a new array on each render (`extractionResult?.courses.map(...)`), but it's wrapped in `useMemo` in App.tsx:23-25, so this is mitigated. However, the `enabled` flag toggling causes channel churn.
- No debounce on the realtime payload handler — rapid succession of INSERT/DELETE events (e.g., many users joining groups) triggers multiple full re-fetches.

**B. No vendor chunking for heavy libraries**
- `@google/genai` is a large SDK (~100–150 KB gzipped). It's bundled into the main chunk despite being needed only during file upload/processing.
- `motion` (~60–100 KB gzipped) is used for page transitions but bundled eagerly.

**C. Already partially optimized**
- `UploadTab` and `ResultsTab` are lazy-loaded with `React.lazy()` + `Suspense` — good.
- `useMemo` and `useCallback` are used appropriately in `App.tsx` — good.

### Estimated Bundle Size
- **React core:** ~40 KB gzipped
- **@google/genai:** ~100–150 KB gzipped  
- **motion:** ~60–100 KB gzipped
- **App code + lazy tabs (UploadTab/ResultsTab chunk):** ~80–150 KB gzipped
- **Total initial (before lazy chunks load):** ~200–300 KB gzipped
- **Total after loading tabs:** ~400–600 KB gzipped

### Recommended Optimizations (Prioritized)
| Priority | Action |
|----------|--------|
| P0 | Debounce/throttle `fetchGroups()` in the realtime handler — use 300–500ms debounce |
| P0 | Use Supabase payload data directly for INSERT/DELETE instead of re-fetching everything (optimistic update or incremental merge) |
| P1 | Move `@google/genai` and `motion` to `manualChunks` (`vendor-ai`, `vendor-animation`) |
| P1 | Reset pagination offsets only when `courseCodes` actually changes (compare with `useRef`) |
| P2 | Add `vite-plugin-compression` for gzip/brotli |
| P2 | Add `build.reportCompressedSize: true` |
| P2 | Consider moving `motion`'s `AnimatePresence` to a separate wrapper component to isolate its bundle |

---

## 5. Cross-App Findings

### Compression
**None of the 4 apps have gzip/brotli compression configured.** This is the single highest-impact, lowest-effort fix available across all apps.

| App | gzip | Brotli |
|-----|------|--------|
| web | ❌ | ❌ |
| admin | ❌ | ❌ |
| courses | ❌ | ❌ |
| schedule | ❌ | ❌ |

**Recommendation:** Add `vite-plugin-compression` to all 4 apps. Typical savings: 60–80% reduction in JS transfer size. Example:
```ts
import compression from 'vite-plugin-compression';
// In plugins array:
compression({ algorithm: 'gzip', ext: '.gz' }),
compression({ algorithm: 'brotliCompress', ext: '.br' }),
```

### manualChunks
**None of the 4 apps have manual chunks configured.** All vendor dependencies are bundled with application code into monolithic chunks.

| App | manualChunks |
|-----|--------------|
| web | ❌ |
| admin | ❌ |
| courses | ❌ |
| schedule | ❌ |

### Large Static Assets in Bundle
- **courses:** `iteData` (entire course prerequisite graph) is ~30–60 KB of embedded JS object, loaded regardless of whether the user visits the map tab.
- **Potential issue in web:** No inline SVG analysis done, but `tailwindcss` v4 + `@tailwindcss/vite` may generate large CSS. This is mitigated by `cssCodeSplit: true`.

### Unused Dependencies
No obviously unused dependencies were found after reviewing imports. However:
- **courses:** `@radix-ui/react-accordion` and `@radix-ui/react-separator` may not be used in the visible code — verify before removing.
- **admin:** `@svu-community/ui` is used (imported in `App.tsx:4`).
- **schedule:** All deps appear to have active import paths.

### Vite Config Completeness Summary

| Check | web | admin | courses | schedule |
|-------|-----|-------|---------|----------|
| build.minify | ✅ esbuild | ✅ default | ✅ default | ✅ default |
| build.manualChunks | ❌ | ❌ | ❌ | ❌ |
| build.sourcemap | ❌ false | ❌ default | ❌ default | ❌ default |
| compression | ❌ | ❌ | ❌ | ❌ |
| cssCodeSplit | ✅ true | ❌ default | ❌ default | ❌ default |
| build.rollupOptions | ✅ multi-page | ❌ | ❌ | ❌ |

---

## 6. Summary of All Performance Issues

### Critical (P0)
| # | App | Issue | Impact |
|---|-----|-------|--------|
| 1 | **courses** | `iteData` + `@xyflow/react` eagerly bundled despite being on a hidden tab | ~200–300 KB loaded on initial page view unnecessarily |
| 2 | **admin** | All 4 admin pages statically imported (no code splitting) | Users download code for pages they never visit |
| 3 | **schedule** | Realtime subscription calls `fetchGroups()` on every INSERT/DELETE, re-fetching all data | Potential render storms + unnecessary DB queries |
| 4 | **all** | No gzip/brotli compression | 60–80% larger transfer sizes; no CDN cache efficiency |

### High (P1)
| # | App | Issue | Impact |
|---|-----|-------|--------|
| 5 | **web** | No `manualChunks` — Supabase bundled into app chunk | Prevents long-term caching of vendor code |
| 6 | **courses** | 12 radix-ui packages bundled without manual chunking | Prevents shared caching of UI primitives |
| 7 | **schedule** | `@google/genai` bundled in main chunk | ~100 KB loaded even on non-upload pages |
| 8 | **all** | Minimal/incomplete vite.config (no build section) | Missing optimizations that Vite provides by default but aren't explicitly configured |

### Medium (P2)
| # | App | Issue | Impact |
|---|-----|-------|--------|
| 9 | **admin** | `motion` library for simple transitions | Could be replaced with CSS for 60–100 KB savings |
| 10 | **web** | Supabase client statically referenced (included on all pages) | ~50 KB loaded on login/register pages that don't need it |
| 11 | **all** | No `build.reportCompressedSize` | No visibility into actual bundle sizes during development |

### Quick Wins
| Action | Apps | Estimated Savings |
|--------|------|-------------------|
| Add `vite-plugin-compression` | all 4 | 60–80% transfer size reduction |
| Lazy-load InteractiveMap in courses | courses | ~250 KB initial bundle reduction |
| Lazy-load admin pages | admin | ~150–200 KB initial bundle reduction |
| Optimize realtime handler in schedule | schedule | Reduces DB query count + re-renders |
