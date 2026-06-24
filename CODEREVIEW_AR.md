# مراجعة شاملة للكود: SVU Community v3.0.0_cleantree
*النطاق: واجهة أمامية React 19 + TypeScript 5.8 + Vite 6. النسخة القديمة `ite_comunety/` مستثناة.*

---

## 1. هيكل الملفات

### التخطيط العام
```
src/
  components/
    accessibility/  (SkipLink)
    dashboard/      (FeatureCard, TestsCard, StudyGroupsCard, CourseMaterialsCard, ScheduleExtractionCard, SettingsModal, LogoutModal, DeleteAccountModal, ModalOverlay, ProfileSettingsForm, SecuritySettingsForm, useProfileSettings, useSecuritySettings)
    landing/        (FeaturesSection, HeroAddition, HowItWorksSection, ProblemsSection, SolutionBridge, ComingSoonSection, FinalCTASection, ScrollIndicator, InteractiveMapSimulation)
    layout/         (Header, Footer, Navbar)
    shared/         (AuthCard, GuestButton, ForgotPasswordModal, AuthBackground)
    ui/             (InputField, PrimaryButton, GlassCard, FadeIn, Skeleton, ServerError, AuthButton, Dropdown, Toast)
  contexts/         (AuthContext, GuestContext)
  features/
    exam/            (core/ adapters/ services/ hooks/ components/ pages/ store.test.ts)
    study-groups/    (src/core/services/index.ts, src/services/studyGroup.supabase.ts, src/services/studyGroupsApi.ts, src/hooks/, src/components/, src/pages/)
  hooks/            (useAuthForm, useRateLimit, useParticleCanvas, useReducedMotion, useInView)
  lib/              (supabase.ts, queryClient.ts, rateLimit.ts, examStorage.ts, exam-cleanup.ts)
  pages/            (Home, Login, Register, AuthCallback, NotFound, Dashboard/)
  schemas/          (auth.schema.ts)
  services/         (auth.service.ts, account.service.ts, profile.service.ts, notification.service.ts, environment.service.ts, index.ts)
  stores/           (notificationStore.ts — مهمل, uiStore.ts — مهمل)
  types/            (auth.ts, canvas.ts, notification.ts, profile.ts, supabase.ts, index.ts)
  utils/            (canvasRenderer.ts, animation.ts, validators.ts — مهمل)
  stories/          (Storybook stories)
tests/              (ين mirror بنية src/ مع vitest)
supabase/
  docs/             (ARCHITECTURE.md, POLICIES.md, MIGRATIONS.md, SEED.md, VARIABLES.md, EDGE_FUNCTIONS.md, SCHEMA.md, FIXES.md)
  functions/        (auth-login, auth-register, delete-account, rate-test, study-groups)
  migrations/       (001-005 + migrations أحدث بتاريخ)
  seed/             (profiles.sql, notifications.sql)
```

### المشاكل الهيكلية
- **كود ميت (Dead code)**: `src/stores/notificationStore.ts` و `src/stores/uiStore.ts` مهملين صراحة ولا يوجد لهما مستخدمون في `src/`. يزيدان من مساحة الصيانة.
- **وحدة مهملة محفوظة**: `src/utils/validators.ts` هو إشعار إهمال من 14 سطراً؛ السكيما الحقيقية لـ Zod موجودة في `src/schemas/auth.schema.ts`.
- **نماذج مزدوجة لعميل Supabase**:
  - `src/lib/supabase.ts` يوفر singleton `getSupabaseClient()`.
  - `src/features/study-groups/src/services/studyGroup.supabase.ts` ينشئ عميله الخاص المخزن مؤقتاً عبر `getSupabase()`.
  - هذا ليس خاطئاً جوهراً ولكنه يخلق مسارين لبدء التشغيل ويخاطر بانحراف التحقق من البيئة.
- **عدم اتساق alias المسار**: بعض الملفات تستخدم `@/src/...` (ميزة exam)، بينما البعض الآخر يستخدم مسارات نسبية. هذا يعمل بفضل إعدادات TS ولكنه يقلل من التوحيد.
- **التستات تن mirror ملفات src/ جيداً**، بالرغم من أن بعض مسارات `tests/features/exam/` تشير إلى تداخل داخلي مختلف قليلاً عن `src/features/exam/`.

---

## 2. منطق الواجهة (UI/UX)

