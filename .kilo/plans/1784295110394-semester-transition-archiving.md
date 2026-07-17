# Semester Transition & Study Group Archiving — Implementation Plan

## Goal
When the admin confirms the next semester, automatically update all users to the new semester, archive previous-semester study groups, notify all users, and show semester-organized group history in "My Groups".

## Current State (Verified)
- `profiles.current_semester` stores mixed formats: `'2026-1'`, `'2026-2'` (seed) vs `'S25'`, `'F25'` (UI)
- `groups` table has **no** `semester_code` or `is_archived` columns
- `StudyGroup` type missing DB fields: `is_full`, `updated_at`
- `getAllWithCreators` selects: `id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at` (no semester/archive)
- `getMyGroups` queries creator groups + joined groups separately, same select list
- `createGroup` inserts: all group fields + `current_members: 1, is_full: false`
- Admin panel: 7 tabs at `/admin/*` (users, extractions, reports, verification, notifications, reviews, analytics)
- `broadcastToAllUsers` exists in `adminNotificationService.supabase.ts`
- `admin_audit_log` table exists: `id, caller_id, action, payload, ip_address, user_agent, created_at`
- `getCurrentSemesterCode()` bug: returns `S26` for Jan-Jul 2026, should return `S25`
- `convertSemesterCodeToLabel` already handles both short (`S25`) and long (`2025-2`) formats

## Design Decisions

### 1. Short-Format Standardization
Use short format **exclusively** everywhere: `S25`, `F25`, `S26`, `F26`
- `F{YY}` = First semester (Fall), starts ~August
- `S{YY}` = Second semester (Spring), starts ~January
- `YY` matches the **start year** of the academic year
- Example: Spring 2026 = `S25` (second semester of academic year 2025/2026)

### 2. Fix `getCurrentSemesterCode()` Bug
File: `src/features/schedule-extraction/utils/semesterUtils.ts`

```ts
export function getCurrentSemesterCode(): string {
  const now = new Date();
  const yearShort = now.getFullYear().toString().slice(-2);
  const month = now.getMonth(); // 0-indexed

  if (month >= 7) {
    return `F${yearShort}`; // Aug-Dec: Fall semester, current year
  } else {
    return `S${(now.getFullYear() - 1).toString().slice(-2)}`; // Jan-Jul: Spring, previous year's academic cycle
  }
}
```

### 3. Data Migration: Normalize Existing Semesters
Run SQL migration to normalize existing data:

```sql
-- Normalize profiles.current_semester from long format to short format
UPDATE public.profiles
SET current_semester = CASE
  WHEN current_semester = '2025-1' THEN 'F25'
  WHEN current_semester = '2025-2' THEN 'S25'
  WHEN current_semester = '2026-1' THEN 'F26'
  WHEN current_semester = '2026-2' THEN 'S26'
  WHEN current_semester ~ '^\d{4}-\d$' THEN
    -- Generic fallback for any other long-format values
    'F' || right(current_semester, 2)
  ELSE current_semester
END
WHERE current_semester IS NOT NULL
  AND current_semester ~ '^\d{4}-[12]$';

-- Normalize extracted_courses.semester_code
UPDATE public.extracted_courses
SET semester_code = CASE
  WHEN semester_code = '2025-1' THEN 'F25'
  WHEN semester_code = '2025-2' THEN 'S25'
  WHEN semester_code = '2026-1' THEN 'F26'
  WHEN semester_code = '2026-2' THEN 'S26'
  ELSE semester_code
END
WHERE semester_code IS NOT NULL
  AND semester_code ~ '^\d{4}-[12]$';

-- Normalize discovered_courses.semester_code
UPDATE public.discovered_courses
SET semester_code = CASE
  WHEN semester_code = '2025-1' THEN 'F25'
  WHEN semester_code = '2025-2' THEN 'S25'
  WHEN semester_code = '2026-1' THEN 'F26'
  WHEN semester_code = '2026-2' THEN 'S26'
  ELSE semester_code
END
WHERE semester_code IS NOT NULL
  AND semester_code ~ '^\d{4}-[12]$';
```

### 4. Groups Table: Add Semester + Archive Fields
New migration file (e.g., `20260717000000_add_semester_archive_to_groups.sql`):

