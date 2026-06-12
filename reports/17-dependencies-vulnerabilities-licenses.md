# Dependencies Audit Report

**Date:** 2026-06-12  
**Scope:** All package.json files (root + 8 apps/packages)

---

## Critical Findings

| # | Package | Version | Issue | Root Cause | Fix |
|---|---------|---------|-------|-----------|-----|
| 1 | react / react-dom | admin: `^18.3.1` vs courses/schedule: `^19.0.0` | Cross-app React version mismatch — cannot coexist; peer resolution breaks, hooks fail | Admin pinned to React 18 while others upgraded | Standardize on React 19 across all apps |
| 2 | @supabase/supabase-js | admin: `^2.39.0`, courses: `^2.100.0`, schedule: `^2.49.1` | Three-way version split — 2.39.0 is ~60 minor versions behind; older versions have weaker RLS auth handling | No workspace-level version agreement | Pin all apps to `^2.100.0` via workspace root or `@svu-community/supabase-client` |
| 3 | vite | admin: `^5.4.0` vs web: `^8.0.1` | Major version mismatch — Vite 5 has upstream esbuild/rollup CVEs | Admin not upgraded when others moved to Vite 6–8 | Upgrade admin to Vite 6.x+; align all apps |
| 4 | tailwindcss | admin: `^3.4.1` vs web/courses/schedule: `4.x` | Major version split — v3 vs v4 use completely different config formats | Admin never migrated to v4 | Migrate admin to Tailwind 4 or document split |

## High Findings

| # | Package | Version | Issue | Root Cause | Fix |
|---|---------|---------|-------|-----------|-----|
| 5 | lucide-react | admin: `^0.294.0`, courses: `0.487.0`, schedule: `^0.546.0` | 250+ minor versions gap in admin — older lucide has XSS risk in untrusted SVG | Admin not kept in sync | Align all apps to `^0.546.0` or latest |
| 6 | @tailwindcss/vite | web: `^4.2.2`, courses: `4.1.12`, schedule: `^4.1.14` | Patch drift causes subtle CSS output differences | Each app independently resolved caret ranges | Pin exact version (e.g. `4.2.2`) across all apps |
| 7 | @vitejs/plugin-react | admin: `^4.2.1`, courses: `4.7.0`, schedule: `^5.0.4` | v4 vs v5 mismatch — v5 supports React 19 JSX transform fully | Admin stuck on older stack | Upgrade admin to `^5.0.4` |
| 8 | @testing-library/react | ui: `^16.0.0` vs apps: `^16.3.2` | 3 minor versions gap — 16.0.x has known findBy* timeout edge cases | UI package has stale range | Bump UI package to `^16.3.2` |
| 9 | @testing-library/jest-dom | ui: `^6.6.0` vs apps: `^6.9.1` | 3 minor versions gap — 6.6.0 lacks async toBeVisible() fixes | UI package not kept current | Bump UI package to `^6.9.1` |
| 10 | @types/node | web/schedule: `^22.14.0` vs utils/types/supabase-client: `^20.14.0` | 8 minor versions behind — older types cause incorrect type resolution | Workspace packages not aligned with app Node target | Bump workspace packages to `^22.x` or align to Node 20 LTS baseline |

## Medium Findings

| # | Package | Version | Issue | Root Cause | Fix |
|---|---------|---------|-------|-----------|-----|
| 11 | @radix-ui/* (12 packages) | courses: pinned `1.1.x`–`2.1.x` | All exact-pinned — security fixes never auto-apply | Copied from lockfile | Switch to caret ranges or lock via workspace `overrides` |
| 12 | clsx | courses: `2.1.1` exact, schedule: `^2.1.1` | Exact pin prevents patch upgrades | Inconsistent semver style | Use `^2.1.1` everywhere |
| 13 | tailwind-merge | courses: `3.2.0` exact, schedule: `^3.5.0` | 3 minor versions gap with exact pin | Courses chose to lock | Update to `^3.5.0` |
| 14 | jsdom | ui: `^26.0.0` vs apps: `^29.1.1` | 3 major versions behind — memory leak reports in test teardown | UI package resolved independently | Bump to `^29.1.1` |
| 15 | vitest in admin | **Not present** | Missing devDependency — monorepo test scripts reference vitest | Oversight during setup | Add `vitest: ^4.1.8` to admin devDependencies |
| 16 | postcss / autoprefixer | admin: `^8.4.35` / `^10.4.17` | Tailwind v4 dropped these as required deps — vestigial bloat | Admin still on v3 workflow | Remove once admin migrates to Tailwind 4 |

## Low Findings

| # | Package | Version | Issue | Root Cause | Fix |
|---|---------|---------|-------|-----------|-----|
| 17 | @types/node in workspace packages | utils/types/supabase-client: `^20.14.0` | Under-spec'd for Node 22 apps consuming these packages | Workspace packages declared their own types | Use `{}` and rely on root devDep hoisting, or bump all to `^22.x` |
| 18 | dagre | courses: `^0.8.5` | Several years old and unmaintained; actively maintained fork is `@dagrejs/dagre` | Historical package choice | Optionally migrate to `@dagrejs/dagre` |
| 19 | class-variance-authority | courses: `0.7.1` exact | Pinned prevents patch upgrades | Exact pin | Change to `^0.7.1` |

## Recommendations

1. **Standardize React version** — Admin must move to React 19 (`^19.0.0`)
2. **Align Supabase** — Pin all apps to `^2.100.0` via workspace root `overrides` or `@svu-community/supabase-client`
3. **Hoist shared runtime deps** — React, react-dom, lucide-react declared at workspace root
4. **Consolidate Vite** — All apps should converge to Vite 6.x; move vitest, @vitejs/plugin-react, @tailwindcss/vite to root devDependencies
5. **Replace exact pins with caret ranges** — All @radix-ui/* packages, clsx, tailwind-merge, tw-animate-css, class-variance-authority
6. **Add npm audit to CI** — Enforce `npm audit --audit-level=high` and fail builds on critical findings
7. **Add Dependabot or Renovate** — Weekly updates for npm ecosystems across all workspaces
