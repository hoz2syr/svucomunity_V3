# Edge Functions

## الحالة الحالية

`delete-account` موجودة لكنها **ليست جاهزة للإنتاج بالكامل**. يجب التعامل معها ضمن المرحلة الخلفية من خطة جاهزية الإنتاج، وليس كأنها feature مكتملة.

## delete-account

**المسار:** `supabase/functions/delete-account/index.ts`

### فجوات الإنتاج قبل الاعتماد عليها

- الحذف غير atomic.
- audit log لا يجب أن يعتمد على `catch(() => undefined)`.
- rate limit الحالي مبني على `Map` في الذاكرة وليس persistent storage.
- admin detection لا يجب أن يعتمد على `user_metadata` فقط.
- يجب اختبار السيناريوهات الحساسة قبل النشر.

### الوظيفة

تتعامل الدالة مع حذف الحساب بشكل آمن من خلال:

1. قبول `POST` فقط.
2. التحقق من `Authorization: Bearer <JWT>`.
3. قراءة المستخدم من JWT عبر Supabase Admin API.
4. منع حذف مستخدم آخر.
5. منع حذف الحسابات الإدارية.
6. حذف `profiles`.
7. حذف `auth.users`.
8. تسجيل audit event في `admin_audit_log`.
9. تطبيق rate limit داخلي.

### المتغيرات السرية

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set ALLOWED_ORIGINS="https://your-domain.com"
```

### النشر

```bash
supabase functions deploy delete-account --project-ref YOUR_PROJECT_ID
```

### الاختبار

لا ترسل `userId` في body. استخدم JWT المستخدم الحالي:

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-account" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Origin: https://your-domain.com"
```

### سيناريوهات يجب اختبارها

- مستخدم عادي يحذف حسابه: يجب أن ينجح.
- مستخدم يحاول حذف حساب آخر: غير ممكن لأن الدالة لا تقبل userId.
- طلب بدون Authorization: يجب أن يرجع `401`.
- طلب من origin غير مصرح: يجب أن يرجع `403`.
- أكثر من 3 محاولات خلال دقيقة من نفس origin/IP: يجب أن يرجع `429`.
- مستخدم بـ `user_metadata.role=admin`: يجب أن يرجع `403`.
