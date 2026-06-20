# خطة التنفيذ الكاملة — SVU Community Web

## حالة التنفيذ الحالية

الحالة النهائية: مكتملة.

تم تنفيذ المراحل 01–09 وتحديث ملفات الخطة والتوثيق وملفات الجلسات.

التحقق النهائي:
```bash
npm run lint
npm run build
npm run test
npm run build-storybook
```

النتائج:
- `npm run lint`: نجح.
- `npm run build`: نجح مع تحذير chunk size فقط.
- `npm run test`: نجح، 11 ملفات اختبار و36 اختباراً.
- `npm run build-storybook`: نجح مع تحذير chunk size وتحذير عدم وجود MDX فقط.
- تم حذف `storybook-static/` بعد build-storybook.
- تم تحديث `.gitignore` ليشمل `storybook-static/` و `tsc-errors.txt`.

## مبدأ الاكتمال العمودي

لا نعمل على كامل المشروع بنسبة `10/100` في كل جزء. كل مرحلة يجب أن تُغلق عمودياً:

1. تحديد فجوة حقيقية.
2. تنفيذ الحد الأدنى المنتج.
3. إضافة الاختبارات حسب الحاجة.
4. تحديث التوثيق.
5. تشغيل التحقق المناسب.
6. تسجيل النتيجة في ملف الجلسة.

## حدود التعقيد المطلوبة

### الواجهة الأمامية

- الكود واضح وقابل للتعديل.
- حالات الخطأ والنجاح والتحميل تُضاف فقط عند الحاجة الفعلية.
- لا توجد اختبارات آلية لكل مكون؛ الاختبار يكون للflows الحرجة والمكونات ذات السلوك المهم.

### طبقة العميل

- هدفها خدمة UX و no-env behavior.
- لا تُعامل كطبقة أمان لأنها قابلة للتعديل من المتصفح.
- لا تعتمد على rate limit أو authorization في المتصفح فقط.

### طبقة الخادم و Supabase

- هي الطبقة الأهم للأمان والبيانات.
- RLS والمigrations والـ Edge Functions تحتاج اختبارات وتوثيق أقوى.
- لا تُعتمد على UI-layer protections للأمان الحقيقي.

### التوثيق

- يجب أن يوضح مخطط الملفات والمجلدات.
- يجب أن يحتوي على diagram عند وجود بنية أو تدفق مهم.
- يجب أن يفرّق بين الحالة الحالية وخطة الإنتاج.
- لا تُنشأ تقارير متكررة أو ملفات جلسة داخل `docs/`.

---

## المهمة 01 — تثبيت حدود Storybook

الحالة: مكتملة.

التعديلات المنفذة:
- `src/components/layout/Header.tsx` أصبح مكوناً إنتاجياً بسيطاً.
- أزيل الاعتماد على scaffold داخل `src/stories`.
- بقيت stories تستورد من production components فقط.
- أضيفت stories حقيقية لمكونات UI موجودة.

الاختبارات المطلوبة:
- Storybook build يجب أن ينجح.
- لا يوجد import من production إلى `src/stories`.

التحقق:
```bash
npm run lint
npm run build-storybook
```

ملف الجلسة:
- `.kilo/sessions/01-storybook-boundary.md`

---

## المهمة 02 — بناء Service Layer لـ Supabase

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء:
  - `src/services/auth.service.ts`
  - `src/services/profile.service.ts`
  - `src/services/notification.service.ts`
  - `src/services/account.service.ts`
  - `src/services/environment.service.ts`
  - `src/services/index.ts`
- نُقلت عمليات Supabase من pages/components إلى services.
- تم تثبيت lazy client behavior في `src/lib/supabase.ts`.

الاختبارات المطلوبة:
- `tests/supabase.test.ts`
- `tests/services/auth.service.test.ts`
- `tests/services/profile.service.test.ts`
- `tests/services/notification.service.test.ts`
- `tests/services/account.service.test.ts`

