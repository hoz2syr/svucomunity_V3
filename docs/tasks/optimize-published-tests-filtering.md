# Task: Optimize Published Tests Filtering & Test Loading Performance

## Status: COMPLETED

## Changes Applied

### 1. Database Migration (NEW)
`supabase/migrations/20260624000000_add_test_course_major_filter_columns.sql`
- Added `major` and `course_code` as GENERATED ALWAYS AS ... STORED columns from `settings->>'major'` and `settings->>'courseCode'`
- Added indexes: `idx_tests_major`, `idx_tests_course_code`

### 2. Backend Service (`src/features/exam/src/services/exam.supabase.ts`)
- `fetchPublishedTests` now accepts optional `major?: string` and `courseCode?: string`
- Select list changed to exclude `questions`: `id, title, description, settings, rating, published, created_at, updated_at`
- Server-side filtering applied via `.filter('settings->>major', 'eq', major)` and `.filter('settings->>courseCode', 'eq', courseCode)`
- Mapped rows set `questions: []` to preserve `TestModel` type compatibility
- `fetchPublishedTestById` unchanged (still fetches full test with questions for play flow)

### 3. Client Hook (`src/features/exam/src/hooks/usePublishedTests.ts`)
- `queryKey` now includes `selectedMajor`, `selectedCourse`, and `searchQuery` so filter changes trigger refetch
- `queryFn` passes the new filter arguments to `fetchPublishedTests`
- Client-side filtering reduced to search-only; major/course filtering removed from `useMemo` (now server-side)

### 4. Tests
- `tests/features/exam/services/exam.supabase.test.ts` — passes (9 tests)
- `tests/features/exam/hooks/usePublishedTests.test.tsx` — passes (4 tests)
- All 97 test files pass (602 tests)
- `tsc --noEmit` passes

## Verification
```
npx vitest run tests/features/exam tests/features/study-groups 2>&1 | tail -1
Test Files  38 passed (38)
Tests       370 passed (370)

npx vitest run 2>&1 | tail -1
Test Files  97 passed (97)
Tests       602 passed (602)
```

## Outstanding Items
- [ ] Database migration applied to Supabase instance
- [ ] Verify indexes are created on the Supabase dashboard or via SQL
- [ ] Optionally add server-side search filter via `ilike` on `title`/`description`
