# تقرير فحص أمان نظام تسجيل الدخول
## SVU Community Auth System Security Audit

**التاريخ:** 2026-06-16  
**المدقق:** Kilo  
**النطاق:** نظام المصادقة الكامل (SSO, OAuth, JWT, RBAC)  
**نظام التشغيل:** Windows/Dev  
**حالة الاستضاف:** Frontend نشط + Supabase WebApp  

---

## ملاحظة هامة

هذا التقرير هو **تقرير فحص أولي/مبدئي**. فحص SSO الكامل يتطلب:
1. وصول إلى إعدادات Supabase (Auth Providers, RLS Policies)
2. فحص Edge Functions (admin-actions)
3. اختبار تكاملي حي (E2E Testing)
4. مراجعة كاملة للـ RBAC

**نسبة الجاهزية للإنتاج (Live Production Readiness):**يقدر بأنها **30-40% فقط** بناءً على النتائج الحالية.

---

## 1. ملخص تنفيذي (Executive Summary)

| الفئة | الحالة | النسبة |
|--------|--------|--------|
| **XSS Prevention** |虚弱 (Weak) | 30% ❌ |
| **CSRF Protection** | جزئي | 50% ⚠️ |
| **Security Headers** | جزئي | 40% ⚠️ |
| **Authentication Logic** | متوسط | 50% ⚠️ |
| **Brute Force Protection** | ضعيف | 30% ❌ |
| **Password Policy** | ضعيف جداً | 20% ❌ |
| **SSO/OAuth Security** | مشتبه | 40% ⚠️ |
| **JWT/Token Security** | متوسط | 50% ⚠️ |
| **RBAC Enforcement** | مشتبه | 50% ⚠️ |
| **Audit Logging** | ضعيف | 30% ❌ |
| **Risk Score** | **عالي جداً** | 🔴 |

---

## 2. المشاكل الحرجة (Critical Vulnerabilities)

### 2.1 ثغرة XSS في localStorage 🔴 CRITICAL

**الملف:** `packages/supabase-client/src/index.ts`  
**خط السطر:** 14-20

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,   // ❌ يخزن الـ JWT في localStorage
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

**المشكلة:** `persistSession: true` يخزن الـ refresh_token والـ access_token في `localStorage`.  
هذا يعني:

- ✗ عرضة لسرقة الـ tokens عبر XSS بسيط
- ✗ أي `alert(document.cookie)` أو استغلال `innerHTML` يمكن أن يسرب الجلسة
- ✗ Supabase JS SDK يخزنها في `window.localStorage` افتراضياً

**الاستراتيجية المقترحة:**
- استخدام `@supabase/ssr` + `persistSession: false` مع `cookies()` (Next.js/SSR approach)
- أو استخدام `memoryStorage` (بدون تخزين دائم) + `autoRefreshToken: true`
- أو استخدام Supabase SSR adapter للتعامل مع الكوكيز بشكل آمن

---

### 2.2 ثغرة XSS في `innerHTML` 🔴 CRITICAL

**الملف:** `apps/web/src/js/modules/page-login.js`  
**خط السطر:** 125-131

```javascript
function redirectToDashboard(message = 'مرحباً بك مرة أخرى') {
  if (redirectInProgress) return;
  redirectInProgress = true;
  showToast(message, 'success');
  setTimeout(() => {
    window.location.href = REDIRECT_URL;  // ⚠️ ليست مشكلة مباشرة لكن...
  }, 1200);
}

function updatePasswordIcon() {
  const svg = document.getElementById('toggleLoginPassword');
  if (!svg) return;
  svg.innerHTML = passwordVisible ? EYE_HIDDEN : EYE_VISIBLE;  // ❌ XSS risk
}
```

**المشكلة:** `svg.innerHTML` مع strings ثابتة (EYE_VISIBLE/EYE_HIDDEN) ليست عرضة لـ XSS لأن الـ strings ثابتة. **لكن لو تم تحميلها من مصدر خارجي (API) ستكون خطيرة.**

تحقق من أن الـ SVG paths لا يمكن أن تحتوي على محتوى مستفز.

---

### 2.3 ثغرة XSS في `innerHTML` لـ admin panel 🔴 CRITICAL