### الصفحة الرئيسية والتنقل
- **Home** (`src/pages/Home.tsx`): خلفية لوحة كانفاس جسيمات بحجم كامل الشاشة مع حركة تجميع حروف النص. يستخدم هوك `useParticleCanvas` مع 120 جسيماً وأحرف "SVU Community".
- **أقسام الصفحة الرئيسية**: المشاكل → جسر الحل → الميزات → كيف يعمل → قريباً → CTA النهائي. كلها مغلفة بـ `Suspense` مع `CardSkeleton` كاحتياط.
- **Navbar** (`src/components/layout/Navbar.tsx`): ثابت/ضبابي مع قائمة desktop + mobile، Focus trap، إغلاق بزر Escape، تدرج لوني للعلامة. الروابط تشير إلى `#problems`، `#features`، `#how`.
- **Footer** (`src/components/layout/Footer.tsx`): روابط إلى `/#features`، `/#how`، `/login`.

### الداشبورد
- **EmptyDashboardState** يعرض 4 مكونات `FeatureCard` في شبكة 3 أعمدة.
- **توجيه البطاقات**: `TestsCard` → `/exam`، `StudyGroupsCard` → `/dashboard/study-groups`، `CourseMaterialsCard` → `/dashboard/courses`، `ScheduleExtractionCard` → `/dashboard/schedule`.
- **المشكلة**: مسارات `/dashboard/courses` و `/dashboard/schedule` **غير معرفة** في `src/App.tsx`. النقر على هذه البطاقات ينتقل لمسارات غير موجودة (صفحة فارغة أو 404). صفحة NotFound تعيد التوجيه إلى `/dashboard`، وليس هذه المسارات المعطلة.

### واجهة المصادقة
- **Login/Register**: تستخدم `AuthCard` مع خلفية لوحة كانفاس، زر Google OAuth، نماذج محققة عبر Zod بوساطة هوك `useAuthForm`، حالات تحميل `AuthButton`، و `ForgotPasswordModal`.
- **AuthCallback** (`src/pages/AuthCallback.tsx`): يحتوي على AbortController، مهلة 30 ثانية، حد أقصى 2 إعادة محاولة.
- **GuestButton**: يسمح بالوصول للوضع الضيف إلى `/dashboard`.

### إمكانية الوصول والحركة
- مكون `SkipLink` مستخدم في Home و Dashboard.
- هوك `useReducedMotion` مطبق على `FeatureCard` و `DashboardHeader` و `ModalOverlay` و `Navbar` (ضمنياً عبر CSS).
- حقول الإدخال تحتوي على `aria-invalid`، `aria-describedby`، و species مرتبطة بشكل صحيح.
- النوافذ المنبثقة تحتوي على `role="dialog"`، `aria-modal`، Focus trap، إغلاق بزر Escape، واستعادة التركيز.
- **فجوة**: لا يوجد Skip Link في صفحات Login/Register/AuthCallback.

### تناسق التصميم البصري
- استخدام مكثف لأصناف Tailwind مع قيم لونية مكتوبة بشكل ثابت (`#060a1f`، `rgba(34,211,238,0.4)`، إلخ) بدلاً من CSS custom properties. هذا يجعل التخصيص صعباً.
- `primaryButton.tsx` يستخدم توجيه `"use client"` لكن التطبيق معروض على العميل عبر Vite؛ هذا هو إصدار لا فائدة منه artifact.

### مشاكل واجهة حقيقية
- `Dashboard.tsx` سطر 18: قيمة `getUser()` الاحتياطية للاسم هي `'طالب'`، اسم المستخدم `'student'`، الدور `'طالب'`. هذه قيم افتراضية مختلطة عربي/إنجليزي مرئية للمستخدمين إذا فشل جلب الملف الشخصي.
- `DashboardHeader` يحتوي على حقل بحث لا **يفعل شيئاً** — لا معالج `onChange` مرتبط بأي إجراء تصفية أو تنقل خارج الحالة المحلية.
- `FeatureCard` يترك سابقاً أيقينة سهم LTR `←` في واجهة RTL؛ الأيقونات الاتجاهية قد تبدو غير متسقة.

---

## 3. اكتمال الميزات

