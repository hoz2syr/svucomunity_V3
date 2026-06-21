# Authentication & Session Management — Technical Report
**Project:** SVU Community v3.0.0\_cleantree  
**Date:** 2026-06-21  
**Scope:** Login/Signup flow, session management, profile service, auth callbacks, error handling, Supabase auth config, known issues.

---

## 1. Login / Signup Flow

### Overview
The app uses **Supabase Auth** with two primary providers:
1. **Email / Password** (sign-up + sign-in)
2. **Google OAuth** (sign-in)

There is also a **Guest Mode** that bypasses authentication entirely using encrypted `sessionStorage` (XOR+Base64, not plain text).

### Component Map
| Layer | File | Role |
|---|---|---|
| Page | `src/pages/Login.tsx` | Email/password login form + Google button |
| Page | `src/pages/Register.tsx` | Registration form + Google button |
| Shared UI | `src/components/shared/AuthCard.tsx` | Glass-morphism card wrapping the form |
| Shared UI | `src/components/ui/InputField.tsx` | Labeled input with validation styling |
| Shared UI | `src/components/shared/GuestButton.tsx` | "Continue as guest" button |
| Hook | `src/hooks/useAuthForm.ts` | React Hook Form + Zod resolver wrapper |
| Hook | `src/hooks/useRateLimit.ts` | Client-side rate limiter using `localStorage` |
| Service | `src/services/auth.service.ts` | All auth network calls |
| Context | `src/contexts/AuthContext.tsx` | Global session/profile state |
| Context | `src/contexts/GuestContext.tsx` | Guest mode toggle |
| Guard | `src/components/GuestRoute.tsx` | Allows authenticated OR guest users |
| Guard | `src/components/ProtectedRoute.tsx` | Reserved for future study groups (not wired in `App.tsx`) |

### Exact Steps: User Clicks "Login" → Authenticated

**Email/Password path:**
1. `LoginPage` renders `AuthCard` with `InputField`s for email + password.
2. `useAuthForm({ mode: 'login' })` provides `loginSchema`:
   - `email`: required, valid email, max 255 chars
   - `password`: min **8** chars, max 128 (`src/schemas/auth.schema.ts:6`)
3. On submit, `LoginPage.onSubmit` is called (`src/pages/Login.tsx:18`).
4. It first checks `hasSupabaseEnv()` — if env is missing, sets `serverError` immediately.
5. It checks `rateLimiter.status.blocked` — if blocked, shows Arabic rate-limit message.
6. It calls `auth.handleSubmit()` which runs Zod validation via RHF.
7. If validation passes, it calls `loginWithPassword(values.email, values.password)` (`src/services/auth.service.ts:40`).
8. `loginWithPassword` calls `client.auth.signInWithPassword({ email, password })` (`src/services/auth.service.ts:47`).
9. On success:
   - Rate limiter records success (`recordAttempt(false)`).
   - `navigate('/dashboard')` is called (`src/pages/Login.tsx:49`).
   - **Important:** The page does NOT wait for `AuthContext` to update before navigating; navigation is immediate after the Supabase call resolves.
10. On failure:
    - `rateLimiter.limiter.recordAttempt(true)` is called.
    - `auth.setServerError(error.message || 'فشل تسجيل الدخول...')` is set.
    - Error is displayed by `ServerError` inside `AuthCard`.

**Google OAuth path:**
1. User clicks Google button in `AuthCard`.
2. `handleGoogleSignIn` calls `loginWithGoogle()` (`src/services/auth.service.ts:75`).
3. This calls `signInWithGoogle()` in `src/lib/supabase.ts:102`:
   ```ts
   client.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: `${window.location.origin}/auth/callback` },
   })
   ```
4. The browser is redirected to Google; on success Google redirects back to `/auth/callback`.

