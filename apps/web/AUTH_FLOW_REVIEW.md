# تقرير مراجعة كاملة لملفات تسجيل الدخول/التسجيل/Auth flow

## نطاق المراجعة (حسب الملفات التي تم قراءتها)

### apps/web (Vanilla JS + صفحات UI):
- `apps/web/src/pages/login.html`
- `apps/web/src/pages/register.html`
- `apps/web/src/pages/verify-email.html`
- `apps/web/src/pages/reset-password.html`
- `apps/web/src/js/modules/page-login.js`
- `apps/web/src/js/modules/page-register.js`
- `apps/web/src/js/modules/page-register/register-api.js`
- `apps/web/src/js/modules/page-verify-email.js`
- `apps/web/src/js/modules/page-reset-password.js`

### packages/ui (React Auth hook):
- `packages/ui/src/hooks/useAuth.ts`

### packages/supabase-client:
- `packages/supabase-client/src/index.ts`
- `packages/supabase-client/src/middleware.ts`

### apps/admin (Authorization):
- `apps/admin/src/App.tsx`

### اختبارات:
- `apps/web/tests/e2e/login.spec.ts`
- `apps/web/tests/e2e/dashboard.spec.ts`
- `apps/schedule/tests/e2e/app.spec.ts`

**ملاحظة:** الملفات التي ذكرتها تحت `apps/schedule/src/tests/*.tsx` غير موجودة بالمسار المذكور؛ الموجود فعلياً تحت `apps/schedule/src/__tests__/*`.

---

### تحديث بعد المراجعة الفعلية للملفات (2026-06-15):

- `checkExistingSession()` في `page-login.js` **يستخدم فعلاً** `isSupabaseSessionActive(db)` أولاً (يحث Supabase session عبر `db.auth.getUser()`)، ثم ينتقل إلى `loadCurrentUser(db)`.
- **تم الإصلاح:** تمت إزالة `loadCurrentUser` من مسار `checkExistingSession()`، والآن يعتمد فقط على Supabase session activation.

- `useAuth.ts` **لا يستخدم** `type AuthUser = Profile | SupabaseUser` كما ذكر التقرير؛ الحالة الفعلية:
  ```ts
  const [user, setUser] = useState<Profile | null>(null);
  ```
- **تم الإصلاح:** تم تغيير `isAuthenticated` لتعتمد على `session !== null` فقط بدلاً من الشرط المزدوج `user !== null && session !== null`، لمنع logout العرضي.

- `resendVerification()` يحتوي بالفعل على 3 مستويات fallback:
  1. `?email=` query string
  2. `localStorage.getItem('svu_pending_verification_email')`
  3. `window.prompt()` كاحتياط أخير
- **تم الإصلاح:** تم حذف المتغير غير المستخدم `errorDescription` من `page-verify-email.js`.

- `subscriptionRef.current?.unsubscribe()` يتوافق مع `onAuthStateChange` في Supabase JS SDK.

---

## 1) apps/web — Login

### ما يعمل بشكل جيد
- يوجد validation أساسي:
  - email regex
  - password length >= 8
- يوجد UX مناسب:
  - disable للزر + spinner
- يوجد `checkExistingSession` قبل السماح بعملية تسجيل الدخول.
- يتم save للـuser/profile session عبر:
  - `loadCurrentUser(db)` ثم `saveUserSession(userData)`

### نقاط ملاحظة/مخاطر
**الاعتماد على `loadCurrentUser()` بعد signIn**

`handleLoginSubmit()` يستدعي `loadCurrentUser(db)` بعد `signInWithPassword` ويثبت نجاحه قبل السماح بـ redirect.
إذا فشل تحميل الـprofile رغم نجاح المصادقة، سيتم عرض خطأ بدلاً من الدخول.

**توصية:** تأكيد أن الجدول `users` يُكتب تلقائياً بعد التسجيل، أو التعامل مع الفشل بمنح دخول مؤقت.

