# Security & Quality Review — Files 11–20

**Review Date:** 2026-06-15
**Scope:** `apps/web/src/js/modules/auth/auth.js`, `shared.js`, `i18n/index.js`, `services/api.js`, `page-login.js`, `page-register/register-api.js`, `page-register/validation.js`, `page-dashboard.js`, `page-courses.js`, `page-home.js`
**Focus:** clean-architecture, clerk-auth, clean-code, senior-frontend, accessibility-compliance, rest-api-best-practices, load-testing-apis, security-best-practices, signup-flow-cro, form-cro

---

## File 11: `apps/web/src/js/modules/auth/auth.js`
**Focus:** clean-architecture, clerk-auth

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Unauthorized error leaks intent** — `throw new Error('Unauthorized')` exposes exact auth-failure semantics to any caller; if this propagates to the UI or logs, it confirms route protection exists before the guard runs. | Throw a generic `Error('Access denied')` or, better, return a sentinel and let the router handle the redirect silently. |
| 2 | **options parameter unvalidated** — `options = {}` is accepted but never validated or typed. Callers can pass `null`/`undefined` or unexpected keys silently. | Add a guard: `options = { redirectTo: '/login.html', ...defaults }` and validate known keys. |
| 3 | **No JSDoc / parameter contract** — consumers have no guidance on what `options` shape or return type to expect. | Add JSDoc with `@param`, `@returns`, and `@throws`. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 4 | **Single-responsibility dilution** — `requireAuth` couples "check auth" with "throw on failure" in one primitive. The guard (`checkAuth`) already exists; this layer re-wraps it without adding value. | Either remove this file and inline `checkAuth` where needed, or extend it with expiry checks, role gates, or audit logging. |
| 5 | **No integration with Clerk** — skill `clerk-auth` is listed but this module has no Clerk-specific patterns (middleware hooks, token refresh, org sync). | If Clerk is the auth provider, replace custom `checkAuth` with Clerk's `auth()` helper and `currentUser()` pattern. |

---

## File 12: `apps/web/src/js/modules/shared.js`
**Focus:** clean-code, senior-frontend

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **`getCountryName` hardcodes `lang = 'ar'`** — Line 294: `const lang = 'ar'` is always Arabic regardless of document language. English users see Arabic country names. | Use `getCurrentLang()` or `document.documentElement.lang` to pick the correct locale. |
| 2 | **`coursesFailed` is a permanent permanent cache poison** — Once `coursesFailed = true` is set (line 64), it stays `true` forever. If `svu_courses.json` is temporarily unavailable (CDN 503), the cache is permanently poisoned for the session. Replace with a timestamped TTL (e.g., retry after 30s). |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 3 | **`timeAgo` is a redundant alias** — Lines 157-159: `timeAgo` calls `formatDate` with the same argument. Two public exports for one function. | Remove `timeAgo` or distinguish them (e.g., `formatDate` for localized date, `timeAgo` for relative time). |
| 4 | **`COUNTRIES` data embedded in logic module** — 286 lines of static data in a "shared utilities" file violates SRP. | Move to `data/countries.js` and import. |
| 5 | **`escapeHtml` used before `textContent`** — Line 101: `content.textContent = safeMessage` — `textContent` already escapes HTML. The `escapeHtml` call is redundant here. | Remove `escapeHtml` on textContent assignments; reserve it for `innerHTML` contexts only. |
| 6 | **`log` object captures `import.meta.env` at definition** — If env changes at runtime (HMR), the log level is stale. | Accept log level as parameter or read env on each call. |
| 7 | **Module exports 20+ functions** — Single barrel export makes tree-shaking unreliable and obscures the module's cohesion boundary. | Split into `courses.js`, `toast.js`, `utils.js`, `i18n-helpers.js`. |
| 8 | **Empty catch blocks** — Lines 59-61, 194-196: silent failures hide real issues (missing JSON, enrichment errors). | Add `log.warn` context inside each catch. |

### 🟢 Low

