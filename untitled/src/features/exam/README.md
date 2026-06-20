# exam feature — README

## Overview

`exam` is a self-contained feature for creating, playing, and exporting
multiple-choice / true-false / essay tests inside SVU Community.  
It lives entirely under `src/features/exam/` and exposes its public pages
via the barrel `src/features/exam/index.ts`.

---

## Directory Structure

```
src/features/exam/
├── index.ts                    # Public barrel: Home, CreateTest, PlayTest, SavedTests
├── components/
│   ├── ExamLayout.tsx          # Route layout shell (back button)
│   └── ExamNavbar.tsx          # Feature tab navigation
└── src/
    ├── types.ts                # QuestionType, Question, TestSettings, TestModel
    ├── components/
    │   ├── Skeletons.tsx       # Skeleton, TestCardSkeleton, PlayTestSkeleton
    │   ├── ErrorState.tsx      # Error display with optional retry
    │   └── Loading.tsx         # Full-page spinner
    ├── hooks/
    │   ├── index.ts            # Barrel re-export
    │   ├── usePromptPreferences.ts   # Home page prompt builder state
    │   ├── usePromptGenerator.ts     # Pure Arabic prompt string generator
    │   ├── useCopyToClipboard.ts     # Clipboard abstraction
    │   ├── useTestCreator.ts         # CreateTest form logic + validation
    │   ├── usePlayTest.ts            # PlayTest state machine + timer
    │   └── useSavedTests.ts          # SavedTests CRUD + export actions
    ├── lib/
    │   ├── store.ts            # localStorage CRUD (TODO: replace with Supabase)
    │   ├── export.ts           # PDF (html2pdf.js) and Word (docx) generators
    │   └── utils.ts            # cn() tailwind-merge helper, escapeHtml()
    └── pages/
        ├── Home.tsx            # Prompt builder landing page
        ├── CreateTest.tsx      # JSON upload / paste → test creation form
        ├── PlayTest.tsx        # Active test play view (pre-start / answering / results)
        └── SavedTests.tsx      # Grid list of saved tests with actions
```

---

## Data Flow

```
User → Home page
       ├── Adjusts prompt settings (stored in localStorage 'svu_prompt_settings')
       ├── Copies Arabic prompt → pastes into ChatGPT/Gemini
       └── Clicks "توليد اختبار جديد" → /exam/create

User → CreateTest page
       ├── Pastes AI-generated JSON OR uploads .json file
       ├── Fills title, description, time limit, explanations toggle
       ├── handleCreate validates JSON, normalises structure
       └── saveTest(newTest) → localStorage under 'svu_tests_db'
            → navigates to /exam/saved

User → SavedTests page
       ├── Lists all tests from localStorage
       ├── Play → /exam/play/:id
       ├── PDF → exportToPdf(test)  (html2pdf.js, temporary DOM)
       ├── Word → exportToWord(test) (docx, file-saver)
       └── Delete → deleteTest(id) + refetch

User → PlayTest page
       ├── Fetches test by id (getTestById)
       ├── Pre-start screen: choose feedback mode (immediate vs deferred)
       ├── Active answering: MCQ / True-False / Essay
       ├── Timer countdown (if globalTimeLimitMinutes set)
       ├── Answer reveal + explanation display
       └── Results screen with score + full answer breakdown
```

---

## TestModel (canonical shape)

```ts
interface TestModel {
  id: string;                  // UUID
  title: string;
  description?: string;
  createdAt: number;           // Unix ms
  settings: {
    showExplanations: boolean;
    globalTimeLimitMinutes?: number;
  };
  questions: Question[];
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  text: string;
  options?: string[];          // required for multiple_choice
  correctAnswer?: string;      // 'true'/'false' for TF, matching text for MCQ
  explanation?: string;
  timeLimitSeconds?: number;
}
```

---

## Entry Points

| Route | Component | Source |
|---|---|---|
| `/exam` | `Home` | `src/pages/Home.tsx` |
| `/exam/create` | `CreateTest` | `src/pages/CreateTest.tsx` |
| `/exam/saved` | `SavedTests` | `src/pages/SavedTests.tsx` |
| `/exam/play/:id` | `PlayTest` | `src/pages/PlayTest.tsx` |

---

## LocalStorage Keys

| Key | Owner | Purpose |
|---|---|---|
| `svu_tests_db` | `src/lib/store.ts` | Serialised `TestModel[]` |
| `svu_prompt_settings` | `usePromptPreferences` hook | Prompt builder preferences |

Both are slated for replacement by the Supabase backend (see `BACKEND_SCHEMA.md`).

---

## Export Formats

### PDF
- Uses **html2pdf.js** with A4 portrait, 2x scale, JPEG quality 1.0
- Renders inline RTL HTML with Cairo font, SVG logo header
- Per-question rendering shared via `renderQuestionPdf()` helper

### Word (.docx)
- Uses **docx** (v9) + **file-saver**
- RTL via `bidirectional: true` on every Paragraph
- Header branding on every page ("مجتمع SVU" / "svucommunity.social")

---

## Hooks Reference

| Hook | Responsibility |
|---|---|
| `usePromptPreferences` | Persisted form state for AI prompt builder |
| `usePromptGenerator` | Memoised Arabic prompt string from preferences |
| `useCopyToClipboard` | Clipboard write with fallback + 2s success flash |
| `useTestCreator` | Create test form state, file upload, JSON parsing, validation |
| `usePlayTest` | Full test-play state machine: fetch, timer, select, reveal, score |
| `useSavedTests` | Listing, delete-confirm, PDF/Word export loading states |

---

## Running Tests

```bash
# All tests
npx vitest run

# Exam feature only (33 tests)
npx vitest run tests/features/exam

# With coverage
npx vitest run --coverage
```

---

## Typechecking

```bash
npx tsc --noEmit
```

Zero TypeScript errors in the exam feature as of this refactor.

---

## Backend Migration Checklist

See `BACKEND_SCHEMA.md` for full details. High-level steps:

1. **Create `tests` table** in Supabase with RLS policies.
2. **Replace `store.ts`** with Supabase client CRUD.
3. **Add `src/lib/api/exam.ts`** wrapper (mirrors current `store.ts` API).
4. **Hook updates** — `usePlayTest` and `useSavedTests` call new API layer.
5. **One-time localStorage migration** for existing users.
6. **Optional:** Server-side PDF export via Supabase Edge Function.
