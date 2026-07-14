# Implementation Plan: Subjects/Sources Feature + Simulator Cloud Sync

## Goal
Add a "Sources" (المصادر) card alongside the existing Simulator (المحاكي) in the Courses tab, with a full subject detail view including references, tests, and groups. Also add cloud sync for simulator progress.

## Architecture

### New Feature: `src/features/subjects/`
```
src/features/subjects/
├── components/
│   ├── SubjectsLayout.tsx        # AppBackground + RTL shell
│   ├── SubjectCard.tsx           # Course card in grid
│   ├── SubjectDetailView.tsx     # Tabbed detail (info | refs | tests | groups)
│   ├── ReferencesList.tsx        # Social references feed
│   ├── AddReferenceModal.tsx     # Add reference form (auth only)
│   └── SubjectTabs.tsx           # Tab navigation
├── src/
│   ├── pages/
│   │   ├── SubjectsHome.tsx      # Grid of all courses from coursesDB
│   │   └── SubjectDetailPage.tsx # Detail for single course_code
│   ├── hooks/
│   │   ├── useSubjects.ts        # List + filter by major
│   │   ├── useSubjectDetail.ts   # Compose refs + tests + groups
│   │   ├── useReferences.ts      # CRUD for subject_references
│   │   └── useUserProgress.ts    # Cloud sync for simulator
│   ├── services/
│   │   ├── subjects.supabase.ts  # Raw queries
│   │   └── subjects.service.ts   # Service layer
│   └── types/
│       └── index.ts              # Subject, SubjectReference
└── index.ts
```

### Data Model

#### New Supabase Tables

**`subject_references`**
- `id` (uuid PK)
- `course_code` (text, indexed)
- `user_id` (uuid FK → profiles)
- `type` (text: 'video' | 'reference' | 'link')
- `title` (text)
- `url` (text)
- `description` (text, nullable)
- `created_at` (timestamptz)

**`user_course_progress`** (simulator cloud sync)
- `user_id` (uuid PK, FK → profiles)
- `course_code` (text PK)
- `status` (text: 'passed' | 'carried')
- `updated_at` (timestamptz)

### Routing

Add to `src/App.tsx`:
- `/dashboard/subjects` → `SubjectsLayout` + `SubjectsHome`
- `/dashboard/subjects/:courseCode` → `SubjectsLayout` + `SubjectDetailPage`

### Navigation Changes

**`CoursesHome.tsx`** (existing simulator page):
- Add a prominent "المصادر" card at the top
- Clicking navigates to `/dashboard/subjects`

**`SubjectsHome.tsx`** (new):
- Grid of all subjects from existing `coursesDB`
- Filter by `profile.major` (auto-selected)
- Card shows: course name, credits, level, icon

**`SubjectDetailPage.tsx`** (new):
- Header with course name + breadcrumb
- 4 tabs:
  1. **معلومات المادة** — `info.over`, `info.doc`, `info.prac`, `info.exam`
  2. **المصادر** — social references list + add button (auth only)
  3. **الاختبارات** — published tests for this course_code
  4. **المجموعات** — study groups for this course_code
- Action buttons:
  - "تصفح الاختبارات" → `/exam/browse?course_code=X`
  - "تصفح المجموعات" → `/dashboard/study-groups?course_code=X`

### Simulator Cloud Sync

**Changes to `src/features/courses/src/hooks/useCourses.ts`:**
- After `saveSemesterData()`, also call `syncProgressToCloud()` if logged in
- On mount, call `loadProgressFromCloud()` if logged in, merge with localStorage
- Cloud wins on conflict

**New service: `src/features/courses/src/services/courses.supabase.ts`**
- `saveProgress(userId, passed[], carried[])` → upsert `user_course_progress`
- `loadProgress(userId)` → fetch all progress rows

### Social References

- Logged-in users can add references via `AddReferenceModal`
- References are public (visible to all)
- Each reference shows: title, type badge, URL, description, creator name, date
- No moderation flow in v1

### Data Reuse

- Reuse `coursesDB` from `coursesData.ts` for subject list + detail info
- Reuse `usePublishedTests` filtering by `course_code` for tests tab
- Reuse `useStudyGroups` filtering by `course_code` for groups tab
- Reuse `AppBackground`, `GlassCard`, `Icon`, `Button` from shared UI

## Supabase Tables & RLS

### `subject_references`
```sql
create table subject_references (
  id uuid default gen_random_uuid() primary key,
  course_code text not null,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('video','reference','link')),
  title text not null,
  url text not null,
  description text,
  created_at timestamptz default now()
);

create index idx_subject_references_course_code on subject_references(course_code);
create index idx_subject_references_user_id on subject_references(user_id);

alter table subject_references enable row level security;

create policy "Anyone can view references"
  on subject_references for select
  using (true);

create policy "Authenticated users can insert references"
  on subject_references for insert
  with check (auth.uid() = user_id);

create policy "Users can update own references"
  on subject_references for update
  using (auth.uid() = user_id);

create policy "Users can delete own references"
  on subject_references for delete
  using (auth.uid() = user_id);
```