| # | Issue | Recommendation |
|---|-------|----------------|
| 9 | **`_toastTimers` Map using static key** — Line 113: only one toast timer key (`'toastMsg'`). Multiple rapid toasts will clobber each other's timers. | Use a unique key per toast or sequence IDs. |
| 10 | **`debounce` uses `setTimeout` without `clearTimeout` guard for `null`** — `clearTimeout(timer)` when `timer` is `undefined` is safe in JS, but add `let timer = null` for clarity. |

---

## File 13: `apps/web/src/js/modules/i18n/index.js`
**Focus:** accessibility-compliance, clean-code

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **`INPUT[type="submit"]` gets `placeholder` instead of `value`** — Lines 44-48: `if (el.tagName === 'INPUT') el.placeholder = text` treats ALL inputs equally. Submit buttons lose their visible text when language toggles. | Check `el.type === 'submit'` and use `el.value` (or `textContent`) for buttons; use `placeholder` only for text-like inputs. |
| 2 | **No screen-reader announcement on language change** — When `toggleLang` runs, assistive tech users get no announcement that the page language changed. | Dispatch `document.documentElement.setAttribute('lang', lang)` (already done) AND fire a polite `aria-live` region update or `announce` via an SR-only element. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 3 | **`data-i18n-placeholder` conflicts with `data-i18n` on inputs** — If an input has both attributes, the second loop (line 51) overwrites the first (line 44). | Document precedence: `data-i18n-placeholder` wins, or remove `data-i18n` from inputs entirely. |
| 4 | **`toggleLang` return value is unused and misleading** — Returns `currentLang` (already set) which callers ignore. | Remove return or use it in the caller. |
| 5 | **Missing `data-i18n-value` support** — Hidden inputs or input values that need translation (e.g., country names in selects) have no key. | Add a `data-i18n-value` loop that sets `.value = t(key)`. |
| 6 | **No fallback for missing translation keys** — Line 17: returns the raw key string (e.g., `"homeTitle"`) which surfaces in the UI if a translation is missing. | Add a `t.fallback = '﹝?﹞'` sentinel or log missing keys in debug mode. |
| 7 | **`applyLanguage` selects all `[data-i18n]` on every toggle** — No memoization or dirty-checking; on large pages this re-queries and re-updates the entire DOM. | Scope to the active view/page, or use a `MutationObserver` to track what needs updating. |
| 8 | **Accessibility: `lang` attribute not synced with `dir`** — Line 38-39: `dir` and `lang` are set independently. If a future language has `dir: 'ltr'` but `lang: 'ar'`, screen readers may mispronounce. | Tie `dir` to `lang` via a locale map: `const LOCALES = { ar: 'rtl', en: 'ltr' }`. |

---

## File 14: `apps/web/src/services/api.js`
**Focus:** rest-api-best-practices, load-testing-apis

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **No `Accept` header** — REST best practice: client should signal expected response format. Without `Accept: application/json`, servers may return HTML error pages that fail `res.json()`. | Add `Accept: application/json` to default headers. |
| 2 | **Error responses can leak server internals** — Lines 49-55: `body?.message || body?.error` propagates raw backend error messages to the client (potential stack traces, SQL fragments, internal paths). | Map known error codes to safe user messages; log raw errors server-side only. |
| 3 | **No retry logic** — Single failed request aborts the flow. For transient 5xx or network errors, the user sees a hard failure. | Add exponential-backoff retry (max 2-3 retries) for 5xx and `AbortError` (non-timeout). |
| 4 | **`...opts` spread can override default headers** — `headers: { 'Content-Type': 'application/json', ...opts.headers }` lets callers silently drop `Content-Type`, causing backend 415 errors. | Merge explicitly: only allow callers to append; never replace `Content-Type` for JSON calls. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 5 | **No `credentials` policy** — Line 33: `fetch` defaults to `same-origin`, but if the API is on a different origin/subdomain, cookies/Supabase auth won't attach. | Add `credentials: 'include'` explicitly if the API is cross-origin. |
| 6 | **No HTTP method validation** — Line 34: `...opts` spreads `method`, `body`, etc. without defaults. A `GET` with a `body` triggers a no-op in fetch but indicates a caller bug. | Set `method: 'GET'` by default; throw if body is provided with GET/HEAD. |
| 7 | **No structured error class** — All errors are `Error` objects with string messages. Callers can't distinguish network errors from auth errors from validation errors. | Create `ApiError extends Error { status, code, body }`. |
| 8 | **No request/response logging hook** — For debugging and load-testing metrics, there's no interception point. | Accept an optional `onRequest`/`onResponse` callback in options. |
| 9 | **10s timeout is hardcoded** — For long-polling or file uploads, 10s is too aggressive. | Make timeout configurable per-call (already partially supported via `opts.timeout`) but document defaults. |
| 10 | **No connection pooling** — For load testing, creating a new TCP/TLS handshake per request is expensive. | Note: browsers handle pooling, but document that `fetch` is not suitable for high-throughput scenarios; recommend batching or WebSocket for real-time. |