### الميزات المنفذة
| الميزة | الحالة | ملاحظات |
|---|---|---|
| مصادقة بريد/كلمة مرور | ✅ | عبر Edge Functions `auth-login` / `auth-register` |
| Google OAuth | ✅ | `signInWithGoogle` يعيد التوجيه إلى `/auth/callback` |
| الوضع الضيف | ✅ | ملف تعريف `sessionStorage` مشفر؛ لا كتابات لـ Supabase |
| عرض/تعديل الملف الشخصي | ✅ | تبويبان Profile + Security في SettingsModal |
| تغيير كلمة المرور | ✅ | يتطلب كلمة المرور الحالية؛ Zod `securitySchema` |
| حذف الحساب | ✅ | Edge Function `delete-account`؛ يتطلب كتابة اسم المستخدم |
| الإشعارات (قراءة) | ✅ | يجلب آخر 20 من Supabase |
| CRUD الامتحانات (محلي) | ✅ | localStorage أولاً مع محولات مزامنة Supabase |
| تصفح الاختبارات المنشورة | ✅ | قراءة عامة على `published=true` |
| تقييم الاختبار | ✅ | حد معدل من جهة العميل + Edge Function `rate-test` |
| مجموعات الدراسة (قاعدة بيانات مباشرة) | ✅ | `studyGroup.supabase.ts` مع CRUD كامل |
| مجموعات الدراسة (واجهة Edge) | ✅ | `studyGroupsApi.ts` مع سطح مماثل |

### ميزات غير مكتملة / معطلة
| الميزة | الحالة | المشكلة |
|---|---|---|
| `/dashboard/courses` | ❌ | المسار غير معرف في `App.tsx` |
| `/dashboard/schedule` | ❌ | المسار غير معرف في `App.tsx` |
| استخراج الجدول (AI) | ⏳ | محاكاة/محاكاة فقط؛ `InteractiveMap.tsx` هو عرض تجريبي |
| مواد الكورس | ⏳ | البطاقة موجودة، لا يوجد backend/pages |
| إشعارات فورية | ❌ | جلب ثابت فقط؛ `notificationStore` انحراف مهمل |
| شريط جانبي/سمة | ❌ | `uiStore` مهمل؛ لا نظام سمة موصل |
| اشتراكات فورية | ❌ | وثيقة البنية تؤكد "لا توجد subscriptions فعلية" |
| تخزين (ملفات/صور) | ❌ | غير مستخدم |
| تكامل Discord (إن وُجد) | ❌ | غير موجود |

---

## 4. أمان السيرفر (Supabase)

### سياسات RLS
- **profiles**: SELECT/UPDATE على `auth.uid() = id`. INSERT أزيل (trigger يتولى التسجيل). DELETE أزيل (Edge Function فقط). تغيير الدور ممنوع عبر BEFORE UPDATE trigger.
- **notifications**: CRUD كامل محصور بـ `auth.uid() = user_id`.
- **tests**: سياسة `select_tests` تسمح بـ `published = true OR auth.uid() = user_id` (مثبت في migration `20260623001755`). يسمح هذا بشكل صحيح للضيوف بقراءة الاختبارات المنشورة.
- **admin_audit_log**: INSERT مسموح فقط عند `auth.uid() IS NULL` (أي `service_role` / Edge Functions). المستخدمون يمكنهم SELECT صفوفهم الخاصة.
- **rate_limits**: جدول للاستخدام الحصري لـ service_role لتحديد المعدل المستمر.

### Edge Functions
- `auth-login`: حد معدل على اساس IP (3 محاولات/2دقيقة) + تحقق من كلمة المرور.
- `auth-register`: حد معدل على اساس IP + تحقق من كلمة المرور.
- `delete-account`: يسجل الحذف تدقيقياً، يمسح بيانات الامتحانات المحلية.
- `rate-test`: منطق التقييم من جهة السيرفر مع تحديد المعدل.

### فجوات / مخاطر
- **لا توجد سياسة RLS موضحة لجدولي `groups` أو `group_members`** في الـ migrations التي تمت مراجعتها. إذا كانت هذه الجداول موجودة في قاعدة البيانات الحية، فسياساتها غير موثقة هنا. كود study-groups يستعلم عنها مباشرة من العميل.
- **`studyGroupsApi.ts`** يستدعي Edge Function `study-groups` بـ `{ action, payload }`، لكن `studyGroup.supabase.ts` يستعلم عن `groups` / `group_members` / `users` مباشرة. إذا كان مخطط قاعدة البيانات لـ study-groups يفتقر لـ RLS، فإن أي عميل بمفتاح anon يمكنه قراءة/كتابة كل المجموعات.
- **`getCreators`** تستعلم عن جدول `users` (ليس `auth.users` أو `profiles`). إذا كان جدول `users` مخصصاً ولا يحتوي على RLS، فإنه يسرّب بيانات شخصية (PII) (الاسم الأول، الاسم الأخير، اسم المستخدم).
- **ملفات seed** تستخدم UUIDs مؤشرة (`REAL_USER_ID_HERE`). إذا نسي شخص استبدالها ويرفعها بـ `service_role` حقيقي، فقد ينشئ صفوفاً يتيمة.

