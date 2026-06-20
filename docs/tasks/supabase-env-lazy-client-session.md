# ملف الجلسة: تثبيت عميل Supabase عند نقص البيئة

## بيانات الجلسة

- **المشروع:** SVU Community Web
- **المسار:** `untitled/`
- **تاريخ الجلسة:** 2026-06-19
- **الحالة:** مكتملة
- **المهمة:** منع انهيار التطبيق عند نقص متغيرات Supabase

## المهمة المثبتة

عند تشغيل التطبيق بدون `.env.local` أو عند نقص:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

يجب ألا ينهار التطبيق أثناء تحميل الموديولات. يجب إنشاء عميل Supabase بطريقة lazy، ولا تظهر رسالة الخطأ إلا عند استدعاء عملية تحتاج Supabase فعلياً.

## النتيجة المنفذة

- تم تثبيت lazy client behavior في `src/lib/supabase.ts`.
- لم يعد يتم إنشاء Supabase client عند import.
- لا يرمي `getSupabaseClient()` خطأ إلا عند استدعاء عملية تحتاج Supabase.
- بقيت `hasSupabaseEnv()` آمنة للقراءة فقط.
- نُقلت عمليات Supabase إلى `src/services/**`.
- لم تعد pages/components تحتوي على Supabase calls مباشرة.
- أضيفت service tests لتغطية no-env behavior.

## ملفات مرتبطة

- `src/lib/supabase.ts`
- `src/services/auth.service.ts`
- `src/services/profile.service.ts`
- `src/services/notification.service.ts`
- `src/services/account.service.ts`
- `src/services/environment.service.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/AuthCallback.tsx`
- `src/components/shared/ForgotPasswordModal.tsx`
- `src/components/dashboard/**`
- `tests/supabase.test.ts`
- `tests/services/*.test.ts`
- `docs/business-rules.md`

## التحقق

```bash
npm run lint
npm run test
npm run build
```

النتيجة: جميع الأوامر نجحت.

## مخاطر تمت معالجتها

- لم يعد stub client يخفي فشل العمليات بصمت.
- لا تُقرأ session ولا تُعرض حالة نجاح وهمية عند نقص البيئة.
- لا يتم الاشتراك في `onAuthStateChange` عند نقص البيئة.
