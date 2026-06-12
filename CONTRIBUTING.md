# Contributing — SVU Community v3.0.0

Thank you for your interest in contributing to SVU Community. This guide explains how to set up your
local environment, follow our coding standards, and submit changes.

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (project uses npm workspaces)
- **Git** >= 2.30

> The project `package.json` specifies `"packageManager": "npm@10.8.2"`. If your CLI warns about
> package manager mismatch, consider using `corepack enable` to respect the pinned version.

## Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/<org>/svu-community.git
cd "svu community v3.0.0_cleantree"

# 2. Install all workspace dependencies
npm install

# 3. Set up environment variables (see docs/setup.md for details)
cp .env.example .env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your actual credentials

# 4. Start all dev servers (orchestrated by Turborepo)
npm run dev

# 5. In a separate terminal, run the linter and type checker together
npm run lint && npm run typecheck
```

## Monorepo Structure

```
svu-community-v3.0.0_cleantree/
├── apps/
│   ├── admin/       ← Admin dashboard (React + Vite)
│   ├── courses/     ← Courses browser & management (React + Vite)
│   ├── schedule/    ← Class schedule viewer (React + Vite)
│   └── web/         ← Legacy vanilla JS app served alongside the new apps
├── packages/
│   ├── config/      ← Shared ESLint, Tailwind, Vite, and TypeScript configs
│   ├── supabase-client/ ← Reusable Supabase client & middleware
│   ├── types/       ← Shared TypeScript type definitions
│   ├── ui/          ← Shared component library (Button, Card, Input, etc.)
│   └── utils/       ← Shared utility functions (date, validation, storage)
├── supabase/        ← Local Supabase config, Edge Functions, migrations, seed data
├── docs/            ← Project documentation
├── scripts/         ← Maintenance and migration scripts
└── turbo.json       ← Turborepo pipeline definition
```

## Available Scripts

Run any of these from the root of the repository:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all dev servers via Turborepo |
| `npm run dev:web` | Start only the web app |
| `npm run dev:courses` | Start only the courses app |
| `npm run dev:schedule` | Start only the schedule app |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Run ESLint across all workspaces |
| `npm run test` | Run the full test suite |
| `npm run typecheck` | TypeScript type checking across all workspaces |
| `npm run clean` | Remove build artifacts and caches |

## Code Quality

Before opening a pull request, make sure:

1. `npm run lint` passes with no errors.
2. `npm run typecheck` produces no type errors.
3. `npm test` passes and coverage thresholds are met.
4. You have followed the commit conventions below.

## Commit Conventions

All commit messages should follow **Conventional Commits**. Use the provided scopes:

| Type | When to use |
|------|-------------|
| `feat:` | A new feature for the user or project |
| `fix:` | A bug fix (user-facing or internal) |
| `docs:` | Documentation-only changes |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding, updating, or fixing tests |
| `chore:` | Maintenance tasks (dependency bumps, config changes, etc.) |
| `perf:` | Performance improvement |
| `style:` | Code style changes (formatting, semicolons, etc.) — no logic change |

### Examples

```
feat(courses): add interactive campus map component
fix(admin): resolve user deletion confirmation dialog
docs: update TESTING.md with coverage thresholds
refactor(ui): extract Button variants into sub-components
test(utils): add unit tests for date formatter
chore: bump vitest to 2.1.0
```

## Branching

- Create a descriptive branch name: `feat/course-filters`, `fix/schedule-export`, etc.
- Open a pull request against `main` when your change is ready for review.
- Keep PRs focused. If you are addressing multiple unrelated concerns, split them into separate PRs.

## Reporting Issues

- Search existing issues before opening a new one to avoid duplicates.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach relevant logs, screenshots, or error messages.

## Code of Conduct

Treat all contributors with respect. Harassment, discrimination, or exclusionary behavior of any kind
is not acceptable.
