# SVU Community — Top-Level Guardrails

## Scope
This file defines high-level guardrails for the SVU Community project. All agents must respect these rules.

## Security
- Do not expose secrets, API keys, tokens, or credentials.
- Do not modify authentication, sessions, or RBAC unless fixing a confirmed bug.
- Do not modify database migrations without explicit task scope.

## Architecture
- Follow the layer boundaries defined in `.kilo/rules.md`.
- Use shared services for data access; never call Supabase directly from UI components.
- Keep pages thin, components presentational, and services for data operations.

## Quality
- All logic changes require tests.
- All UI changes require visual verification.
- Run `svu-verify` before marking any task complete.
- Document decisions in session files under `.kilo/sessions/`.

## Coordination
- Before acting, load `.kilo/rules/` and relevant commands from `.kilo/commands/`.
- Use the Context Manager agent when unsure which rules apply.
- Do not introduce new dependencies without user approval.

## Communication
- Use English for code, file names, and technical documentation.
- Use Arabic for user-facing explanations only when explicitly requested.
