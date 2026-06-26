# Design System Consolidation Plan

## Goal
Apply the existing documented design system consistently across all components. Remove duplication, replace ad-hoc values with tokens, and eliminate unused CSS utilities.

## Current State Summary
- `design-tokens.css` defines ~200 CSS variables, but components largely ignore them.
- `index.css` defines 40+ CSS utility classes that are dead code.
- `Navbar` is completely off-system (inline styles, hardcoded hex values).
- `Button`, `AuthButton`, `PrimaryButton` are duplicated and inconsistent.
- Glass/glassmorphism patterns are implemented 4 different ways across components.
- Feature components (`GroupCard`, `FeatureCard`) use raw Tailwind colors instead of tokens.

## Decision: CSS Utilities vs Tailwind Classes
Components currently use inline Tailwind utility strings that re-implement styles already defined in `index.css`. We standardize on **Tailwind utilities + CSS variables only** and delete the dead CSS utility classes from `index.css`. Rationale: components already lean on Tailwind; keeping CSS utilities creates parallel styling systems.

## Decision: Button Consolidation
- Remove `PrimaryButton` (thin wrapper with no added value).
- Merge `AuthButton` variant into `Button` via `variant="auth"` with motion support.
- Update all imports across pages and features.

## Decision: Glass Pattern Token
Add to `design-tokens.css`:
- `--glass-bg: rgba(6, 10, 31, 0.45)`
- `--glass-border: rgba(255, 255, 255, 0.1)`
- `--glass-blur: 14px`
- `--glass-hover-border: rgba(255, 255, 255, 0.2)`

Then unify `GlassCard`, `AuthCard`, and feature card containers to use these tokens.

## Ordered Task List

### Task 1: Fix Token Definitions
- Remove redundant `:root` definitions that duplicate `@theme`.
- Delete duplicate `--color-indigo-500` / `--color-indigo-600` collision.
- Remove duplicate spacing/font-weight aliases from `@theme` block.
- Validate CSS compiles with `vite build`.

### Task 2: Clean `index.css`
- Delete unused utility classes: `.btn-primary`, `.btn-glass`, `.btn-danger`, `.btn-accent`, `.btn-success`, `.btn-warning`, `.input-field`, `.glass-card`, `.gradient-text`, `.animation-fade-in`, `.animation-fade-in-up`, `.card-hover`, `.animate-border-glow`, `.skeleton-shimmer`, `.skeleton-fade-in`, `.exam-container`.
- Keep animation utilities if referenced: `.animate-typewriter`, `.shimmer-sweep`.

### Task 3: Fix Button Components
- Fix import path in `Button.tsx`: `@/src/lib/utils` -> `@/lib/utils`.
- Update `Button.tsx` to use spacing/radius tokens:
  - `px-[var(--space-button-x)] py-[var(--space-button-y)]`
  - `rounded-[var(--radius-button)]`
- Add `variant="auth"` to `Button` with loading + motion support (inline the AuthButton pattern).
- Delete `PrimaryButton.tsx` and `AuthButton.tsx`.
- Update imports in: `Login.tsx`, `Register.tsx`, `AuthCard.tsx`, `ForgotPasswordModal.tsx`, any feature using auth buttons.

### Task 4: Rewrite Navbar with Tokens
- Replace all inline style objects with CSS variable + Tailwind class equivalents.
- Map hardcoded colors to tokens:
  - `#6199f6` -> `var(--color-primary-500)`
  - `#4f4f80` -> `var(--color-secondary-500)`
  - `#a3a3b3` -> `var(--color-text-muted)`
  - `#fcfcfc` -> `var(--color-text-primary)`
  - `#040407` -> `var(--color-bg-primary)`
  - `rgba(79, 79, 128, 0.24)` -> nearby derived rgba from token palette
- Note: Navbar uses a custom blue (`#6199f6`) not in the current palette. Add it as `--color-brand-500` in `design-tokens.css` if it’s intentional.

### Task 5: Standardize Glass/Card Patterns
- Refactor `AuthCard.tsx` to use `GlassCard` (or same classNames) with token values.
- Update `GroupCard.tsx` to replace raw `bg-white/[0.03]` with `bg-[var(--color-bg-card)]`.
- Update `FeatureCard.tsx` to use `GlassCard` pattern or token classes.
- Add tokens for opacity values if needed (e.g., `--opacity-glass: 0.03`).

### Task 6: Feature Component Token Alignment
- `GroupCard.tsx`: replace `rose-500/15`, `emerald-500/15`, `cyan-500/10`, `indigo-500/10` with semantic tokens or new theme tokens. Prefer semantic aliases (`success`, `danger`) first.
- `FeatureCard.tsx`: replace `bg-[var(--color-bg-secondary)]/80` if consistent with `--color-bg-card`; otherwise document why.

### Task 7: Add Missing Tokens (if needed)
- `--color-brand-500` / `--color-brand-400` if the Navbar blue (`#6199f6`) is a deliberate brand color.
- `--color-slate-*` aliases only if they appear often; otherwise keep using native Tailwind `slate-*` for grayscale.
- Opacity/alpha tokens for repeated glass values if they appear >3 times.

### Task 8: Validation
- Run `vite build` to ensure CSS compiles.
- Run visual regression spot-check on: Home, Login, Dashboard, Exam Home, Study Groups Home.
- Run existing unit tests (`vitest`) to confirm no regressions from component renames.
- Verify RTL mirroring still works after class changes.

## Out of Scope
- Adding new components.
- Changing landing page layout or animations.
- Refactoring feature logic (exam, study-groups).
- Adding shadcn/ui or a component registry.

## Key Risk
Navbar relies on JavaScript hover state styling via inline styles. Migrating to CSS classes may require a class-toggle on hover, which could affect smoothness. Mitigation: keep hover via `group-hover:` Tailwind utilities.
