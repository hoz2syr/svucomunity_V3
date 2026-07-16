# Phase 1 — Semester Enrollment Persistence

**Date:** 2026-07-15  
**Project:** SVU Community v3.0.0_cleantree  
**Scope:** Persist schedule extraction results to Supabase + enable dashboard/courses tab integration  
**Status:** Planned — awaiting confirmation before execution

---

## 1. Goal

After the user uploads a schedule image and the system extracts courses, persist those courses to a new `user_semester_enrollments` table so they can be displayed:
- On the dashboard as a "Current Semester" card
- In a new "Current Semester" tab in the Courses page
- As a badge/link in the Subjects references page

---

## 2. Input Format (Actual User Data)

The schedule table the user uploads has this structure:

```
| Placement Test | S25 | ITE_BPT_C61_S25 | Nada Hussein Mohanna | t_nmohanna  |
| Electronic Circuits | S25 | ITE_BEC401_C6_S25 | Oumayma Mohiddine Al Hakawati Al Dakkak | t_odakkak  |
| Programming II | S25 | ITE_BPG402_C10_S25 | Jamil Anton Layous | t_jlayous  |
```

Columns: `course_name | semester_code | full_code | instructor_name | instructor_username`

The `full_code` format is: `{MAJOR}_{COURSE_CODE}_C{SECTION}_S{SEMESTER}`  
Example: `ITE_BPG402_C10_S25` → major=ITE, course_code=BPG402, section=C10, semester=S25

---

## 3. Current State Analysis

| Component | Current State |
|---|---|
| `ExtractedCourse` type | Has `code, name, section, instructor, time, major` — **missing `instructor_username`, `semester` as separate field** |
| OCR Parser (`ocrParser.ts`) | Assumes 4-column markdown table — **needs update for 5 columns + `---` separator rows** |
| `useScheduleMatching` | Returns `result, matchedGroups, autoDrafts` — **no persistence, no save function** |
| `ScheduleExtractionPage` | Shows 2-card grid per course — **no save-to-database flow** |
| `profiles` table | Has `major` column — **no semester info** |
| `user_course_progress` table | Tracks `passed`/`carried` only — **no current semester concept** |
| Dashboard | Shows feature cards only — **no current semester display** |
| Courses page | Shows static catalog + progress — **no current semester tab** |

---

## 4. Required Changes — Phase 1

### 4.1 Database Migration

**File:** `supabase/migrations/20260715000000_create_semester_enrollments.sql` (NEW)

```sql
create table public.user_semester_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_label text not null,           -- "2025/2026 - الفصل الثاني"
  semester_code text not null,            -- "S25"
  course_code text not null,              -- "ITE_BPG402_C10_S25"
  course_name text not null,
  section text,                           -- "C10"
  instructor text,
  instructor_username text,               -- "t_jlayous"
  major text,                             -- "ITE"
  matched_group_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index uq_user_semester_course
  on public.user_semester_enrollments (user_id, semester_label, course_code);

alter table public.user_semester_enrollments enable row level security;

create policy "Users view own enrollments"
  on public.user_semester_enrollments for select
  using (auth.uid() = user_id);

create policy "Users insert own enrollments"
  on public.user_semester_enrollments for insert
  with check (auth.uid() = user_id);

create policy "Users update own enrollments"
  on public.user_semester_enrollments for update
  using (auth.uid() = user_id);

create policy "Users delete own enrollments"
  on public.user_semester_enrollments for delete
  using (auth.uid() = user_id);
```

### 4.2 TypeScript Types

**File:** `src/types/database.ts` — ADD:

