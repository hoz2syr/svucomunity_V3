# AGENTS.md — SVU Community

## Overview
SVU Community is a **Turborepo + npm workspaces monorepo** for a Syrian Virtual University student platform.
It consists of 4 apps and 6 shared packages, backed by Supabase (PostgreSQL + Edge Functions).

## Tech Stack
- **Frontend**: React 19, TypeScript 5.4, Tailwind CSS v4, shadcn/ui (packages/ui)
- **Build**: Turborepo, Vite 6, Vitest 4
- **Testing**: Vitest (unit), Playwright 1.60 (e2e)
- **Backend**: Supabase (PostgreSQL + Edge Functions: Deno runtime)
- **AI/OCR**: Google Gemini (apps/schedule), OCR proxy edge function
- **Ticketing**: Linear (via MCP at runtime, not in repo)

## Repository Structure
```
svu-community/
├── apps/
│   ├── web/        — Main portal (multi-page HTML + vanilla JS, Arabic RTL)
│   ├── courses/    — Course catalog + interactive prerequisite graph
│   ├── schedule/   — Student schedule builder (AI-powered conflict resolver)
│   └── admin/      — Admin dashboard (React, shadcn/ui)
├── packages/
│   ├── ui/         — Shared shadcn/ui component library
│   ├── types/      — Shared TypeScript types/interfaces
│   ├── utils/      — Validation, sanitization, date formatters
│   ├── i18n/       — Internationalization (ar/en)
│   ├── config/     — Shared eslint, tailwind, tsconfig, vite, vitest configs
│   └── supabase-client/ — Shared Supabase client + middleware
├── supabase/
│   ├── migrations/ — SQL migrations (001–008)
│   ├── seed/       — Seed data (users, courses, groups)
│   └── functions/  — Edge Functions (admin-actions, gemini-proxy, ocr-proxy, send-email)
├── docs/           — Architecture, API, guides
├── scripts/        — Setup, seed, migrate, deploy, lint shells
├── load-tests/     — k6 load tests
└── landing/        — Marketing landing page
```

## Workspace Rules
1. **Always run `npm install` at root** after workspace changes.
2. **Use `npm run dev`** from root to start all apps concurrently:
   - `apps/web` → http://localhost:5173
   - `apps/courses` → auto-detected
   - `apps/schedule` → http://localhost:3001
3. **Use `npm run lint`** for cross-repo linting; `npm run typecheck` for TS.
4. **Run tests**: `npm test` (unit), `npx playwright test` (e2e), `npm run test:coverage` per app.
5. **Do NOT commit `.env.local`** or any file containing secrets.
6. **Do NOT modify logic without tests**; add tests before or with every change.
7. **Do NOT touch `supabase/migrations/`** unless a new migration is required; migrations are append-only.
8. **Avoid changing existing behavior** of auth, session verification, or RBAC unless fixing a confirmed bug.

## Security Rules
- Never log secrets, API keys, or session tokens.
- Use parameterized queries only (Supabase client handles this — no raw SQL in app code).
- All user input must pass through `packages/utils/src/validation/validators.ts` before use.
- Edge Functions validate JWT before any action.
- `.env.example` files must never contain real secrets.

## CI/CD
- GitHub Actions workflows in `.github/workflows/`:
  - `ci.yml` — security check + lint + typecheck + test + coverage (apps/web)
  - `deploy-web.yml`, `deploy-courses.yml`, `deploy-schedule.yml` — stubbed (update for real hosting)

## Coding Standards
- **TypeScript**: strict mode, no `any` without explicit justification.
- **React**: functional components + hooks; no class components.
- **CSS**: Tailwind v4 utility classes; custom CSS in globals.css only.
- **Linting**: ESLint flat config (`eslint.config.js`), TypeScript-ESLint.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## Delegation Protocol
When working on this repo, use the following **hierarchical delegation** to preserve context:
1. **Tier 1 (Root/Orchestration)**: global decisions, cross-cutting concerns, CI/CD, docs.
2. **Tier 2 (Shared Packages)**: `packages/ui`, `packages/types`, `packages/utils`, `packages/config` changes.
3. **Tier 3 (Apps)**: changes isolated to one app: `apps/web`, `apps/courses`, `apps/schedule`, `apps/admin`.
4. **Tier 4 (Edge Functions)**: `supabase/functions/*` — atomic, serverless functions.

Never let a single agent handle changes across more than **two tiers simultaneously**.

## Known Issues Tracker
See `apps/web/CRITICAL_FIXES_PLAN.md` for the web app remediation plan.
See `security_review_files_*.md` for prior security audit findings.