---

## 5. أمان العميل

### تدفق المصادقة
- **تحقق Zod** على كل مدخلات المصادقة (`loginSchema`، `registerSchema`، `securitySchema`، `deleteAccountSchema`).
- **تحديد المعدل (Rate limiting)**: هوك `useRateLimit` يخزن المحاولات في `localStorage` (يمكن تجاوزه بمسح التخزين أو استخدام التصفح المتخفي). توفر Edge Functions الحد الفعلي؛ تحديد المعدل من جهة العميل هو لأغراض تجربة المستخدم فقط.
- **انتهاء صلاحية الجلسة**: `AuthContext` يتنقل بين `getSession` كل 30 ثانية. `AuthCallback` له مهلة 30 ثانية + 2 إعادة محاولة.
- **كلمة المرور مخزنة في الذاكرة فقط**: النماذج تستخدم مدخلات خاضعة للتحكم؛ لا `autocomplete=off`، لكن حقول كلمة المرور تستخدم `autoComplete="current-password"` / `"new-password"`.

### الوضع الضيف (Guest Mode)
- **"التشفير" هو XOR بمفتاح ثابت** `svu-community-guest-v3-2026`. هذا **ليس تشفيراً حقيقياً** — فهو عكسي بشكل تافه ويوفر أماناً صفرياً. يخفي فقط حمل `sessionStorage` عن الفحص العرضي.
- الضيف لا يمكنه الكتابة إلى Supabase (RLS يحظر الطفرات غير المصادق)، ولكن بيانات الضيف في `localStorage` قابلة للقراءة بالكامل بواسطة أي برنامج نصي على الصفحة.

### XSS / حقن
- استخدام مكثف للأنماط المضمنة و `dangerouslySetInnerHTML`؟ **لم يُلاحظ**. كل العرض يستخدم JSX.
- `localStorageTestStorage` يحلل JSON بدون تعقيم؛ إدخال localStorage فاسد يسبب انهيار القراءة بشكل متدرج (يرجع `[]`).
- `InteractiveMap.tsx` يستخدم عناصر `<animate>` SVG؛ لم يتم العثور على متجهات حقن نص برمجي.

### CSRF
- لا توجد رموز CSRF ملحوظة. Supabase Auth يعتمد على رؤوس `Authorization: Bearer`؛ سياق SPA يقلل من مخاطر CSRF الكلاسيكية، لكن الطفرات تفتقر إلى تدابير مكافحة CSRF.

### كشف البيانات الحساسة
- نوع `SupabaseOperationError` يعرض فقط `message`. جيد.
- `src/lib/supabase.ts` يربط المفتاح العام (anon key)؛ من المفترض أن يكون عاماً. لم يُلاحظ كشف لمفتاح `service_role` في الكود من جهة العميل.
- `AuthCallback.tsx` يسجل معلومات خطأ محدودة (`console.error` محجوز بـ `import.meta.env.DEV`).

### مخاطر تجاوز المصادقة من جهة العميل
- **`GuestRoute`** يسمح للمستخدمين غير المصادقين بالوصول إلى `/dashboard` و `/exam`. الضيوف يقتصرون على localStorage، لكن الواجهة تظهر هذه المسارات كامنة الوصول بشكل كامل. هذا حسب التصميم، وليس علة.
- **`ProtectedRoute`** موجود ولكن **لا يوجد له مستخدمون** في `src/`. لا يوجد مسار حساس يتطلب في الواقع جلسة Supabase حقيقية.
- **`updatePassword`** في `profile.service.ts'` يستدعي أولاً `signInWithPassword` بكلمة المرور الحالية، ثم `updateUser`. إذا كان المهاجم لديه جلسة المستخدم بالفعل، فإنه يمكن أن يغير كلمة المرور بدون كلمة المرور الحالية (بمجرد استدعاء `updateUser` مباشرة). ومع ذلك، تمنع RLS التحديثات المباشرة لـ `auth.supabase.auth.users` من العميل؛ فقط واجهة برمجة تطبيقات Supabase Auth تسمح بذلك، والخدمة تفرض التحقق من كلمة المرور الحالية.

