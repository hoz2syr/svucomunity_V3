# PROJECT_RECOVERY_PLAN.md — SVU Community v3.0.0

##Objective
Complete project recovery, security hardening, test activation, and production readiness without changing platform logic.

##Context Preservation
- All changes documented in `docs/recovery/change-log.md`
- Pre-fix state snapshots in `docs/recovery/baseline/`
- Rollback procedures in `docs/recovery/rollback.md`
- No business logic modifications allowed

##Hierarchical Delegation Rules
- **Tier 1 (Root)**: Security, CI/CD, Architecture, Documentation
- **Tier 2 (Shared Packages)**: packages/ui, packages/utils, packages/types, packages/config
- **Tier 3 (Apps)**: Individual app fixes
- **Tier 4 (Edge Functions)**: supabase/functions/* fixes

Maximum 2 tiers per agent to prevent context exhaustion.

##Reviewer Teams (Parallel Execution)
1. **Team Alpha**: Security & Architecture — Tier 1
2. **Team Beta**: Tests & Infrastructure — Tier 1
3. **Team Gamma**: UI/UX & Accessibility — Tier 2
4. **Team Delta**: Documentation & Production Deployment — Tier 1

Each team produces a structured report with: file, line, severity, issue, fix.

##Phases
1. **Phase 0**: Context setup & baseline capture
2. **Phase 1**: Structural fixes (missing files, paths, imports, configs)
3. **Phase 2**: Security fixes (audit findings → patches)
4. **Phase 3**: UI/UX fixes (accessibility, responsive, components)
5. **Phase 4**: Test activation (fix configs, write missing tests, run all)
6. **Phase 5**: Documentation completion (diagrams, guides, deployment)
7. **Phase 6**: Production hardening (env, deploy, monitoring)
8. **Phase 7**: Final review & sign-off

##Constraints
- No changes to business logic
- All tests must pass before completion
- No secrets committed
- Follow existing code style and conventions
- Arabic RTL preserved for all user-facing interfaces
