# سجل الـ Migrations

## نظرة عامة

يتم تنفيذ Migrations تلقائيًا عبر Supabase CLI بالترتیب الرقمي.

```bash
supabase migration up
```

---

## 001 — `001_init_profiles.sql`

**التاريخ:** المرحلة الأولى

**الغاية:** إنشاء جدول الملفات الشخصية الأساسي مع RLS.

**التغييرات:**
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" ...
create policy "Users can update own profile" ...
create policy "Users can insert own profile" ...
```

**التأثير:**
- ينشئ جدول `profiles` مرتبط بـ `auth.users`
- يفعّل RLS مع 3 policies أساسية
- **ناقص:** DELETE policy + حقول الهوية (email, username, role)

**يصحح لاحقًا في:** `003_add_profile_identity_fields.sql` و `001m_fix_update_timestamps.sql`

---

## 001m — `001m_fix_update_timestamps.sql`

**التاريخ:** ما بعد 001

**الغاية:** إضافة trigger لتحديث `updated_at` تلقائياً عند كل UPDATE.

**التغييرات:**
```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  when (old.* is distinct from new.*)
  execute function public.set_updated_at();
```

**التأثير:**
- يُحدّث `updated_at` تلقائياً بدون تدخل من الكود
- يمنع التحديثات غير الضرورية (`when old.* is distinct from new.*`)

---

## 002 — `002_init_notifications.sql`

**التاريخ:** المرحلة الأولى

**الغاية:** إنشاء جدول الإشعارات مع RLS.

**التغييرات:**
```sql
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- 4 policies: SELECT, INSERT, UPDATE, DELETE
create policy "Users can view own notifications" ...
create policy "Users can insert own notifications" ...
create policy "Users can update own notifications" ...
create policy "Users can delete own notifications" ...
```

**التأثير:**
- ينشئ جدول `notifications` مرتبط بـ `auth.users`
- يفعّل RLS مع 4 policies كاملة

**المشكلة الأصلية (قبل الإصلاح):**
- كانت ناقصة `DELETE` policy
- عند استدعاء `fetchNotifications` مع حذف كانت تفشل بـ 403

---

## 002m — `002m_add_notification_indexes.sql`

**التاريخ:** ما بعد 002

**الغاية:** إضافة فهارس لأداء استعلامات الإشعارات.

**التغييرات:**
```sql
create index if not exists idx_notifications_user_id
  on public.notifications (user_id);

create index if not exists idx_notifications_created_at
  on public.notifications (user_id, created_at desc);
```

**التأثير:**
- يحسّن أداء استعلام `fetchNotifications` (filter by user_id + order by created_at)

---

## 003 — `003_add_profile_identity_fields.sql`

**التاريخ:** ما بعد 001

**الغاية:** إضافة حقول الهوية إلى `profiles` وإنشاء جداول التدقيق والـ DELETE policy.

**التغييرات:**
```sql
-- إضافة حقول لـ profiles
alter table public.profiles
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists role text not null default 'student',
  add column if not exists provider text not null default 'email',
  add column if not exists provider_id text;

create unique index if not exists profiles_username_key
  on public.profiles (username)
  where username is not null;

-- DELETE policy لـ profiles (كانت مفقودة)
create policy "Users can delete own profile" ...;

-- جدول التدقيق
create table public.admin_audit_log (
  id uuid primary key default uuid_generate_v4(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  payload jsonb default '{}'::jsonb,
  ip_address text default 'unknown',
  user_agent text default 'unknown',
  created_at timestamptz default now() not null
);

alter table public.admin_audit_log enable row level security;
create policy "Users can view own audit log" ...
```

**التأثير:**
- يوسع جدول `profiles` بمعلومات المصادقة
- ينشئ `admin_audit_log` لتسجيل العمليات الحساسة

---

## 003m — `003m_add_profile_constraints.sql`

**التاريخ:** ما بعد 003

**الغاية:** إضافة قيود CHECK و UNIQUE على `profiles`.

**التغييرات:**
```sql
alter table public.profiles
  add constraint check_role
  check (role in ('student', 'admin'));

alter table public.profiles
  add constraint check_provider
  check (provider in ('email', 'google'));

alter table public.profiles
  add constraint profiles_email_key
  unique (email);
```

**التأثير:**
- يمنع إدخال قيم غير صالحة في `role` و `provider`
- يضمن تفرد `email` عبر جميع المستخدمين

---

## 004 — `004_auto_profile_trigger.sql`

**التاريخ:** آخر migration

**الغاية:** إنشاء trigger يُنشئ `profile` تلقائياً عند إنشاء مستخدم جديد في `auth.users`.

**التغييرات:**
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, username, role, provider, provider_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1)
    ),
    'student',
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    new.raw_app_meta_data->>'provider_id'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**التأثير:**
- يُنشئ الملف الشخصي تلقائياً عند التسجيل عبر البريد أو Google
- يلغي الحاجة لاستدعاء `upsertProfile` يدوياً من الواجهة

---

## ملاحظات

| البند | الحالة |
|---|---|
| ترتيب التنفيذ التلقائي | ✅ 001 → 001m → 002 → 002m → 003 → 003m → 004 |
| idempotent (يمكن إعادة التشغيل) | ✅ `IF NOT EXISTS` مستخدم في كل مكان |
| رجوع (rollback) | ⚠️ لا توجد migrations عكسية |

---

## كيفية إضافة Migration جديدة

1. أنشئ الملف بترتيب رقمي يتناسب مع آخر migration
2. استخدم `CREATE TABLE IF NOT EXISTS` أو `ALTER TABLE ADD COLUMN IF NOT EXISTS`
3. فعّل RLS وأضف Policies إذا لزم الأمر
4. سجّل التغيير في هذا الملف
