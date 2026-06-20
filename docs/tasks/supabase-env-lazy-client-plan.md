# خطة المهمة: تثبيت عميل Supabase عند نقص متغيرات البيئة

## الحالة

مكتملة.

## الهدف

منع انهيار التطبيق عند تشغيل المشروع بدون ملف `.env.local` أو عند نقص المتغيرات:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

يجب أن يبقى التطبيق قابلاً للتحميل، مع إظهار حالة واضحة للمستخدم عند محاولة استخدام أي ميزة تعتمد على Supabase.

## المشكلة الأصلية

الملف المعني:

- `src/lib/supabase.ts`

النقاط الحرجة التي كانت موجودة سابقاً:

- `getSupabaseClient()` كان يرمي الخطأ عند نقص البيئة.
- إنشاء client عند تحميل الموديول كان يمكن أن يسبب crash.
- الاعتماد المباشر على `supabase` في pages/components كان قد يسبب فشل التطبيق قبل الوصول إلى `AuthContext`.

## نطاق العمل المنفذ

### ملفات تم تعديلها/إنشاؤها

- `src/lib/supabase.ts`
- `src/services/auth.service.ts`
- `src/services/profile.service.ts`
- `src/services/notification.service.ts`
- `src/services/account.service.ts`
- `src/services/environment.service.ts`
- `src/services/index.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/AuthCallback.tsx`
- `src/components/shared/ForgotPasswordModal.tsx`
- `src/components/dashboard/**`
- `tests/supabase.test.ts`
- `tests/services/*.test.ts`

## خطوات التنفيذ المنفذة

1. تحديث `src/lib/supabase.ts`
   - أزيل أي إنشاء فوري لـ Supabase client.
   - أصبح `getSupabaseClient()` lazy.
   - لا يرمي الخطأ عند import.
   - يظهر الخطأ فقط عند استدعاء دالة تحتاج Supabase فعلياً.
   - بقيت `hasSupabaseEnv()` دالة آمنة لا ترمي خطأ.

2. تحديث طبقة المصادقة
   - `AuthContext` يتحقق من `hasSupabaseEnv()` قبل استدعاء أي دالة Supabase.
   - عند نقص البيئة لا يتم الاشتراك في `onAuthStateChange`.
   - لا تُقرأ session ولا تُعرض حالة نجاح وهمية.

3. تحديث واجهات المستخدم
   - تسجيل الدخول، إنشاء الحساب، استعادة كلمة المرور، حذف الحساب، حفظ الملف الشخصي، وتحديث كلمة المرور تمر عبر services.
   - عند نقص البيئة تظهر رسالة واضحة عبر service result.

4. تحديث الدوال المساعدة
   - `loginWithPassword`
   - `registerWithEmail`
   - `signInWithGoogle`
   - `completeAuthCallback`
   - `resetPassword`
   - `fetchProfile`
   - `updateProfile`
   - `updatePassword`
   - `fetchNotifications`
   - `signOut`
   - `deleteOwnAccount`

   جميعها تتعامل مع نقص البيئة بطريقة قابلة للتنبؤ.

5. إضافة اختبارات
   - استيراد `src/lib/supabase.ts` بدون `.env.local` لا يسبب crash.
   - `hasSupabaseEnv()` ترجع `false` عند نقص المتغيرات.
   - استدعاء `getSupabaseClient()` بدون بيئة يعطي الخطأ المتوقع.
   - services لا تنجح بصمت عند نقص البيئة.

## معايير القبول

- [x] التطبيق يعمل بدون `.env.local`.
- [x] لا يوجد crash عند تحميل أي صفحة.
- [x] أي إجراء يحتاج Supabase يعرض رسالة واضحة للمستخدم.
- [x] لا توجد عمليات Supabase وهمية تنجح بصمت.
- [x] الكود متوافق مع TypeScript strict mode.
- [x] اختبار يثبت أن import `supabase.ts` آمن بدون `.env.local`.
- [x] service tests تغطي no-env behavior.

## غير مشمول

- تغيير بنية Supabase أو إضافة migration جديدة.
- تغيير منطق Auth الأساسي إلا بالقدر اللازم لمنع crash.
- إضافة ميزات جديدة خارج تثبيت التعامل مع نقص البيئة.

## التحقق

```bash
npm run lint
npm run test
npm run build
```

النتيجة: جميع الأوامر نجحت.