التحقق:
```bash
npm run lint
npm run test
npm run build
```

ملف الجلسة:
- `.kilo/sessions/02-supabase-service-layer.md`

---

## المهمة 03 — إعادة تنظيم Auth flow

الحالة: مكتملة.

التعديلات المنفذة:
- تم تحديث `Login.tsx` لاستخدام `loginWithPassword`, `loginWithGoogle`, `hasSupabaseEnv`.
- تم تحديث `Register.tsx` لاستخدام `registerWithEmail`, `loginWithGoogle`.
- تم تحديث `AuthCallback.tsx` لاستخدام `completeAuthCallback`.
- تم تحديث `ForgotPasswordModal.tsx` لاستخدام `resetPassword`.
- تم تحديث `AuthContext.tsx` لاستخدام services و no-env checks.

الاختبارات المطلوبة:
- تحديث `tests/auth.test.tsx`.
- إضافة/تحديث tests لـ login/register/forgot password/callback.
- إضافة `tests/services/auth.service.test.ts`.

التحقق:
```bash
npm run lint
npm run test
npm run build
```

ملف الجلسة:
- `.kilo/sessions/03-auth-flow-refactor.md`

---

## المهمة 04 — تفكيك Dashboard

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء مجلد `src/pages/Dashboard/`.
- تم إنشاء:
  - `Dashboard.tsx`
  - `DashboardHeader.tsx`
  - `DashboardLayout.tsx`
  - `EmptyDashboardState.tsx`
  - `useDashboardNotifications.ts`
  - `useDashboardState.ts`
- أصبح `src/pages/Dashboard.tsx` re-export فقط.
- تم تحديث `tests/Dashboard.test.tsx`.

الاختبارات المطلوبة:
- تحديث `tests/Dashboard.test.tsx`.
- تغطية empty/error notification states و profile/logout flows.

التحقق:
```bash
npm run lint
npm run test
npm run build
```

ملف الجلسة:
- `.kilo/sessions/04-dashboard-refactor.md`

---

## المهمة 05 — تفكيك Modals

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء:
  - `src/components/dashboard/ModalOverlay.tsx`
  - `src/components/dashboard/LogoutModal.tsx`
  - `src/components/dashboard/DeleteAccountModal.tsx`
  - `src/components/dashboard/SettingsModal.tsx`
  - `src/components/dashboard/ProfileSettingsForm.tsx`
  - `src/components/dashboard/SecuritySettingsForm.tsx`
  - `src/components/dashboard/useProfileSettings.ts`
  - `src/components/dashboard/useSecuritySettings.ts`
  - `src/components/dashboard/index.ts`
- تم نقل Supabase operations إلى services.
- تم إصلاح accessibility bug في `InputField` عبر ربط label بـ input باستخدام `inputId`.

الاختبارات المطلوبة:
- `tests/dashboard/LogoutModal.test.tsx`
- `tests/dashboard/DeleteAccountModal.test.tsx`
- `tests/dashboard/SettingsModal.test.tsx`
- service tests للـ profile/account.

التحقق:
```bash
npm run lint
npm run test
npm run build
```

ملف الجلسة:
- `.kilo/sessions/05-dashboard-modals-refactor.md`

---

## المهمة 06 — توحيد Types و Validation

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء/تثبيت:
  - `src/types/auth.ts`
  - `src/types/notification.ts`
  - `src/types/profile.ts`
  - `src/types/canvas.ts`
  - `src/types/supabase.ts`
  - `src/types/index.ts`
- تم استخدام `src/schemas/auth.schema.ts` للـ auth/profile/security validation.
- تم تثبيت feature service index files تحت `src/features/**/services/index.ts`.
- grep أكد عدم وجود `any` في `src`.

الاختبارات المطلوبة:
- service tests للـ typed results.
- build/lint للتحقق من type compatibility.

التحقق:
```bash
npm run lint
npm run test
```