---

## 6. التستات والتغطية

### نظرة عامة على مجموعة التستات
- **الإطار**: Vitest مع `@testing-library/react`.
- **عدد الملفات**: ~80+ ملف اختبار تمتد على `tests/` ENTIRE mirror لـ `src/`.
- **مناطق بتغطية قوية**:
  - `tests/features/exam/`: الخدمات، التخزين الأساسي، الخطافات، المكونات، الصفحات (PlayTest).
  - `tests/features/study-groups/services/studyGroup.supabase.test.ts`: محاكاة CRUD كاملة.
  - `tests/components/dashboard/`: بطاقات الميزات، النوافذ المنبثقة، lineوات les الإعدادات.
  - `tests/components/landing/`: كل أقسام الصفحة الرئيسية.
  - `tests/hooks/useRateLimit.test.ts`: منطق تحديد المعدل الاستنزافي.
  - `tests/contexts/AuthContext.test.tsx`: شكل السياق الأساسي.
  - `tests/auth.test.tsx`: تسجيل الدخول، التسجيل، نسيت كلمة المرور، عرض رد الاتصال.
  - `tests/lib/supabase.callback.test.ts`: حارس البيئة + سلوك رد الاتصال.

### فجوات التغطية
| المنطقة | التغطية |
|---|---|
| AuthContext (انتقالات الحالة الحقيقية، انتهاء الجلسة) | منخفض — تم فحص الصادرات فقط؛ لا توجد tests لآلة الحالات |
| GuestContext | **لا شيء** — لم يُعثر على ملف اختبار |
| Edge Functions (`supabase/functions/*`) | **لا شيء** — تم اختبار جهة العميل فقط |
| `profile.service.ts` | توجد unit tests ولكن محدودة |
| `notification.service.ts` | **لا شيء** |
| `account.service.ts` (منطق الحذف، المهلة) | **لا شيء** |
| خطاف `useAuthForm` | له ملف اختبار مخصص |
| `useParticleCanvas` | له ملف اختبار مخصص |
| `InteractiveMap.tsx` | **لا شيء** |
| `ScheduleExtractionCard` (الميزات غير المنفذة) | N/A — بطاقة فقط |
| RLS / هجرات قاعدة البيانات | **لا شيء** — لا توجد اختبارات تكامل ضد قاعدة بيانات اختبارية |

### ملاحظة حقيقية
- اختبارات ميزة الامتحان هي الأكثر نضجاً، مما يشير إلى أنها أقدم/أثبت الميزات.
- اختبارات study-groups تغطي فقط **العميل Supabase المباشر** (`studyGroup.supabase.ts`)، وليس **واجهة برمجة تطبيقات Edge Function** (`studyGroupsApi.ts`). إذا كانت Edge Function هي المسار الإنتاجي، فهي غير مختبرة من جهة العميل.

---

## 7. الأخطاء الحقيقية ونقاط الفشل

