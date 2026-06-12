# CI/CD — SVU Community v3.0.0

This document explains the Continuous Integration and Continuous Deployment setup for the
SVU Community monorepo. It covers the four GitHub Actions workflows, how deploys are triggered,
how to check CI status, and how to add a new app's deploy workflow.

## Overview

All workflows live in `.github/workflows/` at the root of the repository. There are four workflows:

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Continuous Integration — lint, typecheck, and test on every push |
| `.github/workflows/deploy-web.yml` | Deploy the legacy web app to its hosting target |
| `.github/workflows/deploy-courses.yml` | Deploy the courses app to its hosting target |
| `.github/workflows/deploy-schedule.yml` | Deploy the schedule app to its hosting target |

## CI Workflow (`ci.yml`)

The CI workflow runs on:

- Every push to `main`.
- Every pull request targeting `main`.

It performs the following jobs in sequence:

1. **Install** — Checks out the repository and runs `npm install` across all workspaces.
2. **Lint** — Executes `npm run lint` to enforce code style and catch common errors.
3. **Typecheck** — Executes `npm run typecheck` to validate TypeScript types across every package and app.
4. **Test** — Executes `npm test` and enforces the coverage thresholds defined in `TESTING.md`.

> All steps must pass for CI to report success. A failing check will block a pull request from being merged.

## Deploy Workflows

Each deploy workflow is responsible for building and deploying one app:

- `deploy-web.yml` targets the legacy vanilla JS web app (`apps/web/`).
- `deploy-courses.yml` targets the courses React app (`apps/courses/`).
- `deploy-schedule.yml` targets the schedule React app (`apps/schedule/`).

### How Deploys Are Triggered

- **Push to `main`** — The deploy workflow for each app runs automatically when changes are merged to `main`.
- **Manual dispatch (if enabled)** — Some workflows may have a `workflow_dispatch` trigger allowing manual runs from the GitHub Actions UI.

### Viewing CI / Deploy Status

1. Go to the **Actions** tab in the GitHub repository.
2. Select the workflow you want to inspect (e.g. `CI`, `Deploy Courses`).
3. Click on a specific workflow run to see job logs and step-by-step output.
4. A green checkmark next to a commit SHA in the pull request view indicates that CI passed.

You can also view the status directly from the command line if you have the GitHub CLI installed:

```bash
gh run list                      # List recent workflow runs
gh run view <run-id>             # Inspect a specific run
gh run watch                     # Watch the latest run in real time
```

### GitHub Badge

To display CI status in a README, add a badge using the Actions workflow name. Example for CI:

```markdown
![CI](https://github.com/<org>/svu-community/actions/workflows/ci.yml/badge.svg)
```

## Adding a New App's Deploy Workflow

When a new app is added to the monorepo (`apps/<new-app>/`), follow these steps to add its deploy workflow:

1. **Create the workflow file**

   Add a new file named `deploy-<new-app>.yml` in `.github/workflows/`.

   ```yaml
   name: Deploy <New App>

   on:
     push:
       branches:
         - main
       paths:
         - "apps/<new-app>/**"

   jobs:
     deploy:
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: apps/<new-app>
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 18
             cache: "npm"
             cache-dependency-path: apps/<new-app>/package-lock.json
         - run: npm ci
         - run: npm run build
         # Add your deploy step here (Vercel, Netlify, Cloudflare, etc.)
   ```

2. **Configure deployment secrets**

   If the new app deploys to an external provider (Vercel, Netlify, Render, etc.), add the required
   secrets under **Settings → Secrets and variables → Actions** in the GitHub repository. Common secrets:

   - `VERCEL_TOKEN`
   - `NETLIFY_AUTH_TOKEN`
   - `CLOUDFLARE_API_TOKEN`

3. **Limit triggering paths (optional)**

   Use the `paths` filter in the `on.push` section so the workflow only runs when files inside
   `apps/<new-app>/` change. This reduces unnecessary compute for changes in other workspaces.

4. **Set the working directory**

   Use `defaults.run.working-directory` to scope `npm ci` and `npm run build` to the new app's
   folder. This keeps the workflow isolated and avoids building unrelated workspaces.

5. **Update the root `package.json` build script (if needed)**

   If the new app needs a root-level build alias, add it under `scripts` in the root `package.json`:

   ```json
   "build:<new-app>": "turbo run build --filter=@svu-community/<new-app>"
   ```

6. **Verify locally**

   Before committing, you can validate the workflow file with `actionlint` or by pushing to a
   feature branch and watching the Actions run in the GitHub UI.

## Secrets & Environment Variables

Never commit secrets. All deployment credentials and API keys should be stored as GitHub Actions
secrets and referenced with the `${{ secrets.SECRET_NAME }}` syntax inside workflow files.
