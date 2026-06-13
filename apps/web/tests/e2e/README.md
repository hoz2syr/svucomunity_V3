# E2E Tests with Playwright

## Prerequisites

- Node.js >= 18
- npm >= 9
- Playwright (run `npx playwright install` before first run)

## Run Tests

```bash
npx playwright test
```

Open headed (developer mode):

```bash
HEADLESS=false npx playwright test
```

## Run Specific File

```bash
npx playwright test apps/web/tests/e2e/app.spec.ts
```

## View Report

```bash
npx playwright show-report playwright-report
```

## Environment Variables

| Variable      | Default                   | Description                  |
|---------------|---------------------------|-------------------------------|
| BASE_URL      | http://localhost:5173     | Web app URL                   |
| HEADLESS      | true (set `false` to disable) | Run with visible browser |