**Registration path (Email):**
1. `RegisterPage` uses `registerSchema`:
   - `name`: required, min 2 chars, max 100
   - `email`: required, valid email, max 255
   - `password`: min **8** chars, max 128 (`src/schemas/auth.schema.ts:16`)
2. On submit, `registerWithEmail(name, email, password)` is called (`src/services/auth.service.ts:54`).
3. It calls `client.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: '.../auth/callback' } })`.
4. If successful (no error returned), `RegisterPage` sets `success = true` and shows the confirmation screen (`src/pages/Register.tsx:60-124`).
5. User must click the email confirmation link sent by Supabase; then they land on `/auth/callback`.

---

## 2. Session Management

### Storage Mechanisms
There is **no manual session token storage** in `localStorage` or `sessionStorage`. The project relies entirely on **Supabase's built-in session management**:
- Supabase SDK stores the session in a **`sb-<ref>-auth-token` cookie** (HTTP-only, secure by default in production) and a **`sb-<ref>-refresh-token` cookie**.
- The app does not call `localStorage.setItem('session', ...)` or similar.

### Session Initialization (`src/contexts/AuthContext.tsx`)
```ts
// Lines 53-81
const init = async () => {
  const result = await completeAuthCallback(); // calls handleAuthCallback -> getSession()
  setSession(result.data.session);
  if (result.data.session) {
    await refreshProfileForUser(result.data.session.user.id);
  }
};
```
- `completeAuthCallback` (`src/services/auth.service.ts:104`) delegates to `libHandleAuthCallback` from `src/lib/supabase.ts:122`.
- `handleAuthCallback` calls `getSupabaseClient().auth.getSession()` (`src/lib/supabase.ts:128`), which reads the cookie-based session.

### Session Refresh / Validation
- **`listenAuthChanges`** (`src/services/auth.service.ts:121`): Subscribes to `client.auth.onAuthStateChange`. The callback fires on `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, etc.
  ```ts
  client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  ```
- **AuthContext listener** (`src/contexts/AuthContext.tsx:83-103`): On any auth state change:
  - Sets `session`
  - If `session.user` exists, calls `refreshProfileForUser`
  - Else sets `profile = null`
  - Sets `loading = false`
- **Supabase client auto-refreshes** tokens in the background via its internal `refreshSession` logic; the app code only observes the result through `onAuthStateChange`.

### Guest Mode Persistence
- **`GuestContext`** (`src/contexts/GuestContext.tsx`) stores the flag in `sessionStorage` under key `svu-guest-mode`.
- Guest profile data (`name`, `email`) is stored encrypted (XOR+Base64) in `sessionStorage['svu-guest-profile']` — not plain text.
- `GuestRoute` (`src/components/GuestRoute.tsx`) permits access if `session` exists **OR** `isGuest` is true.
- Guest mode is **per-tab** (sessionStorage is not shared across tabs).

### Persistence Summary Table
| Data | Storage | Location |
|---|---|---|
| Supabase session tokens | `sb-*-auth-token` cookie (Supabase-managed) | Browser cookie jar |
| Guest mode flag | `sessionStorage['svu-guest-mode']` | `src/contexts/GuestContext.tsx:11` |
| Exam tests (legacy) | `localStorage['svu_tests_db']` | `src/features/exam/src/core/storage/localStorageTestStorage.ts` |
| Prompt preferences | `localStorage['svu_prompt_settings']` | `src/features/exam/src/hooks/usePromptPreferences.ts` |
| Login rate limit | `localStorage['login_rate_limit']` | `src/lib/rateLimit.ts`, `src/hooks/useRateLimit.ts` |

---

## 3. Profile Service

**File:** `src/services/profile.service.ts`

### `refreshProfile(userId: string)`
- Calls `client.auth.getUser()` to verify the current user matches `userId` (line 37).
- Queries `public.profiles` with `.select('*').eq('id', userId).maybeSingle()` (line 43-47).
- Uses `.maybeSingle()` to avoid throwing when no row exists (returns `null` data + no error).
- If PostgREST returns `PGRST116` (no rows), it returns `{ data: null, error: null }` (line 50-51).
- **Access control:** It does **not** enforce RLS directly in the query — it relies on Supabase RLS policies (`auth.uid() = id`). If the session is invalid, `getUser()` will return null and the function returns "غير مصرح به." (Unauthorized) at line 40.

### `updateProfile(userId, full_name, username)`
- Verifies user identity via `getUser()` (line 73).
- Calls `.from('profiles').update({ full_name, username }).eq('id', userId)` (line 79-82).
- No RLS bypass; relies on RLS policy.

### `updatePassword(email, currentPassword, newPassword)`
- Verifies `user.email === email` (line 103).
- Calls `signInWithPassword` to verify `currentPassword` (line 107).
- Then calls `client.auth.updateUser({ password: newPassword })` (line 116).

### Profile Creation After Auth
- **Frontend path:** In `handleAuthCallback` (`src/lib/supabase.ts:130-148`), if `email_confirmed_at` is present, it **upserts** the profile.
  - **Bug/Fragility:** If the upsert fails with RLS (error code 42501), the error is returned. In `AuthContext` init (`src/contexts/AuthContext.tsx:64`), `completeAuthCallback` result is **not checked for error** — `setSession(result.data.session)` runs regardless. Only `refreshProfileForUser` is skipped silently on error. This means a user could end up with a valid session but no profile loaded, with no visible error to the user.
- **Backend path:** Database trigger `handle_new_user` in `supabase/migrations/004_auto_profile_trigger.sql` inserts a profile automatically after `auth.users` insert. This is the **sole source of truth** per the project docs (`src/docs/flows/auth-flow.md:157`).

---

## 4. Auth Callback / Handlers

### `/auth/callback` Route
Defined in `src/App.tsx:29`:
```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

