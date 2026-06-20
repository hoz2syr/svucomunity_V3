# State & Data Flow

## State types

### Local React state
- auth forms
- dashboard menus
- modals
- landing states
- notification menu state
- guest mode flag (`isGuest`)
- exam feature state (test creation, play, timer)

### React Hook Form
- login
- register
- profile settings
- security settings
- delete account

### GuestContext
- `isGuest` flag persisted in `sessionStorage` under key `svu-guest-mode`
- `enableGuestMode()` / `disableGuestMode()` used by `GuestButton` and `GuestRoute`
- affects which downstream hooks and UI branches render

### Exam Feature State (features/exam)
- `usePromptPreferences` — persisted in `localStorage` under `svu_prompt_settings`
- `useTestCreator` — form state for CreateTest page (file upload, JSON parsing)
- `usePlayTest` — full state machine: fetch, timer, select, reveal, score
- `useSavedTests` — CRUD + export loading states
- `usePromptGenerator` — memoised Arabic prompt string from preferences
- local persistence: `localStorage` under key `svu_tests_db`

### Zustand
- `notificationStore`
- `uiStore`
- موجودتان لكن غير مستخدمتين في production حالياً

### TanStack Query
- `queryClient` موجود
- لا يستخدم فعلياً في جلب البيانات حالياً

## Data flow

```txt
Page
  -> Hook
  -> Service
  -> Supabase
  -> Result
  -> Page state
```

## Auth data flow

```txt
LoginPage / RegisterPage
  -> useAuthForm
  -> auth.service.ts
  -> Supabase
  -> AuthContext
  -> Redirect
```

## Guest data flow

```txt
User enables guest mode
  -> sessionStorage.setItem('svu-guest-mode', 'true')
  -> isGuest = true
  -> GuestRoute renders DashboardPage
  -> useDashboardNotifications short-circuits (no API call)
  -> DashboardHeader hides notifications/account actions
  -> ProfileMenu shows "تسجيل الدخول" prompt
```

## Exam feature data flow

```txt
User on ExamHome
  -> usePromptPreferences (localStorage)
  -> usePromptGenerator (builds Arabic prompt)
  -> user copies prompt → pastes into ChatGPT/Gemini

User on CreateTest
  -> useTestCreator
  -> validates AI JSON
  -> saveTest(newTest) → localStorage (svu_tests_db)

User on SavedTests
  -> useSavedTests
  -> lists all tests from localStorage
  -> play → navigate /exam/play/:id
  -> PDF → exportToPdf(test) (html2pdf.js)
  -> Word → exportToWord(test) (docx)
  -> delete → deleteTest(id) + refetch

User on PlayTest
  -> usePlayTest
  -> fetches test by id (getTestById)
  -> pre-start screen: choose feedback mode
  -> active answering: MCQ / True-False / Essay
  -> timer countdown (if set)
  -> answer reveal + explanation display
  -> results screen with score + full breakdown
```

## Dashboard data flow

```txt
DashboardPage
  -> useDashboardNotifications
    -> if isGuest -> empty state, no Supabase call
    -> else -> notification.service.ts -> Supabase
  -> notifications state
```

## Profile data flow

```txt
SettingsModal (logged-in user only)
  -> ProfileSettingsForm
  -> profile.service.ts
  -> Supabase
  -> result
```

## Account deletion flow

```txt
DashboardPage (logged-in user only)
  -> DeleteAccountModal
  -> account.service.ts
  -> Supabase Edge Function
  -> result
```

## Route guards summary

| Guard | Used in App.tsx | Allows | Blocks |
|---|---|---|---|
| `GuestRoute` | ✅ نعم | logged-in + guest | anonymous without guest mode |
| `ProtectedRoute` | ❌ لا | logged-in only | guest mode |

## ملاحظات

- `features/**/services/index.ts` موجودة لكن لا تزال mostly re-export.
- `src/lib/supabase.ts` يحتوي على دوال legacy.
- `src/services/*` هي الطبقة المفضلة حالياً.
- `stores` (notificationStore, uiStore) غير مستخدمة حالياً.
- `Exam feature` تستخدم localStorage فقط — BACKEND_SCHEMA.md يخطط للتحويل لـ Supabase.