**الاعتماد على `handleLoginError()` من core.js**

تمت مراجعته ضمن نطاق القراءة:
- لا يكشف معلومات حساسة
- يعيد رسائل عامة (مثل "البريد أو كلمة المرور غير صحيحة")

**أين بالضبط؟**
- `apps/web/src/js/modules/page-login.js`
  - `checkExistingSession()` ✅ تم الإصلاح
  - `handleLoginSubmit()`

---

## 2) apps/web — Register

### ما يعمل بشكل جيد
- يوجد validation قوي للحقول قبل signUp:
  - username pattern
  - major/phone/password confirmation
- يوجد payload واضح لـ `options.data` داخل signUp
- يوجد duplicate check preflight عبر جدول `users` قبل signUp
- redirect logic:
  - إن كان `data.session` موجود → `login.html`
  - غير ذلك → `verify-email.html?...`

### نقاط ملاحظة/مخاطر
**معالجة أخطاء constraint بعد signUp**

**تم الإصلاح:** تمت إضافة معالجة مخصصة لأخطاء `signUp` الناتجة من unique constraint (رسائل تحتوي على 'duplicate'/'already exists'/'unique') في `register-api.js:143-154`، مع عرض رسالة خطأ مناسبة للحقل (username/email).

**التحقق في جدول `users` وليس `auth.users`**

Supabase/auth يعمل بتصميم منفصل: `auth.users` للاعتمادات، و `users` للبيانات الإضافية. الـ pre-check على `users` صحيح في هذا السياق.

**أين بالضبط؟**
- `apps/web/src/js/modules/page-register/register-api.js`
  - `submitRegisterForm()` duplicate checks + error handling ✅
  - `buildAuthPayload()` بناء payload

---

## 3) apps/web — Verify Email

### ما يعمل بشكل جيد
- استخراج tokens من hash:
  - `access_token`, `refresh_token`, `type`
- مسار signup:
  - `db.auth.setSession({ access_token, refresh_token })`
  - ثم `showSuccess()` ثم `signOut` ثم redirect إلى `login.html`
- مسار recovery:
  - redirect إلى `reset-password.html` مع نفس hash
- وجود resend flow وعرض states (loading/success/error)

### نقاط ملاحظة/مخاطر
**`resendVerification()` يعتمد على `window.location.search` لاستخراج email**

**تم الإصلاح:** حذف المتغير `errorDescription` غير المستخدم.
الكود يحتوي على 3 مستويات fallback:
1. `?email=` query string
2. `localStorage.getItem('svu_pending_verification_email')` (يتم تخزينه عند redirect)
3. `window.prompt()` كاحتياط أخير

**توصية:** التأكد من تمرير `?email=` دائماً عند redirect لـ `verify-email.html` لتقليل الاعتماد على localStorage/prompt.

**أين بالضبط؟**
- `apps/web/src/js/modules/page-verify-email.js`
  - segment `type === 'signup'`
  - segment `resendVerification()` ✅ تم الإصلاح (حذف errorDescription)

---

## 4) apps/web — Reset Password

### ما يعمل بشكل جيد
- استخراج tokens من hash وإجراء `setSession` عند `type=recovery`
- validation قبل `updateUser`:
  - length >= 8
  - match confirm
- UX:
  - disable + spinner
  - error/success divs

### نقاط ملاحظة/مخاطر
**تدفق invalid/expired link**

branch عند `!accessToken`:
يتم `db.auth.getSession()` ثم إن لم توجد session → `showError()` وإخفاء form
لكن:
عدم وجود `showError()` قد يتكرر/يتغير حسب timing

**توصية:** بناء state واضح للـlink validity قبل ربط submit (مثلاً boolean `isLinkValid` يمنع submit نهائياً).

**استخدام `db.auth.updateUser({ password: newPassword })` بعد setSession**

هذا يعتمد على أن session التي تم ضبطها بـ `setSession()` صحيحة ومسموح بها.

