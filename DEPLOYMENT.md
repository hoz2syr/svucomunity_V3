# SVU Community - توثيق الإعداد والنشر

## 1. المتطلبات الأساسية

- حساب Supabase (مجاني أو مدفوع)
- حساب Cloudflare Pages
- مستودع GitHub مربوط بـ Cloudflare Pages

---

## 2. إعداد Supabase

### 2.1 إنشاء مشروع جديد
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروعاً جديداً باسم `svu-community`
3. احفظ:
   - `Project URL`
   - `anon public` key

### 2.2 تشغيل Migrations
تأكد من تشغيل جميع migrations من `supabase/migrations/`، بما فيها `003_add_profile_identity_fields.sql`.

الطريقة الآلية (عبر CI):
- عند كل push لـ `master`، job `deploy-supabase` في `.github/workflows/ci.yml` ينشر migrations تلقائيًا.

الطريقة اليدوية (إذا احتجت):
```bash
# من مجلد المشروع الرئيسي
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

### 2.3 إضافة بيانات أولية (Seed)
```bash
supabase db seed
```

### 2.4 تفعيل المصادقة
1. اذهب إلى **Authentication → Providers**
2. فعّل **Email**:
   - ✅ Confirm email (موصى به للإنتاج)
   - ✅ Secure email change
   - Site URL: `https://svu-community.pages.dev` (أو domain تاعك)
   - Redirect URLs: `https://<project-id>.supabase.co/auth/v1/callback`
