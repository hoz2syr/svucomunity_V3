# توثيق migration `003_auth.sql`

## الغرض
هذه الـ migration تنشئ الدوال والـ triggers المسؤولة عن ربط مستخدمي Supabase Auth (`auth.users`) بملف المستخدم في التطبيق (`public.users`) وتوفير دوال مساعدة للتحقق من صلاحيات المشرف.

## الدوال والـ Triggers

### 1. `handle_email_confirmed()` — Trigger function
**النوع:** Trigger function (SECURITY DEFINER)  
**الهدف:** إنشاء سجل في `public.users` تلقائياً عندما يُؤكد المستخدم بريده الإلكتروني لأول مرة.

**المنطق:**
- يشتغل فقط عند transitioning من `email_confirmed_at = NULL` إلى `email_confirmed_at IS NOT NULL`
- ينشئ صف في `public.users` بالحقول: `id`, `email`, `username`
- `username` يأخذ قيمة البريد الإلكتروني كاحتياط (`COALESCE`)
- `ON CONFLICT (id) DO NOTHING` يمنع الأخطاء عند التحديثات اللاحقة

**الاستخدام:** مرتبط بـ `on_auth_email_confirmed` trigger على `auth.users`

### 2. `on_auth_email_confirmed` — Trigger
**الحدث:** `AFTER UPDATE OF email_confirmed_at ON auth.users`  
**الشروط:** يشتغل فقط عندما `NEW.email_confirmed_at IS NOT NULL`  
**التأثير:** يستدعي `handle_email_confirmed()`

### 3. `handle_new_user()` — Trigger function
**النوع:** Trigger function (SECURITY DEFINER)  
**الهدف:** إنشاء ملف مستخدم فور إنشاء المستخدم في Supabase Auth (إذا كان البريد مؤكداً مسبقاً).

**المنطق:**
- يفحص `NEW.email_confirmed_at IS NOT NULL`
- ينشئ صف في `public.users` بنفس طريقة `handle_email_confirmed()`
- `ON CONFLICT (id) DO NOTHING` للأمان

**الاستخدام:** مرتبط بـ `on_auth_user_created` trigger على `auth.users`

### 4. `on_auth_user_created` — Trigger
**الحدث:** `AFTER INSERT ON auth.users`  
**التأثير:** يستدعي `handle_new_user()`

### 5. `has_role(check_role TEXT)` — Function
**النوع:** SECURITY DEFINER function  
**الهدف:** التحقق مما إذا كان المستخدم الحالي (`auth.uid()`) مشرفاً (`is_admin = true`) ونشطاً (`is_active = true`).

**الإدخال:** `check_role` — اسم الدور المطلوب (للتمديد المستقبلي)  
**الإخراج:** `BOOLEAN` — `true` إذا كان المستخدم مشرفاً ونشطاً  
**الاستخدام:** يمكن استدعاؤه من RLS policies أو Edge Functions

### 6. `services.get_user_roles(uid UUID)` — Function
**النوع:** SECURITY DEFINER function في schema `services`  
**الهدف:** إرجاع `is_admin` و `is_active` لمستخدم معين.

**الإدخال:** `uid` — معرف المستخدم  
**الإخراج:** TABLE(`is_admin BOOLEAN`, `is_active BOOLEAN`)  
**الأمان:** يرفع خطأ `42501` (غير مصادق) إذا لم يكن `auth.uid()` موجوداً

### 7. `services.assert_admin()` — Function
**النوع:** SECURITY DEFINER function في schema `services`  
**الهدف:** التحقق من صلاحيات المشرف ورفع خطأ إذا لم تكن موجودة.

**الإخراج:** `VOID` أو يرفع `EXCEPTION`  
**الاستخدام:** يُستدعى في بداية كل دالة إدارية في `admin-actions` Edge Function

## schema `services`
دانة籃 services مخصصة للدوال المشتركة المستخدمة في Edge Functions وليس لها وصول مباشر من العميل.

## ملاحظات أمنية
- جميع الدوال تستخدم `SECURITY DEFINER` للعمل بصلاحيات المالك (المشرف)
- `search_path` مضبوط لمنع هجمات_path traversal
- `ON CONFLICT (id) DO NOTHING` يمنع تكرار السجلات
- لا توجد دوال تقبل مدخلات من العميل مباشرة (باستثناء `has_role` الذي يستخدم `auth.uid()` فقط)

## التبعيات
- `auth.users` (Supabase managed)
- `public.users` (يجب إنشاؤها قبل هذه الـ migration)
- RLS policies على `public.users` للسماح بالقراءة للمستخدم المصادق
