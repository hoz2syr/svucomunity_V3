# خطة التنفيذ الكلي — جاهزية الإنتاج Supabase

## الهدف

إكمال تحويل `untitled/` من scaffold React/TypeScript نظيف إلى منصة إنتاجية قابلة للنشر، مع Backend/Supabase آمن وموثق ومختبر.

## نطاق الخطة

تشمل الخطة:

1. تنظيف التوثيق وتثبيت مرجع واحد للمهمة 10.
2. إصلاح الفشل الحالي في الاختبارات.
2. إكمال migrations و RLS و indexes.
3. إصلاح Edge Function حذف الحساب.
4. إضافة إعدادات وسكربتات Supabase قابلة للتشغيل.
5. تحسين no-env behavior في Auth/ProtectedRoute.
6. تحسين accessibility في الواجهات الحرجة.
7. توحيد التوثيق.
8. إضافة CI/e2e/audit/coverage.
9. تشغيل التحقق النهائي.

## ضوابط التنفيذ

- لا تعدّل `.env.local`.
- لا تضف secrets إلى git.
- لا تعدّل migrations إلا في مهمة مخصصة.
- لا تغيّر auth/session/RBAC إلا لإصلاح خلل مثبت.
- لا تضع Supabase calls مباشرة في pages/components.
- لا تضيف منطق Edge Function حساساً بدون اختبارات.
- أي تغيير غير تافه يجب أن يُرافق بتحديث ملف الجلسة وملف المهام.

---

## مبدأ الاكتمال العمودي

لا يُقبل مسار العمل الأفقي الذي يحسّن كل جزء بنسبة قليلة ثم يؤجل الإغلاق. كل مرحلة يجب أن تُغلق عمودياً قبل الانتقال إلى غيرها:

1. تحديد فجوة حقيقية تؤثر على الإنتاج أو تجربة المستخدم.
2. تنفيذ الحد الأدنى المنتج فقط داخل نطاق المرحلة.
3. إضافة الاختبارات حسب الحاجة وليس لكل مكون.
4. تحديث التوثيق المرتبط.
5. تشغيل التحقق المناسب.
6. تسجيل النتيجة في ملف الجلسة.
7. إغلاق المرحلة في `docs/tasks/master-task-list.md`.

## حدود التعقيد المطلوبة

### الواجهات الأمامية

- الهدف: واجهات واضحة، قابلة للتعديل، وغير متشابكة.
- حالات الخطأ والنجاح والتحميل تُضاف فقط عندما تؤثر فعلياً على تجربة المستخدم.
- لا تُبنى أنظمة UI عامة زائدة عن الحاجة.
- الاختبارات تُكتب للflows الحرجة والمكونات ذات السلوك المعقّد، وليس لكل مكون.

### طبقة العميل

- الهدف: خدمة UX و no-env behavior.
- لا تُعامل كطبقة أمان لأنها قابلة للتعديل من المتصفح.
- لا تعتمد على rate limit أو authorization في المتصفح فقط.
- لا تضيف تعقيداً كبيراً إلا إذا كان يحمي سلوكاً حقيقياً للمستخدم.

### طبقة الخادم و Supabase

- الهدف: حماية البيانات والعمليات الحساسة.
- RLS والمigrations والـ Edge Functions تحتاج اختبارات وتوثيق أقوى من الواجهة.
- لا تُستخدم Supabase كبديل عن توثيق السياسات والسلوك.
- أي عملية حساسة مثل حذف الحساب يجب أن تكون قابلة للاختبار والمراجعة.

### التوثيق

- كل توثيق يجب أن يوضح الحالة الحالية وخطة الإنتاج.
- كل بنية مهمة يجب أن يكون لها مخطط ملفات أو diagram.
- لا تُنشأ تقارير متكررة أو ملفات جلسة داخل `docs/`.
- ملف الخطة وملف الجلسة هما المصدر النشط للمهمة 10.

---

## المرحلة 0 — تثبيت baseline للمراجعة

### الهدف

تثبيت نقطة بداية واضحة قبل أي تنفيذ، وتنظيف التوثيق المربك قبل بدء مراحل الإنتاج.

### الملفات

- `docs/tasks/10-production-readiness-plan.md`
- `.kilo/sessions/10-production-readiness.md`
- `docs/tasks/master-task-list.md`
- `docs/README.md`
- `docs/architecture/final-file-map-and-work-plan.md`
- `docs/architecture/implementation-plan.md`

### الإجراءات