```ts
export type SemesterEnrollment = {
  id: string;
  user_id: string;
  semester_label: string;
  semester_code: string;
  course_code: string;
  course_name: string;
  section: string | null;
  instructor: string | null;
  instructor_username: string | null;
  major: string | null;
  matched_group_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type SemesterEnrollmentInsert = {
  semester_label: string;
  semester_code: string;
  course_code: string;
  course_name: string;
  section: string | null;
  instructor: string | null;
  instructor_username: string | null;
  major: string | null;
  matched_group_id: string | null;
};

// In Database.Tables:
user_semester_enrollments: {
  Row: SemesterEnrollment;
  Insert: Omit<SemesterEnrollment, 'id' | 'created_at' | 'updated_at'> & { user_id: string };
  Update: Partial<Omit<SemesterEnrollment, 'id' | 'user_id' | 'course_code' | 'created_at' | 'updated_at'>>;
}
```

**File:** `src/features/schedule-extraction/types/index.ts` — UPDATE `ExtractedCourse`:

```ts
export interface ExtractedCourse {
  code: string;              // "ITE_BPG402_C10_S25"
  name: string;              // "Programming II"
  section: string | null;    // "C10"
  instructor: string | null; // "Jamil Anton Layous"
  instructor_username: string | null; // "t_jlayous" ← NEW
  semester: string | null;   // "S25" ← NEW
  major: string | null;      // "ITE" ← NEW
  time: string | null;
}
```

### 4.3 OCR Parser Update

**File:** `src/features/schedule-extraction/services/ocrParser.ts` — UPDATE

Changes needed:
1. Handle 5-column markdown table format
2. Skip `| --- |` separator rows
3. Parse `full_code` (e.g., `ITE_BPG402_C10_S25`) into components:
   - `major` = prefix before first `_`
   - `course_code` = between first `_` and `_C{section}`
   - `section` = after `_C` before next `_`
   - `semester` = after last `_S`
4. Extract `instructor_username` from column 5

### 4.4 Helper Function — `parseCourseCode()`

**File:** `src/features/schedule-extraction/services/ocrParser.ts` — ADD

```ts
export function parseCourseCode(fullCode: string): {
  major: string;
  course_code: string;
  section: string;
  semester: string;
} | null {
  // Pattern: {MAJOR}_{CODE}_C{SECTION}_S{SEMESTER}
  const match = fullCode.match(/^([A-Z]+)_([A-Z]+\d+)_C(\d+)_S(\d+)$/);
  if (!match) return null;
  return {
    major: match[1],
    course_code: match[2],
    section: match[3],
    semester: match[4],
  };
}
```

### 4.5 New Service — `semesterEnrollments.supabase.ts`

**File:** `src/features/schedule-extraction/services/semesterEnrollments.supabase.ts` (NEW)

```ts
export type ServiceResult<T> = { data: T | null; error: Error | null };

export async function saveSemesterEnrollments(
  userId: string,
  semesterLabel: string,
  semesterCode: string,
  courses: ExtractedCourse[],
  bestMatches: Record<string, MatchedGroup>
): Promise<ServiceResult<SemesterEnrollment[]>>

export async function loadCurrentSemester(
  userId: string,
  semesterLabel: string
): Promise<ServiceResult<SemesterEnrollment[]>>

export async function loadAllSemesters(
  userId: string
): Promise<ServiceResult<SemesterEnrollment[]>>

export async function clearSemester(
  userId: string,
  semesterLabel: string
): Promise<ServiceResult<null>>

export async function deleteEnrollment(
  userId: string,
  enrollmentId: string
): Promise<ServiceResult<null>>
```

### 4.6 Hook Update — `useScheduleMatching`

**File:** `src/features/schedule-extraction/hooks/useScheduleMatching.ts` — UPDATE

Add:
```ts
const saveToSemester = useCallback(async (
  semesterLabel: string,
  semesterCode: string
): Promise<ServiceResult<SemesterEnrollment[]>> => {
  if (!session?.user) {
    return { data: null, error: new Error('Not authenticated') };
  }
  
  const bestMatches: Record<string, MatchedGroup> = {};
  for (const groups of Object.values(matchedGroups)) {
    const sorted = groups.slice().sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    if (sorted[0]) {
      bestMatches[sorted[0].course_code.toUpperCase()] = sorted[0];
    }
  }
  
  return saveSemesterEnrollments(
    session.user.id,
    semesterLabel,
    semesterCode,
    result?.courses || [],
    bestMatches
  );
}, [result, matchedGroups, session]);
```

