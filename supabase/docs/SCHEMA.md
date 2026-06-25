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

### 5. `public.groups`

مجموعات الدراسة للتعاون بين الطلاب.

| الحقل | النوع | القيود | ملاحظات |
|---|---|---|---|
| `id` | `uuid` | Primary Key | `default uuid_generate_v4()` |
| `name` | `text` | not null | اسم المجموعة |
| `course_name` | `text` | not null | اسم المادة |
| `course_code` | `text` | not null | رمز المادة |
| `class_number` | `text` | nullable | رقم الفصل (C1-C50) |
| `doctor_name` | `text` | nullable | اسم الدكتور |
| `major` | `text` | not null | التخصص الدراسي |
| `max_members` | `integer` | not null، default `5` | الحد الأقصى للأعضاء |
| `current_members` | `integer` | not null، default `1` | عدد الأعضاء الحالي |
| `whatsapp_link` | `text` | not null | رابط مجموعة الواتساب |
| `group_link` | `text` | nullable | رابط المجموعة الإضافي |
| `is_full` | `boolean` | not null، default `false` | هل المجموعة ممتلئة؟ |
| `creator_id` | `uuid` | not null | FK → `auth.users.id` مع `ON DELETE CASCADE` |
| `creator_name` | `text` | not null | اسم منشئ المجموعة |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | |

**قيود إضافية:**
- `CHECK constraint`: `max_members >= 2 AND max_members <= 20`
- Index on `creator_id` for fast lookup of user's groups
- Index on `major` for filtering by major

**سياسات RLS (Row Level Security):**
- `groups_select_all`: أي شخص يمكنه عرض جميع المجموعات (للتصفح)
- `groups_insert_authenticated`: المستخدمون المسجلون فقط يمكنهم إنشاء مجموعة
- `groups_update_creator`: المنشئ فقط يمكنه تعديل مجموعته
- `groups_delete_creator`: المنشئ فقط يمكنه حذف مجموعته

**يُضاف عبر Migration:**
- `20250625000000_create_study_groups_tables.sql`

---

### 6. `public.group_members`

عضوية المستخدمين في المجموعات.

| الحقل | النوع | القيود | ملاحظات |
|---|---|---|---|
| `id` | `uuid` | Primary Key | `default uuid_generate_v4()` |
| `group_id` | `uuid` | not null | FK → `public.groups.id` مع `ON DELETE CASCADE` |
| `user_id` | `uuid` | not null | FK → `auth.users.id` مع `ON DELETE CASCADE` |
| `joined_at` | `timestamptz` | default `now()` | تاريخ الانضمام |

**قيود إضافية:**
- `UNIQUE(group_id, user_id)`: منع الانضمام المزدوج لنفس المجموعة
- Index on `group_id` for fast membership queries
- Index on `user_id` for fast lookup of user's groups

**سياسات RLS:**
- `group_members_select`: أي شخص يمكنه عرض عضوية المجموعات
- `group_members_insert_authenticated`: المستخدمون المسجلون يمكنهم الانضمام
- `group_members_delete_own`: العضو يمكنه مغادرة مجموعته

**يُضاف عبر Migration:**
- `20250625000000_create_study_groups_tables.sql`

---

## العلاقات

```
auth.users (1) ──────── (N) public.profiles          [id → id, CASCADE]
auth.users (1) ──────── (N) public.notifications      [id → user_id, CASCADE]
auth.users (1) ──────── (N) public.admin_audit_log    [id → caller_id, CASCADE]
auth.users (1) ──────── (N) public.groups             [id → creator_id, CASCADE]
public.groups (1) ───── (N) public.group_members     [id → group_id, CASCADE]
auth.users (1) ──────── (N) public.group_members      [id → user_id, CASCADE]
```

---

## ملاحظات

- جميع الجداول في `public` schema
- RLS مفعّل على كل الجداول
- لا توجد جداول في `storage` أو `realtime` حالياً
- `role` و `provider` يُدخلان عبر trigger `handle_new_user` عند إنشاء المستخدم، ويمكن تحديثهما يدوياً في `profiles`

### ملاحظة أمنية حول `role`

لا تعتمد الدوال الحساسة (مثل `delete-account`) على `user_metadata.role`. بدلاً من ذلك، تستعلم مباشرة من جدول `profiles.role`. هذا يمنع انتحال الدور عبر تعديل بيانات المصادقة الوصفية.
