# قاعدة بيانات SVU Community — توثيق المخطط

## نظرة عامة

المشروع يستخدم Supabase كـ backend كخدمة (BaaS). قاعدة البيانات تعتمد على PostgreSQL مع Row Level Security (RLS) مفعّل على جميع الجداول العامة.

---

## الجداول

### 1. `auth.users` (مدمج من Supabase)

ليس جزءًا من migration، لكنه الجدول المركزي الذي ترتبط به كل الجداول.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | `uuid` | Primary Key |
| `email` | `text` | |
| `encrypted_password` | `text` | |
| `email_confirmed_at` | `timestamptz` | |
| `last_sign_in_at` | `timestamptz` | |
| `user_metadata` | `jsonb` | الاسم، صورة الملف الشخصي |
| `app_metadata` | `jsonb` | مزود المصادقة (google/email) |
| `created_at` | `timestamptz` | |

---

### 2. `public.profiles`

ملف المستخدم الشخصي. يُنشأ تلقائيًا عند تسجيل الدخول/التسجيل عبر `upsertProfile`.

| الحقل | النوع | القيود | ملاحظات |
|---|---|---|---|
| `id` | `uuid` | Primary Key | FK → `auth.users.id` مع `ON DELETE CASCADE` |
| `full_name` | `text` | nullable | الاسم الكامل |
| `avatar_url` | `text` | nullable | رابط صورة الملف الشخصي |
| `phone` | `text` | nullable | رقم الهاتف |
| `email` | `text` | nullable | البريد الإلكتروني (مكرر من auth.users) |
| `username` | `text` | nullable | اسم المستخدم الفريد |
| `role` | `text` | not null، default `'student'` | دور المستخدم: `student` / `admin` |
| `provider` | `text` | not null، default `'email'` | مزود المصادقة: `email` / `google` |
| `provider_id` | `text` | nullable | معرف المستخدم عند مزود خارجي |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | |

**قيود إضافية:**
- `UNIQUE INDEX` على `username` WHERE `username IS NOT NULL`
- `ON DELETE CASCADE`: حذف المستخدم من `auth.users` يحذف ملفه تلقائيًا

**يُضاف عبر Migration:**
- `001_init_profiles.sql` — الجدول الأساسي (id, full_name, avatar_url, phone, created_at, updated_at)
- `003_add_profile_identity_fields.sql` — email, username, role, provider, provider_id + UNIQUE index + DELETE policy

---

### 3. `public.notifications`

إشعارات المستخدم.

| الحقل | النوع | القيود | ملاحظات |
|---|---|---|---|
| `id` | `uuid` | Primary Key | `default uuid_generate_v4()` |
| `user_id` | `uuid` | not null | FK → `auth.users.id` مع `ON DELETE CASCADE` |
| `title` | `text` | not null | عنوان الإشعار |
| `body` | `text` | nullable | نص الإشعار |
| `read` | `boolean` | not null، default `false` | حالة القراءة |
| `created_at` | `timestamptz` | default `now()` | |

**يُضاف عبر Migration:**
- `002_init_notifications.sql` — الجدول كامل + RLS + DELETE policy (مُصلح)

---

### 4. `public.admin_audit_log`

سجل عمليات التدقيق الإداري.

| الحقل | النوع | القيود | ملاحظات |
|---|---|---|---|
| `id` | `uuid` | Primary Key | `default uuid_generate_v4()` |
| `caller_id` | `uuid` | not null | FK → `auth.users.id` مع `ON DELETE CASCADE` |
| `action` | `text` | not null | نوع العملية (مثل `delete_account`) |
| `payload` | `jsonb` | default `'{}'::jsonb` | بيانات إضافية (مزود، IP، User-Agent) |
| `ip_address` | `text` | default `'unknown'` | عنوان IP للمستخدم |
| `user_agent` | `text` | default `'unknown'` | متصفح المستخدم |
| `created_at` | `timestamptz` | default `now()` | |

**يُضاف عبر Migration:**
- `003_add_profile_identity_fields.sql` — الجدول + RLS + SELECT policy (مُصلح)

---

## العلاقات

```
auth.users (1) ──────── (N) public.profiles          [id → id, CASCADE]
auth.users (1) ──────── (N) public.notifications      [id → user_id, CASCADE]
auth.users (1) ──────── (N) public.admin_audit_log    [id → caller_id, CASCADE]
```

---

## ملاحظات

- جميع الجداول في `public` schema
- RLS مفعّل على كل الجداول
- لا توجد جداول في `storage` أو `realtime` حالياً
- `role` و `provider` يُدخلان عبر trigger `handle_new_user` عند إنشاء المستخدم، ويمكن تحديثهما يدوياً في `profiles`

### ملاحظة أمنية حول `role`

لا تعتمد الدوال الحساسة (مثل `delete-account`) على `user_metadata.role`. بدلاً من ذلك، تستعلم مباشرة من جدول `profiles.role`. هذا يمنع انتحال الدور عبر تعديل بيانات المصادقة الوصفية.