### `user_course_progress`
```sql
create table user_course_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  course_code text not null,
  status text not null check (status in ('passed','carried')),
  updated_at timestamptz default now(),
  primary key (user_id, course_code)
);

create index idx_user_course_progress_user_id on user_course_progress(user_id);

alter table user_course_progress enable row level security;

create policy "Users can view own progress"
  on user_course_progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on user_course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_course_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on user_course_progress for delete
  using (auth.uid() = user_id);
```

### Migration Notes
- Place SQL in `supabase/migrations/YYYYMMDDHHMMSS_subjects_feature.sql`
- Run via Supabase CLI or dashboard
- No data migration needed — tables are new

## Cloud Sync Strategy

### State Priority
1. On mount: load from `localStorage` first (instant UI), then fetch from cloud
2. If cloud data exists: merge into local state (cloud replaces local)
3. On `saveSemesterData()`: save to `localStorage` AND cloud (if logged in)
4. If cloud sync fails: log error, keep local state intact (no data loss)

### Guest Users
- No cloud sync attempted
- Continue using localStorage only
- `hasSupabaseEnv()` guards all cloud operations

### Edge Cases
- Offline: local works, syncs when back online (via next successful save)
- Conflict: cloud wins (user's last known state from another device)
- New user (no cloud data): localStorage is source of truth until first save

## Implementation Steps

### Step 1: Supabase Migration
- Create migration file with both table DDL + RLS
- Apply to database
- Verify with Supabase dashboard or CLI

### Step 2: Subjects Feature Core
- `src/features/subjects/src/types/index.ts` — `Subject`, `SubjectReference`
- `src/features/subjects/src/services/subjects.supabase.ts` — raw queries
- `src/features/subjects/src/services/subjects.service.ts` — service layer with `{ data, error }` returns
- `src/features/subjects/src/hooks/useSubjects.ts` — list, filter by major
- `src/features/subjects/src/hooks/useSubjectDetail.ts` — compose refs + tests + groups
- `src/features/subjects/src/hooks/useReferences.ts` — CRUD for references
- `src/features/subjects/src/hooks/useUserProgress.ts` — cloud sync (moved from courses)

### Step 3: Subjects UI
- `src/features/subjects/components/SubjectsLayout.tsx`
- `src/features/subjects/components/SubjectCard.tsx`
- `src/features/subjects/components/SubjectDetailView.tsx`
- `src/features/subjects/components/ReferencesList.tsx`
- `src/features/subjects/components/AddReferenceModal.tsx`
- `src/features/subjects/components/SubjectTabs.tsx`
- `src/features/subjects/src/pages/SubjectsHome.tsx`
- `src/features/subjects/src/pages/SubjectDetailPage.tsx`
- `src/features/subjects/index.ts`

### Step 4: Simulator Cloud Sync
- `src/features/courses/src/services/courses.supabase.ts` — raw queries for `user_course_progress`
- `src/features/courses/src/services/courses.service.ts` — service layer
- Update `src/features/courses/src/hooks/useCourses.ts`:
  - Import `useAuth` from contexts
  - Add `loadCloudProgress()` on mount
  - Add `syncToCloud()` after `saveSemesterData()`

### Step 5: Routing & Navigation
- Update `src/App.tsx`:
  - Add `/dashboard/subjects` and `/dashboard/subjects/:courseCode` routes
  - Lazy-load subjects pages
- Update `src/features/courses/src/pages/CoursesHome.tsx`:
  - Add "المصادر" navigation card

### Step 6: Validation
- `npm run lint`
- `npm run build`
- `npm run test`

## Data Flow

```
SubjectsHome
  └─ useSubjects()
       └─ subjects.service.ts
            └─ imports coursesDB from courses feature
            └─ filters by profile.major

SubjectDetailPage (:courseCode)
  ├─ Header: course data from coursesDB
  ├─ Tab "معلومات": info.over, info.doc, info.prac, info.exam
  ├─ Tab "المصادر":
  │    └─ useReferences(courseCode)
  │         └─ subject_references table (filtered by course_code)
  │         └─ AddReferenceModal (auth only, inserts to same table)
  ├─ Tab "الاختبارات":
  │    └─ usePublishedTests({ courseCode })
  │         └─ TanStack Query filtering by course_code
  └─ Tab "المجموعات":
       └─ useStudyGroups({ course_code: X })
            └─ Supabase query filtering by course_code
```

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cloud sync conflicts with local | Cloud wins, user can reset locally |
| Large `coursesDB` import cycle | Import only types, not full data, in subjects services |
| RLS misconfiguration | Test with multiple user accounts |
| Guest users see auth-only UI | Guard buttons with `session?.user` check |
| No tests for new hooks | Add unit tests for useReferences, useUserProgress |

## Out of Scope
- Reference moderation/approval flow
- Reference voting/liking
- Simulator progress analytics
- Offline-first sync queue
- Reference categories beyond video/reference/link
