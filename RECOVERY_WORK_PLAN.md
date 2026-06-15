# SVU Community v3.0.0 — Production Recovery Work Plan

## Work Charter
Fix all critical/high/medium issues, complete missing assets, harden security, fix build and tests, document the system, and prepare for production deployment while preserving existing platform business logic.

## Hierarchical Delegation
| Tier | Scope | Boundary |
|------|-------|----------|
| 1 | Root orchestration, CI/CD, docs, cross-app configs | Roots and shared configs only |
| 2 | Shared packages: `packages/*`, docs architecture, security policy | Tier 2 assets only |
| 3 | Single-app changes: `apps/web`, `apps/courses`, `apps/schedule`, `apps/admin` | One app per task |
| 4 | Edge Functions + supabase migrations (append only) | Supabase functions only |

**Rule: no agent handles more than two tiers simultaneously.**

## Review Cadence
- Overloop review after every completed fix batch (Tier 2 → Tier 3 → Tier 4).
- Each batch must pass `npm run lint`, `npm run typecheck`, and relevant tests before sign-off.

## Current Blockers
- Export mismatch: `getCsrfHeaders` added to `apps/web/src/js/modules/csrf.js`; `getCsrfHeaderName` is still imported by `apps/web/src/js/modules/shared.js`.
- Build of `apps/web` blocked by above mismatch + potential duplicate `const toast` in `shared.js`.
- Empty docs: `docs/overview.md`, `docs/database.md`, `docs/monorepo.md`, `docs/setup.md`, `docs/contributing.md`, `docs/deployment.md`, `docs/report.md`.
- Tests: unit tests exist; Playwright e2e and load tests need setup.
- CI matrix: only `apps/web` is tested.

## Fix-Backlog (Non-Exhaustive)
1. Restore or replace `getCsrfHeaderName` export in `apps/web/src/js/modules/csrf.js` to match `shared.js` import.
2. Ensure `apps/web/src/js/modules/shared.js` has no duplicate declarations.
3. Sweep all remaining `innerHTML` / DOM XSS patterns; normalize to safe DOM APIs.
4. Re-run SQL injection sweep across all apps; confirm parameterized queries.
5. Normalize script paths in courses.html and admin.html.
6. Restore root `package.json` scripts: clean = `rimraf dist`, audit = moderate.
7. Add missing docs and architecture diagrams (docs/*).
8. Expand `.github/workflows/ci.yml` matrix to include all apps: lint, typecheck, test, build.
9. Add Playwright e2e tests for critical user flows.
10. Configure k6 load tests and collect baselines in `load-tests/`.
11. UI/UX pass: audit shadcn/ui usage, RTL, responsive, accessibility (WCAG 2.2).
12. Secret scan: confirm no secrets in source files.
13. Production env checklist (`docs/deployment.md`, env.example files).

## Non-Negotiable Constraints
- **Do not change business logic** of auth, sessions, or RBAC unless fixing a confirmed bug.
- **Do not commit `.env.local`** or any file containing secrets.
- **All user input must pass through validators** before use.
- **Follow conventional commits** when producing change logs.

## Mission Success Criteria
- `npm run build` succeeds for all apps.
- `npm test` passes for all packages with no flaky failures.
- Zero critical/high security findings in final scan.
- CI runs lint, typecheck, test, build across all apps.
- All required docs complete with diagrams.
- Application ready for production deployment.