### 🟢 Low

| # | Issue | Recommendation |
|---|-------|----------------|
| 11 | **`isValidUrl` parses URL twice** — `new URL(path, BASE)` inside `api()` is fine, but `isValidUrl` also parses. | Consolidate into one URL construction with try/catch. |

---

## File 15: `apps/web/src/js/modules/page-login.js`
**Focus:** security-best-practices, signup-flow-cro

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **CSRF imports are unused** — `getCsrfToken` and `getCsrfHeaderName` are imported (line 6) but never applied to the `db.auth.signInWithPassword` call (line 111). Either the imports are dead code or CSRF protection is missing for the login request. | If Supabase client handles CSRF internally, remove the dead imports. If not, add the headers to the auth call. |
| 2 | **Password validation is minimal** — Line 94: only checks `length < 8`. No uppercase, number, or special-char requirements. Allows `aaaaaaaa` as a valid password. | Enforce at least 3 of 4: uppercase, lowercase, digit, special char. |
| 3 | **Email regex allows edge-case invalid formats** — `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` accepts `a..b@example.com`, `a.@example.com`, trailing dots. | Use a more robust regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is okay but trim first and reject consecutive dots. |
| 4 | **No autocomplete attributes** — Login inputs lack `autocomplete="email"` and `autocomplete="current-password"`, breaking browser password-manager integration. | Add autocomplete attributes. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 5 | **Unused `getCsrfToken`/`getCsrfHeaderName`** — Dead imports increase bundle size and confuse auditors. | Remove or wire them up. |
| 6 | **No "Forgot password" link** — Standard signup-flow-cro: users who can't log in have no self-service recovery path. | Add a "Forgot password?" link below the submit button. |
| 7 | **No social/OAuth login options** — If Clerk or Supabase supports OAuth (Google, GitHub), the login page offers only email/password. | Add OAuth buttons; reduces signup-flow friction. |
| 8 | **`passwordVisible` is mutable module state** — If two login forms exist (unlikely but possible), the toggle state is shared globally. | Encapsulate in a class or pass state per form instance. |
| 9 | **Spinner / btnText not null-guarded before `classList.remove`** — Lines 104-105: if spinner/btnText is missing, the `if` guards prevent errors, but the `finally` block (lines 145-146) always runs `spinner?.classList.add` which is safe but redundant. | The current guards are fine; this is minor. |
| 10 | **`rememberMe` value is captured but not used in auth flow** — Line 75: `rememberMe` is read but never passed to `saveUserSession` or the Supabase auth call. | Either use it (extend session) or remove the checkbox. |

---

