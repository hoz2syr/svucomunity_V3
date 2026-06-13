# DevOps Audit Report — CI/CD

**Date:** 2026-06-12  
**Scope:** .github/workflows/, turbo.json, root package.json scripts

---

## Fix Status (2026-06-12)

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| C1 | CI matrix only covers `apps/web` | ⏳ Pending | Still needs expansion |
| C2 | `fail-fast: true` aborts remaining jobs | ⏳ Pending | Not yet changed to `false` |
| C3 | Coverage artifact path wrong — nested `apps/web/apps/web/coverage/` | ⏳ Pending | Not yet fixed |
| C4–C5 | `deploy-courses.yml` / `deploy-schedule.yml` placeholders | ⏳ Pending | No install/build/deploy steps added |
| C6 | No Turbo remote cache configured (no `TURBO_TOKEN`) | ⏳ Pending | Still missing |
| H1 | CI does not use `turbo run` — bypasses pipeline + caching | ⏳ Pending | Still running raw npm |
| H2 | Node.js version pinned to major only (`20`) | ⏳ Pending | Should pin to `~20.11.0` |
| H3 | `deploy-web.yml` deploy step is a placeholder (`echo`) | ⏳ Pending | No hosting provider configured |
| H4 | No preview/production split in deploy workflows | ⏳ Pending | All deploy to `main` without staging |
| H5 | `turbo.json` `lint` depends on `^build` — lint should be independent | ⏳ Pending | Not yet changed |
| H6 | No security scanning workflow (Snyk, CodeQL, npm audit) | ⏳ Pending | Not yet added |

## Medium Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| M1 | `.github/workflows/ci.yml` | — | **No failure notifications** — no Slack, email, or PR comment on CI failure | Missing notification integration | Add `slackapi/slack-github-action` or PR comment step |
| M2 | `.github/workflows/ci.yml` | 24 | No Turbo remote cache configured | Turbo not wired into CI | Add `TURBO_TOKEN` and `TURBO_TEAM` env vars |
| M3 | `.github/workflows/deploy-web.yml` | 5–8 | Trigger is only `push` to `main` — no `workflow_dispatch`, no `pull_request` preview deploys | Limited trigger strategy | Add `workflow_dispatch: {}` and `pull_request` preview job |
| M4 | `apps/admin/package.json` | 10 | Admin has no `test` or `lint` script | Scripts not defined | Add `"test": "vitest run"`, `"lint": "eslint src --ext ts,tsx"` |
| M5 | turbo.json | 3–6 | `build` outputs include `.next/**` — stale cache from Next.js template | Copied from Next.js turbo template | Remove `.next/**`; use `dist/**` only |
| M6 | `.github/workflows/ci.yml` | — | No environment variable injection during tests | Env vars not loaded | Use `dotenv` in tests or add `env:` block in CI |
| M7 | `.github/workflows/ci.yml` | 44–48 | Artifact retention is only 7 days | Default/minimal retention | Set `retention-days: 30` |

## Recommendations

1. **Re-architect CI to use Turbo**: `npx turbo run lint typecheck test build --continue`
2. **Separate CI into 3 jobs**: `lint-typecheck`, `test`, `build` — chain with `needs:`
3. **Implement actual deploys** for web, courses, schedule, and admin
4. **Add security workflow**: CodeQL, `npm audit`, Snyk
5. **Add Dependabot**: Weekly updates for npm ecosystems
6. **Standardize Node versions**: Pin to exact patch versions
7. **Add `.env.example` files** to `apps/courses/`, `apps/schedule/`, `apps/admin/`

## Changes Applied (2026-06-12)

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Not modified — CI re-architecture (Turbo, matrix expansion, security job) requires explicit design approval |
| `.github/workflows/deploy-*.yml` | Not modified — deploy steps remain placeholders; deployment target (Vercel/Netlify/Render) not yet selected |
| `turbo.json` | Not modified — `lint dependsOn: ["^build"]` and `test dependsOn: ["^build"]` reordering pending |
| `packages/supabase-client/src/` | Auth config corrected — `persistSession`/`autoRefreshToken` confirmed (`see 10-backend-edge-functions.md`) |