1. تحديث `docs/tasks/master-task-list.md` لإضافة المهمة 10.
2. توثيق نتائج المراجعة السابقة في ملف الجلسة.
3. حذف ملفات التوثيق التالفة أو المربكة.
4. إضافة دليل توثيق موحد.
5. عدم تشغيل أوامر build تنتج artifacts دائمة.

### التحقق

- قراءة الملفات الجديدة.
- التأكد من عدم وجود secrets.
- التأكد من أن الخطة تشير إلى الملفات الصحيحة.
- التأكد من عدم وجود تقارير مكررة داخل `docs/tasks`.

### معايير القبول

- يوجد ملف جلسة واضح.
- يوجد ملف خطة واضح.
- يوجد دليل توثيق موحد.
- لا توجد تقارير مكررة أو مراجع تصميم غير مرتبطة.
- الخطة مرتبطة بالمهمة الرئيسية.

---

## المرحلة 1 — إصلاح الاختبار الفاشل

### الهدف

إرجاع `npm test` إلى حالة النجاح قبل أي تغييرات إنتاجية.

### الملفات المحتملة

- `tests/Dashboard.test.tsx`
- `src/pages/Dashboard/DashboardHeader.tsx`
- `src/pages/Dashboard/useDashboardNotifications.ts`

### الإجراءات

1. تشغيل `npm test -- --run tests/Dashboard.test.tsx` لتحديد السلوك الفعلي.
2. مقارنة نص الخطأ الظاهر مع المتوقع.
3. إصلاح UI أو الاختبار فقط إذا كان الاختبار لا يطابق السلوك المقصود.

### الاختبارات

- `npm test -- --run tests/Dashboard.test.tsx`

### التحقق

```bash
npm run lint
npm test
```

### معايير القبول

- `npm test` ينجح بالكامل.
- لا يتغير سلوك عربي غير مطلوب.
- لا تتأثر اختبارات أخرى.

---

## المرحلة 2 — إكمال Supabase migrations و RLS

### الهدف

تحويل قاعدة البيانات إلى بنية آمنة قابلة للإنتاج.

### الملفات

- `supabase/migrations/001_init_profiles.sql`
- `supabase/migrations/002_init_notifications.sql`
- `supabase/migrations/003_add_profile_identity_fields.sql`
- `supabase/seed/profiles.sql`
- `supabase/seed/notifications.sql`
- `docs/supabase-setup.md`

### الإجراءات المقترحة

1. مراجعة كل جدول و policy يدوياً.
2. إضافة policies واضحة لـ:
   - قراءة profile الخاص بالمستخدم فقط.
   - تحديث profile الخاص بالمستخدم فقط.
   - حذف profile الخاص بالمستخدم فقط أو عبر Edge Function موثوق.
   - قراءة/إنشاء/تحديث notifications الخاصة بالمستخدم فقط.
   - منع الكتابة العامة على `admin_audit_log`.
   - منع القراءة العامة على `rate_limits`.
3. إضافة indexes للأعمدة المستخدمة في filters:
   - `notifications.user_id`
   - `notifications.read`
   - `notifications.created_at`
   - `admin_audit_log.created_at`
   - `rate_limits.reset_at`
4. إصلاح seed data بحيث لا يفترض وجود users غير موجودين.
5. إضافة migration منفصلة إذا لزم الأمر.

### الاختبارات

- تشغيل migration على مشروع Supabase test.
- اختبار RLS باستخدام users مختلفين.
- اختبار أن user لا يقرأ/يحدّث/يحذف بيانات user آخر.

### التحقق

```bash
npm run lint
npm test
```

### معايير القبول

- لا توجد policies عامة غير مقصودة.
- seed data يعمل.
- RLS يمنع الوصول العرضي بين المستخدمين.
- التوثيق يعكس الحالة النهائية.

---

## المرحلة 3 — إصلاح Edge Function `delete-account`

### الهدف

جعل حذف الحساب عملية آمنة و atomic ومراقبة.

### الملفات

- `supabase/functions/delete-account/index.ts`
- `docs/edge-functions.md`
- `docs/supabase-setup.md`
- `src/lib/supabase.ts`
- `src/services/account.service.ts`

### المشاكل الحالية

- الحذف غير atomic:
  - حذف profile ثم حذف auth user ثم audit بعد ذلك.
- audit log يعتمد على `catch(() => undefined)`.
- rate limit مبني على `Map` في الذاكرة.
- admin detection يعتمد على metadata فقط.
- لا توجد اختبارات مؤكدة.

### الإجراءات المقترحة