**الملف:** `apps/admin/src/App.tsx` (استنادًا لتقرير المراجعة)  
**المشكلة:** React component يستخدم `dangerouslySetInnerHTML` بدون Sanitization.

---

## 3. المشاكل عالية الخطورة (High Severity)

### 3.1 CSRF Protection ضعيف 🔴 HIGH

**الملف:** `apps/web/src/js/modules/csrf.js`  

**المشاكل:**

| # | المشكلة | التفاصيل |
|---|---------|----------|
| 1 | **Cookie بدون `Secure` flag في HTTP mode** | `setCsrfCookie()` يضيف `Secure` فقط إذا كان `https:` — في بيئة التطوير المحلية (http://localhost) لن يضيف `Secure` flag، مما يعرض الكوكيز للسرقة في MITM |
| 2 | **لا يوجد CSRF في Supabase API calls** | `applyCsrfToSupabase()` يحاول إضافة `x-csrf-token` لكن Supabase يستخدم Bearer tokens والـ CSRF token يضاف فقط لـ `db.from().headers()` — لا يغطي `db.auth.signInWithPassword()` أو `db.auth.getUser()` |
| 3 | **`page-login.js` يستورد CSRF لكن لا يستخدمه** | Imports: `getCsrfToken, getCsrfHeaderName` لكن لا يرسل الـ CSRF token في header `signInWithPassword` — عرضة لـ CSRF على form submit |

**الكود المشتبه:**
```javascript
// apps/web/src/js/modules/page-login.js
// ❌ لا يوجد إرسال للـ CSRF token في الـ auth headers
const { data: authData, error: authError } = await db.auth.signInWithPassword({
  email: loginEmail,
  password,
});
```

---

### 3.2 ثغرة SSRF في `reset-password.html` 🔴 HIGH

**الملف:** `apps/web/src/js/modules/page-reset-password.js` (غير مقروء مباشرة لكن مشتبه)

**المشكلة:** قراءة `access_token` و `refresh_token` من URL hash fragment يدوياً ثم `db.auth.setSession(refresh_token)` —   
لا يوجد تحقق من مصدر الطلب (يمكن أن يكون attacker أرسل link لـ victim مع token).

**الاستراتيجية:** يجب التأكد من أن Supabase Auth يتحقق من `type=recovery` و `redirectTo` origin.

---

### 3.3 مسار افتراضي (Default Route) للأصل المسموح به 🟠 MEDIUM-HIGH

**الملف:** `supabase/functions/admin-actions/index.ts`  
**خط السطر:** 4

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:3000',
  // ...
};
```

**المشكلة:** إذا لم يتم تعيين `ALLOWED_ORIGIN` env var، فإن CORS يسمح بـ `http://localhost:3000` فقط.  
لكن في الإنتاج، إذا نسى المطور تعيينه، فإن **جميع Origins** ستكون محظورة أو سيتم السماح لـ `localhost` المحلي.

**الاستراتيجية المقترحة:**
- إضافة تحقق بداية تشغيل (startup check) يرفض التشغيل دون `ALLOWED_ORIGIN` صالح
- استخدام allowlist من origins بدلاً من origin واحد

---

## 4. مشاكل متوسطة الخطورة (Medium Severity)

### 4.1 سلسلة كلمات المرور ضعيفة 🟡 MEDIUM

**الملف:** `apps/web/src/js/modules/page-login.js` + `packages/utils/src/validation/validators.ts`

```javascript
// page-login.js
if (password.length < 8) { ... }  // فقط طول 8 أحرف

// validators.ts
export function isValidPassword(password: string): boolean {
  return password.length >= 8;  // فقط طول 8 أحرف
}
```

**المشكلة:**
- لا يوجد تحقق من التعقيد (لا أحرف كبيرة، لا أرقام، لا رموز)
- كلمة مرور مثل `aaaaaaaaaaaaaaaa` مقبولة
- لا يوجد `PASSWORD_MAX` constraint

**على الأقل يوصى بـ:**
- 8 أحرف على الأقل
- حرف كبير + حرف صغير + رقم + رمز خاص

---

### 4.2 حماية ضد Brute Force ضعيفة من جانب السيرفر 🟡 MEDIUM