3. فعّل **Google OAuth**:
   - أنشئ عميل OAuth في [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://svu-community.pages.dev`
   - Authorized redirect URIs: `https://<project-id>.supabase.co/auth/v1/callback`
   - انسخ `Client ID` و `Client Secret`
   - عُد لـ Supabase → Authentication → Providers → Google
   - الصق `Client ID` و `Client Secret` → احفظ

### 2.5 تفعيل RLS Policies
تأكد من تنفيذ migrations التالية في Supabase SQL Editor (أو عبر CI كما في 2.2):

```sql
-- جدول profiles بعد migrations 001 و 003
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  provider TEXT NOT NULL DEFAULT 'email',
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);
```

### 2.6 إنشاء Trigger لحذف تلقائي
```sql
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_delete_user();
```

---

## 3. نشر Edge Function: delete-account

راجع التوثيق التفصيلي في `docs/edge-functions.md`.

### 3.1 المتغيرات السرية
لا تضع `SUPABASE_SERVICE_ROLE_KEY` في `.env.local` أو في كود المتصفح.

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set ALLOWED_ORIGINS="https://svu-community.pages.dev"
```

للتطوير المحلي:
```bash
supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

> لا تستخدم `*` في `ALLOWED_ORIGINS` للإنتاج.

### 3.2 نشر الدالة
```bash
supabase functions deploy delete-account --project-ref YOUR_PROJECT_ID
```

### 3.3 التحقق من السلوك
- لا تقبل الدالة `GET`.
- لا تقبل `userId` من body.
- تقرأ المستخدم من JWT فقط.
- تمنع حذف مستخدم آخر.
- تمنع حذف الحسابات الإدارية.
- تسجل عملية الحذف في `admin_audit_log`.
- تطبق rate limit داخلياً.

---

## 4. إعداد متغيرات البيئة

### 4.1 في GitHub Secrets (للـ CI/CD)
أضف في GitHub → Settings → Secrets and variables → Actions:

| Secret | القيمة | من أين |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | public/anon key | Supabase Dashboard → Settings → API |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Google Cloud Console → Credentials |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard → Home |
| `SUPABASE_ACCESS_TOKEN` | Supabase Personal Access Token | Supabase → Account → Access Tokens |

### 4.2 في Cloudflare Pages (للـ Build كاحتياط)
أضف في Cloudflare Dashboard → Pages → svu-community → Settings → Environment Variables:

| Variable | القيمة |
|---|---|
| `VITE_SUPABASE_URL` | نفس القيمة في GitHub Secrets |
| `VITE_SUPABASE_ANON_KEY` | نفس القيمة في GitHub Secrets |
| `VITE_GOOGLE_CLIENT_ID` | نفس القيمة في GitHub Secrets |

### 4.3 محلياً (للتطوير)
```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

**⚠️ تنبيه أمني:**
- لا ترفع `.env.local` إلى Git (مذكور في `.gitignore`)
- استخدم `VITE_*` فقط للمتغيرات العامة (مرئية في المتصفح)
- `SERVICE_ROLE_KEY` ممنوع استخدامه في العميل

---

## 5. بناء ونشر الواجهة (Cloudflare Pages)

### 5.1 البنية التحتية
النشر يتم تلقائيًا عبر GitHub Actions عند كل push لـ `master`:

| Workflow | الوظيفة |
|---|---|
| `.github/workflows/ci.yml` | lint + typecheck + test + build + deploy Supabase migrations |
| `.github/workflows/deploy-web.yml` | build + deploy إلى Cloudflare Pages |

### 5.2 البناء محلياً (للتحقق)
```bash
npm install --force
npm run build
```

### 5.3 الإعدادات في Cloudflare Pages
1. اربط المستودع: `hoz2syr/svucomunity_V3`
2. Branch: `master`
3. Build command: `npm run build`
4. Build output: `dist`
5. أضف الـ Environment Variables كما في القسم 4.2

> **ملاحظة:** لا تبني على Node.js 20 — استخدم Node.js 22 أو أعلى. CI معد ليعمل مع `npm install --force` لحل مشكلة Rollup native module على Linux.

---

## 6. التحقق من النشر

### 6.1 فحوصات TypeScript
```bash
npm run lint
npm run typecheck
```

### 6.2 فحوصات البناء
```bash
npm run build
# تحقق من عدم وجود أخطاء في dist/
```

### 6.3 اختبار الوظائف يدوياً
1. افتح `https://svu-community.pages.dev`
2. سجّل حساب جديد → تحقق من وصول بريد التأكيد
3. سجّل دخول عبر Google → تحقق من التوجيه إلى `/dashboard`
4. اختبر زر حذف الحساب → تحقق من نجاح العملية
5. اختبر زر نسيت كلمة المرور → تحقق من وصول الرابط

---

## 7. المشاكل الشائعة والحلول

### 7.1 خطأ "Missing Supabase environment variables"
**السبب:** `.env.local` غير موجود أو غير مكتمل، أو `VITE_*` غير مضبوط في Cloudflare/GitHub  
**الحل:**
```bash
# تحقق من وجود الملف محلياً
ls .env.local

# تحقق من المتغيرات في Cloudflare Dashboard
# Pages → svu-community → Settings → Environment Variables
```

### 7.2 خطأ "Invalid login credentials"
**السبب:** البريد غير مؤكد أو كلمة المرور خاطئة  
**الحل:**
- فعل **Confirm email** في Supabase
- تحقق من Redirect URL صحيح في Supabase Dashboard → Authentication → URL Configuration

### 7.3 خطأ Cloudflare 401 "Authentication error"
**السبب:** `CLOUDFLARE_API_TOKEN` في GitHub Secrets غير صالح أو منتهي  
**الحل:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. أنشئ Token جديد بصلاحية **Cloudflare Pages > Edit**
3. حدث `CLOUDFLARE_API_TOKEN` في GitHub Secrets

### 7.4 خطأ "Unsupported provider: provider is not enabled"
**السبب:** Google Provider غير مفعل في Supabase  
**الحل:**
1. Supabase Dashboard → Authentication → Providers → Google
2. ✅ Enabled = Yes
3. أضف Client ID + Client Secret من Google Cloud Console

### 7.5 خطأ TypeScript `published does not exist in type 'TestModel'`
**السبب:** الحقل `published` موجود في قاعدة البيانات لكن مفقود من `TestModel`  
**الحل:** تم الإصلاح في `src/features/exam/src/types.ts` بإضافة `published?: boolean`

### 7.6 Build يفشل على Linux بسبب Rollup
**السبب:** Rollup optional dependency bug على Ubuntu runners  
**الحل:** استخدم `npm install --force` بدلاً من `npm ci` في CI workflows

---

## 8. الأمان

### 8.1 متغيرات البيئة
- ✅ استخدم `VITE_*` فقط للقيم العامة (مُررة من GitHub Secrets للـ Build)
- ❌ لا تستخدم `SERVICE_ROLE_KEY` في الكود الأمامي
- ✅ فعّل RLS على جميع الجداول
- ✅ مفاتيح `VITE_*` موجودة في GitHub Secrets و Cloudflare Dashboard فقط

### 8.2 RLS Policies
تأكد من عدم وجود Policies مفتوحة:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'courses', 'groups');
```

### 8.3 Auth Security Check في CI
الـ workflow `ci.yml` يحتوي على job `security-check` يمنع تسريب أسرار للعميل:
```bash
# يرفض Build إذا وجد SERVICE_ROLE_KEY أو Gemini/Resend API Keys في الكود
```

---

## 9. الصيانة المستقبلية

### 9.1 تحديث التبعيات
```bash
npm audit
npm update
```

### 9.2 مراقبة الأخطاء
- فعّل Supabase Logs → Database → Authentication
- فعّل مراقبة أخطاء الواجهة عند الحاجة

### 9.3 النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
supabase db dump -f backup.sql
```

---

## 10. قائمة التحقق النهائية (Checklist)

- [x] Supabase project منشأ ومتصل
- [x] Migrations منفذة بنجاح (232 rows seeded)
- [x] RLS Policies مفعلة على جميع الجداول
- [x] Google OAuth مفعل في Supabase + Google Cloud Console
- [x] Edge Function `delete-account` منشورة
- [x] `VITE_*` variables في GitHub Secrets و Cloudflare Dashboard
- [x] `npm run lint` يمر بدون أخطاء
- [x] `npm run build` ينتج `dist/` صالح
- [x] CI workflows (`ci.yml` + `deploy-web.yml`) شغالة
- [x] Cloudflare Pages ينشر تلقائيًا من GitHub Actions
- [ ] الموقع المنشور يعمل على `https://svu-community.pages.dev`
- [ ] تسجيل حساب جديد + تأكيد البريد يعمل
- [ ] تسجيل الدخول عبر Google يعمل
- [ ] زر حذف الحساب يعمل (يتطلب Edge Function)
- [ ] زر نسيت كلمة المرور يعمل
- [ ] التوجيه إلى `/dashboard` بعد تسجيل الدخول يعمل
- [ ] حماية المسارات (`GuestRoute`) تعمل

---

تم إنشاء هذا الملف بتاريخ: 2026-06-18  
آخر تحديث: 2026-06-20
