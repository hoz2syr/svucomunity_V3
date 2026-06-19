# جلسة 10 — خطة جاهزية الإنتاج Supabase

## الهدف

توثيق نتيجة مراجعة `untitled/` وتحويلها إلى خطة تنفيذية كاملة لإكمال جاهزية الإنتاج، خصوصاً في مجالات:

- Supabase migrations و RLS.
- Edge Functions.
- إعدادات النشر والسكربتات.
- الاختبارات و CI.
- تحسينات الواجهة و accessibility.
- توثيق العمليات التشغيلية.

## التاريخ

2026-06-19

## النطاق

- قراءة ومراجعة الكود والوثائق الحالية.
- عدم تعديل أي ملفات تشغيلية أو إعدادات سرية.
- تنظيف ملفات التوثيق التالفة أو المربكة.
- إنشاء/تحديث ملفات التوثيق النشطة فقط.
- تحديث مؤشرات الملفات الرئيسية لتشير إلى المهمة الجديدة.

## قرار المسار وحدود التعقيد

تم تثبيت المسار التالي للعمل على جاهزية الإنتاج:

1. لا نعمل أفقياً على كامل المشروع بنسبة `10/100` لكل جزء.
2. كل مرحلة يجب أن تُغلق عمودياً:
   - تحديد فجوة حقيقية.
   - تنفيذ الحد الأدنى المنتج.
   - إضافة الاختبارات حسب الحاجة.
   - تحديث التوثيق.
   - تشغيل التحقق المناسب.
   - تسجيل النتيجة.
3. الواجهة الأمامية:
   - الكود واضح وقابل للتعديل.
   - حالات الخطأ والنجاح والتحميل تُضاف فقط عند الحاجة الفعلية.
   - لا توجد اختبارات لكل مكون؛ الاختبار يكون للflows الحرجة والمكونات ذات السلوك المهم.
4. طبقة العميل:
   - هدفها الأساسي خدمة UX و no-env behavior.
   - لا تُعامل كطبقة أمان لأنها قابلة للتعديل من المتصفح.
   - لا تُضاف تعقيدات أمان غير مفيدة على العميل.
5. طبقة الخادم و Supabase:
   - هي الطبقة الأهم للأمان والبيانات.
   - RLS والمigrations والـ Edge Functions تحتاج اختبارات وتوثيق أقوى.
6. التوثيق:
   - يجب أن يوضح مخطط الملفات والمجلدات.
   - يجب أن يحتوي على diagram عند وجود بنية أو تدفق مهم.
   - يجب أن يفرّق بين الحالة الحالية وخطة الإنتاج.
   - لا تُنشأ تقارير متكررة أو ملفات جلسة داخل `docs/`.

## ملفات التوثيق التي تم تنظيفها

- حذف `docs/tasks/task2` لأنه تقرير مكرر/غير منظم.
- حذف `design.md` لأنه مرجع Frame.io غير مرتبط بهذا المشروع.
- حذف `ِAgents.md` لأنه ملف وكيل تالف وغير مستخدم.
- إضافة `docs/README.md` كنقطة دخول موحدة للتوثيق.

## الملفات التي تمت مراجعتها

- `docs/supabase-setup.md`
- `docs/edge-functions.md`
- `docs/tasks/master-task-list.md`
- `docs/architecture/implementation-plan.md`
- `docs/architecture/final-file-map-and-work-plan.md`
- `package.json`
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/layout/Navbar.tsx`
- `src/pages/Dashboard/DashboardHeader.tsx`
- `src/components/ui/ServerError.tsx`
- `supabase/functions/delete-account/index.ts`
- `supabase/migrations/003_add_profile_identity_fields.sql`
- `tests/Dashboard.test.tsx`

## نتائج المراجعة المختصرة

### تحقق سابق

- `npm run lint`: نجح.
- `npm test`: فشل باختبار واحد.
- `npm audit --json`: 0 vulnerabilities.
- لا توجد imports من production إلى `src/stories`.
- لا توجد Supabase calls مباشرة داخل pages/components.
- لا توجد أنماط `dangerouslySetInnerHTML` / `eval` / `innerHTML =`.

### الفشل الحالي

- فشل اختبار في `tests/Dashboard.test.tsx:99`.
- السبب المتوقع: حالة الخطأ في قائمة الإشعارات لا تعرض النص الذي يتوقعه الاختبار.

### فجوات الإنتاج

- Supabase backend غير مكتمل كمنصة إنتاجية:
  - RLS غير مكتمل.
  - `admin_audit_log` و `rate_limits` مفعّل عليهما RLS بدون policies.
  - seed data غير صالح عملياً بدون users حقيقيين.
  - لا يوجد `supabase/config.toml`.
- Edge Function `delete-account` غير جاهزة للإنتاج:
  - الحذف غير atomic.
  - audit log يُكتب بعد حذف الحساب.
  - rate limit مبني على `Map` في الذاكرة.
  - admin detection يعتمد على metadata فقط.
  - لا توجد اختبارات مؤكدة للدالة.
- Frontend:
  - `ProtectedRoute` لا يتعامل مع `envMissing`.
  - `AuthContext` قد يظل في حالة inconsistent عند no-env.
  - accessibility gaps في `Navbar` و `DashboardHeader` و `ServerError`.
- التوثيق:
  - `DEPLOYMENT.md` غير متسق بين Cloudflare و Vercel.
  - إعدادات Supabase تحتاج ملفاً واحداً واضحاً بالخطوات والسكربتات.
  - Edge Functions تحتاج توثيق تشغيل/نشر/اختبار أعمق.
- CI:
  - لا يوجد `npm audit`.
  - لا توجد e2e tests.
  - لا توجد coverage thresholds.

## القرار

تم تثبيت المسار العمودي لجاهزية الإنتاج: لا نوزّع التحسين على كل المشروع، بل نُغلق كل جزء بالكامل قبل الانتقال إلى الجزء التالي.

تم تحديث الخطة في:

```txt
docs/tasks/10-production-readiness-plan.md
```

وأصبح `docs/README.md` نقطة الدخول الموحدة للتوثيق.

## المخاطر

- تعديل migrations بدون خطة منفصلة قد يكسر RLS أو البيانات الموجودة.
- تغيير auth/session/RBAC قد يؤثر على تجربة المستخدم إذا لم تُغطَّ بالاختبارات.
- Edge Function حذف الحساب حساسة ويجب أن تكون atomic وموثقة ومختبرة قبل النشر.
- أي ملف يحتوي `service_role` أو مفاتيح API يجب أن يبقى خارج git.

## الحالة

مكتملة كجلسة تنظيف وتوثيق أولي. تم تثبيت المسار العمودي وحدود التعقيد المطلوبة. لم يتم تعديل أي كود تشغيلي أو إعدادات سرية.
