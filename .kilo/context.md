# SVU Community — Project Context

## Overview
SVU Community project. Stack: React 19 + Vite 6 + TypeScript + Supabase + TanStack Query + Tailwind CSS + shadcn/ui.

## Current Phase
_Not set. Update this file when a phase is defined._

## Active Constraints
- No secrets or credentials in code
- No auth/session/RBAC changes without confirmed bug
- No database migration changes without explicit scope
- UI changes require visual verification
- Logic changes require tests
- Use `svu-verify` before marking any task complete
- All decisions documented in `.kilo/sessions/`

## Layer Boundaries
- `src/pages/` — route state, composition, calls feature hooks/services. No raw Supabase, no large business logic, no reusable UI.
- `src/components/` — presentation, local UI state, controlled inputs, accessibility, reusable UI. No Supabase, no Storybook imports, no production mocks.
- `src/features/` — feature components, hooks, services, types. No global app routing, no unrelated feature logic.
- `src/services/` — API/service functions, Supabase operations, error normalization, typed results. No React components, JSX, or UI state.
- `src/stores/` — global UI state, lightweight notification UI state. No Supabase, no large business logic.

## Naming
- File names: English only, clear names, no Arabic in `src`.
- No unusual Unicode characters in file names.
- Comments in code only when necessary for security/safety behavior.
- Directories: lowercase with dashes (e.g. `components/auth-wizard`).

## Test Rules
- Any logic change requires tests.
- Any Supabase behavior change requires tests proving safe import, correct no-env behavior, and no silent failures on missing env.
- Any main component change requires test or story.
- Any existing page flow change requires test if flow already exists.
- Do not auto-generate tests for every component; test critical flows and components with important behavior.

## Verification
Before completing any non-trivial task:
1. Run `npm run lint`
2. If UI/build changed: run `npm run build`
3. If logic/tests changed: run `npm run test`
4. If Storybook/components changed: run `npm run build-storybook`
5. If pre-existing verification fails for reasons outside the task scope: document in session file, do not hide or expand scope to cover it.

## Session Rules
Every executable task must have a session in `.kilo/sessions/`.