## File 16: `apps/web/src/js/modules/page-register/register-api.js`
**Focus:** security-best-practices, form-cro

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Phone number builder has a logic bug** — Line 12: `dial.slice(1).length` calculates 2 for `+963`, then slices `digits.slice(2)`. For Syria (`+963`), `localPfx[0] = '9'`), the local number `912345678` (9 digits) becomes: `digits = '912345678'`, `digits.slice(2) = '2345678'` (7 digits), result `+9632345678` (missing the leading `9`). The phone number is **corrupted on submission**. | Fix: use `state.selected.localPfx` to determine how many leading digits to keep, not `dial.slice(1).length`. |
| 2 | **Duplicate-check query interpolates raw user input** — Line 89: `.or(`username.eq.${payload.username},email.eq.${payload.email}`)` — if `payload.username` contains `.` or `'`, Supabase's query builder handles escaping, but this is fragile. | Supabase client uses parameterized queries here (`or` with `.eq.`), so it's likely safe — but add a comment confirming this and validate/escape on the client. |
| 3 | **No CAPTCHA / bot protection** — Registration endpoints are high-value abuse targets. | Add a hidden CAPTCHA field or rate-limit by IP on the backend. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 4 | **Form feedback is toast-only** — Inline validation errors show via toast (top-level notification), not next to the offending field. Users can't see which field failed without re-reading the toast. | Add inline error spans below each field (`<span class="error">…</span>`) AND keep toasts for success. |
| 5 | **No password strength meter** — Users get no visual feedback on password quality before submission. | Add a strength indicator using `calcStrength` from `validation.js`. |
| 6 | **No progressive disclosure for the form** — 6+ required fields shown at once overwhelms users (form-cro anti-pattern). | Group fields into steps: "Account" → "Profile" → "Contact". |
| 7 | **`state._submitting` not reset on early returns** — Lines 52, 63, 71: validation failures return early without resetting `_submitting`. If user fixes one error but another fires, the button stays disabled permanently. | Reset `_submitting = false` before every early `return`. |
| 8 | **No email domain suggestions** — Common typos (`gmial.com`, `yaho.com`) are not caught or suggested. | Add a "Did you mean?" suggestion for common domain typos. |
| 9 | **Success redirect has no `data.session` guard for the `encodeURIComponent`** — Line 125: `payload.email` is used in the URL after `encodeURIComponent`, which is safe, but `data` may not exist if `signUp` returns no data. | Add `data?.session` guard and ensure `payload.email` is sanitized. |

---

## File 17: `apps/web/src/js/modules/page-register/validation.js`
**Focus:** clean-code, security-best-practices

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **`formatFieldError` bypasses i18n system** — Lines 56-62: hardcoded Arabic/English strings instead of calling `i18nT('registerUsernameTaken')` etc. This breaks translation workflow and forces duplicate strings. | Move strings to `translations.js` and use `i18nT`. |
| 2 | **`validatePhone` allows empty string when `country` is `null`** — Line 34: `if (digits.length < (country?.minLen ?? 0))` — with `country = null`, `minLen` is `0`, so `digits.length < 0` is always false, allowing an empty phone to pass if `digits` is non-empty. But if `digits` is empty, it correctly catches. The `?? 0` fallback is too permissive. | Remove `?? 0`; require `country` object to be present and throw if missing. |
| 3 | **`tI18n` and `i18nT` are redundant wrappers** — Lines 7-13: `i18nT` just delegates to `tI18n` with no added logic. | Remove `i18nT` and use `tI18n` directly, or merge into one function. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 4 | **`localizeI18n` uses two different i18n lookup strategies** — Reads from `data-i18n-*` HTML attributes AND `window.i18n.t()`. These are two separate translation systems. | Standardize on one: either the module's `TRANSLATIONS` object (via the main i18n module) OR data attributes, not both. |
| 5 | **Password strength scoring is simplistic** — `calcStrength` (line 64): 4-point scale, no weight for length beyond 8, no dictionary/common-password check. | Add length bonus (e.g., 12+ chars = +1), penalize repeated chars, or integrate zxcvbn. |
| 6 | **`validateUsername` regex rejects valid formats silently** — `/^[a-zA-Z]+_\d{6}$/` only allows exactly one underscore and 6 digits. No error message tells the user *why* it failed (format hint). | Add a descriptive error: "Username must be like `sami_123456`". |
| 7 | **`validateMajor` trims but doesn't validate against known majors** — Any non-empty string passes. | Validate against the majors list from `register-state.js`. |
| 8 | **Constants in module scope without namespace** — `PASSWORD_MIN`, `STR_COLOR`, etc. are exported bare. If another module imports them, they pollute the namespace. | Group into a `PASSWORD_POLICY` object. |

---