1. اعتماد نموذج role أكثر موثوقية:
   - role من جدول `profiles.role`.
   - أو claims موثوقة داخل JWT.
   - أو policy/permission table.
2. جعل العملية transactional قدر الإمكان:
   - audit before delete.
   - profile deletion.
   - auth user deletion.
   - failure handling واضح.
3. تحويل rate limit إلى persistent storage:
   - استخدام جدول `rate_limits`.
   - cleanup للصفوف القديمة.
4. تحسين CORS:
   - رفض origin غير المصرح به.
   - عدم استخدام `*` في الإنتاج.
5. تحسين معالجة الأخطاء:
   - عدم كشف تفاصيل داخلية.
   - عدم حذف الحساب إذا فشل audit.
6. إضافة اختبارات unit/integration للدالة.

### الاختبارات

- مستخدم عادي يحذف حسابه: success.
- مستخدم بدون Authorization: 401.
- origin غير مصرح: 403.
- rate limit exceeded: 429.
- admin user: 403.
- audit failure: account غير محذوف.
- profile delete failure: account غير محذوف.
- auth delete failure: rollback/compensation واضح.

### التحقق

```bash
npm run lint
npm test
```

### معايير القبول

- الدالة لا تحذف الحساب إذا فشل audit.
- لا يمكن حذف حساب آخر.
- لا يمكن حذف admin.
- rate limit يعمل بين invocations.
- التوثيق يوضح النشر والاختبار.

---

## المرحلة 4 — إعدادات Supabase والسكربتات

### الهدف

توحيد خطوات إعداد Supabase في ملف واحد قابل للتنفيذ.

### الملفات

- `docs/supabase-setup.md`
- `supabase/config.toml`
- `scripts/supabase-check.sh`
- `scripts/supabase-check.ps1`
- `.env.example`

### الإجراءات المقترحة

1. إضافة `supabase/config.toml`.
2. توثيق:
   - إنشاء المشروع.
   - ربط المشروع.
   - تطبيق migrations.
   - إعداد secrets.
   - نشر Edge Functions.
   - اختبار RLS.
   - اختبار Edge Function.
3. إضافة سكربتات تحقق:
   - وجود `supabase/config.toml`.
   - وجود secrets المطلوبة.
   - وجود migrations.
   - وجود Edge Function.
   - عدم وجود secrets في git.

### التحقق

```bash
npm run lint
npm test
```

### معايير القبول

- ملف التوثيق يحتوي خطوات وسكربتات واضحة.
- لا توجد secrets داخل repo.
- يمكن تشغيل checks محلياً بدون كشف مفاتيح.

---

## المرحلة 5 — تحسين no-env behavior

### الهدف

منع crashes أو السلوك المضلل عند غياب إعدادات Supabase.

### الملفات

- `src/lib/supabase.ts`
- `src/services/environment.service.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/Dashboard.tsx`

### الإجراءات المقترحة

1. توحيد منطق no-env في `environment.service.ts`.
2. جعل `AuthContext` يعرض حالة `envMissing` واضحة.
3. جعل `ProtectedRoute` يتعامل مع `envMissing` قبل `!session`.
4. منع صفحات protected من عرض loading أبدي عند no-env.
5. إضافة tests لـ no-env flows.

### الاختبارات

- no-env login لا يظهر success وهمي.
- no-env protected route لا يدخل loop.
- no-env auth context لا يشترك في Supabase.
- pages لا تستدعي Supabase مباشرة.

### التحقق

```bash
npm run lint
npm test
npm run build
```

### معايير القبول

- سلوك no-env واضح ومختبر.
- لا توجد crashes.
- لا توجد Supabase calls من pages/components.

---

## المرحلة 6 — تحسين accessibility في الواجهات الحرجة

### الهدف

تحسين قابلية الاستخدام للقارئات الشاشية والتنقل عبر لوحة المفاتيح.

### الملفات المحتملة

- `src/components/layout/Navbar.tsx`
- `src/pages/Dashboard/DashboardHeader.tsx`
- `src/components/ui/ServerError.tsx`
- `src/components/dashboard/ModalOverlay.tsx`
- `src/components/dashboard/DeleteAccountModal.tsx`

### الإجراءات المقترحة

1. إضافة `aria-controls` و `id` للمenus.
2. إضافة `aria-labelledby` أو `aria-describedby` للمودالات.
3. إضافة `role="alert"` إلى `ServerError`.
4. تحسين focus trap داخل modals.
5. إغلاق menus عند Escape.
6. تحسين labels و focus states.
7. إضافة tests accessibility أساسية.

### الاختبارات

