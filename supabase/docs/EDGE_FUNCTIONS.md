# Edge Functions — `delete-account`

## نظرة عامة

دالة خادمية على Supabase تحذف حساب المستخدم شخصياً. لا يمكن تنفيذ الحذف مباشرة من العميل لأنها تتطلب `service_role` key.

---

## الاستدعاء من الواجهة

```typescript
// src/services/account.service.ts
const { error: fnError } = await client.functions.invoke('delete-account');
```

```typescript
// src/lib/supabase.ts —也是最
const { error: fnError } = await client.functions.invoke('delete-account');
```

**Trigger:** مستخدم يضغط على "حذف الحساب" → يكتب اسم المستخدم للتأكيد → تُستدعى الدالة.

---

## المدخلات (Input)

| الحقل | المصدر | الوصف |
|---|---|---|
| `Authorization` header | العميل | `Bearer <JWT>` token من Supabase |
| `x-forwarded-for` header | Supabase Gateway | عنوان IP للعميل |
| `user-agent` header | المتصفح | User-Agent string |
| `Origin` header | المتصفح | For CORS check |

---

## المخرجات (Output)

| الحالة | HTTP Code | الاستجابة |
|---|---|---|
| نجاح | 200 | `{ "ok": true }` |
| بدون JWT | 401 | `{ "error": "Unauthorized" }` |
| JWT غير صالح | 401 | `{ "error": "Unauthorized" }` |
| Origins غير مسموح | 403 | `{ "error": "Forbidden origin" }` |
| مستخدم مسؤول | 403 | `{ "error": "Forbidden" }` |
| كثرة الطلبات | 429 | `{ "error": "Too many requests" }` |
| خطأ في الإعدادات | 500 | `{ "error": "Server configuration error" }` |
| فشل حذف الملف | 500 | `{ "error": "Profile deletion failed" }` |
| فشل حذف الحساب | 500 | `{ "error": "Account deletion failed" }` |

---

## Rate Limit

```typescript
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 دقيقة
const RATE_LIMIT_MAX_ATTEMPTS = 3;    // 3 محاولات كحد أقصى
```

**المشكلة:** يتم تخزين العداد في `Map` في الذاكرة (في هذه الدالة). لا ينجح في بيئة production مع عدة instances لأن:
- كل instance له `Map` منفصل
- عند إعادة تشغيل الدالة يُفقد العداد

**الحل المقترح (غير مطبق):** استخدام جدول `rate_limits` أو Redis.

---

## CORS

```typescript
const ALLOWED_ORIGINS = "http://localhost:3000"; // من config.toml
```

- تُقرأ من متغير البيئة `ALLOWED_ORIGINS`
- تدعم عدة origins مفصولة بفاصلة
- تُستجيب لـ `OPTIONS` بـ 204

---

## CORS

```typescript
const ALLOWED_ORIGINS = "http://localhost:3000"; // من config.toml
```

- تُقرأ من متغير البيئة `ALLOWED_ORIGINS`
- تدعم عدة origins مفصولة بفاصلة
- تُستجيب لـ `OPTIONS` بـ 204

---

## Audit Log

عند نجاح الحذف، تُسجل العملية في `admin_audit_log`:

```typescript
{
  caller_id: user.id,
  action: "delete_account",
  payload: {
    auth_provider: "google" | "email",
    ip_address: "x.x.x.x",
    user_agent: "Mozilla/5.0..."
  },
  ip_address: "x.x.x.x",
  user_agent: "Mozilla/5.0..."
}
```

**ملاحظة:** `.catch(() => undefined)` يتجاهل فشل الإدراج صمتاً — خطأ أمني.

---

## المتغيرات المطلوبة

| المتغير | المصدر | الوصف |
|---|---|---|
| `SUPABASE_URL` | Supabase secrets | عنوان المشروع |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets | مفتاح الخدمة (لا يُظهر للعميل) |
| `ALLOWED_ORIGINS` | Supabase secrets | Origins المسموح بها لـ CORS |

**ضبطها:**
```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_KEY"
supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,https://your-domain.com"
```

---

## التبعيات

```
https://deno.land/std@0.168.0/http/server.ts
https://esm.sh/@supabase/supabase-js@2
```

## الأمان

| البند | الحالة |
|---|---|
| التحقق من JWT | ✅ عبر `supabaseAdmin.auth.getUser()` |
| تقييد المعدل | ⚠️ فعال فقط في instance واحدة |
| CORS | ✅ origins محددة |
| منع الإداريين | ✅ `isAdminUser()` يستعلم من `profiles.role` بصلاحيات `service_role` |
| Audit logging | ⚠️ فشل الإدراج يُسجل في `console.error` ويُتابع التنفيذ |
