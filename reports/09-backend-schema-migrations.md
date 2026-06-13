# Backend Audit Report — Schema & Migrations

**Date:** 2026-06-12  
**Scope:** supabase/migrations/, packages/types/src/

---

## Fix Status (2026-06-12)

| # | Finding | Original Status | Current Status | Notes |
|---|---------|----------------|----------------|-------|
| 1–4 | Empty migrations (001, 002, 005, 007) | — | ✅ Fixed 2026-06-12 | 002_users.sql, 003_auth.sql, 005_study_groups.sql filled; 001_init.sql extended with schemas; 007_catalog.sql never created (placeholder not needed) |
| 6 | `course_resources` denormalized columns (`course_code`, `course_name`, `major`) | High | ⏳ Pending | Columns still present in table |
| 7 | `uploader_id` missing `REFERENCES auth.users(id)` | High | ⏳ Pending | Has `NOT NULL DEFAULT auth.uid()`; FK fixed in 003_auth.sql |
| 8 | `resource_type` CHECK uses mixed Arabic/Latin | High | ⏳ Pending | Check constraint added in 006_resources.sql: `'PDF', 'فيديو', 'رابط', 'كود', 'شرائح'` |
| 9 | `Course` TypeScript type has phantom fields | High | ⏳ Pending | `title_ar`, `credits`, `semester`, etc. still in `packages/types` |
| 14 | `idx_courses_code` redundant with inline UNIQUE | Low | ⏳ Pending | Unique index + inline UNIQUE both present |
| 15 | No `updated_at` on `courses` table | Medium | ✅ Fixed 2026-06-12 | Added `updated_at TIMESTAMPTZ` + `courses_set_updated_at` trigger |
| 16 | `users_update_own` missing `WITH CHECK` clause | Medium | ✅ Fixed 2026-06-12 | Added `WITH CHECK (auth.uid() = id)` to prevent privilege escalation |
| 17 | `study_groups_update_own` missing `WITH CHECK` clause | Medium | ✅ Fixed 2026-06-12 | Added `WITH CHECK (creator_id = auth.uid())` |
| 18 | Missing `DROP POLICY IF EXISTS` before each CREATE POLICY | Medium | ✅ Fixed 2026-06-12 | Added to 002, 004, 006 migrations |
| 19 | `services` schema missing | Medium | ✅ Fixed 2026-06-12 | `CREATE SCHEMA IF NOT EXISTS services` added in 001_init.sql |
| 20 | `services.assert_admin()` and `services.get_user_roles()` missing | Medium | ✅ Fixed 2026-06-12 | Added `SECURITY DEFINER` functions in 003_auth.sql |

---

## Critical Findings

| # | Migration File | Line/Table | Issue | Root Cause | Fix |
|---|---------------|-----------|-------|-----------|-----|
| 1 | 001_init.sql | N/A | **File completely empty (0 bytes)** — no initial schema established | Migration was never populated; base schema missing | Populate 001_init.sql with extensions, types, and base schema (uuid-ossp, pgcrypto) |
| 2 | 002_users.sql | N/A | **File completely empty** — `users` table never created despite TypeScript User type referencing 11 fields | Migration placeholder left blank | Create `users` table with UUID PK `id`, FK to `auth.users(id)`, and matching columns (email, username, is_admin, etc.) |
| 3 | 005_study_groups.sql | N/A | **File completely empty** — `study_groups` table referenced in 12+ code locations never created | Migration never written; app queries fail at runtime | Create `study_groups` table with proper columns and enable RLS |
| 4 | 007_catalog.sql | N/A | **File completely empty** — migration slot reserved but no implementation | Feature incomplete or migration lost | Either implement catalog table or delete migration slot to avoid confusion |

## High Findings

