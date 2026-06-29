# Design System Redesign Plan

## 1. Audit Summary — Problems Identified

### 1.1 Token Architecture Issues
| Issue | Severity | Location |
|---|---|---|
| Duplicate token definitions between `:root` and `@theme` blocks | Medium | `design-tokens.css` |
| Legacy shadow aliases (cyan-15, indigo-70, etc.) add maintenance burden | Medium | `design-tokens.css:420-435` |
| `.btn-*` utilities in `index.css` conflict with component-driven approach | Low | `index.css:67-120` |
| Mixed naming: `--color-primary-*` vs `--color-accent-primary` (confusing) | Medium | `design-tokens.css:533-548` |

### 1.2 Component Inconsistencies
| Issue | Severity | Component |
|---|---|---|
| `Button.tsx` uses inline `variants` object instead of a centralized system | Medium | `Button.tsx` |
| `GlassCard.tsx` has motion hover effects but no semantic token for `--radius-card` in `@theme` shadow alias | Low | `GlassCard.tsx` |
| `InputField.tsx` references `--color-danger` which is defined in `:root` but not in `@theme` | Medium | `InputField.tsx:70` |
| Toast uses hardcoded `rounded-[var(--radius-lg)]` — should use `--radius-toast` | Low | `Toast.tsx:44` |

### 1.3 Documentation Gaps
- Arabic docs (`src/docs/design/design-system.md`) are outdated and contain incorrect assertions (e.g., "no central tokens file")
- English docs (`docs/design/design-system.md`) exist but need token mapping table
- No component usage guidelines or variant documentation

### 1.4 Identity Weaknesses
- The 4-pallette identity (Cosmic/Ocean/Tide/Aura) exists in tokens but components don't consistently use semantic names
- Gradient system is defined but not consistently applied across components
- Motion tokens (`--transition-fast/normal/slow`) exist but aren't documented as a system

---

## 2. Redesign Direction

### 2.1 Design Identity Concept
The project currently has a strong bioluminescent/space aesthetic. We will:
- **Double down on the existing identity** rather than replace it
- Enforce a strict `PRIMITIVE → SEMANTIC → COMPONENT` token hierarchy
- All components use ONLY semantic tokens (never raw primitives)
- Gradients become first-class visual language, not afterthoughts

### 2.2 Proposed Token Hierarchy
```
PRIMITIVE (Cosmic/Ocean/Tide/Aura scales)
  ↓ mapped to
SEMANTIC (accent, success, danger, warning, info, bg, text, border)
  ↓ consumed by
COMPONENT (button-primary, card-glass, input-error, toast-success)
```

### 2.3 Naming Convention Changes
| Current | Proposed | Reason |
|---|---|---|
| `--color-danger` | `--color-danger-500` | Follow scale convention |
| `--color-accent-primary` | `--color-accent-primary-400` | Scale-aware naming |
| `--color-bg-glass-sm/md/lg` | Consolidate to `--color-bg-glass` + opacity utilities | Reduce token sprawl |
| `--shadow-glow-amber-25` | Remove (cosmic should dominate) | Eliminate out-of-palette tokens |
| Legacy aliases (cyan, indigo, teal, purple, emerald) | Keep but mark `@deprecated` | Safe migration path |

### 2.4 Component System Improvements
1. **Button**: Migrate variant arrays to a `buttonVariants()` CVA pattern
2. **GlassCard**: Extract `hover` state tokens (`--glass-hover-bg`, `--glass-hover-border`)
3. **InputField**: Fix `--color-danger` reference → use `--color-danger-500`
4. **Toast**: Add `--radius-toast` token, use semantic bg tokens
5. **Drop-in utility cleanup**: Move `.btn-*` into components, remove from global CSS

### 2.5 Animation & Motion System
| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 250ms | Hover/active states |
| `--duration-slow` | 500ms | Page transitions |
| `--duration-drift` | 30s | Background gradient |
| `--easing-default` | ease | General transitions |
| `--easing-bounce` | cubic-bezier(0.34, 1.56, 0.64, 1) | Entrance animations |

---

## 3. Implementation Plan (Phased)

### Phase 1: Token Consolidation (Low Risk)
**Files**: `src/styles/design-tokens.css`
- [ ] Remove duplicate definitions between `:root` and `@theme` (keep `:root` as source of truth)
- [ ] Add `@deprecated` comments to legacy aliases
- [ ] Remove `--shadow-glow-amber-*` tokens
- [ ] Add missing `--color-danger-500`/`600` to `@theme` block
- [ ] Add animation/motion tokens to `@theme`

### Phase 2: Component Token Migration (Medium Risk)
**Files**: `Button.tsx`, `GlassCard.tsx`, `InputField.tsx`, `Toast.tsx`
- [x] Fix `--color-danger` → `--color-danger-500`
- [x] Fix `--color-info-400` → `--color-info` (or add `--color-info-400` to `@theme`)
- [x] Add `--radius-toast` token
- [x] Replace `.btn-*` class usage in components with semantic variants

### Phase 3: Component System Modernization (Higher Risk)
**Files**: `Button.tsx`, new files
- [x] Create `src/lib/cva.ts` with `cva()` wrapper (using clsx + tailwind-merge)
- [x] Migrate `Button.tsx` variants to `buttonVariants()` CVA
- [x] Add `Dropdown`, `FadeIn`, `Skeleton`, `ServerError` token audit
- [x] Create `src/components/ui/variants.ts` for shared variant recipes

### Phase 4: Documentation & Cleanup (Low Risk)
**Files**: `docs/design/design-system.md`, `src/docs/design/design-system.md`
- [x] Update English docs with new token hierarchy
- [x] Update Arabic docs to match (or archive if obsolete)
- [x] Add component usage examples with correct token references
- [x] Document motion system

### Phase 5: Validation (Required)
- [x] Run `npm run lint`
- [x] Run `npm run build`
- [x] Run `npm run test`
- [x] Visual regression check on all affected components

---

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Breaking existing components | Medium | High | Phase approach + comprehensive tests |
| Tailwind v4 `@theme` recreation | Low | High | Keep `:root` source of truth |
| Arabic doc staleness | High | Medium | Update or archive Obsolete docs |
| Legacy alias removal | Low | Medium | Deprecation comments first, remove in v2 |

---

## 5. Success Criteria
- All components use semantic tokens exclusively (no raw primitive colors)
- No duplicate token definitions
- `npm run lint` passes without new warnings
- `npm run test` passes (all existing tests updated)
- Design docs accurately reflect implementation
- Zero visual regressions on core components (Button, GlassCard, InputField, Toast)