## File 18: `apps/web/src/js/modules/page-dashboard.js`
**Focus:** clean-architecture, senior-frontend

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Three sequential DB calls instead of parallel** — Lines 45-79: `loadStats` runs 3 independent queries sequentially. Each waits for the previous. | Use `Promise.all([loadCoursesCount, loadGroupsCount, loadResourcesCount])` to parallelize. |
| 2 | **`authTimeout` starts at module load, not page load** — Line 137: `setTimeout` fires when the JS module is first parsed/imported, not when the DOM is ready. If imported early, the 10s timer can expire before `init()` even runs. | Move `setTimeout` inside `init()` after `DOMContentLoaded` or after the first loading-state check. |
| 3 | **Hardcoded Arabic strings in `showErrorState`** — Lines 21, 24, 29, 40: strings like `'حدث خطأ'`, `'تسجيل الدخول'` bypass i18n entirely. | Use `i18nT('errorGeneric')`, `i18nT('loginLink')` etc. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 4 | **`init` does too much** — Auth checks, UI rendering, DB stats loading, and admin-link toggling are all in one 150-line function. | Split into: `AuthGuard`, `DashboardRenderer`, `StatsLoader`. |
| 5 | **No error differentiation** — All failures (network, auth, 500) show the same generic `'حدث خطأ'`. Users can't tell if they should retry, log in, or contact support. | Add error codes: `'auth_expired'`, `'network_error'`, `'server_error'` with distinct UI messages. |
| 6 | **`setStat` has no formatting or null-safety** — `count ?? '--'` is fine, but `'--'` is ambiguous (could mean "no groups" or "error"). | Use `'N/A'` for errors, `0` for legit zero. |
| 7 | **Admin link visibility is inline DOM manipulation** — Line 120-123: `adminLink.classList.remove('hidden')` — this mixes access control with view logic. | Gate admin UI at the template/component level, not in the controller. |
| 8 | **Global `window.handleLogout`** — Pollutes global namespace; could conflict with other scripts. | Use event delegation or a namespaced `window.SVU = { handleLogout }`. |
| 9 | **No loading skeleton or optimistic UI** — Stats show `'--'` while loading. A skeleton or spinner improves perceived performance. | Add `skeleton` placeholders before data resolves. |

---

## File 19: `apps/web/src/js/modules/page-courses.js`
**Focus:** clean-code, senior-frontend

### 🔴 Critical

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Search input has no debounce** — Line 51: `searchInput.addEventListener('input', render)` fires on every keystroke. For 500+ courses, this triggers 500 DOM rebuilds/sec during typing. | Wrap `render` in `debounce(fn, 300)` from `shared.js`. |

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 2 | **String-concat HTML for course cards** — Lines 40-48: template literals with manual `escapeHtml` are error-prone. A missing escape in a future edit (e.g., adding `c.instructor`) becomes an XSS vector. | Use a lightweight template function or `createElement` builder. |
| 3 | **No loading / empty state affordances** — If `loadSVUCourses` is slow, the user sees a blank grid. If empty, only a text message appears. | Add skeleton cards and a proper empty state with an illustration/icon. |
| 4 | **No error boundary** — `load()` failures are silently caught at line 19 (returns empty object). Users see "no courses" instead of an error state. | Distinguish "empty data" from "load failure" with different UI. |
| 5 | **Semester comparison uses `String()` coercion** — Line 31: `String(c.semester) === semester` — if `c.semester` is `null`, it becomes `'null'` which is a valid but unintended match. | Guard: `c.semester != null && String(c.semester) === semester`. |
| 6 | **No virtualization for large lists** — If courses grow beyond ~200, innerHTML rebuild causes jank. | Implement simple virtual scrolling or batch rendering with `requestAnimationFrame`. |
| 7 | **Course card lacks key metadata** — No category badge, instructor, or enrollment count. Reduces scannability. | Add `category`, `instructor` to card template. |

---

## File 20: `apps/web/src/js/modules/page-home.js`
**Focus:** senior-frontend, clean-code

