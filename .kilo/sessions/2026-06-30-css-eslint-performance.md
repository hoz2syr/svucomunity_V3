# SVU Community — Session: CSS Cleanup, ESLint Fixes, and Performance Evaluation

## Goal
تنظيف CSS، إصلاح أخطاء ESLint، تحسين الأداء، وتوثيق النتائج

## Scope
- CSS theme deduplication in `src/styles/design-tokens.css`
- ESLint error reduction (76 → 0 errors)
- Performance evaluation for lazy loading
- Routing evaluation (createBrowserRouter)

## Steps

### 1. CSS Cleanup
- Verified `src/styles/design-tokens.css` contains only one `@theme` block (line 140-247)
- Confirmed no duplicate `@theme` definitions remain across the project
- `design-tokens.css` now contains:
  - CSS custom properties (surfaces, text, borders, radii, shadows, etc.)
  - Single `@theme` block with semantic tokens

### 2. ESLint Fixes
- Reduced errors from ~76 to 0 (3 pre-existing warnings remain)
- Fixed `PlayTestShell.tsx`: Added missing `backPath` prop to `BackButton` usages
- Fixed `GuestContext.tsx`: Moved `isGuestRef.current = isGuest` into `useEffect` to avoid ref mutation during render
- Fixed `SecuritySettingsForm.tsx`: Moved `useForm` declaration before `useSecuritySettings` to fix variable-before-declaration error
- Fixed `useParticleCanvas.ts`: Added `textChars` to dependency array to resolve exhaustive-deps warning
- Pre-existing warnings (not fixed as they are non-critical):
  - `DeleteAccountModal.tsx`: React Compiler incompatible-library warning (React Hook Form)
  - `ErrorBoundary.tsx`: `any` type usage
  - `studyGroup.supabase.ts`: Unused eslint-disable directive

### 3. Performance Optimization
- Evaluated `lucide-react`: Tree-shakeable named imports; no lazy loading needed
- Evaluated `motion/react`:
  - Below-the-fold landing sections in `Home.tsx` now lazy-loaded via `React.lazy()`
  - Moved `LandingSections` composition to `src/components/LandingSections.tsx` as a named export
  - Updated `Home.tsx` to use `LazyLandingSections` with existing `Suspense` fallback
  - Dashboard and exam routes already lazy-loaded in `App.tsx`
  - Modal components use conditional rendering, so `motion` cost is inherently deferred
- Lighthouse: Unable to run locally (no browser automation in this environment). Recommendation: run `npx lighthouse http://localhost:5173` after starting dev server to measure LCP/FCP.

### 4. Routing Evaluation (Optional)
- Evaluated `createBrowserRouter` + `RouterProvider` migration
- Current setup: `BrowserRouter` + `Routes` + `Route` with `React.lazy()` + `Suspense`
- `createBrowserRouter` benefits for this project are limited:
  - Only 2 routes use dynamic params (`/exam/play/:id`, `/exam/shared/:id`)
  - No data loaders/actions in use
  - Current code-splitting via `React.lazy()` already works well
- Recommendation: Keep current routing. Migration would add complexity without significant benefit.

## Verification
- `npx tsc --noEmit`: Passes
- `npx eslint src`: 0 errors, 3 warnings
- `npm run build`: Passes

## Files Changed
- `src/styles/design-tokens.css`: Verified clean (single `@theme` block)
- `src/features/exam/components/PlayTestShell.tsx`: Fixed missing `backPath` prop
- `src/contexts/GuestContext.tsx`: Fixed ref mutation during render
- `src/components/dashboard/SecuritySettingsForm.tsx`: Fixed declaration order
- `src/hooks/useParticleCanvas.ts`: Fixed exhaustive-deps
- `src/pages/Home.tsx`: Lazy-loaded below-the-fold landing sections
- `src/components/LandingSections.tsx`: Added `LandingSections` composition export + `TestsFeatureSection`

## Risks
- `Home.tsx` now requires network fetch for landing sections chunk on initial load below the fold
- Session file did not exist prior to this change
