# Design System

## Overview

This project uses a **token-driven design system** built on CSS custom properties and Tailwind CSS v4. All design decisions are centralized in a single source of truth to ensure consistency and speed of development.

---

## Core Files

| File | Purpose |
|------|---------|
| `src/styles/design-tokens.css` | All design tokens (colors, spacing, typography, radii, shadows, z-index) |
| `src/index.css` | Global styles, animations, and CSS utility classes |
| `src/lib/utils.ts` | `cn()` utility for merging Tailwind classes |
| `src/components/ui/` | Reusable component library |

---

## Design Tokens

### Colors

**Surfaces** — background hierarchy:
- `--color-bg-primary` / `--color-bg-secondary` / `--color-bg-tertiary`
- `--color-bg-card` / `--color-bg-glass` / `--color-bg-elevated`
- `--color-bg-input` / `--color-bg-input-hover`

**Text**:
- `--color-text-primary` / `--color-text-secondary` / `--color-text-muted`

**Semantic**:
- `--color-success` / `--color-warning` / `--color-danger` / `--color-info`

**Accent Palettes** (300–600):
- Cyan, Indigo, Purple, Rose, Amber, Emerald, Red

### Spacing Scale

Use these tokens for padding, margin, and gaps:

```
--space-0  → 0
--space-1  → 0.25rem (4px)
--space-2  → 0.5rem (8px)
--space-3  → 0.75rem (12px)
--space-4  → 1rem (16px)
--space-5  → 1.25rem (20px)
--space-6  → 1.5rem (24px)
--space-8  → 2rem (32px)
--space-10 → 2.5rem (40px)
--space-12 → 3rem (48px)
--space-16 → 4rem (64px)
--space-20 → 5rem (80px)
--space-24 → 6rem (96px)
--space-32 → 8rem (128px)
```

**Semantic spacing shortcuts**:
- `--space-section`: 3rem (page sections)
- `--space-card`: 1.5rem (card padding)
- `--space-input`: 0.75rem (input padding)
- `--space-button-x`: 1.25rem (button horizontal padding)
- `--space-button-y`: 0.625rem (button vertical padding)

### Typography

**Font families**:
- `--font-sans`: Tajawal (Arabic-first, default)
- `--font-display`: Space Grotesk (headings, logos)

**Font sizes**: `--text-xs` (0.75rem) → `--text-8xl` (6rem)

**Font weights**: `--font-weight-light` (300) → `--font-weight-black` (900)

**Line heights**: `--leading-tight` (1.25) → `--leading-relaxed` (1.625)

### Radii

```
--radius-xs: 0.25rem  --radius-sm: 0.5rem  --radius-md: 0.75rem
--radius-lg: 1rem    --radius-xl: 1.5rem  --radius-2xl: 2rem
--radius-full: 9999px
```

**Semantic radii**: `--radius-button`, `--radius-input`, `--radius-card`, `--radius-modal`

### Shadows

- `--shadow-glow-cyan` / `--shadow-glow-cyan-strong` — cyan glow effects
- `--shadow-glow-indigo` / `--shadow-glow-rose` / `--shadow-glow-amber` / `--shadow-glow-green`
- `--shadow-card` / `--shadow-elevated` — elevation

### Z-Index

```
--z-base: 0      --z-dropdown: 50
--z-modal: 100   --z-toast: 200    --z-tooltip: 300
```

---

## Component Library

### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" onClick={() => {}}>Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger" disabled>Delete</Button>
```

**Variants**: `primary` | `secondary` | `danger`

### InputField

```tsx
import { InputField } from '@/components/ui/InputField';

<InputField label="البريد الإلكتروني" placeholder="example@email.com" />
<InputField label="كلمة المرور" type="password" />
<InputField label="الاسم" error="هذا الحقل مطلوب" />
```

**Props**: `label`, `error`, `type`, `showSuccessIndicator`, + all standard input attributes

### GlassCard

```tsx
import { GlassCard } from '@/components/ui/GlassCard';

<GlassCard className="p-6">
  <h2 className="text-xl font-bold">Card Title</h2>
  <p className="text-slate-300">Card content</p>
</GlassCard>
```

### Toast

```tsx
import { useToast } from '@/components/ui/Toast';

const { showToast } = useToast();
showToast({ type: 'success', message: 'تم الحفظ بنجاح' });
```

---

## Utilities

### `cn()` — Class Name Merger

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-classes', condition && 'conditional-class', className)} />
```

Merges `clsx` + `tailwind-merge` to intelligently resolve conflicting Tailwind classes.

---

## Usage Patterns

### Applying Design Tokens in Components

**Prefer Tailwind utilities with design token values**:

```tsx
<div className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-[var(--space-card)]">
```

**Or use CSS classes for repeated patterns** (defined in `index.css`):
- `.btn-primary`, `.btn-glass`, `.btn-danger`
- `.glass-card`
- `.input-field`
- `.gradient-text`

### Spacing

Use semantic spacing tokens:

```tsx
<section className="p-[var(--space-section)]">
  <div className="p-[var(--space-card)]">
    <input className="p-[var(--space-input)]" />
    <button className="px-[var(--space-button-x)] py-[var(--space-button-y)]" />
  </div>
</section>
```

### Colors

Use semantic color tokens:

```tsx
<div className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
  <span className="text-[var(--color-success)]">Success</span>
  <span className="text-[var(--color-danger)]">Error</span>
</div>
```

---

## Adding New Components

1. Place in `src/components/ui/` for base primitives
2. Export from `src/components/ui/index.ts`
3. Use `cn()` for className merging
4. Reference design tokens via CSS variables
5. Follow existing patterns (variant props, accessibility, RTL support)

---

## Accessibility

- All interactive elements have `aria-label` or associated `<label>`
- `prefers-reduced-motion` is respected globally
- Focus states use `--ring-color` tokens
- Error messages use `role="alert"` and `aria-describedby`

---

## RTL Support

- `dir="rtl"` on `<html>`
- Use logical properties where possible (`padding-inline-start` instead of `padding-left`)
- Icons mirror automatically via `lucide-react`