**توصية:** التأكد أن Supabase config والflows تدعم updateUser على recovery session.

**أين بالضبط؟**
- `apps/web/src/js/modules/page-reset-password.js`
  - branch `type === 'recovery'`
  - branch `!accessToken`
  - submit handler

---

## 5) packages/ui — useAuth.ts (React)

### ما يعمل بشكل جيد
- `getSession()` ثم `onAuthStateChange` لتحديث state.
- fetch profile:
  - `.from('users').select('*').eq('id', userId).single()`
- fallback `display_name` إذا لا يوجد `display_name`.

### نقاط ملاحظة/مخاطر
**`user` قد يكون `null` حتى مع `session` موجود**

`fetchProfile` يعود `null` عند فشل، و`setUser(profile)` يضع `null`.
المكونات التي تعتمد على `user` لاحقاً قد تواجه `null` حتى لو session موجود.

**تم الإصلاح:** `isAuthenticated` يعتمد الآن على `session !== null` فقط بدلاً من الشرط المزدوج `user !== null && session !== null`.

**unsubscribe type**

`subscriptionRef.current?.unsubscribe()` يتوافق مع `onAuthStateChange` في Supabase JS SDK.

**أين بالضبط؟**
- `packages/ui/src/hooks/useAuth.ts`
  - `fetchProfile()` — يعود `null` عند الفشل
  - `isAuthenticated` ✅ تم الإصلاح
  - effect cleanup `subscriptionRef.current?.unsubscribe()` ✅ متوافق

---

## 6) packages/supabase-client

