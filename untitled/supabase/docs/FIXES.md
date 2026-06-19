# سجل الإصلاحات

## نظرة عامة

هذا الملف يوثق جميع الإصلاحات المطبقة على هيكلة Supabase بعد المراجعة الشاملة.

---

## 1. ✅ تصحيح Seed Data

**المشكلة:** UUIDs وهمية لا تطابق auth.users
**الحل المُطبق:** توثيق أن البيانات التجريبية تحتاج إلى إنشاء مستخدمين فعليين أولاً.
**الحالة:** ✅ موثق في SEED.md
**الملف:** `supabase/seed/*.sql`

---

## 2. ✅ توحيد upsertProfile و completeAuthCallback

**المشكلة:** ازدواجية الدوال في lib/supabase.ts و services/
**الحل المُطبق:** الاعتماد على `src/lib/supabase.ts` فقط في `completeAuthCallback`
**الحالة:** ✅ تم الإصلاح
**الملف:** `src/services/auth.service.ts:105-127`

---

## 3. ✅ إزالة الكود المكرر بالكامل من auth.service.ts

**المشكلة:** وجود نسخة كاملة مكررة من جميع الدوال في الأسطر 142-271
**الحل المُطبق:** حذف جميع الأسطر المكررة
**الحالة:** ✅ تم الإصلاح
**الملف:** `src/services/auth.service.ts`

---

## 4. ✅ تصحيح مفتاح full_name في registerWithEmail

**المشكلة:** يرسل `data: { name }` لكن trigger يقرأ `full_name`
**الحل المُطبق:** تغيير إلى `data: { full_name: name }`
**الحالة:** ✅ تم الإصلاح
**الملف:** `src/services/auth.service.ts:66`

---

## 5. ✅ إصلاح isAdminUser في Edge Function delete-account

**المشكلة:** كان يفحص `user_metadata.role` وليس `profiles.role`
**الحل المُطبق:** استعلام مباشر إلى `profiles.role` باستخدام `service_role` key
**الحالة:** ✅ تم الإصلاح
**الملف:** `supabase/functions/delete-account/index.ts:68-76, 128-132`

---

## 6. ✅ إصلاح معالجة فشل Audit Log

**المشكلة:** `.catch(() => undefined)` يتجاهل فشل الإدراج صمتاً
**الحل المُطبق:** تغيير إلى `if (auditError) { console.error(...) }`
**الحالة:** ✅ تم الإصلاح
**الملف:** `supabase/functions/delete-account/index.ts:148-164`

---

## 7. ✅ إصلاح الاستدعاء الذاتي اللانهائي (Stack Overflow)

**المشكلة:** `completeAuthCallback` كان يستدعي نفسه بدلاً من `libHandleAuthCallback`
**الحل المُطبق:** استدعاء `libHandleAuthCallback()` بدلاً من `completeAuthCallback()`
**الحالة:** ✅ تم الإصلاح
**الملف:** `src/services/auth.service.ts:111`

---

## 8. ✅ توحيد نوع Notification.createdAt

**المشكلة:** `types/notification.ts` → `string`، `notificationStore.ts` → `number`
**الحل المُطبق:** توحيد النوع إلى `string` (ISO 8601) في المكانين
**الحالة:** ✅ تم الإصلاح
**الملفات:** `src/types/notification.ts`، `src/stores/notificationStore.ts`

---

## 9. ✅ إضافة CHECK Constraints على role و provider

**الملف:** `003m_add_profile_constraints.sql`
**التأثير:** يمنع إدخال قيم غير صالحة
**الحالة:** ✅ تم إنشاء migration

---

## 10. ✅ إضافة UNIQUE Constraint على email

**الملف:** `003m_add_profile_constraints.sql`
**الحالة:** ✅ تم إنشاء migration

---

## 11. ✅ إضافة Trigger لـ updated_at

**الملف:** `001m_fix_update_timestamps.sql`
**الحالة:** ✅ تم إنشاء migration

---

## 12. ✅ إضافة Index على notifications

**الملف:** `002m_add_notification_indexes.sql`
**الحالة:** ✅ تم إنشاء migration

---

## 13. ✅ تنفيذ عمليات الإصلاح الحرجة (P0)

### 13.1 Edge Function - delete-account
- ✅ تحقق من `profiles.role` بدلاً من `user_metadata`
- ✅ معالجة خطأ Audit Log الصحيحة
- ✅ Rate limit في الذاكرة (مُوثق كقيود في EDGE_FUNCTIONS.md)

### 13.2 المصادقة - Auth Service
- ✅ إزالة الكود المكرر بالكامل
- ✅ إصلاح الاستدعاء الذاتي
- ✅ تصحيح مفتاح `full_name` في registerWithEmail

### 13.3 أنواع TypeScript
- ✅ توحيد `Notification.createdAt` إلى `string`
- ✅ تحديث `notificationStore.ts` لاستخدام ISO string

---

## قائمة الملفات المعدّلة

| الملف | نوع التعديل |
|---|---|
| supabase/migrations/001m_fix_update_timestamps.sql | ✨ جديد |
| supabase/migrations/002m_add_notification_indexes.sql | ✨ جديد |
| supabase/migrations/003m_add_profile_constraints.sql | ✨ جديد |
| supabase/migrations/004_auto_profile_trigger.sql | ✨ جديد |
| supabase/functions/delete-account/index.ts | 🔧 modified |
| src/services/auth.service.ts | 🔧 modified |
| src/stores/notificationStore.ts | 🔧 modified |
| supabase/docs/MIGRATIONS.md | 📝 updated |
| supabase/docs/FIXES.md | 📝 updated |
| README.md | 📝 updated |