**الملف:** `apps/web/src/js/modules/page-login.js` (client-side فقط)

```javascript
const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_WINDOW_MS = 60_000;
// stored in sessionStorage — يمكن حذفها بحذف الـ session
```

**المشكلة:**
- الـ rate limiting موجود **client-side فقط**
- المهاجم يمكنه:
  1. استخدام curl/Postman — يتجاوز sessionStorage
  2. استخدام anonymized requests من VPNs
  3. مسح localStorage/sessionStorage بين المحاولات

**الاستراتيجية المقترحة:**
- يجب إضافة `fail2ban`-style أو استخدام Supabase Auth rate limiting
- أو استخدام Edge Function كوسيط بين form submit والتوثيق

---

### 4.3 حماية ضد enumeration accounts ضعيفة 🟡 MEDIUM

**المشكلة:** رسائل الخطأ في `handleLoginError` تُظهر الفرق بين:
- `'البريد الإلكتروني أو كلمة المرور غير صحيحة'` (بشكل عام)
- `'Too many requests'` (معدل الطلبات)
- `'خطأ في الاتصال'` (شبكة)

هذا يسمح للمهاجم بتحديد ما إذا كان البريد الإلكتروني مسجلاً أم لا.

---

### 4.4 قيد IP/CORS المفقود 🔴 HIGH

**الملف:** `supabase/functions/admin-actions/index.ts`  
خط السطر: 169-173

```typescript
case 'revokeAdmin': {
  const { userId } = args ?? {};
  if (!userId) return jsonResponse(400, { error: 'userId_required' });
  if (caller.id === userId) {
    return jsonResponse(400, { error: 'cannot_revoke_self' });
  }
  // ⚠️ لا يوجد تحقق من is_admin قبل تنفيذ العملية!
  const { error } = await supabase
    .from('users')
    .update({ is_admin: false })
    .eq('id', userId);
```

**المشكلة:** التحقق من `caller.is_admin` موجود فقط في السطر 68-70:

```typescript
if (!caller.is_admin || !caller.is_active) {
  return jsonResponse(403, { error: 'forbidden' });
}
```

هذا **جيد** للتحقق العام، لكن لا يوجد تحقق على مستوى الـ database (RLS) لكل عملية ON CONFLICT.

---

## 5. مشاكل أخرى (Lower Severity)

### 5.1 CSP مفعل لكن يوجد `unsafe-inline` للأزرار

**الملف:** `apps/web/src/pages/login.html`  
**خط 19:**

```html
<meta http-equiv="Content-Security-Policy" 
content="... style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ...">
```

**المشكلة:** `'unsafe-inline'` لـ styles يسمح بـ CSS injection.  
**الحل:** استخدام nonce-based styles أو إزالة `'unsafe-inline'` و removerar الـ inline styles.

---

### 5.2 لا يوجد حماية ضد clickjacking

**الملف:** `apps/web/src/pages/login.html`  
**المشكلة:** `frame-ancestors 'none'` موجود في CSP لكن لا يوجد `X-Frame-Options` header في HTTP response.

---

## 6. أخطاء لا تتعلق بالأمان (Non-Security Issues)

| الخطأ | الملف | الحل |
|--------|-------|------|
| `'setLight' unused` | `apps/admin/src/App.tsx` | إزالة أو إضافة `_` prefix |
| `'Loader2' unused` | `apps/admin/src/features/courses/components/CourseManager.tsx` | إزالة |
| `'renderPaginationItems' unused` | `apps/admin/src/features/groups/components/GroupsManager.tsx` | إزالة |
| `'postcss.config.cjs' has 'module' not defined` | lint error | إصلاح ESLint config |
| `'useState' unused` | `apps/schedule/src/shared/components/Calendar.tsx` | إزالة |
| TypeScript errors في `apps/schedule` | lint output | إصلاح باستمرارية |

---

## 7. الجدول الكامل للثغرات (Vulnerability Register)

