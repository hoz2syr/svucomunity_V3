# Register Subsystem — Review Report

> تاريخ المراجعة: 2026-06-15  
> الحالة: مكتمل — تم تطبيق جميع الإصلاحات الحرجة والمتوسطة

## ملفات النظام

| الملف | الوصف |
|-------|-------|
| `apps/web/src/pages/register.html` | واجهة صفحة التسجيل |
| `apps/web/src/js/modules/page-register.js` | نقطة دخول |
| `apps/web/src/js/modules/page-register/register-state.js` | إدارة الحالة |
| `apps/web/src/js/modules/page-register/register-api.js` | منطق الـ API والتحقق |
| `apps/web/src/js/modules/page-register/register-ui.js` | واجهة المستخدم + `buildPhone` موحد |
| `apps/web/src/js/modules/page-register/register-handlers.js` | معالجات الأحداث |
| `apps/web/src/js/modules/page-register/validation.js` | قواعد التحقق |
| `apps/web/src/__tests__/validation.test.js` | اختبارات unit |
| `apps/web/src/__tests__/register-api.test.js` | اختبارات unit |
| `apps/web/src/__tests__/page-login.test.js` | اختبارات unit |
| `apps/web/src/assets/auth.css` | ستايل موحد لصفحاتAuth |

## الإصلاحات المنفذة

### 🔴 CRITICAL

1. **Bug 1 — منطق تحديد الحقل المكرر خاطئ**  
   **الملف:** `register-api.js:100-128`  
   **قبل الإصلاح:** depend on `duplicateCheck` التي قد تكون `null` → `field` دائماً email  
   **بعد الإصلاح:** فحص username أولاً، ثم email بشكل منفصل — رسالة خطأ صحيحة لكل حقل

2. **توحيد `buildPhone`**  
   **الملفات:** `register-api.js`, `register-ui.js`  
   **قبل الإصلاح:** دالتان منفصلتان بنفس الاسم ومنطق مختلف  
   **بعد الإصلاح:** `register-api.js` يستورد `buildPhone` من `register-ui.js` — مصدر واحد للحقيقة

3. **إضافة `server-side validation` basic**  
   **الملف:** `register-api.js:73-95`  
   **التحقق:**
   - `email` طول ≤ 254 حرف
   - `username` طول ≤ 50 حرف
   - `first_name`/`last_name` طول ≤ 100 حرف
   - `phone` طول بين 8 و 20 رقم

4. **اختبارات unit لـ `validation.js`**  
   **الملف:** `apps/web/src/__tests__/validation.test.js`  
   **التغطية:**
   - `validateUsername` — 7 حالات
   - `validateMajor` — 3 حالات
   - `validatePhone` — 7 حالات (SY, SA, US)
   - `validatePassword` — 5 حالات
   - `calcStrength` — 5 حالات
   - `formatFieldError` — 3 حالات

5. **اختبارات unit لـ `register-api.js`**  
   **الملف:** `apps/web/src/__tests__/register-api.test.js`  
   **التغطية:**
   - `submitRegisterForm` — 5 سيناريوهات
   - duplicate username/email
   - GET Successful signup happy path

### 🟠 MEDIUM

6. **اختبارات unit لـ `page-login.js`**  
   **الملف:** `apps/web/src/__tests__/page-login.test.js`  
   **التغطية:**
   - `isAllowedRedirect` — 8 حالات
   - Rate limiting (record, increment, cooldown, clear, reset)
   - `formatCooldown` message formatting

7. **توحيد ستايل صفحات Auth**  
   **الملف الجديد:** `apps/web/src/assets/auth.css`  
   **يضم:**
   - Skip link accessible pattern
   - Shared toast accessibility (role=alert/status)
   - Shared toggle bar pattern
   - Form field states (valid/invalid)
   - Reduced motion

8. **إصلاح `register.html` toast**  
   **التغيير:** إضافة `role="alert" aria-live="assertive" aria-atomic="true"`

### 🟢 LOW

9. **إزالة `onclick` inline** من `reset-password.html`  
   **قبل:** `onclick="window.i18n?.toggleLang(); location.reload();"`  
   **بعد:** `data-lang-toggle` (handled by JS)

10. **توثيق `003_auth.sql`**  
    **الملف:** `supabase/migrations/003_auth.sql.md`

## الفجوات المفتوحة (مطلوب متابعة)

| # | المجال | الحالة | الأولوية |
|---|--------|--------|---------|
| G1 | E2E register happy path مع seeded user | مفتوح | 🟠 متوسط |
| G2 | E2E test لـ CSRF header | مفتوح | 🟡 منخفض |
| G3 | E2E test لـ logout storage cleanup | مفتوح | 🟡 منخفض |
| G4 | تحديث README.md | مفتوح | 🟢 منخفض |
| G5 | إنشاء `review-register/` تقرير كامل | مفتوح | 🟢 منخفض |

## التوصيات المستقبلية

- **Server-side validation كاملة:** نقل كل التحقق إلى Supabase Edge Function أو RLS policies
- **إضافة Recovery Email verification flow tests:** verify-email happy path
- **إضافة reset-password E2E happy path:** مع mocked recovery token
- **اختبارات أمنية:** XSS في `username`, CSRF token lifecycle
- **rate limiting server-side:** حالياً فقط client-side (sessionStorage)
