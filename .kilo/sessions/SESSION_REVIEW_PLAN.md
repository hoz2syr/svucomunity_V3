# خطة جلسة مراجعة مشروع SVU Community - untitled

**المسار:** `untitled/`  
**تاريخ الجلسة:** 2026-06-18  
**نطاق المراجعة:** مراجعة للمجلد `untitled` وتنفيذ خطة الإصلاح تدريجياً؛ يتم تحديث هذا الملف بعد كل مرحلة تنفيذ.  
**المهارات المستخدمة:** `codebase-onboarding`، `code-review`، `security-best-practices`، `senior-architect`، `senior-frontend`، `senior-backend`، `accessibility-compliance`.

---

## 1. ملخص الجلسة

تمت مراجعة مبدئية لمشروع React + TypeScript مبني بـ Vite ويستخدم Supabase للمصادقة والـ backend. المراجعة غطت جودة الكود، الاختبارات، الأمان، إعدادات Supabase، Edge Functions، التوثيق، الواجهات، قابلية الوصول، وقابلية التوسع.

النتيجة العامة: المشروع ليس جاهزاً للإنتاج بصيغته الحالية بسبب مشاكل typecheck، اختبارات فاشلة، عدم تزامن CI، عدم تطابق schema، وتوثيق غير متزامن. كما توجد مشكلة أمنية حرجة في Edge Function حذف الحساب.

---

## 1.1 سجل تنفيذ الجلسة

### تنفيذ 3 - تحسين accessibility والواجهة الأساسية

**التاريخ:** 2026-06-18  
**الحالة:** مكتمل  
**ما تم:**

- تم إنشاء صفحة 404 في `src/pages/NotFound.tsx` وربطها في `src/App.tsx`.
- تم إضافة `prefers-reduced-motion` في `src/index.css`.
- تم تحسين `InputField`:
  - ربط الخطأ بـ `aria-describedby`.
  - إضافة `aria-invalid`.
  - إضافة label و `aria-pressed` لزر إظهار/إخفاء كلمة المرور.
- تم تحسين `ModalOverlay`:
  - focus trap.
  - إغلاق بـ Escape.
  - إعادة التركيز للعنصر السابق.
  - `aria-labelledby` و `aria-describedby`.
- تم تحسين Dropdowns في `Dashboard`:
  - `aria-expanded`.
  - `aria-controls`.
  - `aria-haspopup`.
  - إغلاق بـ Escape.
- تم استبدال `alert()` عند فشل حذف الحساب بعرض `role="alert"`.
- تم إضافة `aria-hidden` للـ canvas في `Home`.

**التحقق:**

- `npm run lint`: نجح.
- `npm test`: نجح، 3 ملفات و9 اختبارات.
- `npx vite build --outDir "C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build"`: نجح، مع تحذير حجم chunk فقط.

### تنفيذ 4 - التحقق النهائي

**التاريخ:** 2026-06-18  
**الحالة:** مكتمل  
**ما تم:**

- تم تشغيل فحوصات نهائية بعد كل مراحل التنفيذ.

**التحقق النهائي:**

- `npm run lint`: نجح.
- `npm test`: نجح، 3 ملفات و9 اختبارات.
- `npx vite build --outDir "C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build"`: نجح، مع تحذير حجم chunk فقط.
- `npm audit --omit=dev --audit-level=moderate`: نجح، 0 vulnerabilities.
- `git status --short -- "untitled" ".kilo/sessions/SESSION_REVIEW_PLAN.md"`: يوضح أن مجلد `untitled` وملف الجلسة غير متتبعين في هذا المستودع.

**ملاحظات متبقية:**

- تحذير حجم chunk > 500 kB ما زال موجوداً؛ يمكن معالجته لاحقاً بتقسيم routes أو manual chunks.
- تحذيرات jsdom عن `HTMLCanvasElement.prototype.getContext` ما زالت تظهر في اختبارات auth لكنها لا تفشل.
- Edge Function تحتاج اختباراً يدوياً على بيئة Supabase حقيقية باستخدام JWT صالح قبل الاعتماد عليها في الإنتاج.

**ملاحظات:**

- ما زالت اختبارات auth تطبع تحذيرات jsdom عن `HTMLCanvasElement.prototype.getContext`، لكنها لا تفشل.
- تم تشغيل build مؤقت بعد هذه المرحلة بنجاح في `C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build`، مع تحذير حجم chunk فقط.
- ما زال `dist/` موجوداً داخل `untitled/` رغم أنه مُدرج في `.gitignore`، ويمكن حذفه محلياً إذا أردت تنظيفاً فقط.
- ما زال `metadata.json` فارغاً/غير مملوء.
- ما زالت Stories الموجودة هي Stories افتراضية من قالب Storybook وليست stories حقيقية لمكونات المشروع.

---

## 2. نتائج التحقق التي تم تشغيلها

