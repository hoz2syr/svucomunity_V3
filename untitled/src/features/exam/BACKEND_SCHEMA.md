# backend schema plan
# Exam Feature — Backend Integration Plan

> Baseline: current state is localStorage (`svu_tests_db` key).
> Target: Supabase Postgres + REST API via Supabase Edge Functions or direct client calls.

---

## 1. Supabase Schema

### `tests` table

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `title` | `text` | NO | — | Test title |
| `description` | `text` | YES | — | Optional description |
| `created_at` | `timestamptz` | NO | `now()` | Creation timestamp |
| `created_by` | `uuid` | YES | — | FK → `auth.users.id` |
| `settings` | `jsonb` | NO | `{}` | `{"showExplanations": true, "globalTimeLimitMinutes": 30}` |
| `questions` | `jsonb` | NO | `[]` | Array of `Question` objects |
| `published` | `boolean` | NO | `false` | If true, accessible via share link |

**RLS policies:**

- `SELECT`: owner (`created_by = auth.uid()`) OR `published = true`
- `INSERT`: `auth.uid() IS NOT NULL`
- `UPDATE`: owner only
- `DELETE`: owner only

**Indexes:**

```sql
CREATE INDEX idx_tests_created_by ON tests(created_by);
CREATE INDEX idx_tests_published ON tests(published) WHERE published = true;
```

### `test_attempts` table (future — for tracking student results)

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `test_id` | `uuid` | NO | FK → tests.id |
| `student_id` | `uuid` | YES | FK → auth.users.id |
| `score` | `integer` | NO | — |
| `answers` | `jsonb` | NO | `{}` |
| `completed_at` | `timestamptz` | NO | `now()` |

---

## 2. TypeScript Types (shared package)

File: `packages/types/src/exam.ts`

```ts
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  timeLimitSeconds?: number;
}

export interface TestSettings {
  showExplanations: boolean;
  globalTimeLimitMinutes?: number;
}

export interface TestModel {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  settings: TestSettings;
  questions: Question[];
}

export interface TestRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
  settings: TestSettings;
  questions: Question[];
  published: boolean;
}
```

---

## 3. API Routes

### `GET /api/exam/tests`
List tests for current user.

**Query params:** `?published=true` (guest/public view)

**Response:** `TestRow[]`

### `GET /api/exam/tests/:id`
Get single test (owner or published).

**Response:** `TestRow`

### `POST /api/exam/tests`
Create new test.

**Body:** `{ title, description?, settings, questions }`

**Response:** `TestRow` (201)

### `PATCH /api/exam/tests/:id`
Update test title, description, settings, or questions.

**Body:** partial `TestRow`

**Response:** `TestRow`

### `DELETE /api/exam/tests/:id`
Delete test.

**Response:** 204 No Content

### `POST /api/exam/tests/:id/export-pdf`
Trigger PDF export server-side (optional — currently client-side via html2pdf.js).

**Response:** `{ downloadUrl: string }`

---

## 4. Migration Steps

1. Create `tests` table via Supabase SQL editor.
2. Add RLS policies.
3. Replace `localStorage` calls in `src/lib/store.ts` with Supabase client calls.
4. Add `src/lib/api/exam.ts` as thin API wrapper.
5. Update hooks to use new API layer.
6. Backfill existing localStorage tests (one-time migration script).

### One-time migration script (client-side)

```ts
// scripts/migrate-exam-localstorage-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import { getTests } from '@/src/features/exam/src/lib/store';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
  const localTests = getTests();
  for (const test of localTests) {
    await supabase.from('tests').insert({
      ...test,
      created_at: new Date(test.createdAt).toISOString(),
    });
  }
  console.log(`Migrated ${localTests.length} tests`);
}
```

---

## 5. Security Notes

- Never expose `correctAnswer` in public/published responses unless intended.
- PDF/Word export runs client-side; server-side export adds CORS/streaming complexity.
- `questions` JSONB can reach ~500KB for large tests — consider `jsonb` compression or separate `test_questions` table for >100 question tests.
