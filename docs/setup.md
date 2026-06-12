# Setup Guide — SVU Community v3.0.0

This guide walks you through setting up the SVU Community project on your local machine for
development, testing, and local deployment.

## Prerequisites

- **Node.js** >= 18.0.0 — [Download here](https://nodejs.org/)
- **npm** >= 9.0.0 — bundled with Node.js >= 18
- **Git** >= 2.30 — for cloning the repository
- A **code editor** — VS Code is recommended (project ships with an `.editorconfig`)

> Check your versions with:
> ```bash
> node --version
> npm --version
> git --version
> ```

## Step 1: Clone the Repository

```bash
git clone https://github.com/<org>/svu-community.git
cd "svu community v3.0.0_cleantree"
```

## Step 2: Install Dependencies

The project uses **npm workspaces** with **Turborepo**. Install all dependencies from the root:

```bash
npm install
```

This installs dependencies for the root workspace, all `apps/*`, and all `packages/*`. Turborepo is
installed as a root devDependency and orchestrates cross-package commands.

## Step 3: Configure Environment Variables

The project requires environment variables for the API backend and Supabase. Copy the example files
and fill them in with your values.

### Root `.env`

```bash
cp .env.example .env
```

Edit `.env` and set the following keys:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `development` for local work |
| `VITE_API_URL` | URL of the backend API (e.g. `http://localhost:3001`) |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client-side use) |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features |
| `VITE_RESEND_API_KEY` | Resend API key for transactional email |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **never expose this to the client** |

### Web App `.env`

```bash
cp apps/web/.env.example apps/web/.env
```

This file only needs `VITE_API_URL` for the legacy web app, pointing at your local backend.

## Step 4: Set Up Supabase

SVU Community uses [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions) for its
backend. Follow these steps to set up a local Supabase instance or connect to a remote one.

### Option A: Local Supabase (recommended for full offline development)

1. Install the [Supabase CLI](https://supabase.com/docs/cli):
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in the project (run once from the root):
   ```bash
   supabase init
   ```

3. Start the local Supabase stack (Postgres, Auth, Studio, Edge Functions):
   ```bash
   supabase start
   ```

4. Note the values printed by `supabase start` — you will need the local `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` for your `.env` file.

5. Apply migrations and seed data:
   ```bash
   supabase db reset
   ```

   This runs all SQL files in `supabase/migrations/` and `supabase/seed/`.

### Option B: Remote Supabase (cloud)

1. Create a project at [app.supabase.com](https://app.supabase.com/).
2. Retrieve your project URL and anon key from **Settings → API**.
3. Add them to `.env` under `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Run the migrations against your remote database:
   ```bash
   supabase db push
   ```
5. Seed the database if necessary by running the SQL in `supabase/seed/`.

## Step 5: Run the Project Locally

### Start All Dev Servers

```bash
npm run dev
```

This uses Turborepo to start all React app dev servers in parallel. Open each app at the port
printed in the terminal (usually http://localhost:5173 and variations thereof).

### Start a Single App

To save resource and focus on one app at a time:

```bash
npm run dev:web       # Legacy vanilla JS app
npm run dev:courses   # Courses React app
npm run dev:schedule  # Schedule React app
```

## Step 6: Code Quality Checks

Before committing changes, run the quality gate locally:

```bash
npm run lint         # ESLint across all workspaces
npm run typecheck    # TypeScript type checking
npm test             # Full test suite
```

All three must pass for a healthy codebase state.

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` errors, another process is occupying the default Vite port. Stop the
conflicting process or override the port for the affected app in its `vite.config.ts` or `.env`.

### Supabase Connection Fails

- Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in `.env`.
- Confirm `supabase start` is running if using the local instance (defaults to `http://localhost:54321`).
- Check the Supabase Studio at `http://localhost:54323` for schema and authentication status.

### Node Version Mismatch

If `npm install` fails or you see errors about unsupported Node features, switch to the expected
Node version using `nvm` (Node Version Manager):

```bash
nvm install 18
nvm use 18
```

### Turborepo / Workspace Issues

If Turbo does not detect a workspace:

```bash
# Clean install
rm -rf node_modules
npm install

# Clear Turbo's local cache
npx turbo run clean --force
```

### TypeScript Module Not Found

Make sure the package aliases in `packages/config/tsconfig/` match your actual folder names. If names
or casing were changed during a migration, update the `paths` mapping in the relevant `tsconfig.json`.