Also add `session` to the hook dependencies (import from `useAuth`).

### 4.7 Page Update — `ScheduleExtractionPage`

**File:** `src/features/schedule-extraction/pages/ScheduleExtractionPage.tsx` — UPDATE

After successful extraction, show a confirmation panel:

```tsx
{result && result.courses.length > 0 && (
  <div className="mt-6 p-5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl">
    <h3 className="text-white font-semibold mb-2">حفظ المواد في الفصل الحالي</h3>
    <p className="text-slate-400 text-sm mb-4">
      الفصل المقترح: <span className="text-[var(--color-primary-400)]">{proposedSemesterLabel}</span>
    </p>
    <div className="flex gap-3">
      <Button onClick={handleSaveSemester} isLoading={isSaving}>
        حفظ الفصل
      </Button>
      <Button variant="ghost" onClick={handleDismissSave}>
        لاحقاً
      </Button>
    </div>
  </div>
)}
```

Add state:
```ts
const [showSavePrompt, setShowSavePrompt] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);
```

Add handler:
```ts
const handleSaveSemester = useCallback(async () => {
  if (!result) return;
  setIsSaving(true);
  setSaveError(null);
  
  const semesterLabel = convertSemesterCodeToLabel(result.courses[0]?.semester || '');
  const semesterCode = result.courses[0]?.semester || '';
  
  const res = await saveToSemester(semesterLabel, semesterCode);
  if (res.error) {
    setSaveError(res.error.message);
  } else {
    setShowSavePrompt(false);
    // Optional: navigate to dashboard with success toast
  }
  setIsSaving(false);
}, [result, saveToSemester]);
```

### 4.8 Semester Code → Label Converter

**File:** `src/features/schedule-extraction/utils/semesterUtils.ts` (NEW)

```ts
export function convertSemesterCodeToLabel(code: string): string {
  // S25 → 2025/2026 - الفصل الثاني
  const match = code.match(/^S(\d{2})$/);
  if (!match) return code;
  
  const yearSuffix = match[1]; // "25"
  const fullYear = 2000 + parseInt(yearSuffix, 10); // 2025
  const nextYear = fullYear + 1; // 2026
  
  // Determine semester half based on current date
  const now = new Date();
  const isSecondHalf = now.getMonth() >= 6; // July onwards = second semester
  
  if (isSecondHalf) {
    return `${fullYear}/${nextYear} - الفصل الثاني`;
  } else {
    return `${fullYear - 1}/${fullYear} - الفصل الثاني`;
  }
}
```

---

## 5. Todo List — Phase 1

### Step 1: Database Migration
- [ ] Create `supabase/migrations/20260715000000_create_semester_enrollments.sql`
- [ ] Define table schema with all required columns
- [ ] Add unique constraint on `(user_id, semester_label, course_code)`
- [ ] Add RLS policies (select, insert, update, delete)
- [ ] Verify migration syntax

### Step 2: TypeScript Types
- [ ] Add `SemesterEnrollment` and `SemesterEnrollmentInsert` to `src/types/database.ts`
- [ ] Add `SemesterEnrollment` table to `Database.Tables`
- [ ] Update `ExtractedCourse` interface in `src/features/schedule-extraction/types/index.ts`:
  - [ ] Add `instructor_username: string | null`
  - [ ] Add `semester: string | null`
  - [ ] Add `major: string | null`

