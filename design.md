# SVU Community — Design System

> inspired by **Google Flow** (`labs.google/fx/ar/tools/flow`)
> Minimal, cinematic, purposeful — every element earns its place.

---

## 1. Design Philosophy

Google Flow treats the interface as a **cinematic canvas**: dark, breathable, with soft focal accents.
Apply the same logic here:

- **Background is ambient**, not decorative — dark, slightly warm tint, no competing textures.
- **Cards are subtle** — single soft shadow, 1px border at 8% opacity, no glass-blur unless necessary.
- **One accent color per context** — indigo for primary, emerald for success, rose for danger.
- **Motion is functional**, not ornamental — fade + translate only, max 200ms.

---

## 2. Color Tokens

```
Primary:      indigo (primary-600 → #4F46E5)
Success:      emerald (success-500 → #10B981)
Warning:      amber (warning-400 → #FBBF24)
Danger:       rose (danger-500 → #F43F5E)
Info:         cyan (info-500 → #06B6D4)
Background:   slate-950 (#020617) — warm-tinted near-black
Surface:      slate-900 (#0F172A) — elevated panels
Surface-2:    slate-800 (#1E293B) — inputs, cards
Border:       white/8 — 8% opacity white border
Text Primary: slate-50 (#F8FAFC)
Text Muted:   slate-400 (#94A3B8)
Text Dim:     slate-500 (#64748B)
```

### Removed / Deprecated Colors
- No `--color-aura-*` tokens in UI (reserve for branding only)
- No `cosmos` gradient in card backgrounds
- No `mix-blend-screen` or `mix-blend-overlay` in component layers

---

## 3. Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Heading 1 | Tajawal | 2rem / 1.875rem | 800 |
| Heading 2 | Tajawal | 1.5rem / 1.25rem | 700 |
| Heading 3 | Tajawal | 1.125rem | 600 |
| Body | Tajawal | 0.9375rem | 400 |
| Caption | Tajawal | 0.8125rem | 400 |
| Mono | Space Grotesk | 0.8125rem | 500 |

**Line height:** 1.6 for body, 1.3 for headings.
**Letter spacing:** 0 for Arabic body text, slight tracking (-0.01em) for mono/English only.

---

## 4. Spacing Scale

```
space-xs   = 0.25rem  (4px)
space-sm   = 0.5rem   (8px)
space-md   = 1rem     (16px)
space-lg   = 1.5rem   (24px)
space-xl   = 2rem     (32px)
space-2xl  = 3rem     (48px)
space-3xl  = 4rem     (64px)
```

**Rule:** Component padding ≥ `space-md`. Page sections ≥ `space-xl`. Section gaps ≥ `space-lg`.

---

## 5. Card / Surface Tokens

```
Card (default):
  bg:           var(--color-surface) / slate-900
  border:       1px solid rgba(255,255,255,0.08)
  shadow:       0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
  radius:       0.75rem (12px)
  padding:      space-lg

Card (elevated — modals, dropdowns):
  bg:           var(--color-surface-2) / slate-800
  border:       1px solid rgba(255,255,255,0.12)
  shadow:       0 10px 25px rgba(0,0,0,0.5)

Card (interactive — cards with hover):
  hover-bg:     rgba(255,255,255,0.03)
  hover-border: rgba(255,255,255,0.14)
  transition:   150ms ease
```

**Removed:** `backdrop-blur-xl` on cards. Use solid backgrounds unless behind a video hero.

---

## 6. Button Tokens

```
Primary:
  bg:           var(--color-primary-600)
  hover:        var(--color-primary-500)
  text:         white
  radius:       0.625rem (10px)
  padding:      0.625rem 1.25rem
  shadow:       none (flat)

Secondary:
  bg:           rgba(255,255,255,0.06)
  hover:        rgba(255,255,255,0.10)
  border:       1px solid rgba(255,255,255,0.10)
  text:         var(--color-text-primary)

Ghost:
  bg:           transparent
  hover:        rgba(255,255,255,0.05)
  text:         var(--color-text-muted)
  hover-text:   var(--color-text-primary)
```

**Removed:** Glow shadows on buttons (`shadow-glow-ocean-20`, etc.).
Use solid indigo primary button instead.

---

## 7. Input Tokens

```
bg:           var(--color-surface-2) / slate-800
border:       1px solid rgba(255,255,255,0.10)  (default)
border:       1px solid rgba(244,63,94,0.40)    (error)
border:       1px solid rgba(16,185,129,0.40)   (success)
text:         var(--color-text-primary)
placeholder:  var(--color-text-dim)
radius:       0.625rem (10px)
padding:      0.625rem 0.875rem
font-size:    0.875rem
```

---

## 8. Animation / Motion

**Duration:** 150ms (hover), 200ms (enter), 300ms (exit).
**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out-quint)
**Reduced motion:** `prefers-reduced-motion: reduce` → disable all transitions/animations, show static state.

### Allowed animations:
- Fade in on mount (`opacity: 0 → 1`, `translateY(4px) → 0`)  
- Hover lift (`translateY(-1px)`) on cards only  
- Success/error message slide (`translateY(-8px) → 0`)

### Prohibited:
- `scale` on buttons or inputs
- Blur animations on backgrounds (causes repaint)
- Cascading stagger on lists > 20 items

---

## 9. Hero Section

```
Layout:
  Min height:  100dvh (full viewport)
  Position:     relative
  Overflow:     hidden

Background:
  Video:        object-cover, autoplay, loop, muted, playsinline
  Fallback:     bg-gradient-to-b from-slate-900 to-slate-950
  Overlay:      bg-black/50 (static, no animation)

Content alignment:  center, RTL-friendly
Content padding:    space-3xl top, space-2xl bottom

Poster:          /videos/bg-poster.jpg (static snapshot, prevents CLS)
Video source:    /videos/bg-hero.mp4 (hardcoded, replace in-place)
```

---

## 10. Layout Grid

```
Container:     max-w-7xl, mx-auto, px-4 sm:px-6 lg:px-8
Grid gap:      space-lg (24px) — cards in grid
Section gap:   space-2xl (48px) — between major sections
Page padding:  pt-20 pb-12 (header offset + bottom breathing room)
```

---

## 11. Accessibility

- All text contrast ≥ 4.5:1 (WCAG AA)
- Focus ring: `ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950`
- Skip link present on every page (already implemented)
- `aria-label` on icon-only buttons
- `role="alert"` on error banners
- Reduced motion: all `motion` components respect `useReducedMotion` hook

---

## 12. Migration Checklist

When redesigning any component:

- [ ] Replace `bg-white/5` + `border-white/10` + `shadow-glow-*` with Card Tokens above
- [ ] Replace `text-aura-400` with `text-emerald-400` (success) or `text-indigo-400` (info)
- [ ] Replace `text-danger-400` → `text-rose-400`
- [ ] Replace `bg-info-600` → `bg-indigo-600`
- [ ] Remove `mix-blend-*` from component CSS classes
- [ ] Replace `backdrop-blur-2xl` on cards → solid background
- [ ] Replace animated particle canvas background → video/static gradient
- [ ] Replace glow button shadows with flat solid buttons
- [ ] Verify RTL mirroring still works (margin-start vs margin-left)
- [ ] Check focus-visible styles

---

*Last updated: 2026-06-29*
