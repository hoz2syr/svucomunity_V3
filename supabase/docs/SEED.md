# بيانات Seed

## نظرة عامة

البيانات التجريبية تُستخدم في بيئة التطوير المحلي فقط. لا تُشغّل في Production.

```bash
supabase db seed
```

---

## `seed/profiles.sql`

```sql
insert into public.profiles (id, full_name, avatar_url, phone)
values
  ('00000000-0000-0000-0000-000000000001', 'طالب تجريبي', null, '0500000000'),
  ('00000000-0000-0000-0000-000000000002', 'مستخدم ثاني', null, '0500000001');
```

**المشكلة:** هذه الـ UUIDs لا تطابق أي مستخدم في `auth.users`. تحتاج إلى إنشاء مستخدمين أولاً ثم استخدام UUIDs الخاصة بهم.

---

## `seed/notifications.sql`

```sql
insert into public.notifications (user_id, title, body, read)
values
  ('00000000-0000-0000-0000-000000000001', 'مرحباً بك في SVU Community', ..., false),
  ...;
```

**المشكلة:** نفس المشكلة — `user_id` يجب أن يكون UUID مستخدم موجود فعلياً.

---

## كيف تعمل بشكل صحيح

### الخيار 1: إنشاء المستخدمين عبر Supabase Auth أولاً
```bash
# 1. إنشاء المستخدم عبر Dashboard أو CLI
supabase auth signup --email test@example.com --password test123

# 2. أخذ UUID من auth.users
supabase db remote execute "SELECT id FROM auth.users WHERE email = 'test@example.com';"

# 3. تحديث seed/profiles.sql و seed/notifications.sql بهذا UUID
```

### الخيار 2: استخدام supabase db seed مع triggers

أضف trigger يُنشئ profile تلقائيًا عند إنشاء مستخدم جديد.

---

## إزالة البيانات التجريبية

```sql
-- إزالة الإشعارات
delete from public.notifications;

-- إزالة الملفات الشخصية
delete from public.profiles;

-- إزالة سجلات التدقيق
delete from public.admin_audit_log;
```

**قبل الإطلاق:** تأكد من أن جدول `profiles` لا يحتوي على بيانات تجريبية.

```sql
SELECT * FROM public.profiles LIMIT 5;
```

---

## ملاحظات

| البند | الحالة |
|---|---|
| بيانات صالحة | ❌ UUIDs وهمية لا تطابق auth.users |
| متى تشغّل | بيئة التطوير المحلي فقط |
| متى تحذف | قبل الإطلاق على Production |