### Step 3: Course Code Parser
- [ ] Create `parseCourseCode()` function in `src/features/schedule-extraction/services/ocrParser.ts`
- [ ] Test parser with sample codes: `ITE_BPG402_C10_S25`, `ITE_BPT_C61_S25`
- [ ] Add fallback for malformed codes (return null, don't crash)

### Step 4: OCR Parser Update
- [ ] Update table parsing logic to handle 5 columns
- [ ] Skip `| --- |` separator rows
- [ ] Map columns: `name | semester | full_code | instructor | instructor_username`
- [ ] Call `parseCourseCode()` for each row
- [ ] Populate `ExtractedCourse` with parsed fields
- [ ] Test with sample markdown table

### Step 5: New Service — `semesterEnrollments.supabase.ts`
- [ ] Create file with `ServiceResult<T>` type
- [ ] Implement `saveSemesterEnrollments()` with upsert logic
- [ ] Implement `loadCurrentSemester()` (filter by user_id + semester_label)
- [ ] Implement `loadAllSemesters()` (all enrollments for user)
- [ ] Implement `clearSemester()` (delete by user_id + semester_label)
- [ ] Implement `deleteEnrollment()` (single enrollment)
- [ ] Add `hasSupabaseEnv()` guard to all functions
- [ ] Add error normalization

### Step 6: Hook Update — `useScheduleMatching`
- [ ] Import `useAuth` to get `session`
- [ ] Add `saveToSemester()` callback
- [ ] Build `bestMatches` map from `matchedGroups`
- [ ] Call `saveSemesterEnrollments` with extracted courses + best matches
- [ ] Return `saveToSemester` in hook return object
- [ ] Update TypeScript types if needed

### Step 7: Utility — `semesterUtils.ts`
- [ ] Create `convertSemesterCodeToLabel()` function
- [ ] Handle `S25` → `2025/2026 - الفصل الثاني` conversion
- [ ] Handle edge cases: invalid format, future semesters

### Step 8: Page Update — `ScheduleExtractionPage`
- [ ] Import new service functions and `saveToSemester`
- [ ] Add `showSavePrompt`, `isSaving`, `saveError` state
- [ ] Add `handleSaveSemester` callback
- [ ] Add confirmation panel after extraction results
- [ ] Wire up save button to `saveToSemester`
- [ ] Handle success (navigate to dashboard with toast)
- [ ] Handle error (show error message)
- [ ] Add "Later" button to dismiss prompt

### Step 9: Verification
- [ ] Run `npm run lint` — ensure no TypeScript/ESLint errors
- [ ] Run `npm run build` — ensure build succeeds
- [ ] Run `npm run test` — ensure existing tests pass
- [ ] Manual test: upload schedule image, verify extraction, verify save to DB
- [ ] Check Supabase table has correct data after save

---

## 6. Out of Scope for Phase 1

- Dashboard `CurrentSemesterCard` component
- Courses tab "Current Semester" integration
- Subjects page badge
- Old semester warnings
- Semester replacement logic
- UI/UX polish

These are Phase 2 and Phase 3 tasks.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OCR fails to parse 5-column table | Medium | High | Add fallback to 4-column parsing; show validation errors |
| `parseCourseCode` fails on unexpected format | Medium | Medium | Return null, keep raw `full_code` in `code` field; don't crash |
| Migration fails on existing DB | Low | High | Test migration on staging first; use `IF NOT EXISTS` guards |
| RLS policies too permissive | Low | High | Review policies; test with different user roles |
| Save succeeds but UI doesn't reflect it | Medium | Medium | Add success toast + reload current semester after save |
| User uploads old schedule | Medium | Low | Phase 2: add warning; Phase 1 just saves as-is |

---

## 8. Verification Criteria

Phase 1 is complete when:
1. Migration runs successfully on Supabase
2. User can upload schedule image and see extracted courses with 5 fields populated
3. User can click "Save Semester" and data appears in `user_semester_enrollments`
4. `npm run lint` passes with 0 errors
5. `npm run build` succeeds
6. Existing tests still pass

---

*Document created: 2026-07-15*  
*Next review: After Step 9 completion*