| # | Migration File | Line/Table | Issue | Root Cause | Fix |
|---|---------------|-----------|-------|-----------|-----|
| 6 | 006_resources.sql:14-16 | course_resources | Redundant denormalized columns `course_code`, `course_name`, `major` stored alongside FK `course_id` | Copy-paste optimization at app layer; creates update anomalies | Remove denormalized columns; join via `course_id` |
| 7 | 006_resources.sql:21 | course_resources.uploader_id | `uploader_id UUID` has no explicit FK to `auth.users(id)` — column is nullable and unconstrained | Missing REFERENCES clause; orphaned uploader records possible | Add `REFERENCES auth.users(id) ON DELETE SET NULL` |
| 8 | 006_resources.sql:70-72 | course_resources | `resource_type` CHECK uses Arabic/Multilingual values mixed with Latin (`'PDF'`) — no codified enum | Inconsistent naming; app changes break DB constraint silently | Create proper ENUM type or use ASCII codes with display-name lookup |
| 9 | packages/types/src/course.ts:5-14 | Course interface | TypeScript `Course` has fields (`title_ar`, `title_en`, `instructor`, `credits`, `semester`, `year`, `image_url`) that don't exist in `courses` table | Types drifted from actual DB schema | Add missing columns via migration OR delete phantom fields from TypeScript |
| 10 | packages/types/src/user.ts | User interface | Entire `User` type references a table that doesn't exist in any migration | 002_users.sql is empty | Implement 002_users.sql matching TypeScript interface |

## Medium Findings

| # | Migration File | Line/Table | Issue | Root Cause | Fix |
|---|---------------|-----------|-------|-----------|-----|
| 14 | 004_courses.sql:24 | idx_courses_code | `CREATE UNIQUE INDEX` redundant with inline `UNIQUE` constraint on `code` column | Double constraint wastes space | Remove explicit index; column-level UNIQUE creates it automatically |
| 15 | 004_courses.sql | courses | No `updated_at TIMESTAMPTZ` column — only `created_at` exists; cannot track modifications | Common pattern omitted | Add `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` and consider a trigger |
| 16 | 006_resources.sql | course_resources | `votes` column is mutable without audit trail; vote state can be directly manipulated | No `updated_at`, no vote history table | Add `updated_at` and consider a `course_resource_votes` join table |

## Low Findings

| # | Migration File | Line/Table | Issue | Root Cause | Fix |
|---|---------------|-----------|-------|-----------|-----|
| 19 | 004_courses.sql / 006_resources.sql | both | Comments are a mix of Arabic and English without consistent language policy | Not a bug; style consistency | Standardize on English for code comments |
| 20 | 006_resources.sql:70-72 | course_resources | CHECK constraint added as separate `ALTER TABLE` rather than inline with column definition | Slightly less readable | Move CHECK constraint inline in CREATE TABLE |

## Recommendations

1. **Fill all empty migrations** or remove them and re-number to eliminate numbering gaps
2. **Add `updated_at` to all tables** with a trigger: `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;`
3. **Replace `members UUID[]` with a join table** `study_group_members(group_id, user_id, joined_at)` for proper referential integrity
4. **Sync TypeScript types with DB schema** — add a CI check that diffs `packages/types/src/` against migration SQL

## Changes Applied (2026-06-12)

| File | Change |
|------|--------|
| `supabase/migrations/001_init.sql` | Added `CREATE SCHEMA IF NOT EXISTS services` and `CREATE SCHEMA IF NOT EXISTS auth` after `set_updated_at()` trigger |
| `supabase/migrations/002_users.sql` | Added `DROP POLICY IF EXISTS` before each `CREATE POLICY`. Added `WITH CHECK (auth.uid() = id)` to `users_update_own` |
| `supabase/migrations/003_auth.sql` | Added `services.get_user_roles(uid UUID)` and `services.assert_admin()` as `SECURITY DEFINER` functions |
| `supabase/migrations/004_courses.sql` | Added `DROP POLICY IF EXISTS` before each policy. Added `updated_at TIMESTAMPTZ` + `courses_set_updated_at` trigger |
| `supabase/migrations/005_study_groups.sql` | Added `WITH CHECK (creator_id = auth.uid())` to `study_groups_update_own` |
| `supabase/migrations/006_resources.sql` | Added `DROP POLICY IF EXISTS` before each policy. Changed `resources_insert_auth` from `auth.role()` to `auth.uid() + is_active` check |
