# إصلاح مشكلة عدم ثبات نشر الاختبارات بسبب انتهاء الجلسة

**التاريخ:** 2026-06-24  
**المشكلة:** نشر الاختبار يفشل دائماً حتى بعد تسجيل دخول ناجح، ويطلب إعادة تسجيل الدخول في كل محاولة.

## الأسباب المحتملة

1. انتهاء صلاحية الجلسة (JWT access token) قبل إتمام عملية النشر
2. عدم تجديد الجلسة تلقائياً في AuthContext عند اقتراب انتهاء الصلاحية
3. عدم وجود منطق إعادة محاولة (retry) بعد تجديد الجلسة عند فشل operations بـ 401
4. عدم التحقق من الجلسة الحالية قبل توجيه المستخدم لصفحة تسجيل الدخول

## الملفات المعدلة

### 1. `src/lib/supabase.ts`
- إضافة `getCurrentSession()` للتحقق من الجلسة الحالية
- إضافة `refreshCurrentSession()` / `refreshSession()` لتجديد الجلسة يدوياً
- تصدير `Session` type للاستخدام في الدوال الجديدة

### 2. `src/services/environment.service.ts`
- إعادة تصدير `refreshSession` و `getCurrentSession` من `supabase.ts` عبر طبقة الخدمة

### 3. `src/contexts/AuthContext.tsx`
- إضافة `refreshingRef` لمنع عمليات التجديد المتزامنة المتعددة
- إضافة useEffect يقوم بتجديد الجلسة تلقائياً عندما تصبح `sessionExpiring = true` (أي قبل 5 دقائق من انتهاء الصلاحية)

### 4. `src/features/exam/src/hooks/useTestCreator.ts`
- في `handlePublish`: قبل توجيه المستخدم لتسجيل الدخول عند absence of `uid`, يتم استدعاء `getCurrentSession()` لمحاولة استعادة الجلسة
- إذا نجح الاسترداد، يتم المتابعة بعملية النشر بدون إعادة توجيه

### 5. `src/features/exam/src/hooks/useCoreSavedTests.ts`
- في `handlePublish`: إذا كان `userId` مفقوداً، تتم محاولة استعادة الجلسة عبر `getCurrentSession()` قبل السقوط في التخزين المحلي فقط
- إذا نجح الاسترداد، يتم استخدام `supabaseStorage` بدلاً من `localStorageTestStorage`

### 6. `src/features/exam/src/services/exam.supabase.ts`
- في `upsertTestToSupabase`: إضافة منطق إعادة محاولة تلقائي عند الحصول على خطأ مصادقة (401 / JWT expired / invalid token)
- في `deleteTestFromSupabase`: نفس المنطق لحماية عمليات الحذف من فشل انتهاء الجلسة

### 7. `.github/workflows/ci.yml` + Edge Functions CORS
- تعديل `getAllowedOrigin` في جميع Edge Functions (`auth-login`, `auth-register`, `delete-account`, `rate-test`, `study-groups`) لقبول أصول `*.pages.dev` تلقائياً
- هذا يدعم عمليات النشر المعاينة (preview deployments) على Cloudflare Pages دون الحاجة لتعديل `ALLOWED_ORIGINS` في كل مرة

## الاختبارات المحدثة

### `tests/features/exam/hooks/useTestCreator.test.ts`
- تحديث mock `@/src/lib/supabase` لتشمل `getCurrentSession`
- إضافة اختبار: `redirects to login when user is not authenticated and session is not refreshable`
- إضافة اختبار: `uses refreshed session when local session is missing but getCurrentSession succeeds`

## النتيجة

- النشر الآن يستمر就算 لو كانت الجلسة منتهية تقريباً: يتم تجديدها تلقائياً
- إذا فشل التجديد التلقائي، يحاول الكود استرداد الجلسة مرة أخري قبل إعادة توجيه المستخدم
- عمليات الكتابة إلى Supabase تعيد المحاولة تلقائياً بعد تجديد الجلسة عند فشل 401
- عمليات النشر المعاينة على Cloudflare Pages لم تعد تعاني من مشاكل CORS