ملف الجلسة:
- `.kilo/sessions/06-types-validation.md`

---

## المهمة 07 — تنظيف Landing components

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء/تثبيت components فردية تحت `src/components/landing/`:
  - `HeroAddition.tsx`
  - `ScrollIndicator.tsx`
  - `ProblemsSection.tsx`
  - `SolutionBridge.tsx`
  - `FeaturesSection.tsx`
  - `HowItWorksSection.tsx`
  - `ComingSoonSection.tsx`
  - `FinalCTASection.tsx`
- أصبح `src/components/LandingSections.tsx` barrel exports فقط.
- يستخدم `Home.tsx` components الفردية مع `Suspense` و `ErrorBoundary`.
- تم تنظيف comments غير الضرورية في `InteractiveMap.tsx`.

الاختبارات المطلوبة:
- build يكفي لأن refactor UI لم يغير behavior.

التحقق:
```bash
npm run lint
npm run build
```

ملف الجلسة:
- `.kilo/sessions/07-landing-components-refactor.md`

---

## المهمة 08 — اختبارات و CI

الحالة: مكتملة.

التعديلات المنفذة:
- تم إنشاء `tests/setup.ts`.
- تم تحديث `vitest.config.ts`.
- تم تحديث tests القديمة حسب refactor.
- تم إضافة service tests و dashboard modal tests.

الاختبارات المطلوبة:
- يجب أن تمر كل tests بدون stderr مزعج.
- يجب أن تغطي services الأساسية.

التحقق:
```bash
npm run test
npm run lint
```

ملف الجلسة:
- `.kilo/sessions/08-tests-ci.md`

---

## المهمة 09 — تنظيف نهائي

الحالة: مكتملة.

التعديلات المنفذة:
- تم تحديث:
  - `AGENTS.md`
  - `.kilo/rules.md`
  - `.kilo/tasks.md`
  - `docs/README.md`
  - `docs/architecture/final-file-map-and-work-plan.md`
  - `docs/tasks/master-task-list.md`
  - ملفات الجلسات 00–10
  - `README.md`
- تم تحديث `.gitignore`.
- تم حذف `storybook-static/` و `tsc-errors.txt`.

الاختبارات المطلوبة:
- لا توجد tests جديدة مطلوبة هنا إلا إذا كشف cleanup عن خلل.

التحقق:
```bash
npm run lint
npm run build
npm run test
npm run build-storybook
```

ملف الجلسة:
- `.kilo/sessions/09-final-cleanup.md`

---

## المهمة 10 — جاهزية الإنتاج Supabase

الحالة: قيد التخطيط.

النطاق:
- تنظيف التوثيق التالف أو المربك.
- تثبيت مسار العمل العمودي.
- توثيق حدود التعقيد المطلوبة.
- إكمال جاهزية الإنتاج عبر مراحل مغلقة عمودياً.

الترتيب المعتمد:
1. توثيق ومخطط ملفات وحدود تعقيد.
2. الواجهة الأمامية: no-env، protected route، حالات الخطأ/النجاح/التحميل، accessibility، اختبارات critical flows.
3. طبقة العميل: services/error normalization/no-env utilities بدون تعقيد أمني زائد.
4. Supabase backend: migrations/RLS/indexes/seed/config.
5. Edge Functions: `delete-account` فقط ضمن نطاق الخطة.
6. CI/audit/e2e/coverage.
7. التحقق النهائي.

الاختبارات المطلوبة:
- اختبارات للflows الحرجة فقط.
- اختبارات Supabase/no-env.
- اختبارات Edge Function للسيناريوهات الحساسة.
- e2e للflows الحرجة عند الحاجة.

التحقق:
```bash
npm run lint
npm run build
npm run test
npm run build-storybook
npm audit --audit-level=high
```

ملف الجلسة:
- `.kilo/sessions/10-production-readiness.md`

ملف الخطة:
- `docs/tasks/10-production-readiness-plan.md`
