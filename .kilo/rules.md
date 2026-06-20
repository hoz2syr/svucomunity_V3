# قواعد العمل الآمنة — `.kilo/rules.md`

## 1. لا تكسر القواعد العليا

هذه القواعد مكملة لقواعد:

```txt
C:\Users\hozai\projects\svu community v3.0.0_cleantree\AGENTS.md
```

وخاصة:
- لا تكشف secrets.
- لا تعدل auth/session/RBAC إلا لإصلاح خلل مثبت.
- لا تعدل migrations إلا عند الحاجة.
- لا تغيّر logic دون tests.

---

## 2. لا خلط بين production و Storybook

ممنوع:

```txt
src/components/** -> src/stories/**
src/pages/** -> src/stories/**
src/features/** -> src/stories/**
```

مسموح:

```txt
src/stories/** -> src/components/**
src/stories/** -> src/features/**/components/**
src/stories/** -> src/features/**/services/**
```

`src/stories/**` يحتوي فقط على:
- `.stories.tsx`
- `.stories.ts`
- `.mdx`
- decorators
- mocks
- fixtures
- README توثيقي

---

## 3. لا Supabase مباشرة من UI

ممنوع داخل pages/components/hooks العامة:

```ts
import { getSupabaseClient } from '../lib/supabase';
```

الصحيح:
- pages تستخدم services أو feature hooks
- components تستقبل data/actions عبر props
- feature hooks تستدعي services
- services تستدعي `src/lib/supabase.ts`

---

## 4. Lazy Supabase rule

لا تنشئ Supabase client عند import.

لا ترمِ خطأ عند import.

لا تظهر رسالة الخطأ إلا عند تنفيذ عملية تحتاج Supabase.

عند نقص البيئة:
- لا تقرأ session
- لا تنشئ profile وهمي
- لا تعرض نجاحاً وهمياً
- لا تنفذ Edge Function
- لا توجه إلى protected route

---

## 5. حدود الملفات

### `src/pages/**`
تسمح فقط بـ:
- page state
- route state
- modal open/close state
- composition
- calling feature hooks/services

لا تسمح بـ:
- raw Supabase calls
- large business logic
- reusable UI that belongs in components
- feature-specific services logic

### `src/components/**`
تسمح فقط بـ:
- presentation
- local UI state
- controlled inputs
- accessibility
- reusable UI

لا تسمح بـ:
- Supabase calls مباشرة
- Storybook imports
- production mocks
- business logic كبير

### `src/features/**`
تسمح بـ:
- feature components
- feature hooks
- feature services
- feature types

لا تسمح بـ:
- global app routing
- unrelated feature logic

### `src/services/**`
تسمح فقط بـ:
- API/service functions
- Supabase operations
- error normalization
- typed results

لا تسمح بـ:
- React components
- JSX
- UI state

### `src/stores/**`
تسمح فقط بـ:
- global UI state
- lightweight notification UI state

لا تسمح بـ:
- Supabase calls
- business logic كبير

---

## 6. قواعد الاختبار

أي تغيير في logic يحتاج اختبار.

أي تغيير في Supabase behavior يحتاج test يثبت:
- import آمن
- no-env behavior صحيح
- operation لا تنجح بصمت عند نقص البيئة

أي تغيير في component رئيسي يحتاج test أو story.

أي تغيير في page flow يحتاج test إذا كان flow موجوداً مسبقاً.

لا تُكتب اختبارات لكل مكون بشكل آلي؛ الاختبار يكون للflows الحرجة والمكونات ذات السلوك المهم.

## 6.1 حدود التعقيد

- الواجهة الأمامية يجب أن تكون واضحة وقابلة للتعديل.
- حالات الخطأ والنجاح والتحميل تُضاف فقط عند الحاجة الفعلية.
- طبقة العميل تخدم UX و no-env behavior، وليست طبقة أمان.
- لا تعتمد على rate limit أو authorization في المتصفح فقط.
- RLS والمigrations والـ Edge Functions تحتاج اختبارات وتوثيق أقوى لأنها طبقة الخادم.

---

## 7. قواعد التحقق

قبل إعلان اكتمال أي مهمة غير تافهة:

1. شغّل:
   ```bash
   npm run lint
   ```
2. إذا تغيّر UI أو build files، شغّل:
   ```bash
   npm run build
   ```
3. إذا تغيّر logic أو tests، شغّل:
   ```bash
   npm run test
   ```
4. إذا تغيّر Storybook أو components UI، شغّل:
   ```bash
   npm run build-storybook
   ```

إذا فشل تحقق موجود مسبقاً لأسباب خارج نطاق المهمة:
- وثّق الفشل في ملف الجلسة.
- لا تخفِ الفشل.
- لا تعدل نطاقاً آخر لإخفاء الفشل.

---

## 8. قواعد الكتابة

- اكتب أسماء ملفات واضحة بالإنجليزية.
- لا تستخدم أسماء ملفات عربية في `src`.
- لا تستخدم أحرف Unicode غير عادية في أسماء الملفات.
- لا تضيف comments في code إلا إذا كانت ضرورية لفهم security/safety behavior.
- لا تضف TODOs طويلة. استخدم ملفات المهام.

---

## 9. قواعد الحذف

قبل حذف ملف:
1. تأكد أنه غير مستخدم.
2. ابحث عن imports له.
3. وثّق السبب في ملف الجلسة.
4. لا تحذف docs أو tests دون سبب واضح.

---

## 10. قواعد الجلسات

كل مهمة تنفيذية يجب أن يكون لها ملف جلسة في:

```txt
.kilo/sessions/
```

كل جلسة يجب أن تحتوي على:
- الهدف
- النطاق
- الملفات المرتبطة
- الخطوات
- التحقق
- النتيجة
- المخاطر

كل مهمة يجب أن تكون موجودة في:

```txt
docs/tasks/master-task-list.md
```

---

## 11. شرط استخدام المهارات

استخدم مهارة فقط إذا كانت تطابق المهمة بوضوح.

لا تستخدم مهارات marketing أو business أو deployment إلا إذا طلب المستخدم ذلك.

لا تستخدم skills لتبرير تغيير معماري خارج النطاق.

لا تستخدم skills لقراءة ملفات كثيرة إذا كان Read/Grep/Task كافياً.

---

## 12. قاعدة عدم المفاجأة

لا تقم بـ:
- تغيير dependencies
- حذف Storybook بالكامل
- إعادة كتابة dashboard دفعة واحدة
- تعديل migrations
- تغيير auth/session behavior
- تغيير deployment config

إلا إذا كان ذلك مذكوراً صراحة في ملف المهمة أو طلب المستخدم.