```sql
-- Add semester_code and is_archived to groups
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS semester_code text NOT NULL DEFAULT 'S25',
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Backfill semester_code from creator's profile
UPDATE public.groups g
SET semester_code = COALESCE(
  (SELECT p.current_semester FROM public.profiles p WHERE p.id = g.creator_id),
  'S25'
)
WHERE g.semester_code = 'S25'; -- only backfill default values

-- Indexes
CREATE INDEX IF NOT EXISTS idx_groups_semester_code ON public.groups(semester_code);
CREATE INDEX IF NOT EXISTS idx_groups_is_archived ON public.groups(is_archived);

-- RLS policy: allow anyone to view non-archived groups
CREATE POLICY "groups_select_non_archived"
  ON public.groups
  FOR select
  USING (is_archived = false);

-- RLS policy: allow creator to view their own archived groups
CREATE POLICY "groups_select_own_archived"
  ON public.groups
  FOR select
  USING (auth.uid() = creator_id AND is_archived = true);

-- RLS policy: allow group members to view archived groups they belong to
CREATE POLICY "groups_select_member_archived"
  ON public.groups
  FOR select
  USING (
    is_archived = true
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );
```

**Note:** The existing `groups_select_all` policy (`USING (true)`) must be **dropped** because it would override the new policies. The three new policies together cover: public browse (non-archived), creator viewing own archived, members viewing archived groups they belong to.

### 5. Update `StudyGroup` Type
File: `src/features/study-groups/src/types/index.ts`

Add to `StudyGroup` interface:
```ts
export interface StudyGroup {
  id: string;
  name: string;
  course_name: string;
  course_code: string;
  class_number?: string;
  doctor_name?: string;
  major: string;
  max_members: number;
  current_members: number;
  whatsapp_link: string;
  group_link?: string;
  is_full?: boolean;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at?: string;
  semester_code: string;
  is_archived: boolean;
  _creatorFullName?: string;
  _creatorUsername?: string;
}
```

### 6. Update `getAllWithCreators` (Public Browse)
File: `src/features/study-groups/services/studyGroup.supabase.ts`

Change select to include new fields and filter archived:
```ts
const { data, error } = await client
  .from('groups')
  .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at, semester_code, is_archived')
  .eq('is_archived', false)
  .order('created_at', { ascending: false });
```

### 7. Update `getMyGroups` (Creator + Member View)
File: `src/features/study-groups/services/studyGroup.supabase.ts`

Change both queries to include `semester_code, is_archived` and **do not** filter by `is_archived`:

```ts
// Created groups query
client
  .from('groups')
  .select('id, name, course_name, course_code, class_number, doctor_name, major, max_members, current_members, whatsapp_link, group_link, is_full, creator_id, creator_name, created_at, semester_code, is_archived')
  .eq('creator_id', userId)
  .order('created_at', { ascending: false })

// Joined groups query (same select)
```

### 8. Update `createGroup` Service
File: `src/features/study-groups/services/studyGroup.supabase.ts`

After getting `creator_id`, fetch the profile's `current_semester` and include it in the insert:

```ts
export async function createGroup(groupData: {
  // ... existing fields
  creator_id: string;
  creator_name: string;
}): Promise<ServiceResult<StudyGroup>> {
  const client = await getSupabase();

  // Fetch creator's current semester
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('current_semester')
    .eq('id', groupData.creator_id)
    .single();

  const semesterCode = profile?.current_semester ?? 'S25';

  const { data, error } = await client
    .from('groups')
    .insert({
      ...groupData,
      current_members: 1,
      is_full: false,
      semester_code: semesterCode,
      is_archived: false,
    })
    .select()
    .single();

  // ... rest unchanged
}
```

### 9. Admin "Confirm Next Semester" Service
New file: `src/features/admin/services/adminSemesterTransition.supabase.ts`

```ts
export async function confirmSemesterTransition(
  callerRole: string,
  callerId: string,
  nextSemester: string,
): Promise<ServiceResult<{ oldSemester: string; updatedCount: number; archivedCount: number }>> {
  // 1. Guard: admin role
  // 2. Guard: hasSupabaseEnv
  // 3. Fetch current system semester (e.g., from profiles or getCurrentSemesterCode())
  // 4. If nextSemester === oldSemester, return no-op
  // 5. Update ALL profiles.current_semester to nextSemester
  // 6. Archive all groups where semester_code = oldSemester (set is_archived = true)
  // 7. Log to admin_audit_log
  // 8. Broadcast notification via broadcastToAllUsers
  // 9. Return counts
}
```

### 10. Admin "Semester" Tab in AdminLayout
File: `src/pages/Admin/AdminLayout.tsx`