| الأمر | النتيجة | الملاحظة |
|---|---:|---|
| `npm run lint` | فشل | أخطاء TypeScript exports |
| `npm test` | فشل جزئياً | `InputField` نجح، `Dashboard` فشل |
| `npm audit --omit=dev --audit-level=moderate` | نجح | 0 vulnerabilities |
| `npx vite build --outDir "C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build"` | نجح | تحذيرات bundle و dynamic import |
| `git status --short -- "untitled"` | `?? untitled/` | لم يتم تعديل ملفات المشروع أثناء المراجعة |

---

## 3. قائمة المهام الواضحة

### P0 - أمان حرج

- [ ] إصلاح `supabase/functions/delete-account/index.ts`.
- [ ] منع CORS wildcard واستبداله بـ origin مصرح به.
- [ ] قراءة المستخدم من JWT بدلاً من قبول `userId` من body.
- [ ] منع حذف أي مستخدم غير مطابق للمستخدم الحالي.
- [ ] منع حذف الحسابات الإدارية.
- [ ] إضافة rate limit على endpoint.
- [ ] إضافة audit log أو سجل تحقق للحذف.
- [ ] إزالة رسائل الخطأ الداخلية من response.
- [ ] توثيق Edge Function في ملف منفصل أو قسم واضح.

### P1 - إصلاح build/test/typecheck/CI

- [ ] تصدير `createRateLimiter` من `src/hooks/useRateLimit.ts`.
- [ ] تصدير `RegisterInput` من `src/hooks/useAuthForm.ts` أو نقله إلى ملف types.
- [ ] إصلاح import في `tests/Dashboard.test.tsx` ليتوافق مع `named export`.
- [ ] تغيير `.github/workflows/ci.yml` من `npm run test:run` إلى `npm test`.
- [ ] تشغيل `npm run lint` حتى ينجح.
- [ ] تشغيل `npm test` حتى ينجح.
- [ ] تشغيل build مؤقت خارج المشروع والتأكد من عدم وجود أخطاء.

### P2 - توحيد Supabase schema

- [ ] تحديد الحقول النهائية لجدول `profiles`.
- [ ] مقارنة الحقول بين:
  - `supabase/migrations/001_init_profiles.sql`
  - `src/lib/supabase.ts`
  - `src/contexts/AuthContext.tsx`
  - `src/components/dashboard/Modals.tsx`
  - `src/schemas/auth.schema.ts`
  - seed data
  - التوثيق
- [ ] إنشاء migration جديد فقط إذا كانت هناك حقول مطلوبة فعلاً.
- [ ] تحديث TypeScript types.
- [ ] تحديث Zod schemas.
- [ ] تحديث Supabase client calls.
- [ ] تحديث seed data.
- [ ] إزالة تكرار تعريف `profiles` من `002_init_notifications.sql`.

### P3 - تحسين التوثيق

- [ ] تحديث `docs/supabase-setup.md` ليتوافق مع migrations الفعلية.
- [ ] إزالة أي تعليمات خاطئة حول `auth.admin.deleteUser` من client-side.
- [ ] إضافة قسم خاص بـ Edge Function حذف الحساب.
- [ ] إضافة متغيرات البيئة المطلوبة والسكربتات اللازمة.
- [ ] تحديث `DEPLOYMENT.md` ليشمل Edge Functions و Supabase secrets و Sentry DSN و Google OAuth.
- [ ] ملء `metadata.json` أو حذفه إذا كان غير مستخدم.

### P4 - تحسين الواجهات وإمكانية الوصول

- [ ] إضافة `prefers-reduced-motion` في `src/index.css`.
- [ ] إضافة صفحة 404.
- [ ] تحسين `InputField` لربط الخطأ بـ `aria-describedby`.
- [ ] تحسين modals بإضافة:
  - `aria-labelledby`
  - `aria-describedby`
  - focus trap
  - إغلاق بـ Escape
- [ ] تحسين dropdowns لتعمل بلوحة المفاتيح.
- [ ] إضافة label واضح لزر تبديل كلمة المرور.
- [ ] إضافة Storybook stories حقيقية للمكونات الأساسية.

### P5 - تحسين قابلية التوسع

- [ ] إنشاء طبقة `services/` لفصل عمليات Supabase عن components.
- [ ] توحيد error handling.
- [ ] إزالة dynamic import غير الضروري.
- [ ] تحليل bundle size وتقليل chunks.
- [ ] تحسين CSP بإزالة `unsafe-inline` قدر الإمكان.
- [ ] إضافة policies واضحة لأي جداول مستقبلية مثل `courses` و `groups`.

---

## 4. خطة تفصيلية للتنفيذ

### المرحلة 1: تثبيت الأساس الفني

**الهدف:** جعل المشروع قابلاً للتحقق الآلي قبل أي تحسينات أخرى.

**الأعمال:**

1. تصدير `createRateLimiter`.
2. تصدير `RegisterInput` أو نقله إلى ملف types.
3. إصلاح import في `Dashboard.test.tsx`.
4. إصلاح CI script.
5. تشغيل:

```bash
npm run lint
npm test
npx vite build --outDir "C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build"
```

**معايير القبول:**

- `npm run lint` ينجح.
- `npm test` ينجح.
- build ينجح بدون أخطاء.
- لا توجد أخطاء exports.

---

### المرحلة 2: معالجة مخاطر الأمان الحرجة