- تحديث tests الحالية.
- إضافة tests للـ keyboard interactions.
- تشغيل Storybook accessibility addon عند الحاجة.

### التحقق

```bash
npm run lint
npm test
npm run build-storybook
```

### معايير القبول

- menus قابلة للإغلاق.
- modals لها أدوار و labels واضحة.
- errors تُقرأ كـ alerts.
- لا توجد regressions في UI.

---

## المرحلة 7 — توحيد التوثيق

### الهدف

إزالة التناقضات بين ملفات التوثيق.

### الملفات

- `README.md`
- `DEPLOYMENT.md`
- `docs/supabase-setup.md`
- `docs/edge-functions.md`
- `docs/architecture/implementation-plan.md`
- `docs/tasks/master-task-list.md`

### الإجراءات المقترحة

1. جعل `DEPLOYMENT.md` يشير إلى منصة نشر واحدة أو يوضح اختلاف Cloudflare/Vercel بوضوح.
2. تحديث `README.md` لإزالة أي references غير مستخدمة أو غير دقيقة.
3. توثيق Edge Functions في ملف واحد شامل.
4. تحديث خطة التنفيذ بعد كل مرحلة.
5. تحديث master task list بحالة كل مهمة.

### التحقق

- قراءة الروابط الداخلية.
- التأكد من عدم وجود أوامر broken.
- التأكد من عدم وجود secrets.

### معايير القبول

- التوثيق متسق.
- لا توجد URLs أو أوامر غير واضحة.
- أي setup command قابل للفهم.

---

## المرحلة 8 — CI و audit و e2e و coverage

### الهدف

جعل CI يعكس متطلبات الإنتاج.

### الملفات

- `.github/workflows/ci.yml`
- `package.json`
- `vitest.config.ts`
- `tests/`

### الإجراءات المقترحة

1. إضافة `npm audit --audit-level=high` إلى CI.
2. إضافة e2e tests أساسية عبر Playwright:
   - landing page.
   - login no-env أو mocked Supabase.
   - protected route no-env.
3. إضافة coverage threshold إذا كان مناسباً.
4. منع CI من قراءة secrets.
5. تشغيل build/lint/test/storybook في CI.

### التحقق

```bash
npm run lint
npm test
npm run build
npm run build-storybook
npm audit --audit-level=high
```

### معايير القبول

- CI ينجح.
- audit لا يظهر vulnerabilities عالية أو أعلى.
- e2e tests تعمل محلياً.
- coverage لا ينخفض بدون سبب موثق.

---

## المرحلة 9 — التحقق النهائي وجاهزية النشر

### الهدف

إغلاق الخطة بعد التأكد من أن المشروع جاهز للنشر.

### الملفات

- جميع الملفات المعدلة.
- `docs/tasks/master-task-list.md`
- ملفات الجلسات.

### التحقق النهائي

```bash
npm install
npm run lint
npm run build
npm test
npm run build-storybook
npm audit --audit-level=high
```

### معايير القبول

- جميع الأوامر تنجح.
- لا توجد secrets في git.
- لا توجد imports ممنوعة.
- لا توجد Supabase calls مباشرة من pages/components.
- Edge Function موثقة ومختبرة.
- Supabase setup موثق ومختبر.
- التوثيق متسق.

---

## ترتيب التنفيذ المعتمد

1. تنظيف التوثيق وتثبيت ملف الخطة وملف الجلسة كمرجع وحيد للمهمة 10.
2. الواجهة الأمامية:
   - no-env behavior.
   - protected route.
   - حالات الخطأ/النجاح/التحميل في الواجهات الحرجة فقط.
   - accessibility الأساسية.
   - اختبارات للflows الحرجة.
   - توثيق مخطط الواجهة والسلوك.
3. طبقة العميل:
   - services/error normalization/no-env utilities.
   - عدم تعقيد طبقة العميل لأنها ليست طبقة أمان.
   - اختبارات للسلوك الذي يخدم UX.
4. Supabase backend:
   - migrations/RLS/indexes/seed.
   - توثيق policies والسلوك المتوقع.
   - اختبارات RLS أو تحقق يدوي موثق.
5. Edge Functions:
   - `delete-account` فقط ضمن نطاق الخطة.
   - atomic flow قدر الإمكان.
   - persistent rate limit.
   - audit قبل الحذف.
   - اختبارات وسيناريوهات أمان.
6. CI/audit/e2e/coverage:
   - إضافة التحقق الضروري فقط.
   - e2e للflows الحرجة.
   - audit عالي الخطورة.
7. التحقق النهائي وجاهزية النشر.