### أخطاء مؤكدة / نقاط فشل
1. **مسارات داشبورد معطلة**: `CourseMaterialsCard` → `/dashboard/courses` و `ScheduleExtractionCard` → `/dashboard/schedule` غير موجودة في `App.tsx`. المستخدمون الذين ينقرون على هذه البطاقات يواجهون 404 أو صفحات فارغة.
2. **"تشفير" الوضع الضيف غير آمن**: XOR بمفتاح مكتوب بشكل ثابت في `GuestContext.tsx`. أي برنامج نصي على الصفحة يمكنه قراءة الملف الشخصي للضيف من `sessionStorage`.
3. **تحديد المعدل من جهة العميل هو تجميلي**: `useRateLimit.ts` يخزن الحالة في `localStorage`. يمكن للمستخدمين تجاوز ذلك بمسح التخزين. تحديد المعدل الحقيقي يحدث من جهة السيرفر في Edge Functions.
4. **مسارات بيانات مزدوجة لـ study-groups**: `studyGroup.supabase.ts` (مباشر من العميل) و `studyGroupsApi.ts` (Edge Function) كلاهما مصدر ويمكن استخدامهما. بدون RLS على جداول `groups` / `group_members` / `users`، المسار المباشر يمثل مخاطرة سلامة البيانات.
5. **كشف PII من جدول `users`**: `getCreators()` تستعلم عن `first_name`، `last_name`، `username` من جدول `users`. إذا كان هذا الجدول يفتقر إلى RLS أو كان عاماً، فإنه يسرّب بيانات شخصية.
6. **انحراف الاستيراد الميت**: متاجر Zustand المهملة تبقى في الحزمة، مما يزيد من سطح الهجوم وت confusion الصيانة.
7. **نوع `SupabaseOperationError` غير مكتمل**: يعرض فقط `message`، وليس `status` أو `code`. تعتمد بعض الخدمات أحياناً على `error.status` (مثل `classifyAuthFunctionError`)، لكن النوع يقول `message` فقط.
8. **تحديث الملف الشخصي لا يحدد `updated_at` من جهة العميل**: يعتمد كلياً على مشغل قاعدة البيانات. إذا كان المشغل مفقوداً، فإن `updated_at` قديم.
9. **عمود `rating_count`**: تضيفه الـ migration، لكن `toTestRow` يضع دائماً `rating_count: 0`. قد تقوم Edge Function `rate-test` من جهة السيرفر بزيادتها أو لا؛ لا يوجد اختبار من جهة العميل يتحقق من هذا.
10. **شريط البحث في DashboardHeader غير وظيفي**: حالة `searchQuery` موجودة ولكن لا معالج يربطها بأي تصفية أو تنقل.
11. **`ProtectedRoute` غير مستخدم**: مكون الأمان موجود للمسارات الحساسة، ولكن لا يوجد مسار يستخدمه بالفعل.

### فجوات معالجة الأخطاء
- `AuthCallback` يعيد المحاولة عند الفشل ولكنه لا يفرق بين أخطاء الشبكة العابرة وأخطاء المصادقة الدائمة (مثل مزود غير صالح). قد يعيد محاولة خطأ 400 بشكل غير ضروري.
- `localStorageTestStorage.drainPendingSync` يشغل العناصر في الطابور بشكل متسلسل بدون معالجة أخطاء لكل عنصر؛ فشل واحد ي abort باقي الطابور.
- `supabase/functions/delete-account/index.ts` له مهلة 15 ثانية من جهة العميل، ولكن Edge Function نفسه ليس له مهلة موثقة. إذا توقف، يرى العميل مهلة عامة بدون معرفة ما إذا تم حذف الحساب فعلاً.

---

## 8. التوصيات (مرتبة بالأولوية)

### P0 — الأمان / البيانات
1. **تدقيق RLS على جداول study-groups** (`groups`، `group_members`، `users`). إذا لم يكن `users` هو `auth.users` أو `profiles`، حدد RLS صارمة أو أزله.
2. **استبدال "التشفير" XOR** في `GuestContext` بـ `crypto.subtle` AES-GCM أو وثقه صراحةً على أنه تخليط فقط ولا تعتمد عليه للأمان.
3. **إزالة المتاجر المهملة** (`notificationStore`، `uiStore`) و `utils/validators.ts` لتقليل مساحة الهجوم.

### P1 — الوظائف
4. **إصلاح أو إزالة المسارات المعطلة**: نفذ `/dashboard/courses` و `/dashboard/schedule` أو أزِل البطاقات.
5. **توصيل شريط البحث** في `DashboardHeader` بإجراء حقيقي، أو أزله.
6. **إضافة اختبارات لـ GuestContext** وآلة حالات `AuthContext` (انتهاء الجلسة، التحديث).
7. **إضافة اختبارات العميل لـ `studyGroupsApi.ts`** (مسار Edge Function).

### P2 — جودة الكود
8. **توحيد استخدام عميل Supabase**: دائماً اذهب عبر `src/lib/supabase.ts`.
9. **إصلاح عدم تطابق النوع**: `SupabaseOperationError` يجب أن يتضمن `status` و `code` اختياريين لمطابقة الاستخدام الفعلي في `classifyAuthFunctionError`.
10. **إضافة روابط تخطي (skip links)** لصفحات المصادقة والنظر في حلقات `focus-visible` على كل العناصر التفاعلية.
11. **استبدال قيم الألوان المكتوبة بشكل ثابت** بـ CSS custom properties أو رموز سمة Tailwind لقابلية الصيانة.
12. **إضافة حدود تحميل / أخطاء** حول `InteractiveMap` وعروض كانفاس `AuthBackground`.

---
*المراجعة مبنية على تحليل ثابت لأكثر من 100 ملف. لم يتم الاستعلام عن بيئة مباشرة.*