**الهدف:** منع حذف الحسابات بشكل غير مصرح.

**الأعمال:**

1. تعديل Edge Function حذف الحساب.
2. التحقق من JWT.
3. منع CORS wildcard.
4. منع حذف مستخدم غير مطابق.
5. إضافة rate limit.
6. إضافة audit log.
7. اختبار endpoint بسيناريوهات:
   - مستخدم عادي يحذف نفسه.
   - مستخدم يحاول حذف مستخدم آخر.
   - طلب بدون Authorization.
   - طلب من origin غير مصرح.

**معايير القبول:**

- لا يمكن حذف مستخدم بدون JWT.
- لا يمكن حذف مستخدم غير مطابق للـ JWT.
- لا توجد استجابة CORS wildcard.
- لا توجد أخطاء backend داخل response.

---

### المرحلة 3: توحيد Supabase schema

**الهدف:** إزالة التناقض بين schema والكود والتوثيق.

**الأعمال:**

1. مراجعة migrations.
2. مراجعة client calls.
3. مراجعة seed data.
4. تحديث types.
5. تحديث schemas.
6. إنشاء migration جديد فقط عند الحاجة.
7. إزالة تكرار تعريف `profiles` في `002`.

**معايير القبول:**

- كل حقول `profiles` موحدة بين الكود والـ schema والتوثيق.
- لا توجد queries تعتمد على حقول غير موجودة.
- seed data يعمل مع schema الفعلي.
- التوثيق لا يذكر حقولاً غير موجودة.

---

### المرحلة 4: تحسين التوثيق

**الهدف:** جعل التوثيق مرجعاً آمناً وقابلاً للتنفيذ.

**الأعمال:**

1. تحديث `docs/supabase-setup.md`.
2. إضافة قسم Edge Functions.
3. إضافة إعداد Supabase secrets.
4. إضافة إعداد Sentry DSN.
5. إضافة إعداد Google OAuth.
6. تحديث `DEPLOYMENT.md`.
7. ملء أو حذف `metadata.json`.

**معايير القبول:**

- التوثيق يطابق migrations والكود.
- لا توجد تعليمات تستخدم service role من client-side.
- Edge Function موثقة بالكامل.
- خطوات الإعداد قابلة للتكرار محلياً.

---

### المرحلة 5: تحسين الواجهات وإمكانية الوصول

**الهدف:** تحسين تجربة المستخدم وجعل الواجهة أكثر توافقاً مع accessibility.

**الأعمال:**

1. إضافة reduced motion.
2. إضافة صفحة 404.
3. تحسين modals accessibility.
4. تحسين form errors.
5. تحسين dropdown keyboard support.
6. إضافة stories حقيقية في Storybook.

**معايير القبول:**

- يمكن استخدام النماذج و modals بلوحة المفاتيح.
- رسائل الخطأ مرتبطة بحقولها.
- الحركة تحترم `prefers-reduced-motion`.
- يوجد fallback واضح للصفحات غير الموجودة.

---

### المرحلة 6: تحسين قابلية التوسع

**الهدف:** تجهيز المشروع للنمو دون فوضى معمارية.

**الأعمال:**

1. إنشاء `services/`.
2. نقل عمليات Supabase من components إلى services.
3. توحيد error handling.
4. تحسين CSP.
5. تحليل bundle.
6. إزالة dynamic import غير الضروري.
7. تحسين cache و invalidation.

**معايير القبول:**

- لا توجد عمليات Supabase مباشرة داخل components إلا في طبقة الخدمات.
- error handling موحد.
- CSP أكثر صرامة.
- bundle size أقل أو على الأقل مفهوم ومراقب.

---

## 5. ملفات مهمة يجب مراجعتها أو تعديلها لاحقاً

- `src/hooks/useRateLimit.ts`
- `src/hooks/useAuthForm.ts`
- `src/lib/rateLimit.ts`
- `src/pages/Register.tsx`
- `src/pages/Dashboard.tsx`
- `tests/Dashboard.test.tsx`
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/dashboard/Modals.tsx`
- `src/schemas/auth.schema.ts`
- `supabase/functions/delete-account/index.ts`
- `supabase/migrations/001_init_profiles.sql`
- `supabase/migrations/002_init_notifications.sql`
- `docs/supabase-setup.md`
- `DEPLOYMENT.md`
- `.github/workflows/ci.yml`
- `index.html`
- `src/index.css`

---

## 6. أوامر التحقق النهائية المقترحة

```bash
npm run lint
npm test
npx vite build --outDir "C:\Users\hozai\AppData\Local\Temp\kilo\svu-community-build"
npm audit --omit=dev --audit-level=moderate
```

---

## 7. ملاحظات مهمة

- لا يجب تشغيل build داخل مجلد المشروع مباشرة لأنه يولد `dist/`.
- لا يجب كشف قيم `.env.local`.
- `.env.example` فقط يجب أن يُشارك.
- أي تغيير على Supabase schema يجب أن يكون عبر migration جديد.
- لا يجب استخدام `SUPABASE_SERVICE_ROLE_KEY` من client-side أبداً.