Add new tab:
```ts
import { CalendarDays } from 'lucide-react';

type Tab = 'users' | 'extractions' | 'reports' | 'verification' | 'notifications' | 'reviews' | 'analytics' | 'semester';

const tabs = [
  // ... existing tabs
  { id: 'semester', label: 'الفصل الدراسي', icon: CalendarDays, path: '/admin/semester' },
];
```

New page component: `src/pages/Admin/SemesterTransitionPage.tsx`

UI:
- Show current semester (read-only, fetched from `getCurrentSemesterCode()` or profile)
- Dropdown with valid next semesters (S25, F25, S26, F26 — filtered to only future/valid options)
- "تأكيد الانتقال للفصل التالي" button with confirmation dialog
- Loading state during transition
- Success/error toast

### 11. Update `MyGroupsPage` UI
File: `src/features/study-groups/src/pages/MyGroupsPage.tsx`

Split groups into:
- **Active** (`is_archived === false`): shown under "المجموعات النشطة"
- **Archived** (`is_archived === true`): shown under "المجموعات المؤرشفة" with badge showing semester label

Each archived group card shows a badge: `"تمت الأرشفة - {semesterLabel}"` using `convertSemesterCodeToLabel(group.semester_code)`.

Creator actions on archived groups: reactivate (set `is_archived = false`) or delete.
Non-creator members: view only (no join/leave actions).

### 12. Update `StudyGroupsHome` UI
File: `src/features/study-groups/src/pages/StudyGroupsHome.tsx`

The `getAllWithCreators` service now filters `is_archived = false` at the DB level, so no UI change needed here. However, verify that the hook (`useStudyGroups`) doesn't re-introduce archived groups.

### 13. Update `GroupCard` for Archived State
File: `src/features/study-groups/components/GroupCard.tsx`

If `group.is_archived` is true, show an archived badge overlay or muted styling:
- Badge: "تمت الأرشفة - {semesterLabel}"
- Muted opacity or grayscale filter

## Implementation Order

1. **Fix `semesterUtils.ts`** — correct `getCurrentSemesterCode()` academic year logic
2. **Migration: normalize existing semester data** — `profiles`, `extracted_courses`, `discovered_courses`
3. **Migration: add `semester_code` + `is_archived` to groups** — with backfill + RLS policies + drop old `groups_select_all`
4. **Update `StudyGroup` type** — add `semester_code`, `is_archived`, `is_full`, `updated_at`
5. **Update `getAllWithCreators`** — select new fields, filter `is_archived = false`
6. **Update `getMyGroups`** — select new fields, no archive filter
7. **Update `createGroup`** — fetch profile semester, set `semester_code` and `is_archived`
8. **Add admin semester transition service** — `adminSemesterTransition.supabase.ts`
9. **Add admin semester page + tab** — `SemesterTransitionPage.tsx` + `AdminLayout.tsx` update
10. **Update `MyGroupsPage` UI** — split active/archived, add badges, reactivate action
11. **Update `GroupCard`** — archived badge and muted styling

## Edge Cases

- **Existing groups without semester_code**: backfilled from creator profile during migration; groups with no creator profile get `S25` default
- **User has no profile.current_semester**: `createGroup` falls back to `'S25'`; transition service updates all profiles, so this only affects edge cases
- **Admin transitions twice in same day**: service checks `nextSemester !== currentSemester` and returns no-op
- **Reactivating an archived group**: set `is_archived = false`, keep same `semester_code` (creator decides if they want to update it via edit)
- **Joining an archived group**: not possible — hidden from browse by RLS policy
- **Member viewing archived group**: allowed via `groups_select_member_archived` RLS policy
- **Creator viewing archived group**: allowed via `groups_select_own_archived` RLS policy
- **Non-member viewing archived group**: denied by RLS

## Validation Steps

1. Run `npm run lint` after all changes
2. Run `npm run typecheck` to verify TypeScript
3. Run existing tests: `npm run test`
4. Verify migration applies cleanly: check `profiles.current_semester` values are short format
5. Verify `getCurrentSemesterCode()` returns correct values for Jan-Jul and Aug-Dec
6. Verify `StudyGroupsHome` doesn't show archived groups
7. Verify `MyGroups` shows both active and archived with correct badges
8. Verify admin transition button updates all profiles and archives old groups
9. Verify broadcast notification is sent after transition

## Out of Scope
- Automatic semester transition based on date (admin-only manual confirmation)
- Deleting archived groups (archive only, no auto-delete)
- Migrating `group_members` data (unchanged)
