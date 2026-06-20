# إعداد مشروع Supabase

## الحالة

هذا الملف يوثّق خطوات الإعداد العامة. حالة الإنتاج الحالية ما زالت غير مكتملة حتى تُغلق مراحل RLS/migrations و Edge Functions في `docs/tasks/10-production-readiness-plan.md`.

---

## 1. إنشاء المشروع

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً.
2. اختر المنطقة الأقرب للمستخدمين.
3. احفظ:
   - `Project URL`
   - `anon public` key
   - `service_role` key في مكان سري خارج المتصفح

> لا تضع `service_role` key في `.env.local` أو في أي كود يعمل داخل المتصفح.

---

## 2. تشغيل Migrations

من جذر المستودع:

```bash
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

المigrations الحالية:

- `001_init_profiles.sql`: جدول `profiles` الأساسي وRLS.
- `002_init_notifications.sql`: جدول `notifications` وRLS.
- `003_add_profile_identity_fields.sql`: حقول تعريف الحساب، سياسة حذف profile، وجداول audit/rate limit.

---

## 3. تفعيل Google OAuth

1. افتح المشروع في **Supabase Dashboard**.
2. اذهب إلى **Authentication → Providers**.
3. فعّل **Google**.
4. أنشئ عميل OAuth في [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://svu-community.pages.dev` (أو domain تاعك)
   - Authorized redirect URIs: `https://<project-id>.supabase.co/auth/v1/callback`
   - انسخ `Client ID` و `Client Secret`
5. عُد لـ Supabase Dashboard → **Authentication → Providers → Google**:
   - **Enabled**: ✅ Yes
   - الصق `Client ID` و `Client Secret`
   - احفظ
6. أضف `VITE_GOOGLE_CLIENT_ID` في Cloudflare Pages → Settings → Environment Variables

---

## 4. إعداد RLS

لا تنسخ SQL يدوياً من التوثيق القديم. اعتمد على migrations الموجودة في:

```txt
supabase/migrations/
```

المهم أن تكون السياسات التالية موجودة:

- المستخدم يقرأ profile الخاص به فقط.
- المستخدم يحدّث profile الخاص به فقط.
- المستخدم يحذف profile الخاص به فقط.
- المستخدم يقرأ/يحدّث/ينشئ notifications الخاصة به فقط.

---

## 5. Edge Function: delete-account

### 5.1 الهدف

الدالة موجودة في:

```txt
supabase/functions/delete-account/index.ts
```

الوظيفة:

- تتلقى طلب `POST` فقط.
- تقرأ المستخدم من JWT المرفق في `Authorization`.
- لا تقبل `userId` من body.
- تمنع المستخدم من حذف حساب مستخدم آخر.
- تمنع حذف الحسابات التي تحمل role = `admin` أو `administrator` في metadata.
- تحذف profile أولاً ثم تحذف auth user.
- تكتب audit log في `admin_audit_log`.
- تطبق rate limit داخلياً.

### 5.2 المتغيرات السرية للدالة

اضبطها عبر Supabase CLI، وليس عبر `.env.local`:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"
```

للتطوير المحلي يمكن إضافة origins المحلية فقط في بيئة التطوير:

```bash
supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

> لا تستخدم `*` في `ALLOWED_ORIGINS` للإنتاج.

### 5.3 نشر الدالة

```bash
supabase functions deploy delete-account --project-ref YOUR_PROJECT_ID
```

### 5.4 اختبار آمن

لا يوجد اختبار آمن بدون JWT صالح. الاختبار الصحيح يتطلب مستخدماً مسجلاً، ثم استدعاء الدالة بالـ JWT الخاص به.

مثال مفاهيمي:

```bash
curl -X POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/delete-account" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Origin: https://your-domain.com"
```

لا ترسل `userId` في body.

### 5.5 سلوك الأخطاء

الدالة لا ترجع تفاصيل backend أو service errors للعميل. الأخطاء العامة المقبولة:

- `Unauthorized`
- `Forbidden`
- `Too many requests`
- `Account deletion failed`

---

## 6. متغيرات بيئة الواجهة

### 6.1 في GitHub Secrets (ل CI/CD)
أضف في GitHub → Settings → Secrets and variables → Actions:

| Secret | القيمة | من أين |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | public/anon key | Supabase Dashboard → Settings → API |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Google Cloud Console → Credentials |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard → Home |
| `SUPABASE_ACCESS_TOKEN` | Supabase Personal Access Token | Supabase → Account → Access Tokens |

### 6.2 في Cloudflare Pages (للـ Build)
أضف في Cloudflare Dashboard → Pages → svu-community → Settings → Environment Variables:

| Variable | القيمة |
|---|---|
| `VITE_SUPABASE_URL` | نفس القيمة في GitHub Secrets |
| `VITE_SUPABASE_ANON_KEY` | نفس القيمة في GitHub Secrets |
| `VITE_GOOGLE_CLIENT_ID` | نفس القيمة في GitHub Secrets |

> **ملاحظة:** المتغيرات `VITE_*` تُقرأ من GitHub Secrets أثناء الـ Build في CI، ومن Cloudflare Dashboard كاحتياط إضافي.

### 6.3 محلياً (للتطوير)
انسخ `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

املأ:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

لا تضع هذه القيم في Git:
- `.env.local`
- `service_role key`
- Google Client Secret

---

## 7. حقول profiles

الـ schema النهائي بعد migrations:

- `id`
- `full_name`
- `avatar_url`
- `phone`
- `email`
- `username`
- `role`
- `provider`
- `provider_id`
- `created_at`
- `updated_at`

الكود يجب أن يستخدم هذه الحقول فقط. لا تستخدم حقولاً قديمة مثل `name` أو `user_name` إلا إذا أضيفت migration جديدة.

---

## 8. ملاحظات أمان

- `anon key` يمكن وضعه في الواجهة لأنه مقيد بـ RLS.
- `service_role key` ممنوع استخدامه في المتصفح.
- أي عملية حساسة مثل حذف الحساب يجب أن تتم عبر Edge Function.
- لا تعتمد على rate limit في المتصفح فقط لأنه قابل للتجاوز.
- لا تكشف أخطاء Supabase الداخلية في response.
