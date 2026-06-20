# SVU Community - توثيق الإعداد والنشر

## 1. المتطلبات الأساسية

- حساب Supabase (مجاني أو مدفوع)
- حساب Cloudflare Pages
- نطاق مخصص (اختياري)

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

```bash
# من مجلد المشروع الرئيسي (svu community v3.0.0_cleantree)
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
   - Redirect URL: `https://your-domain.com/auth/callback`
3. فعّل **Google OAuth**:
   - أنشئ عميل OAuth في [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - أضف Origins و Redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `https://your-domain.com/auth/callback`
   - انسخ `Client ID` إلى Supabase → Google Provider

### 2.5 تفعيل RLS Policies
تأكد من تنفيذ migrations التالية في Supabase SQL Editor:

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
supabase secrets set ALLOWED_ORIGINS="https://your-domain.com"
```

للتطوير المحلي:

```bash
supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

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

### 4.1 إنشاء `.env.local`
```bash
# انسخ من .env.example
cp .env.example .env.local
```

### 4.2 ملء المتغيرات
```env
# من Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# من Google Cloud Console → Credentials
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**⚠️ تنبيه أمني:**
- لا ترفع `.env.local` إلى Git (مذكور في `.gitignore`)
- استخدم `VITE_*` فقط للمتغيرات العامة (مرئية في المتصفح)
- `SERVICE_ROLE_KEY` ممنوع استخدامه في العميل

---

## 5. بناء ونشر الواجهة

### 5.1 بناء المشروع
```bash
# تثبيت التبعيات
npm install

# فحص الأنواع
npm run lint

# بناء للإنتاج
npm run build
```

### 5.2 نشر على Vercel
```bash
# تثبيت Vercel CLI
npm install -g vercel

# نشر
vercel --prod
```

أو عبر لوحة التحكم:
1. اربط مستودع Git بـ Vercel
2. أضف متغيرات البيئة في Vercel Dashboard → Settings → Environment Variables
3. فعّل **Preview Deployment** لـ branches

### 5.3 إعدادات Vercel الإضافية
في `vercel.json` (اختياري):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 6. التحقق من النشر

### 6.1 فحوصات TypeScript
```bash
npm run lint
```

### 6.2 فحوصات البناء
```bash
npm run build
# تحقق من عدم وجود أخطاء في dist/
```

### 6.3 اختبار الوظائف يدوياً
1. افتح الموقع المنشور
2. سجّل حساب جديد → تحقق من وصول بريد التأكيد
3. سجّل دخول عبر Google → تحقق من التوجيه إلى `/dashboard`
4. اختبر زر حذف الحساب → تحقق من نجاح العملية
5. اختبر زر نسيت كلمة المرور → تحقق من وصول الرابط

---

## 7. المشاكل الشائعة والحلول

### 7.1 خطأ "Missing Supabase environment variables"
**السبب:** `.env.local` غير موجود أو غير مكتمل  
**الحل:**
```bash
# تحقق من وجود الملف
ls .env.local

# تحقق من المحتوى
cat .env.local | grep VITE_
```

### 7.2 خطأ "Invalid login credentials"
**السبب:** البريد غير مؤكد أو كلمة المرور خاطئة  
**الحل:**
- فعل **Confirm email** في Supabase
- تحقق من Redirect URL صحيح

### 7.3 زر حذف الحساب لا يعمل
**السبب:** Edge Function غير منشورة أو Service Role key غير مضبوط  
**الحل:**
```bash
# تحقق من نشر الدالة
supabase functions list --project-ref YOUR_PROJECT_ID

# أعد النشر إذا لزم الأمر
supabase functions deploy delete-account --project-ref YOUR_PROJECT_ID
```

### 7.4 Google OAuth يفشل
**السبب:** Client ID أو Redirect URI غير صحيح  
**الحل:**
- تحقق من `VITE_GOOGLE_CLIENT_ID` في `.env.local`
- تحقق من Authorized Redirect URIs في Google Cloud Console

---

## 8. الأمان

### 8.1 متغيرات البيئة
- ✅ استخدم `VITE_*` فقط للقيم العامة
- ❌ لا تستخدم `SERVICE_ROLE_KEY` في الكود الأمامي
- ✅ فعّل RLS على جميع الجداول

### 8.2 RLS Policies
تأكد من عدم وجود Policies مفتوحة:
```sql
-- تحقق من absence of overly permissive policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'courses', 'groups');
```

### 8.3 CORS
في Supabase Dashboard → Settings → API:
- أضف نطاق موقعك إلى **Allowed Origins**

---

## 9. الصيانة المستقبلية

### 9.1 تحديث التبعيات
```bash
npm audit
npm update
```

### 9.2 مراقبة الأخطاء
- فعّل Supabase Logs → Database → Authentication
- فعّل مراقبة أخطاء الواجهة عند الحاجة عبر آلية موثقة وخارج نطاق هذا الملف حالياً

### 9.3 النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
supabase db dump -f backup.sql
```

---

## 10. قائمة التحقق النهائية (Checklist)

- [ ] Supabase project منشأ ومتصل
- [ ] Migrations منفذة بنجاح
- [ ] RLS Policies مفعلة على جميع الجداول
- [ ] Google OAuth مفعل ويعمل
- [ ] Edge Function `delete-account` منشورة
- [ ] `.env.local` مكتمل بالقيم الصحيحة
- [ ] `npm run lint` يمر بدون أخطاء
- [ ] `npm run build` ينتج `dist/` صالح
- [ ] الموقع المنشور يعمل على `https://your-domain.com`
- [ ] تسجيل حساب جديد + تأكيد البريد يعمل
- [ ] تسجيل الدخول عبر Google يعمل
- [ ] زر حذف الحساب يعمل (يتطلب Edge Function)
- [ ] زر نسيت كلمة المرور يعمل
- [ ] التوجيه إلى `/dashboard` بعد تسجيل الدخول يعمل
- [ ] حماية المسارات (`ProtectedRoute`) تعمل

---

تم إنشاء هذا الملف بتاريخ: 2026-06-18  
آخر تحديث: 2026-06-18
