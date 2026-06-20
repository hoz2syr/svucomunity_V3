# RLS Policies — توثيق السياسات

## نظرة عامة

جميع السياسات تستخدم `auth.uid()` للتحقق من هوية المستخدم الحالي. تنطبق فقط عند تفعيل RLS على الجدول.

---

## `public.profiles`

### SELECT
```sql
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```
- **الغاية:** المستخدم يرى ملفه فقط
- **من:** المستخدم المصادق (`auth.uid()`)

### UPDATE
```sql
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```
- **الغاية:** المستخدم يحدّث ملفه فقط
- **من:** المستخدم المصادق

### INSERT
```sql
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```
- **الغاية:** المستخدم ينشئ ملفًا فقط لنفسه
- **من:** المستخدم المصادق

### DELETE
```sql
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);
```
- **الغاية:** المستخدم يحذف ملفه فقط
- **من:** المستخدم المصادق
- **ملاحظة:** تُنفذ عبر Edge Function `delete-account` وليس مباشرة من العميل

---

## `public.notifications`

### SELECT
```sql
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
```
- **الغاية:** المستخدم يرى إشعاراته فقط

### UPDATE
```sql
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
```
- **الغاية:** المستخدم يحدّث إشعاراته (مثل تحديد كمقروء)
- **ملاحظة:** الإشعارات تُنشأ من Edge Functions أو triggers، ليس من العميل

### INSERT
```sql
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
- **الغاية:** إنشاء إشعار جديد للمستخدم الحالي فقط

### DELETE
```sql
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
```
- **الغاية:** المستخدم يحذف إشعاراته
- **ملاحظة:** مُضافة في `002_init_notifications.sql` (مُصلحة)

---

## `public.admin_audit_log`

### SELECT
```sql
CREATE POLICY "Users can view own audit log"
  ON public.admin_audit_log FOR SELECT
  USING (auth.uid() = caller_id);
```
- **الغاية:** المستخدم يرى سجلاته التدقيقية فقط
- **من:** المستخدم المصادق
- **ملاحظة:** الإدراج يتم من Edge Function بخدمة Service Role Key

### INSERT / UPDATE / DELETE
- **لا توجد policies** لـ INSERT/UPDATE/DELETE
- **السبب:** الإدراج يتم من Edge Function باستخدام `service_role` key (تجاوز RLS)
- **خطر:** إذا تم استدعاء الدالة من عميل بخدمة ANON key لن يعمل

---

## جدول Pick Policy

| الجدول | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | auth.uid() = id | auth.uid() = id | auth.uid() = id | auth.uid() = id |
| `notifications` | auth.uid() = user_id | auth.uid() = user_id | auth.uid() = user_id | auth.uid() = user_id |
| `admin_audit_log` | auth.uid() = caller_id | — | — | — |

---

## ملاحظات أمنية

1. لا توجد سياسة تسمح للمستخدم برؤية ملفات أخرى (`profiles` أو `notifications`)
2. لا توجد سياسة تسمح بالتعديل على `admin_audit_log` من العميل
3. جميع السياسات تتطلب مصادقة (`auth.uid() IS NOT NULL` ضمنياً)
4. `role` في `profiles` لا يُستخدم حالياً في RLS — الاستحقاقات الإدارية تحتاج policy إضافية