### `AuthCallback` Component (`src/pages/AuthCallback.tsx`)
- Renders a simple loading/error screen with a cyan or red message.
- On mount, starts a **30-second timeout** with up to **2 retries** (line 41-50).
- Calls `completeAuthCallback()` (`src/services/auth.service.ts:28`).
- On success: `navigate('/dashboard', { replace: true })` (line 29).
- On error: sets `status = 'error'`, shows error message with retry ("إعادة المحاولة") and home ("العودة لتسجيل الدخول") buttons (line 74-90). No longer auto-redirects.
- On timeout after 3 failed attempts: shows "انتهت المهلة. يرجى المحاولة مرة أخرى." (line 47-49).

### `handleAuthCallback` (`src/lib/supabase.ts:122-155`)
1. Calls `getSupabaseClient().auth.getSession()`.
2. If session exists AND `user.email_confirmed_at` is truthy:
   - Calls `upsertProfile` on `public.profiles`.
   - If upsert fails, returns `{ data, error: { message: profileWriteError.message } }` (line 146).
3. If `email_confirmed_at` is null (e.g., OAuth in progress), skips upsert entirely (tested in `tests/lib/supabase.callback.test.ts:22-61`).

### Google OAuth Redirect
Both email registration and Google login redirect to `/auth/callback`:
- Email signup: `emailRedirectTo: '.../auth/callback'` (`src/services/auth.service.ts:66`)
- Google OAuth: `redirectTo: '.../auth/callback'` (`src/lib/supabase.ts:105`)

### Edge Function (Delete Account Only)
The only Supabase Edge Function in the project is **`delete-account`** (`supabase/functions/delete-account/index.ts`). There is **no auth-specific edge function** for login/signup.

---

## 5. Error Handling in Auth