### 🟡 Medium

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | **Silent error swallowing** — Line 28: `catch (err)` ignores the error and shows a generic message. No `console.error` or `log.warn`. | Add `log.error('[page-home]', err)` before showing fallback. |
| 2 | **Magic number `slice(0, 6)`** — Line 13: hardcoded limit with no configuration or comment. | Extract `const HOME_FEATURED_COUNT = 6` with a comment. |
| 3 | **No loading state** — While `loadSVUCourses` fetches, the `#main-content` container stays static (or empty). No skeleton, no spinner. | Add a loading placeholder before the `await load()`. |
| 4 | **No CTAs or engagement elements** — The hero section only shows a title, tagline, and course list. No "Get Started", "Join Community", or "Explore Courses" buttons. | Add 1-2 primary CTA buttons (per signup-flow-cro / page-cro). |
| 5 | **No personalization** — Ignores logged-in user context (major, name). Shows the same generic view to everyone. | If `isLoggedIn()`, personalize: "Welcome back, [name]" and show the user's major courses first. |
| 6 | **No lazy loading / progressive rendering** — All 6 courses render immediately. If the home page grows, this blocks the main thread. | Use `loading="lazy"` on linked images (if added) and `requestIdleCallback` for non-critical content. |

---

## Cross-Cutting Concerns

### 🔴 Cross-Cutting Critical

| # | Files | Issue | Recommendation |
|---|-------|-------|----------------|
| 1 | 12, 13, 15, 17, 18 | **i18n system fragmentation** — Three different i18n strategies coexist: `window.i18n.t()` (i18n/index.js), `data-i18n-*` HTML attributes (i18n/index.js), `tI18n()` reading `data-i18n-*` attrs (validation.js), and hardcoded strings (dashboard.js, login.js, register-api.js). | Standardize on ONE i18n approach. Recommend: main `i18n` module as the single source; all UI strings go through `t(key)`. |
| 2 | 12, 17 | **Error swallowing everywhere** — 8+ empty `catch {}` blocks across shared.js, validation.js, register-api.js. Real errors vanish. | At minimum: `log.warn('[module] context:', err)`. |
| 3 | 11, 14, 15, 16 | **CSRF token fetched but inconsistently applied** — `getCsrfToken`/`getCsrfHeaderName` imported in login.js, auth.js but never attached to Supabase requests. Either these are needed (and missing) or dead code. | Audit: if Supabase client manages CSRF internally, remove all CSRF utility imports. If not, wire them up. Document the decision. |

### 🟡 Cross-Cutting Medium

| # | Files | Issue | Recommendation |
|---|-------|-------|----------------|
| 4 | 12, 15, 16, 18 | **Hardcoded Arabic strings in JS logic** — Multiple files bypass the i18n module for error messages, labels, and status text. | Extract to `translations.js` and use `t(key)` everywhere. |
| 5 | 11, 14, 18 | **No error-type taxonomy** — All errors are bare `Error('...')`. Callers can't programmatically distinguish network failures from auth errors. | Create `AppError` class with `{ code, status, retryable }` fields. |
| 6 | 18, 19, 20 | **No loading/error/empty state triad** — All three pages treat 3 states with 1-2 UI variants. | Standardize: `loading` → skeleton, `error` → retryable error card, `empty` → illustration + CTA. |
| 7 | 12, 14 | **No request/response metrics** — For load-testing and monitoring, there's zero instrumentation. | Add optional `onRequestStart(url, opts)` / `onResponseEnd(url, res, duration)` callbacks to `api()`. |

---

## Recommended Action Priority

| Priority | Files | Action |
|----------|-------|--------|
| **P0 — Fix immediately** | register-api.js, validation.js, dashboard.js | Fix phone number builder logic bug; fix `getCountryName` hardcoded `'ar'`; parallelize `loadStats`; move `authTimeout` inside `init()`. |
| **P1 — Near-term** | api.js, page-login.js, i18n/index.js | Add `Accept` header + retry logic; fix INPUT submit button placeholder bug; deduplicate `i18nT`/`tI18n`; wire up or remove unused CSRF imports. |
| **P2 — Medium-term** | shared.js, page-courses.js, page-home.js | Split shared.js barrel exports; debounce search input; extract hardcoded strings to i18n; add error logging to all catch blocks. |
| **P3 — Backlog** | auth.js, all files | Standardize i18n into one system; add `AppError` class; add skeletons/loading states; extract magic numbers. |
