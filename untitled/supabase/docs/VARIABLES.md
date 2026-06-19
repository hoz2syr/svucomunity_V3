# متغيرات البيئة

## نظرة عامة

المشروع يستخدم Supabase مع متغيرات بيئة منقسمة إلى قسمين:
1. **متغيرات العميل** — مكشوفة في `.env.local` للواجهة الأمامية
2. **متغيرات الخادم** — محمية داخل Supabase Secrets للدوال والـ edge

---

## متغيرات العميل (`.env.local`)

| المتغير | مطلوب | المصدر | الاستخدام |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API | تهيئة عميل Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard → Settings → API | مصادقة العميل (محدودة الصلاحيات) |
| `VITE_GOOGLE_CLIENT_ID` | ❌ | Google Cloud Console → Credentials | تسجيل الدخول بحساب Google |

**التحقق من وجودها:**
```typescript
// src/lib/supabase.ts
hasSupabaseEnv(): boolean // يتحقق من URL + ANON_KEY
```

**أين تُستخدم:**
- `src/lib/supabase.ts` — تهيئة العميل
- `index.html` — Content-Security-Policy يسمح بـ `https://*.supabase.co`

---

## متغيرات الخادم (Supabase Secrets)

تُضبط عبر CLI وتُستخدم فقط في Edge Functions:

```bash
supabase secrets set KEY="value"
```

| المتغير | مطلوب | الاستخدام |
|---|---|---|
| `SUPABASE_URL` | ✅ | عنوان المشروع في Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | مفتاح الخدمة لحذف المستخدمين والوصول الكامل |
| `ALLOWED_ORIGINS` | ✅ | origins المسموح بها لـ CORS في `delete-account` |

**التحقق من وجودها:**
```typescript
// functions/delete-account/index.ts
if (!supabaseUrl || !serviceRoleKey) return 500;
```

---

## حيث تُستخدم كل دالة

| الدالة | المتغيرات |
|---|---|
| `useSupabaseClient()` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `loginWithGoogle()` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID` |
| `delete-account` (Edge Function) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS` |

---

## ملاحظات أمنية

| البند | الشرح |
|---|---|
| `SERVICE_ROLE_KEY` | **لا تضعه أبداً في `.env.local`** — يتجاوز كل RLS |
| `ANON_KEY` | آمن في العميل لأنه مقيد بـ RLS على الخادم |
| `config.toml` | لا يحتوي على مفاتيح، فقط إعدادات الهيكل |