### UI Error Display
Auth errors are displayed **inline** inside `AuthCard` via the `ServerError` component (`src/components/ui/ServerError.tsx`).
- It is an animated red banner (`bg-red-500/10 border border-red-500/30`) with an `AlertCircle` icon.
- It appears with `AnimatePresence` (motion) and slides in/out.
- There is **no global toast/notification system** for auth failures. The `notificationStore` (`src/stores/notificationStore.ts`) exists but is **unused** (confirmed by `src/docs/frontend-checklist.md:76`).

### Error Sources & Messages
| Source | File | Example Message |
|---|---|---|
| Missing Supabase env | `src/services/auth.service.ts:32-33` | "Missing Supabase environment variables..." |
| Rate limit exceeded | `src/pages/Login.tsx:29` | "تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً." |
| Supabase `signInWithPassword` error | `src/pages/Login.tsx:43` | `error.message || 'فشل تسجيل الدخول. تحقق من البيانات.'` |
| Supabase `signUp` error | `src/pages/Register.tsx:36` | `error.message || 'فشل إنشاء الحساب. حاول مرة أخرى.'` |
| AuthCallback failure | `src/pages/AuthCallback.tsx:35` | `result.error.message || 'حدث خطأ أثناء تسجيل الدخول...'` |
| Profile unauthorized | `src/services/profile.service.ts:40` | "غير مصرح به." |

### Rate Limiting
- `useRateLimit` hook (`src/hooks/useRateLimit.ts`) implements a sliding-window counter:
  - Max **5 failed attempts** per **5 minutes**.
  - State persisted in `localStorage` under key `login_rate_limit`.
  - Interval refreshes status every **1 second**.
  - Listens to `storage` events to sync across tabs.
- On the `LoginPage` (`src/pages/Login.tsx:27-31`), the limiter is checked **before** calling the API. If blocked, it shows the Arabic warning and aborts.

### "Refresh Page" / Retry Behavior
- **AuthCallback** has a manual retry via the "إعادة المحاولة" button (`src/pages/AuthCallback.tsx:77-80`) that re-runs the callback.
- The user can also choose to navigate home via the "العودة لتسجيل الدخول" button (line 83-88).
- **LoginPage** retry is implicit — the user can re-submit the form, which triggers rate limiting.
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx:77`) has an "إعادة المحاولة" (Retry) button, but this is for crashed React components, not auth errors.
- There is **no `window.location.reload()`** call anywhere in the auth flow.

---

## 6. Supabase Auth Configuration

### Client Singleton
```ts
// src/lib/supabase.ts:30-38
let _supabase: SupabaseClient | null = null;
export const getSupabaseClient = (): SupabaseClient => {
  const currentEnv = ensureSupabaseEnv();
  if (!_supabase) {
    _supabase = createClient(currentEnv.url, currentEnv.anonKey);
  }
  return _supabase;
};
```
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`src/lib/supabase.ts:14-15`).
- Client is a **lazy singleton** — created once and reused.

### Providers
Only two providers are configured in the application code:
1. **Email** (`signInWithPassword`, `signUp`) — `src/services/auth.service.ts:47,61`
2. **Google** (`signInWithOAuth({ provider: 'google' })`) — `src/lib/supabase.ts:102`

There is **no** magic-link, phone, Apple, GitHub, or other provider wired up in the frontend.

### RLS Policies (`supabase/migrations/001_init_profiles.sql`)
```sql
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
```
- Users can insert their own profile, but RLS on `profiles` means `upsertProfile` during `handleAuthCallback` can fail with **42501** if the session is not fully established or if RLS is misconfigured.

### Auto-Profile Trigger
`supabase/migrations/004_auto_profile_trigger.sql` creates:
```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
This runs **server-side** with `security definer`, so it bypasses RLS and always inserts a profile. This was added because frontend upserts were failing due to RLS.

---

## 7. Known Issues & Fragilities (Remaining)

