# Testing Guide — SVU Community v3.0.0

This project is a Turborepo monorepo. All test commands are orchestrated via Turbo from the root.

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all test suites across every app and package |
| `npm run test:watch` | Run all tests in watch mode with auto-reload |
| `npm run test:coverage` | Run all tests and generate a coverage report |

## Per-App / Per-Package Testing

Run tests for a specific workspace using Turbo's `--filter` flag:

```bash
npm run test -- --filter=apps/admin
npm run test -- --filter=apps/courses
npm run test -- --filter=apps/schedule
npm run test -- --filter=packages/ui
npm run test -- --filter=packages/utils
npm run test -- --filter=packages/types
```

You can also target multiple workspaces at once:

```bash
npm run test -- --filter=apps/courses... apps/schedule...
```

## Writing Tests

### File Locations

| Type | Location Pattern |
|------|-----------------|
| Unit tests (TS/TSX) | `packages/**/__tests__/*.test.ts` |
| Component tests | `apps/*/src/__tests__/*.test.tsx` |
| Web app tests (Vanilla JS) | `apps/web/src/__tests__/*.test.js` |

### Test Style

- Use `describe` + `it` blocks to group related assertions.
- Import `vi` from `vitest` for mocks, stubs, and spying.
- Prefer testing behavior over implementation details.
- Mock external dependencies (Supabase, Gemini API, etc.) to keep tests fast and deterministic.

```ts
import { describe, it, expect, vi } from 'vitest'

describe('formatDate', () => {
  it('returns a formatted date string for a valid ISO date', () => {
    expect(formatDate('2025-01-01')).toBe('01/01/2025')
  })
})
```

## Test Frameworks & Config

- **Vitest** is the test runner across the monorepo.
- **Testing Library** (`@testing-library/react`) is used for component tests in React / TSX files.
- Root and per-package Vitest configs live next to `vite.config.ts`:
  - `vitest.config.ts` at the root for shared workspace tests
  - `vitest.config.ts` inside each app/package for isolated test environments

## Coverage Thresholds (Enforced in CI)

These minimums are checked during CI. Falling below any threshold will fail the build:

| Workspace | Minimum Coverage |
|-----------|-----------------|
| `packages/ui` | 80% |
| `packages/utils` | 70% |
| `packages/types` | 60% |
| `apps/courses` | 60% |
| `apps/schedule` | 60% |

## Test File Naming Conventions

- Always use the `*.test.ts`, `*.test.tsx`, or `*.test.js` extension.
- Colocate tests with the source file they exercise, or place them in a sibling `__tests__/` directory.
- Mirror the source directory structure inside `__tests__/` for easy navigation.

## CI Integration

Tests run automatically on every pull request and push to `main` via the GitHub Actions CI workflow. See `docs/ci-cd.md` for details on how CI is configured and how to view build status.

## Tips & Common Gotchas

- If a test leaks state between suites, use `vi.clearAllMocks()` or `vi.resetAllMocks()` in `beforeEach`.
- Use `@testing-library/jest-dom` matchers for richer DOM assertions.
- For date-dependent tests, mock `Date.now()` or inject the current time as a parameter.
- Keep environment-dependent logic at the edges; inject API clients and config objects so they can be replaced with mocks during tests.
