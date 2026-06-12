# Architecture Audit Report — Shared Packages

**Date:** 2026-06-12  
**Scope:** packages/ui/src/, packages/utils/src/, packages/types/src/, packages/supabase-client/src/, packages/config/

---

## Critical Findings

| # | Package | File | Issue | Root Cause | Fix |
|---|---------|------|-------|-----------|-----|
| 1 | ui | `src/components/Badge/`, `Button/`, `Input/`, `Card/` | Custom Badge/Button/Input/Card duplicate shadcn/ui components with app-specific styling. Two parallel component trees. | Maintainers created app-branded wrappers before finalizing shadcn/ui as source of truth. | Re-export shadcn/ui variants. If app-specific branding needed, apply via CSS variables/theme layer, not duplicate component code. |
| 2 | ui | `src/hooks/useAuth.ts` | App-specific Supabase auth hook lives in UI package. Package owns domain/auth behavior instead of being generic. | Reusable label applied to domain-specific feature library. | Move `useAuth` to consuming app or new `@svu-community/auth` package. |
| 3 | supabase-client | `src/index.ts`, `src/client.ts` | No clear server/middleware separation; single client is only the browser anon client. | Missing SSR-safe client and middleware abstractions. | Export `createBrowserClient()` and separate `createServerClient()`; document which to use where. |
| 4 | types | `src/auth-state.ts`, `src/index.ts` | `AuthState` defined twice (file + index), risking divergence. | Ad-hoc additions to index.ts instead of single source. | Keep one definition in `src/auth-state.ts` and re-export only. |
| 5 | types | `package.json` | `private: true` while declared as peer dep in `@svu-community/ui`. Private packages should not be depended on by other workspace packages. | Misconfiguration. | Either publish `types/` or remove it from ui peerDeps, or move to `dependencies`. |

## High Findings

| # | Package | File | Issue | Root Cause | Fix |
|---|---------|------|-------|-----------|-----|
| 1 | ui | `src/components/ui/*` and custom `Badge/Button/Input/Card` | Two parallel component trees for same primitives — transition from custom to shadcn/ui was partial. | Partial migration. | Select one canonical tree; delete duplicate custom components. |
| 2 | ui | `src/index.ts`, `src/components/index.ts` | `components/index.ts` only re-exports `./ui`; custom Badge/Button/Input/Card exist but are not exported. Inconsistent export surface. | Incomplete consolidation. | Either export custom components from index or remove them. |
| 3 | ui | `package.json` | Missing `react` and `react-dom` peer deps. | Peer dep list defined ad hoc. | Add `"react": "^19.x"` and `"react-dom": "^19.x"`. |
| 4 | supabase-client | `src/index.ts` | Creates browser client at module top-level using Vite env vars — works only in browser. | Workspace-only assumption. | Export factory functions; don't create client at module top-level. |
| 5 | utils | `src/date/formatters.ts` | `formatDate` locale is non-configurable (hardcoded `ar-SA`). | Built for current app only. | Add `locale?: string` param with sensible default. |
| 6 | utils | `src/storage/index.ts` | `localStorage` wrapper is browser-only; can crash in SSR/node. | App UI assumptions leaked into generic utils. | Guard with `typeof window !== 'undefined'` or move to browser-only package. |

## Medium Findings

| # | Package | File | Issue | Root Cause | Fix |
|---|---------|------|-------|-----------|-----|
| 1 | ui | `src/utils/helpers.ts` | `buildQueryString` uses `any` in parameter value typing. | Loose typing. | Change `Record<string, any>` to `Record<string, string \| number \| boolean \| null>`. |
| 2 | config | `package.json` | No `files` or `exports` completeness; unclear if any app imports from it. | Likely not used by any app. | Verify usage; delete if unused. |
| 3 | ui | `src/components/Card/Card.tsx` | Hardcoded `text-white`, `border-secondary-700` — app theme values embedded in generic component. | No design-token layer. | Use semantic CSS variables/tokens instead of literal colors. |
| 4 | utils | `src/validation/validators.ts` | No locale support for phone/date rules. | Generic enough but not internationalized. | Add optional locale parameter. |

## Recommendations

1. **Remove duplicate primitive components** in `packages/ui` — use shadcn/ui's Badge/Button/Input/Card directly via `cn()` + app-level CSS variables.
2. **Split `@svu-community/supabase-client`** into browser/server/middleware clients with explicit exports and documentation.
3. **Make `packages/utils` locale-agnostic** or move locale-specific formatters to the app layer.
4. **Audit unused UI components** under `components/ui/` and remove anything not imported by apps.
5. **Verify `packages/config` usage** — if unused, delete the package to reduce maintenance overhead.
