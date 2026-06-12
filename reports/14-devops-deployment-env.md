# DevOps Audit Report — Deployment & Environment

**Date:** 2026-06-12  
**Scope:** .env.example, apps/* env files, supabase/config.toml, deploy workflows, vite.config.ts files

---

## Critical Findings

| # | File/Config | Issue | Root Cause | Fix |
|---|-------------|-------|-----------|-----|
| 1 | `.github/workflows/deploy-web.yml`, `deploy-courses.yml`, `deploy-schedule.yml` | All deploy workflows are **placeholders only** — `echo "Deploy step..."` — nothing is actually deployed | No deployment provider configured | Choose and configure a deployment target (Vercel, Netlify, Render) and implement actual deploy steps |
| 2 | `apps/courses/`, `apps/schedule/`, `apps/admin/` — **no `.env.example` files** | Apps read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` but have no documented env vars | `.env.example` only created for `apps/web`; other 3 apps missed | Create `.env.example` in each app with at minimum `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` |
| 3 | `supabase/config.toml` | **Empty file (0 bytes)** — no project ID, no auth config, no Edge Function registry | File created as placeholder, never populated | Populate with `project_id`, `auth.email.enabled = true`, and other required config |

## High Findings

| # | File/Config | Issue | Root Cause | Fix |
|---|-------------|-------|-----------|-----|
| 4 | `.env.example` | `VITE_GEMINI_API_KEY` and `VITE_RESEND_API_KEY` are **bundled into client JS** — exposes paid API keys to every browser | `VITE_` prefix exposes vars to client build | Remove these keys; store only as Supabase secrets in Edge Functions |
| 5 | `apps/web/.env.example` | Missing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — app cannot initialize Supabase without them | Only `VITE_API_URL` was added; Supabase vars omitted | Add both Supabase vars to `apps/web/.env.example` |
| 6 | All deploy workflows | **No GitHub Secrets referenced** — no `${{ secrets.XXX }}` usage | Secrets never set up or referenced | Configure required secrets in GitHub repo Settings → Secrets |
| 7 | All Edge Function `index.ts` files | All are **empty (0 bytes)** — stubs, not functional | Functions scaffolded but never implemented | Implement or remove stub references |

## Medium Findings

| # | File/Config | Issue | Root Cause | Fix |
|---|-------------|-------|-----------|-----|
| 8 | `apps/courses/vite.config.ts`, `apps/schedule/vite.config.ts`, `apps/admin/vite.config.ts` | No `base` public path configured (defaults to `/`) | Vite configs are minimal | If deploying to subpaths, set `base` accordingly; if subdomains, keep `/` |
| 9 | `apps/web/vite.config.js` | Multi-page app has no SPA fallback — 404 on non-existent routes | Vite default builds static files only | Add `_redirects` file (`/* /index.html 200`) for Netlify or equivalent |
| 10 | `apps/web/vite.config.js` | `window.SVU_ENV` via `define` — different env values require different builds for dev vs prod | Fragile env injection pattern | Use runtime env injection or proper `.env.production` per app |
| 11 | `apps/web/package.json` | Version `"2.0.0"` while other apps are `"1.0.0"` or `"0.0.0"` — inconsistent monorepo versioning | Independent versioning per app | Align versions or switch to Changesets |
| 12 | `apps/schedule/package.json` | `dev` script binds to `0.0.0.0` — exposes dev server to all interfaces | Convenience for multi-device testing | Change to `localhost` only or document as dev-only |

## Low Findings

| # | File/Config | Issue | Root Cause | Fix |
|---|-------------|-------|-----------|-----|
| 13 | `apps/web/package.json` | `@testing-library/react` listed as devDependency for Vanilla JS app — adds ~2MB | Scaffold template artifact | Remove if not testing React components |
| 14 | `apps/admin/package.json` | No `test`, `lint`, or `typecheck` scripts — admin cannot be validated in CI | Minimal scaffold | Add missing scripts |
| 15 | `apps/web/package.json` | No `engines` field — Tailwind 4.x requires Node.js >= 18 | Not documented | Add `"engines": {"node": ">=18"}` |

## Recommendations

1. **Choose deployment target** — Vercel (recommended for SPAs), Netlify, or Render. Wire `deploy-web.yml`, `deploy-courses.yml`, `deploy-schedule.yml` to actual platform actions.
2. **Create `deploy-admin.yml`** mirroring web deploy workflow.
3. **Complete Supabase config.toml** with actual project ID and auth settings.
4. **Remove `VITE_GEMINI_API_KEY` and `VITE_RESEND_API_KEY`** from all `.env.example` files.
5. **Add `.env.example` to each app** with the minimum required variables.
6. **Add preview/production split** to deploy workflows.
7. **Implement actual deploy steps** — replace all `echo` placeholders with real deployment commands.
