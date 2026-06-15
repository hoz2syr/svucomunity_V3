# Context Checkpoint — Phase 0
Date: 2026-06-15
Branch: master
Commit: (current HEAD)

##Baseline Snapshot
- Git status recorded in `docs/recovery/baseline/git-status.txt`
- All config files backed up
- Test baseline: pending first run
- Security baseline: unpatched (see security_review_files_*.md)

##Scope Boundaries
- Monorepo: 4 apps, 6 packages, 3 edge functions
- Tests: Vitest (unit) + Playwright (e2e) + k6 (load)
- UI: React 19 + Tailwind v4 + shadcn/ui
- Backend: Supabase (Edge Functions + PostgreSQL)

##Critical Rules
1. Do NOT modify platform logic
2. Do NOT commit .env.local or secrets
3. Do NOT bypass test gates
4. Hierarchical delegation enforced (max 2 tiers/agent)
5. Overloop review after each fix batch