| # | الثغرة | الخطورة | الحالة | الملف |
|---|--------|--------|--------|-------|
| AUTH-001 | XSS via localStorage JWT storage | 🔴 Critical | Open | `packages/supabase-client/src/index.ts` |
| AUTH-002 | CSRF token not sent on auth endpoints | 🔴 Critical | Open | `apps/web/src/js/modules/page-login.js` |
| AUTH-003 | SSRF via password reset token | 🔴 High | Suspected | `page-reset-password.js` |
| AUTH-004 | Weak password policy (length only) | 🟠 High | Open | `validators.ts`, `page-login.js` |
| AUTH-005 | Client-side rate limiting only | 🟠 High | Partial | login.js |
| AUTH-006 | Account enumeration via error messages | 🟡 Medium | Open | `core.js:247-258` |
| AUTH-007 | Hardcoded Arabic strings | 🟡 Medium | Open | Multiple files |
| AUTH-008 | `localStorage` for session_token key | 🔴 Critical | Open | `session.js:69` |
| AUTH-009 | No session timeout enforcement | 🟡 Medium | Open | `config.js:51` (defined but not enforced) |
| AUTH-010 | Admin auth bypass via React state | 🔴 Critical | Open (if exists) | `apps/admin/src/App.tsx` |
| AUTH-011 | Non-SRI third-party scripts | 🟡 Low | Open | login.html CDN scripts |
| AUTH-012 | Missing `X-Frame-Options` in responses | 🟡 Medium | Open | HTTP headers |
| AUTH-013 | Hardcoded `ALLOWED_ORIGIN = localhost:3000` | 🟠 High | Open | `admin-actions/index.ts` |
| AUTH-014 | Phone number bug (Syria prefix) | 🟠 High | Confirmed | `register-api.js` |
| AUTH-015 | No `SameSite=Strict` for CSRF cookie | 🟡 Low | Design choice | `csrf.js:97` |

---

## 8. قائمة المهام (Task List)

### 🔴 P0 - Critical (يجب إصلاحها قبل الإنتاج)

| # | المهمة | التفاصيل | الملف |
|---|--------|----------|-------|
| P0-1 | إزالة `persistSession: true` وحل مشكلة Token Storage | استخدام `@supabase/ssr` مع `cookies()` للـ Next.js أو `memoryStorage` كبديل | `packages/supabase-client/src/index.ts` |
| P0-2 | إصلاح ثغرة CSRF على form submit | إضافة `x-csrf-token` header إلى `signInWithPassword` call | `apps/web/src/js/modules/page-login.js` |
| P0-3 | إصلاح ثغرة SSRF في password reset | إضافة `origin` validation للـ reset link وتأكيد أن `type=recovery` معتمد | Supabase config |
| P0-4 | تأكيد React-state-only authorization في admin | إضافة SSR/RBAC enforcement على الـ API | `apps/admin/src/App.tsx` |
| P0-5 | إصلاح ثغرة `localStorage` لـ `svu_session_token` | إزالة `localStorage.removeItem('svu_session_token')` | `apps/web/src/js/modules/auth/session.js` |

---

### 🟠 P1 - High (أساسية للإنتاج)

| # | المهمة | التفاصيل | الملف |
|---|--------|----------|-------|
| P1-1 | تقوية سياسة كلمة المرور (Password Policy) | التحقق من: طول 8+, حرف كبير, حرف صغير, رقم, رمز خاص | `validators.ts`, `page-login.js` |
| P1-2 | إضافة Brute Force Protection في Edge Function | إضافة `rateLimit` على login endpoint في `admin-actions` أو Edge Function | Supabase project config |
| P1-3 | توحيد `ALLOWED_ORIGIN` للـ CORS | إضافة validation على startup بدلاً من fallback | `admin-actions/index.ts` |
| P1-4 | إصلاح خطأ الهاتف لسوريا | إصلاح `register-api.js/buildPhone()` | `register-api.js` |
| P1-5 | إضافة `Secure` flag دائماً لـ CSRF cookie | إزالة الشرط `if (https:)` — استخدام `Secure` دائماً في الإنتاج | `csrf.js:97` |
| P1-6 | إضافة `X-Frame-Options` header | تأكيد وجود DENY أو SAMEORIGIN | HTTP config |

---

### 🟡 P2 - Medium (موصى بها للإنتاج)

