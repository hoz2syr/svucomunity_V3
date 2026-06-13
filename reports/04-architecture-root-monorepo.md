# Architecture Audit Report — Root Monorepo

**Date:** 2026-06-12  
**Scope:** Root package.json, turbo.json, tsconfig.json, .github/workflows/, .env.example, apps/, packages/

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| 1 | Root `tsconfig.json` missing | ⏳ Pending | Not yet created — requires monorepo-wide project references design |
| 2 | CI matrix only covers `apps/web` | ⏳ Pending | Needs expansion to all 4 apps |
| 3–5 | Empty `tsconfig.json` files in packages | ⏳ Pending | types/ui/utils placeholders still empty |
| 9 | `turbo.json` `test` depends on `^build` | ⏳ Pending | Dependency ordering not yet fixed |
| 16 | `packages/supabase-client/src/server.ts` in wrong package scope | ⏳ Pending | Server client still co-located with browser client |
| 17 | `superbase-setup.sql` aggregate migration present alongside numbered migrations | ⏳ Pending | Not harmful but can confuse migration runner — keep or remove |

---

## Critical Findings

| # | File | Issue | Root Cause | Fix |
|---|------|-------|-----------|-----|
| 1 | `tsconfig.json` (root) | **File missing.** Root `tsc -b --force` has no composite config to orchestrate project references. | Snapshot added without base TypeScript config. | Create composite tsconfig with `references` to all apps and packages. |
| 2 | `.github/workflows/ci.yml` | **CI matrix only covers `apps/web`.** `courses`, `schedule`, `admin` never linted/typechecked/tested. | CI written for single-app flow, never expanded. | Add matrix items for all 4 apps. |
| 3 | `packages/types/tsconfig.json` | **Empty file (0 bytes).** Composite projects require `composite: true` and `declaration: true`. | Placeholder never filled. | Populate with proper `compilerOptions`, include `src`, exclude tests. |
| 4 | `packages/ui/tsconfig.json`, `packages/utils/tsconfig.json` | **Empty files.** Same composite-projects issue. | Same. | Same fix — add composite structure. |
| 5 | `apps/web/tsconfig.json` | **File missing.** Cannot participate in project references or shared path aliases. | App scaffolded as Vanilla JS, no TS config added. | Add tsconfig.json or migrate to TS/Vite. |

## High Findings

| # | File | Issue | Root Cause | Fix |
|---|------|-------|-----------|-----|
| 6 | `packages/ui/src/hooks/useAuth.ts` | Hard-coded relative import `../../packages/supabase-client` inside a workspace package. Breaks if directory depth changes. | Rapid prototyping with local paths. | Use package-name imports: `import { createClient } from '@supabase/supabase-js'`. |
| 7 | `apps/courses/src/types.ts` | Domain types (`SupabaseCourse`, `SupabaseResource`) duplicated locally while `packages/types/src/course.ts` exports `Course`. Risk of drift. | Feature built before shared types stabilized. | Move all course DTOs into `packages/types/src/course.ts` and import from `@svu-community/types`. |
| 8 | `apps/web/package.json` | App has **zero `@svu-community/*` workspace dependencies.** Risks duplicate types/utils/components in `apps/web`. | Originally a separate repo, not yet migrated. | Add workspace deps; remove local duplicates. |
| 9 | `turbo.json` | `test` depends on `build` (self only), not `^build` (dependencies). When shared package changes, app tests may run against stale source. | Default turbo config omitted dependency build. | Change `"dependsOn": ["^build", "build"]` for `test` task. |
| 10 | `turbo.json` | `lint` depends on `^build`. Lint should be independent; forcing build first slows CI. | Copied pattern without considering lint semantics. | Change to `"dependsOn": []` or only `["^build"]` if linting types requires built declarations. |
| 11 | `apps/admin/package.json` | Depends on `@svu-community/ui` at `"*"` but not referenced in CI matrix. Admin structurally decoupled from pipeline. | Admin app added last; not integrated. | Add admin to CI matrix and turbo.json. |

## Medium Findings

| # | File | Issue | Root Cause | Fix |
|---|------|-------|-----------|-----|
| 12 | `.env.example` | `SUPABASE_SERVICE_ROLE_KEY` included in client-side env template. Mixes server-only and client-only vars. | Copied from backend template. | Split into `.env.example` (client: `VITE_*`) and server-only `.env.server.example`. |
| 13 | `.env.example` & `apps/web/.env.example` | **Duplicate `.env.example` files.** Two sources of truth. | `apps/web` copied root example during migration. | Keep root as canonical; delete `apps/web/.env.example`. |
| 14 | `apps/web/package.json` | **Vite 8.0.1** while courses=6.3.5, schedule=^6.2.0, admin=5.4.0. Cross-app tooling version skew causes inconsistent build outputs. | Apps upgraded independently. | Standardize on Vite 6.x across all apps. |
| 15 | `apps/admin/package.json` | **React 18.3.1** while courses/schedule use React 19.0.0. Runtime/hook behavior mismatches. | Admin never upgraded. | Upgrade to React 19 or document as legacy; enforce via `overrides`. |
| 16 | `packages/supabase-client/src/server.ts` | Server-side client lives in a workspace package that otherwise targets browser/Vite. Node `process.env` variables won't exist at runtime in browser. | Server client added to wrong package scope. | Move to server-only package or guard with dynamic import + Node type. |
| 17 | `packages/config` | **CommonJS (`module.exports`) while entire monorepo is ESM (`"type": "module"`).** Mixing systems causes tooling friction. | ESLint shared config authored in CJS. | Convert to ESM (`export default [...]`) or mark package `"type": "commonjs"`. |
| 18 | `apps/courses/package.json` | Radix UI packages pinned exact (`1.1.3`, `1.1.6`) — security patch updates never auto-apply. | Copied from lockfile directly. | Use `^` ranges with workspace hoisting. |

## Recommendations

1. **Create root `tsconfig.json`** with project references to all apps and packages.
2. **Standardize** on React 19 + Vite 6.x + Tailwind v4 + TypeScript across all four apps.
3. **Eliminate type duplication** — consolidate `apps/courses/src/types.ts` into `packages/types`.
4. **Fix turbo pipeline** — correct `dependsOn` for each task.
5. **Expand CI matrix** to include all 4 apps.
6. **Split `@svu-community/supabase-client`** into browser/server/middleware clients with explicit exports.
7. **Environment hygiene:** Single root `.env.example` with `VITE_*` for client, plain names for server-only notes.