| # | Status | Issue |
|---|--------|-------|
| 7.1 | FIXED | Password length unified: both login and register require min 8 chars |
| 7.2 | FIXED | RLS error now surfaced in AuthContext `error` state — no longer silent |
| 7.3 | FIXED | AuthCallback now has retry UI (إعادة المحاولة) instead of auto-redirect |
| 7.4 | IMPROVED | AuthCallback timeout increased to 30s with up to 2 retries |
| 7.5 | FIXED | Frontend `upsertProfile` removed; backend trigger handles profile creation |

**Remaining active issues:**

### 7.6 Password Update Flow is Insecure by Design
- `updatePassword` (`src/services/profile.service.ts:107`) calls `signInWithPassword` to verify the current password **before** calling `updateUser`.
- While this works, it logs the user in again (refreshing the session), which may have side effects (clearing other sessions, triggering `onAuthStateChange` listeners).

### 7.7 No CSRF Token Handling in Custom Requests
- The app relies entirely on Supabase's default CSRF protection (via cookies). There is no custom `csrf` header handling for the few manual API calls (e.g., Edge Function invocation in `account.service.ts:71`).

### 7.8 Unused Route Guard
- `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) is implemented but **not wired into `App.tsx`** (`src/App.tsx:26-77`). It awaits the future Study Groups feature. If accidentally used without wiring, it would be dead code.

### 7.9 Unused State Stores
- `notificationStore` and `uiStore` (Zustand) exist in `src/stores/` but are not imported anywhere in the production code. Auth does not leverage them for error display.

### 7.10 Environment Check Duplication
- `hasSupabaseEnv` and `missingSupabaseEnvMessage` are re-exported through `src/services/environment.service.ts` (3 lines), adding an indirection layer without adding value. All services import from either `supabase.ts` or `environment.service.ts` interchangeably.

---

## Appendix: Key File Index

| File | Lines | Description |
|---|---|---|
| `src/services/auth.service.ts` | 1-132 | Login, register, Google OAuth, callback, auth listener |
| `src/lib/supabase.ts` | 1-99 | Supabase client singleton, `signInWithGoogle`, `handleAuthCallback` (no upsert) |
| `src/contexts/AuthContext.tsx` | 1-124 | Global auth state, session init, profile refresh on auth change |
| `src/contexts/GuestContext.tsx` | 1-89 | Guest mode via encrypted `sessionStorage` (XOR+Base64 per-tab) |
| `tests/contexts/GuestContext.test.tsx` | 1-107 | Guest context tests (7 tests, encrypted storage verified) |
| `src/pages/AuthCallback.tsx` | 1-93 | OAuth/email callback handler with timeout & retry |
| `src/schemas/auth.schema.ts` | 1-38 | Zod schemas (login 8-char, register 8-char password) |
| `src/pages/Login.tsx` | 1-135 | Login page with rate limiting |
| `src/pages/Register.tsx` | 1-205 | Register page with email confirmation screen |
| `src/components/ProtectedRoute.tsx` | 1-17 | Auth-only route guard (unused) |
| `src/components/GuestRoute.tsx` | 1-21 | Guest + Auth route guard |
| `src/components/shared/AuthCard.tsx` | 1-159 | Shared auth form container |
| `src/components/ui/ServerError.tsx` | 1-27 | Inline error banner |
| `src/hooks/useAuthForm.ts` | 1-94 | RHF + Zod auth forms |
| `src/hooks/useRateLimit.ts` | 1-113 | Client-side rate limiter |
| `src/services/account.service.ts` | 1-129 | `signOutCurrentUser`, `deleteOwnAccount` (Edge Function) |
| `src/App.tsx` | 1-88 | Route definitions |
| `supabase/migrations/004_auto_profile_trigger.sql` | 1-29 | Auto-profile creation trigger |
| `supabase/migrations/001_init_profiles.sql` | 1-25 | RLS policies for profiles |
| `tests/lib/supabase.callback.test.ts` | 1-104 | Callback unit tests |
| `tests/services/auth.service.test.ts` | 1-88 | Auth service unit tests |