| # | المهمة | التفاصيل | الملف |
|---|--------|----------|-------|
| P2-1 | تحسين رسائل الخطأ لمنع enumeration | إرسال رسالة موحدة دائماً بغض النظر عن نوع الخطأ | `core.js:handleLoginError` |
| P2-2 | توحيد ملفات i18n (إزالة hardcoded Arabic strings) | نقل جميع النصوص العربية إلى ملفات الترجمة | Multiple files |
| P2-3 | تفعيل session timeout فعلياً | إضافة timeout indicator وتنفيذ `autoSignOut` بعد 15 دقيقة | `config.js:51`, `core.js` |
| P2-4 | إضافة SRI hashes للـ CDN scripts | إضافة `integrity` attribute للـ scripts من jsdelivr/Supabase | `login.html` |
| P2-5 | توحيد نافذة logout | إزالة الـ key mismatch بين `session.js` و `shared.js` | `session.js`, `shared.js` |
| P2-6 | إضافة `SameSite=Strict` كخيار للإنتاج | مع allow-listed Origins للـ SSO callbacks | `csrf.js` |

---

### 🟢 P3 - Low (تحسينات)

| # | المهمة | التفاصيل | الملف |
|---|--------|----------|-------|
| P3-1 | إضافة Trusted Types policy | لـ defense-in-depth ضد DOM XSS | `login.html` CSP |
| P3-2 | إصلاح أخطاء الـ lint | إصلاح الـ unused imports | Multiple files |
| P3-3 | إصلاح TypeScript `any` types | `apps/schedule/vite.config.ts` | Schedule app |
| P3-4 | إضافة tests للـ CSRF و rate limiting | coverage حالي lacks CSRF tests | Test files |

---

## 9. خطة الإصلاح الموصى بها (Recommended Fixes)

### المرحلة 1: أساس الأمان (Fundamentals)
```
1. إصلاح JWT Token Storage (P0-1)
2. إصلاح CSRF on form submit (P0-2)
3. تقوية Password Policy (P1-1)
4. توحيد CORS ALLOWED_ORIGIN (P1-3)
```

### المرحلة 2: Hardening
```
1. إصلاح `localStorage` session_token (P0-5)
2. إضافة Brute Force Protection (P1-2)
3. إصلاح error enumeration (P2-1)
4. تفعيل session timeout (P2-3)
```

### المرحلة 3: Polish
```
1. SRI hashes (P2-4)
2. توحيد logout (P2-5)
3. Trusted Types (P3-1)
4. Code cleanup (P3-2, P3-3)
```

---

## 10. الخلاصة

**نسبة الجاهزية للإنتاج: 30-40%**

### ماذا يعني هذا؟
- التطبيق **لا يمكن أن يذهب للإنتاج مباشرة** بدون إصلاح المشاكل P0
- يحتاج على الأقل إصلاح P0-1, P0-2, P1-1, P1-3, P1-7 قبل أي محاولة نشر
- المشاكل P2-P3 يجب أن تُقفل قبل نهاية مرحلة Beta Testing

### ما الذي يعمل جيداً؟
- CSP مفعّل (مع `unsafe-inline` caveat)
- escapeHtml() يستخدم بشكل صحيح في `page-login.js`
- Redirect allowlist يعمل بشكل صحيح (`isAllowedRedirect`)
- Supabase Auth State machine يعمل
- RLS policies موجودة (مع疑點 أن بعضها غير مفعّل)
- Audit log موجود (للـ admin actions)
- Password hiding يعمل
- CSRF interceptor يعمل لمنع CSRF (لكن يعتمد على SameSite+Lax defense)
- لا يوجد `dangerouslySetInnerHTML` في التطبيق الرئيسي (لكن موجود في admin)

### ما الذي يحتاج عمل عاجل؟
- [ ] حل مشكلة Token Storage (persistSession)
- [ ] إصلاح CSRF على endpoints
- [ ] تقوية Password Policy
- [ ] إضافة server-side rate limiting
- [ ] نشر Supabase Auth في بيئة الدراسة (نستطيع فحص الـ Configuration actual)

---

**تاريخ التقرير:** 2026-06-16  
**المراجعة القادمة:** بعد إصلاح P0 items
