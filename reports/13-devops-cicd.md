# DevOps Audit Report — CI/CD

**Date:** 2026-06-12  
**Scope:** .github/workflows/, turbo.json, root package.json scripts

---

## Critical Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| C1 | `.github/workflows/ci.yml` | 17–19 | **CI matrix only covers `apps/web`** — `courses`, `schedule`, `admin` are never linted/typechecked/tested | Matrix scoped to single app during initial setup, never expanded | Expand matrix to include all 4 apps |
| C2 | `.github/workflows/ci.yml` | 13 | `fail-fast: true` aborts remaining matrix jobs on first failure | Default/over-eager flag | Set `fail-fast: false` |
| C3 | `.github/workflows/ci.yml` | 42–48 | **Coverage artifact path wrong** — `path: ${{ matrix.package }}/coverage/` creates nested `apps/web/apps/web/coverage/` since working dir is already the app | Path constructed relative to repo root while job cwd is the app directory | Change to `path: coverage/` (relative to current working-directory) |
| C4 | `.github/workflows/deploy-courses.yml` | 17–18 | **Entire workflow is a placeholder** — no install, build, or deploy step | Scaffolded but never implemented | Add `npm ci`, `npm run build`, real deploy step |
| C5 | `.github/workflows/deploy-schedule.yml` | 17–18 | Same placeholder issue as deploy-courses.yml | Same | Same fix |

## High Findings

| # | File | Line | Issue | Root Cause | Fix |
|---|------|------|-------|-----------|-----|
| H1 | `.github/workflows/ci.yml` | 36–42 | **CI does not use `turbo run`** — runs raw `npm run lint`/`test`/`typecheck`, bypassing turbo pipeline, caching, dependency ordering | Workflow written with plain npm | Replace with `npx turbo run lint test typecheck --continue` + TURBO_TOKEN |
| H2 | `.github/workflows/ci.yml` | 29 | Node.js version is `20` (major-only) — not pinned to specific patch | Inconsistent version pinning | Pin to `20.11.0` or `~20.11.0` |
| H3 | `.github/workflows/deploy-web.yml` | 32–33 | Deploy step is a placeholder (`echo`) — no hosting provider integration | Deploy target not configured | Add Vercel/Netlify/Render action with secrets |
| H4 | `.github/workflows/deploy-*.yml` | All | **No preview/production split** — all deploy to `main` without staging | Environments not defined | Add `environment: production` to main deploys; add preview deploys on PRs |
| H5 | turbo.json | 7–9 | `lint` task depends on `^build` — linting should not require dependencies built first | Incorrect turbo dependency declaration | Change to `"dependsOn": []` |
| H6 | `.github/workflows/ci.yml` | — | **No security scanning** — no Snyk, CodeQL, dependency audit, or secret scanning | Security deprioritized | Add separate `security` job |

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