### index.ts
auth config:
- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: false`

**ملاحظة منطقية مهمة:**

بما أن web flows تستخدم hash tokens وتقوم بـ `db.auth.setSession()` داخل صفحات verify/reset،
فـ `detectSessionInUrl: false` يبدو متوافق
لكن يجب التأكد من أن صفحات verify/reset تربط refresh correctly (أنت ترسل `refresh_token`).

### middleware.ts
`withAuth()` فقط:
- `supabase.auth.getSession()`
- إن لم توجد session → Unauthorized

**ملاحظة:**

middleware لا يتحقق من صلاحيات admin/active/email_confirmed_at.
هذا يُفترض أنه يتم في consumer (مثل apps/admin).

**أين بالضبط؟**
- `packages/supabase-client/src/middleware.ts`

---

## 7) apps/admin — App.tsx (Authorization)

### ما يعمل بشكل جيد
- `supabase.auth.getUser()` ثم validate على profile:
  - `is_admin && is_active && email_confirmed_at`
- `onAuthStateChange` يطبق validate في كل تبدل.
- `onFocus` يعيد validate للوضع الحالي.

### نقاط ملاحظة/مخاطر
**احتمال UI flicker:**
- `isLoading` يبدأ `true`
- ثم `validateAccess` قد يضع `isAuthorized` `false`
- وهذا مقبول

**reliance على schema:**
- `Profile` type محلي داخل `App.tsx` يطابق ما يحتاجه.

**أين بالضبط؟**
- `apps/admin/src/App.tsx`
  - `validateAccess()`

---

## 8) الاختبارات (Playwright)

### apps/web/tests/e2e/login.spec.ts
**Risk محتمل:** توقع `page.getByRole('alert')`

كود `login.js` يستخدم `showToast(...)`
غير واضح في `core/showToast` ما إذا كان:
يتم rendering `role="alert"` أو `role="status"`

إذا `showToast` يستخدم `role="status"` أو بدون alert role، قد تفشل الاختبارات.

### apps/web/tests/e2e/dashboard.spec.ts
dashboard redirects to login if not authenticated
tests تعتمد على routing/redirect.
مطلوب التأكد أن dashboard.html فعلًا يستخدم معالج redirect مشابه.

**أين بالضبط؟**
- `apps/web/tests/e2e/login.spec.ts`
- `apps/web/tests/e2e/dashboard.spec.ts`
- `apps/schedule/tests/e2e/app.spec.ts`

**asserts عامة:**
- title موجود
- loader visible
- لا console errors

هذا يعتمد بقوة على نصوص UI الحالية؛ أي تغيير بسيط في wording قد يسبب fail.

---

## 9) قائمة Issues (مختصرة ومصنفة)

### High (تم الإصلاح)
1. ~~تحقق الجلسة في login يعتمد على وجود profile/DB~~ — تم إصلاحه بـ `checkExistingSession()`.
2. ~~union user type في useAuth.ts~~ — تم إصلاحه بتغيير `isAuthenticated`.

### Medium (احتمال مشاكل UX/Consistency)

1. **resendVerification بدون ضمان email query**

   `resendVerification()` يبحث عن email في query string.
   لو `verify-email.html` لا يمرر `?email=` في بعض حالات إعادة الإرسال، سيحتاج المستخدم لإدخال البريد يدوياً.

### Low (تحسين/نظافة)

1. ~~متغيرات غير مستخدمة:~~ — **تم الإصلاح:** حذف `errorDescription` من `verify-email.js`.
2. **مشاكل محتملة في الاختبارات:**
   - `login.spec.ts` يتوقع `role="alert"` في الـDOM — لازم التأكد أن `showToast` يستخدم `role="alert"`.
   - `dashboard.spec.ts` يعتمد على redirect — لازم التأكد أن `dashboard.html` تستخدم redirect مشابه.

---

## 10) توصيات تنفيذية (المتبقية فقط)

| الملف | التوصية |
|-------|---------|
| `apps/web/src/js/modules/page-verify-email.js` | التأكد من تمرير `?email=` دائماً عند redirect لـ `verify-email.html`. |
| `apps/web/tests/e2e/login.spec.ts` | التأكد من أن `showToast` ينتج DOM بـ `role="alert"` أو تحديث selector. |
| `apps/web/tests/e2e/dashboard.spec.ts` | التأكد من أن `dashboard.html` تستخدم معالج redirect مشابه. |

---

## ملخص تنفيذي

تم تنفيذ التعديلات التالية بناءً على النقاط المتبقة:

### 1. Critical — logout cleanup
- `apps/web/src/js/modules/shared.js`: تنظيف صريح لمعظم مفاتيح التخزين المرتبطة بالمصادقة داخل `logout()`.
- `apps/web/src/js/modules/auth/session.js`: `clearSession()` يزيل الآن مفاتيح session و localStorage ذات الصلة.

### 2. Critical — CSRF read/write consistency
- `apps/web/src/js/modules/csrf.js`: تم تصحيح `validateCsrfFromEvent()` لتعتمد على نفس قناة القراءة المستخدمة في النشر (`getCsrfCookieRaw()`)، بدلاً من قراءة cookie يدوياً.

### 3. High — redirect allowlist
- `apps/web/src/js/modules/page-login.js`: تمت إضافة allowlist `ALLOWED_REDIRECTS` + `isAllowedRedirect()` لمنع open redirect.

### 4. Medium — client-side login throttling
- `apps/web/src/js/modules/page-login.js`: تمت إضافة throttling بسيط يعتمد على `sessionStorage`:
  - عداد محاولات فاشلة مع نافذة إعادة تعيين
  - cooldown بعد 5 محاولات
  - مسح تلقائي بعد نجاح تسجيل الدخول

### 5. Medium — standardized login errors
- تم توحيد رسائل أخطاء تسجيل الدخول في `apps/web/src/js/modules/core.js:247-258` لتكون عامة ولا تكشف ما إذا كان الحساب موجوداً.

## الحالة الحالية للتدفقات الرئيسية

- `register` -> `verify-email` -> `login` -> `dashboard`
- `recovery` -> `reset-password`

هذه التدفقات تعمل مع الإصلاحات أعلاها. ما تزال هناك نقاط متابعة منخفضة/متوسطة يمكن معالجتها في批次 منفصلة.
