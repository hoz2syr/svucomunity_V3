# توثيق نظام المصادقة - SVU Community

## جدول المحتويات
1. [نظرة عامة على النظام](#1-نظرة-عامة-على-النظام)
2. [البنية المعمارية](#2-البنية-المعمارية)
3. [مخطط العلاقات العام](#3-مخطط-العلاقات-العام)
4. [تدفقات المصادقة التفصيلية](#4-تدفقات-المصادقة-التفصيلية)
5. [توثيق الملفات](#5-توثيق-الملفات)
6. [قاعدة البيانات](#6-قاعدة-البيانات)
7. [التحليل الأمني](#7-التحليل-الامني)
8. [الاختبارات](#8-الاختبارات)
9. [التوصيات](#9-التوصيات)

---

## 1. نظرة عامة على النظام

### 1.1 الوصف
نظام المصادقة في SVU Community مبني على **Supabase Auth** كخدمة مصادقة كخدمة (BaaS)، مع تطبيق ويب من طرف العميل (SPA) يستخدم Vanilla JavaScript. النظام يدعم ثلاث طبقات:

1. **المصادقة (Authentication):** التحقق من هوية المستخدم عبر البريد الإلكتروني وكلمة المرور أو Google OAuth
2. **التفويض (Authorization):** التحقق من صلاحيات المستخدم (مستخدم عادي / مشرف)
3. **الاستمرارية (Session Management):** إدارة الجلسات وتحديث الرموز تلقائياً

### 1.2 التقنيات المستخدمة
- **Supabase Auth** - خدمة المصادقة (PostgreSQL + GoTrue)
- **Supabase JS SDK v2** - عميل المصادقة من طرف العميل
- **Vanilla JavaScript (ES Modules)** - منطق واجهة المستخدم
- **React + TypeScript** - تطبيق الإدارة (`apps/admin`)
- **Vitest + Playwright** - الاختبارات
- **Content Security Policy (CSP)** - حماية من XSS
- **CSRF Protection** - حماية من هجمات CSRF
- **Sentry** - تتبع الأخطاء مع إخفاء البيانات الحساسة

### 1.3 مسارات التطبيق
| المسار | الوصف |
|--------|-------|
| `/login.html` | صفحة تسجيل الدخول |
| `/register.html` | صفحة إنشاء حساب جديد |
| `/verify-email.html` | تأكيد البريد الإلكتروني |
| `/reset-password.html` | إعادة تعيين كلمة المرور |
| `/dashboard.html` | لوحة تحكم المستخدم |
| `/admin.html` | لوحة تحكم المشرف |

---

## 2. البنية المعمارية

### 2.1 الطبقات

```
┌─────────────────────────────────────────────────────────┐
│                   طبقة العرض (Presentation)              │
│  login.html, register.html, verify-email.html,          │
│  reset-password.html, dashboard.html, admin.html        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                طبقة المنطق (Logic Layer)                 │
│  page-login.js, page-register/*, page-verify-email.js,  │
│  page-reset-password.js, page-dashboard.js              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              طبقة الخدمات المشتركة (Shared)              │
│  config.js, core.js, csrf.js, shared.js, session.js,   │
│  encrypted-storage.js, window-shim.js                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              طبقة الحماية (Auth Guard)                   │
│  auth/auth-guard.js → withAuth() middleware             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               عميل Supabase (Client Layer)              │
│  supabase-client/src/client.ts → createClient()         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│            Supabase Auth (.auth.users) + RLS             │
│            + public.users + Edge Functions              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 قاعدة البيانات

```
auth.users (Supabase managed)
    │
    │ FK: id → ON DELETE CASCADE
    ▼
public.users
    │
    ├── is_admin BOOLEAN (للتحقق من صلاحيات المشرف)
    ├── is_active BOOLEAN (لتعطيل الحساب)
    ├── username TEXT UNIQUE
    ├── email TEXT
    ├── first_name, last_name, middle_name
    ├── major, phone, country_code
    └── avatar_url

Triggers (003_auth.sql):
    ├── handle_new_user() → ينشئ صف في public.users بعد INSERT على auth.users
    └── handle_email_confirmed() → ينشئ صف عند تأكيد البريد

RLS Policies (002_users.sql):
    ├── users_read_own: المستخدم يقرأ بياناته فقط
    ├── users_read_admin: المشرف يقرأ جميع المستخدمين
    └── users_update_own: المستخدم يحدث بياناته فقط

Database Functions (003_auth.sql):
    ├── has_role(check_role) → SECURITY DEFINER
    ├── services.get_user_roles(uid) → SECURITY DEFINER
    └── services.assert_admin() → SECURITY DEFINER
```

---

## 3. مخطط العلاقات العام

```
┌──────────────────────────────────────────────────────────────────────┐
│                        التطبيقات (Apps)                               │
├──────────────┬──────────────────────┬──────────────────────────────────┤
│  apps/web    │   apps/admin (React) │    apps/schedule                │
│  (Vanilla JS)│   (shadcn/ui)        │    (AI-powered)                 │
└──────┬───────┴──────────┬───────────┴──────────────┬─────────────────┘
       │                  │                           │
       │  ┌───────────────┴──────────────┐            │
       │  │  packages/ui (useAuth hook)  │            │
       │  └──────────────────────────────┘            │
       │                                             │
       │  ┌────────────────────────────────────────┐  │
       └──│  packages/supabase-client              │  │
          │  ├── client.ts (browser anon key)       │  │
          │  ├── index.ts (exports + isAdmin())     │  │
          │  ├── server.ts (service-role key)       │  │
          │  └── middleware.ts (withAuth())         │  │
          └────────────────────────────────────────┘  │
                              │                       │
                              ▼                       │
                    ┌───────────────────┐             │
                    │    Supabase       │             │
                    │  ┌─────────────┐  │             │
                    │  │ auth.users  │  │◄── signUp   │
                    │  │ (GoTrue)    │  │   signIn    │
                    │  └──────┬──────┘  │   signOut   │
                    │         │ ON       │   getUser   │
                    │         │ DELETE   │   setSession│
                    │         │ CASCADE  │             │
                    │  ┌──────▼──────┐   │             │
                    │  │public.users │   │             │
                    │  │+ RLS        │   │             │
                    │  └─────────────┘   │             │
                    │                    │             │
                    │  ┌─────────────────┐│             │
                    │  │admin-actions    ││             │
                    │  │(Edge Function)  ││             │
                    │  │↑ verifyCaller() ││             │
                    │  │↑ assert_admin() ││             │
                    │  └─────────────────┘│             │
                    └────────────────────┘             │
                              │                       │
                              ▼                       │
                    ┌───────────────────┐             │
                    │  sequel / HTTP   │             │
                    │  (Realtime)      │             │
                    └───────────────────┘             │
```

---

## 4. تدفقات المصادقة التفصيلية

### 4.1 مخطط تدفق تسجيل الدخول (Login Flow)

```
┌──────────┐              ┌──────────────┐              ┌────────────┐
│ المستخدم  │              │ page-login.js│              │   Supabase │
└────┬─────┘              └──────┬───────┘              └─────┬──────┘
     │                           │                           │
     │  يفتح login.html         │                           │
     │─────────────────────────►│                           │
     │                          │  checkExistingSession()   │
     │                          │──────────────────────────►│
     │                          │  db.auth.getUser()        │
     │                          │◄──────────────────────────│
     │                          │                           │
     │  [جلسة نشطة؟]            │                           │
     │                          │                           │
     │  [نعم]                   │                           │
     │  يوجه لـ dashboard.html │                           │
     │◄─────────────────────────│                           │
     │                          │                           │
     │  [لا] يعرض نموذج الدخول  │                           │
     │◄─────────────────────────│                           │
     │                          │                           │
     │  يدخل البريد + كلمة المرور                        │
     │─────────────────────────►│                           │
     │                          │  validateInput()          │
     │                          │  - email regex            │
     │                          │  - password >= 8 chars   │
     │                          │                           │
     │  [خطأ في المدخلات]       │                           │
     │◄─────────────────────────│  showToast(error)         │
     │                          │                           │
     │  [مدخلات صحيحة]          │                           │
     │                          │  db.auth.signInWithPassword│
     │                          │──────────────────────────►│
     │                          │  { email, password }      │
     │                          │                           │
     │                          │  ◄ SUCCESS ──────────────│
     │                          │  { session, user }        │
     │                          │                           │
     │                          │  loadCurrentUser(db)      │
     │                          │──────────────────────────►│
     │                          │  SELECT FROM public.users │
     │                          │  WHERE id = auth.uid()    │
     │                          │◄──────────────────────────│
     │                          │                           │
     │                          │  saveUserSession(profile) │
     │                          │  (cacheUser)              │
     │                          │                           │
     │                          │  showToast("مرحباً بك!")   │
     │                          │                           │
     │  يوجه لـ dashboard.html  │                           │
     │◄─────────────────────────│  window.location.href     │
     │                          │                           │
```

### 4.2 مخطط تدفق التسجيل (Register Flow)

```
┌──────────┐              ┌────────────────────┐              ┌────────────┐
│ المستخدم  │              │  register-api.js   │              │   Supabase │
└────┬─────┘              └────────┬───────────┘              └─────┬──────┘
     │                               │                               │
     │  يفتح register.html          │                               │
     │─────────────────────────────►│                               │
     │                               │  resolveDb()                  │
     │                               │  fetchMajors()                │
     │                               │  initLang()                   │
     │                               │                               │
     │  يعرض النموذج                │                               │
     │◄─────────────────────────────│                               │
     │                               │                               │
     │  يملأ البيانات + validates    │                               │
     │  (username, email, password,  │                               │
     │   phone, major...)            │                               │
     │─────────────────────────────►│                               │
     │                               │  validateUsername()           │
     │                               │  validateMajor()              │
     │                               │  validatePhone()              │
     │                               │  validatePassword()           │
     │                               │                               │
     │  [خطأ تحقق]                   │                               │
     │◄─────────────────────────────│  showToast(error)             │
     │                               │                               │
     │  [تحقق نجح]                   │                               │
     │                               │  pre-check:                   │
     │                               │  SELECT username FROM users   │
     │                               │  WHERE username = ?           │
     │                               │──────────────────────────────►│
     │                               │◄──────────────────────────────│
     │                               │                               │
     │                               │  [المستخدم موجود؟]           │
     │                               │→ show error (username taken)  │
     │                               │                               │
     │                               │  pre-check:                   │
     │                               │  SELECT email FROM users      │
     │                               │  WHERE email = ?              │
     │                               │──────────────────────────────►│
     │                               │◄──────────────────────────────│
     │                               │                               │
     │                               │  [البريد موجود؟]             │
     │                               │→ show error (email taken)     │
     │                               │                               │
     │                               │  db.auth.signUp()             │
     │                               │  { email, password,           │
     │                               │    options: { data: { ... } } │
     │                               │──────────────────────────────►│
     │                               │                               │
     │                               │  ◄ SUCCESS ──────────────────│
     │                               │  (user + session/email sent)  │
     │                               │                               │
     │                               │  [data.session موجود؟]       │
     │                               │  → yes: redirect login.html   │
     │                               │  → no : redirect verify-email │
     │                               │    + store email in localStorage│
     │                               │      (svu_pending_verification)│
     │  يوجه لـ verify-email.html    │                               │
     │◄─────────────────────────────│                               │
     │                               │                               │
```

### 4.3 مخطط تدفق تأكيد البريد (Verify Email Flow)

```
┌──────────┐              ┌──────────────────────┐              ┌────────────┐
│ المستخدم  │              │ page-verify-email.js│              │   Supabase │
└────┬─────┘              └──────────┬───────────┘              └─────┬──────┘
     │                                │                               │
     │  يضغط على رابط التأكيد         │                               │
     │  (من البريد الإلكتروني)        │                               │
     │───────────────────────────────►│                               │
     │                                │  يقرأ URL hash:               │
     │                                │  - access_token               │
     │                                │  - refresh_token              │
     │                                │  - type=signup                │
     │                                │                               │
     │                                │  db.auth.setSession()         │
     │                                │──────────────────────────────►│
     │                                │  { access_token,             │
     │                                │    refresh_token }            │
     │                                │◄──────────────────────────────│
     │                                │  session established          │
     │                                │                               │
     │                                │  showSuccess()                │
     │                                │  "تم تأكيد البريد"            │
     │◄───────────────────────────────│                               │
     │                                │                               │
     │  [بعد 3 ثوانٍ]                 │                               │
     │                                │  db.auth.signOut()            │
     │                                │──────────────────────────────►│
     │                                │                               │
     │  يوجه لـ login.html            │                               │
     │◄───────────────────────────────│  window.location.href         │
```

### 4.4 مخطط تدفق إعادة تعيين كلمة المرور (Reset Password Flow)

```
┌──────────┐              ┌──────────────────────────┐              ┌────────────┐
│ المستخدم  │              │ page-reset-password.js  │              │   Supabase │
└────┬─────┘              └──────────┬───────────────┘              └─────┬──────┘
     │                                │                                   │
     │  login.html → "نسيت كلمة المرور؟"                                 │
     │──────────────────────────────────────────────────────────────────►│
     │                                │                                   │
     │  يعرض Modal                    │                                   │
     │◄──────────────────────────────│                                   │
     │                                │                                   │
     │  يدخل البريد الإلكتروني         │                                   │
     │──────────────────────────────────────────────────────────────────►│
     │                                │  validateEmail()                 │
     │                                │                                   │
     │                                │  db.auth.resetPasswordForEmail() │
     │                                │─────────────────────────────────►│
     │                                │  { email, redirectTo:           │
     │                                │    /reset-password.html }       │
     │                                │◄─────────────────────────────────│
     │                                │                                   │
     │  showToast("تم إرسال الرابط")  │                                   │
     │◄──────────────────────────────│                                   │
     │                                │                                   │
     │               يضغط على الرابط من البريد (reset-password.html#...) │
     │◄──────────────────────────────────────────────────────────────────│
     │                                │                                   │
     │                                │  يقرأ URL hash:                 │
     │                                │  - access_token                 │
     │                                │  - refresh_token               │
     │                                │  - type=recovery               │
     │                                │                                   │
     │                                │  db.auth.setSession()           │
     │                                │─────────────────────────────────►│
     │                                │  (established recovery session) │
     │                                │                                   │
     │  يعرض نموذج كلمة المرور الجديدة│                                   │
     │◄──────────────────────────────│                                   │
     │                                │                                   │
     │  يدخل كلمة مرور جديدة + تأكيد │                                   │
     │──────────────────────────────────────────────────────────────────►│
     │                                │  validate password >= 8         │
     │                                │  validate confirm match         │
     │                                │                                   │
     │                                │  db.auth.updateUser({ password })│
     │                                │─────────────────────────────────►│
     │                                │◄─────────────────────────────────│
     │                                │                                   │
     │  showSuccess("تم تغيير كلمة المرور")                               │
     │◄──────────────────────────────│                                   │
     │                                │                                   │
     │  [بعد 3 ثوانٍ]                 │                                   │
     │  يوجه لـ login.html            │                                   │
     │◄──────────────────────────────│                                   │
```

### 4.5 مخطط تدفق المشرف (Admin Flow)

```
┌──────────┐              ┌────────────────────┐              ┌─────────────────┐
│ المشرف    │              │ admin/auth.js      │              │admin-actions    │
│ (Browser) │              │ + adminApi.js      │              │(Edge Function)  │
└────┬─────┘              └────────┬───────────┘              └────────┬────────┘
     │                               │                                   │
     │  يفتح admin.html              │                                   │
     │──────────────────────────────►│                                   │
     │                               │  checkAdminAccess()              │
     │                               │──────────────────────────────────►│
     │                               │  1. isLoggedIn()                 │
     │                               │  2. verifySessionWithServer()    │
     │                               │  3. db.from('users').select()    │
     │                               │     .eq('id', user.id)           │
     │                               │     .single()                    │
     │                               │◄──────────────────────────────────│
     │                               │                                   │
     │                               │  [is_admin && is_active؟]        │
     │                               │                                   │
     │  [نعم] يعرض لوحة المشرف      │                                   │
     │◄──────────────────────────────│                                   │
     │                               │                                   │
     │                               │  [لا] showAccessDenied()         │
     │                               │  + redirect بعد ثانيتين          │
     │                               │                                   │
     │  ينفذ إجراء (مثل makeAdmin)   │                                   │
     │──────────────────────────────────────────────────────────────────►│
     │                               │  getAdminAccessToken()           │
     │                               │  (db.auth.getSession())          │
     │                               │                                   │
     │                               │  callAdmin(action, payload)      │
     │                               │──────────────────────────────────►│
     │                               │  db.functions.invoke()           │
     │                               │  Authorization: Bearer token     │
     │                               │  { action, payload }             │
     │                               │                                   │
     │                               │              verifyCaller():      │
     │                               │              1. Bearer token ←──│
     │                               │              2. getUser(token)   │
     │                               │              3. SELECT is_admin  │
     │                               │              4. Check is_active  │
     │                               │◄──────────────────────────────────│
     │                               │                                   │
     │                               │         [unauthorized؟]          │
     │                               │         → 401/403 response       │
     │                               │                                   │
     │                               │         [authorized؟]            │
     │                               │         → execute action         │
     │                               │         → log to admin_audit_log │
     │                               │◄──────────────────────────────────│
     │◄──────────────────────────────│  { ok: true, data }              │
     │  showToast(result)            │                                   │
```

---

## 5. توثيق الملفات

### 5.1 طبقة الخدمات المشتركة (Shared Layer)

#### `apps/web/src/js/modules/config.js`
| العنصر | النوع | الوصف |
|--------|--------|-------|
| `initSupabase()` | دالة | ينشئ عميل SupabaseBrowser مع `persistSession: true`, `autoRefreshToken: true`. يطبق CSRF protection. |
| `getDb()` | دالة | يرق synchronous alias لـ initSupabase() |
| `verifySessionWithServer(db)` | دالة | يتحقق من صحة الجلسة عبر `db.auth.getUser()` |
| `getSessionFromDb()` | دالة | يسترجع الجلسة الحالية |
| `SUPABASE_CONFIG` | كائن | يحتوي على URL ومفتاح anon |
| `AUTH_CONFIG` | كائن | مفاتيح التخزين ومهلة الجلسة (15 دقيقة) |
| `SECURITY_CONFIG` | كائن | requireEmailConfirmation + sessionTimeout |

#### `apps/web/src/js/modules/core.js`
| العنصر | النوع | الوصف |
|--------|--------|-------|
| `getCurrentUser()` | دالة | ترجع المستخدم المخزن في الذاكرة (cachedUser) |
| `cacheUser(userData)` | دالة | تخزين مؤقت لبيانات المستخدم |
| `clearUserSession()` | دالة | مسح التخزين المؤقت |
| `loadCurrentUser(db)` | دالة | جلب الملف الشخصي من `public.users` + التحقق من is_active |
| `isLoggedIn(db)` | دالة | التحقق من وجود جلسة Supabase نشطة |
| `verifySession(db)` | دالة | نفس isLoggedIn (اسم بديل) |
| `handleLoginError(error)` | دالة | تحويل أخطاء Supabase إلى رسائل آمنة |
| `escapeHtml(text)` | دالة | حماية من XSS |
| `initializeCsrf(db)` | دالة | تهيئة حماية CSRF |

#### `apps/web/src/js/modules/csrf.js`
| العنصر | النوع | الوصف |
|--------|--------|-------|
| `getCsrfToken()` | دالة | توليد/استرجاع رمز CSRF مع fingerprint binding |
| `setCsrfCookie(token)` | دالة | تعيين cookie بـ SameSite=Lax |
| `applyCsrfToSupabase(db)` | دالة | حقن رأس x-csrf-token في كل استعلام Supabase |
| `validateCsrfFromEvent(event)` | دالة | التحقق من صحة الرمز من الأحداث |

**CSRF Token Format:** `{fingerprint}:{randomHexToken}` مخزن في sessionStorage + cookie

**Browser Fingerprint:** User-Agent + Language + Timezone + Screen Resolution → hash

#### `apps/web/src/js/modules/shared.js`
| العنصر | النوع | الوصف |
|--------|--------|-------|
| `logout()` | دالة | تسجيل خروج كامل: signOut + مسح التخزين + redirect |
| `showToast(message, type)` | دالة | عرض إشعارات (success/error) بـ role="alert" |
| `loadSVUCourses()` | دالة | تحميل قائمة المواد من ملف JSON |

**الاختيارات المخزنة في localStorage:**
- `svu_session` - (قديم/legacy)
- `svu_user` - بيانات المستخدم غير الحساسة (username, major)
- `svu_theme` - تفضيل المظهر

**الاختيارات المخزنة في sessionStorage:**
- `svu_session_token` - (قديم/legacy)
- `svu_csrf_token` - رمز CSRF المرتبط بالبصمة

### 5.2 طبقة الحماية (Auth Guard Layer)

#### `apps/web/src/js/modules/auth/auth-guard.js`
```javascript
// التدفق العام:
1. getDb() → إذا فشل → redirect login.html
2. verifySessionWithServer(db) → getUser() → إذا فشل → redirect login.html
3. getCurrentUser() → إذا null → redirect login.html
4. إذا requireAdmin=true:
   query users table → is_admin && is_active → إذا فشل → redirect index.html
5. إرجاع { user, db }
```

| المعلمة | النوع | الوصف |
|---------|--------|-------|
| `requireAdmin` | boolean | التحقق من صلاحيات المشرف |
| `silent` | boolean | عدم عرض إشعارات أو redirect (للفحص فقط) |

#### `apps/web/src/js/modules/auth/auth.js`
غلاف بسيط يرمي خطأ `Unauthorized` عند فشل `checkAuth()`.

### 5.3 صفحات المصادقة (Auth Pages)

#### `apps/web/src/js/modules/page-login.js`
```
checkExistingSession()
  └─> isSupabaseSessionActive(db)
       └─> db.auth.getUser()
            └─> [نشط] → redirectToDashboard()
            └─> [غير نشط] → clearUserSession()

handleLoginSubmit()
  ├─> validate: email regex + password >= 8
  ├─> db.auth.signInWithPassword({ email, password })
  ├─> loadCurrentUser(db) ──> SELECT FROM public.users
  ├─> saveUserSession(userData)
  ├─> showToast("مرحباً بك!")
  └─> redirectToDashboard()

handleForgotPasswordSubmit()
  └─> db.auth.resetPasswordForEmail(email, { redirectTo })
```

#### `apps/web/src/js/modules/page-register/register-api.js`
```
submitRegisterForm()
  ├─> validateUsername() ── Regex: [a-zA-Z]+_\d{6}
  ├─> validateMajor()
  ├─> validatePhone() ── digits length by country
  ├─> validatePassword() ── >= 8 chars + match confirm
  ├─> pre-check: SELECT username FROM users WHERE username = ?
  ├─> pre-check: SELECT email FROM users WHERE email = ?
  ├─> db.auth.signUp({ email, password, options: { data: {...} } })
  ├─> [session exists] → redirect login.html
  └─> [no session] → redirect verify-email.html + localStorage email
```

#### `apps/web/src/js/modules/page-verify-email.js`
```
type === 'signup':
  └─> db.auth.setSession({ access_token, refresh_token })
  └─> showSuccess() → setTimeout → signOut() → login.html

type === 'recovery':
  └─> redirect reset-password.html + hash

resendVerification():
  ├─> fallback 1: URL ?email= query param
  ├─> fallback 2: localStorage svu_pending_verification_email
  ├─> fallback 3: window.prompt()
  └─> db.auth.resend({ type: 'signup', email })
```

#### `apps/web/src/js/modules/page-reset-password.js`
```
type === 'recovery':
  └─> db.auth.setSession({ access_token, refresh_token })
  └─> show form

submit:
  ├─> validate password >= 8 + match
  ├─> db.auth.updateUser({ password })
  ├─> showSuccess()
  └─> setTimeout → login.html
```

### 5.4 طبقة React (Admin App)

#### `packages/ui/src/hooks/useAuth.ts`
```
initAuth():
  ├─> import supabase client
  ├─> supabase.auth.getSession()
  ├─> setSession(currentSession)
  ├─> fetchProfile(supabase, userId) → SELECT * FROM users
  ├─> supabase.auth.onAuthStateChange()
  │     ├─> setSession(newSession)
  │     └─> fetchProfile() → setUser()
  └─> cleanup: unsubscribe on unmount

login(email, password):
  └─> supabase.auth.signInWithPassword() → fetchProfile()

logout():
  └─> supabase.auth.signOut() → setUser(null) → setSession(null)

isAuthenticated = session !== null  (not user !== null)
```

### 5.5 طبقة العميل المشترك (Shared Client)

#### `packages/supabase-client/src/client.ts`
```typescript
createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,  // handled manually in verify/reset pages
  }
})
```

#### `packages/supabase-client/src/middleware.ts`
```typescript
withAuth(fn):
  └─> supabase.auth.getSession()
  └─> if no session → throw 'Unauthorized'
  └─> return fn()
  // ملاحظة: لا يتحقق من صلاحيات المشرف
```

#### `packages/supabase-client/src/server.ts`
```typescript
// للاستخدام في Edge Functions فقط
createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
})
// يستخدم مفتاح خدمة خدمة Supabase - يتجاوز RLS
```

### 5.6 أنواع TypeScript

#### `packages/types/src/user.ts`
```typescript
interface User {
  id: string
  email: string
  username: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Profile extends User {
  display_name: string
  first_name?: string
  last_name?: string
  avatar_url?: string | null
}
```

#### `packages/types/src/auth-state.ts`
```typescript
interface AuthState {
  user: User | null
  loading: boolean
}
```

---

## 6. قاعدة البيانات

### 6.1 الجداول

#### `public.users` (002_users.sql)
```sql
CREATE TABLE public.users (
    id          UUID      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT      NOT NULL,
    username    TEXT      NOT NULL UNIQUE,
    is_admin    BOOLEAN   NOT NULL DEFAULT false,
    is_active   BOOLEAN   NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes:
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);

-- RLS Policies:
-- 1. users_read_own: auth.uid() = id (SELECT only)
-- 2. users_read_admin: auth.uid() IS NOT NULL AND is_admin = true (SELECT only)
-- 3. users_update_own: auth.uid() = id (UPDATE only)
```

#### `public.settings` (007_settings.sql)
```sql
CREATE TABLE public.settings (
    key       TEXT      PRIMARY KEY,
    value     JSONB     NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: admins only read/update
```

### 6.2 Triggers

#### `handle_new_user()` (003_auth.sql)
- **الحدث:** AFTER INSERT ON auth.users
- **الشرط:** NEW.email_confirmed_at IS NOT NULL
- **الإجراء:** INSERT INTO public.users (id, email, username)

#### `handle_email_confirmed()` (003_auth.sql)
- **الحدث:** AFTER UPDATE OF email_confirmed_at ON auth.users
- **الشرط:** NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL
- **الإجراء:** INSERT INTO public.users (id, email, username)

### 6.3 دوال Database

```sql
-- التحقق من وجود صلاحيات مشرف
has_role(check_role TEXT) RETURNS BOOLEAN
  SECURITY DEFINER
  -- يتحقق: auth.uid() IS NOT NULL AND is_admin = true AND is_active = true

-- جلب صلاحيات مستخدم
services.get_user_roles(uid UUID) RETURNS TABLE(is_admin BOOLEAN, is_active BOOLEAN)
  SECURITY DEFINER
  -- يرفع استثناء 42501 إذا لم يكن المستخدم مصادقاً

-- التأكد من أن المستخدم مشرف
services.assert_admin() RETURNS VOID
  SECURITY DEFINER
  -- يرفع استثناء 42501 إذا لم يكن مشرف
```

---

## 7. التحليل الأمني

### 7.1 نقاط القوة

| # | العنصر | الوصف |
|---|--------|-------|
| 1 | **Content Security Policy** | مفعلة على login.html: restrict إلى self + supabase.co + jsdelivr.net |
| 2 | **CSRF Protection** | double-submit cookie pattern مع SameSite=Lax + browser fingerprint binding |
| 3 | **XSS Protection** | escapeHtml() في كل أماكن إخراج البيانات + Sentry redaction |
| 4 | **Session Storage** | الجلسات في sessionStorage (لا تبقى بعد إغلاق المتصفح) + Supabase SDK |
| 5 | **Email Confirmation** | requireEmailConfirmation: true |
| 6 | **RLS Policies** | كل جدول محمي بـ RLS على auth.uid() |
| 7 | **SECURITY DEFINER** | دوال has_role/get_user_roles/assert_admin تستخدم SECURITY DEFINER |
| 8 | **Admin Audit Log** | كل إجراء مشرف يُسجل في admin_audit_log |
| 9 | **Error Sanitization** | handleLoginError لا يكشف معلومات حساسة |
| 10 | **Password Hiding** | حقول كلمة المرور تستخدم type="password" + autocomplete |

### 7.2 نقاط الضعف

#### حرجة (Critical)

| # | المعرف | الملف | الوصف |
|---|--------|-------|-------|
| C-1 | `logout cleanup` | shared.js:219-227 | لا يتم مسح localStorage بالكامل عند تسجيل الخروج |

**الملاحظة:** بعد المراجعة الفعلية، `logout()` في shared.js يقوم بـ:
```javascript
sessionStorage.removeItem('svu_session_token');
sessionStorage.removeItem('svu_csrf_token');
localStorage.removeItem('svu_session');
localStorage.removeItem('svu_user');
localStorage.removeItem('svu_theme');
```
ولكن `session.js:66-69` يستخدم مفاتيح مختلفة (`svu_session_token`, `svu_csrf_token`, `svu_theme`, `svu_user`). يجب توحيد المفاتيح.

#### عالية الخطورة (High)

| # | المعرف | الملف | الوصف |
|---|--------|-------|-------|
| H-1 | `unvalidated redirect` | page-login.js:27 | `redirectToDashboard()` يستخدم URL ثابت dashboard.html - آمن |
| H-2 | `email_confirmed check` | 003_auth.sql | Trigger يتحقق من email_confirmed_at قبل إنشاء المستخدم |

**الملاحظة:** بعد المراجعة الفعلية، 003_auth.sql يتضمن الشرط:
```sql
IF NEW.email_confirmed_at IS NOT NULL THEN
  INSERT INTO public.users ...
```
هذا **تم إصلاحه** في migration 003. ولكن `supabase-setup.sql` (bundled version) لا يحتوي على هذا الشرط - يجب توحيد الإصدارات.

#### متوسطة الخطورة (Medium)

| # | المعرف | الملف | الوصف |
|---|--------|-------|-------|
| M-1 | `client-side validation` | page-login.js:98 | طول كلمة المرور يُتحقق فقط في العميل |
| M-2 | `no rate limiting` | all auth files | لا يوجد تحديد لمحاولات تسجيل الدخول الفاشلة |
| M-3 | `error enumeration` | core.js:247-258 | handleLoginError يعرض رسائل مختلفة (Supabase لا يفرق عموماً) |

#### منخفضة الخطورة (Low)

| # | المعرف | الملف | الوصف |
|---|--------|-------|-------|
| L-1 | `admin logout redirect` | admin/auth.js:50 | showAccessDenied لا يعيد التوجيه في كل الحالات |
| L-2 | `test base URL` | login.spec.ts:3 | يستخدم http://localhost بدلاً من https |
| L-3 | `window pollution` | window-shim.js | دوال كثيرة معروضة على window.* |

---

## 8. الاختبارات

### 8.1 الاختبارات الوحدوية (Unit Tests)

#### `apps/web/src/__tests__/auth-guard.test.js`
|TestCase|الوصف|
|--------|------|
|redirects to login when no db|تحقق من التوجيه عند عدم تهيئة Supabase|
|redirects to login on invalid session|تحقق من التوجيه عند جلسة غير صالحة|
|returns user and db on silent auth|تحقق من إرجاع المستخدم بدون redirect|
|blocks non-admin; redirects to index|تحقق من حظر المشرف غير المصرح|
|redirects to index when admin check throws|تحقق من التعامل مع أخطاء قاعدة البيانات|

### 8.2 اختبارات end-to-end (Playwright)

#### `apps/web/tests/e2e/login.spec.ts`
```typescript
✓ login page loads correctly
✓ login form has email and password fields
✓ login form has submit button
✓ login page has link to register
✓ login page has link to reset password
✓ shows error for empty credentials
✓ shows error for invalid email format
✓ shows error for short password
```

#### `apps/web/tests/e2e/register.spec.ts`
```typescript
✓ register page loads correctly
✓ register form has all required fields
✓ register form has name field
✓ register form has submit button
✓ register page has link to login
```

#### `apps/web/tests/e2e/reset-password.spec.ts`
```typescript
✓ reset password page loads correctly
✓ reset password form has email field
✓ reset password form has submit button
✓ reset password page has link to login
```

#### `apps/web/tests/e2e/verify-email.spec.ts`
```typescript
✓ verify email page loads correctly
✓ verify email page shows verification message
✓ verify email page has link to home
```

### 8.3 تغطية الاختبارات

| المنطقة | الاختبارات | الحالة |
|---------|-----------|--------|
| تسجيل الدخول | E2E + Unit | ✅ مغطاة |
| التسجيل | E2E | ✅ مغطاة (تحقق أساسي) |
| إعادة تعيين كلمة المرور | E2E | ✅ مغطاة (تحقق أساسي) |
| تأكيد البريد الإلكتروني | E2E | ✅ مغطاة (تحقق أساسي) |
| لوحة التحكم | E2E (dashboard.spec.ts) | ✅ مغطاة |
| حماية المشرف | Unit | ✅ مغطاة |
| CSRF | لا يوجد | ❌ غير مغطى |
| Rate Limiting | لا يوجد | ❌ غير مغطى |
| Session Timeout | لا يوجد | ❌ غير مغطى |

---

## 9. التوصيات

### 9.1 فورية (High Priority)

| # | التوصية | الملفات المعنية | أولوية |
|---|---------|-----------------|--------|
| 1 | توحيد مفاتيح التخزين بين `session.js` و `shared.js` | session.js, shared.js | عالية |
| 2 | توحيد 003_auth.sql مع supabase-setup.sql | migrations | عالية |
| 3 | إضافة اختبارات لـ CSRF protection | tests/ | عالية |
| 4 | إضافة rate limiting على Server side | admin-actions/index.ts | عالية |

### 9.2 متوسطة (Medium Priority)

| # | التوصية | الملفات المعنية |
|---|---------|-----------------|
| 1 | إضافة session timeout indicator في UI | dashboard.html |
| 2 | تحسين admin logout redirect | admin/auth.js |
| 3 | توحيد رسائل الأخطاء | core.js handleLoginError |
| 4 | إضافة اختبارات تدفق كامل (Cypress/Playwright) | tests/e2e/ |

### 9.3 طويلة المدى (Low Priority)

| # | التوصية | الوصف |
|---|---------|-------|
| 1 | ترحيل إلى Supabase SSR middleware | @supabase/ssr لتحسين الأمان |
| 2 | إضافة 2FA | TOTP / WebAuthn |
| 3 | إضافة Password strength meter في login | نفس الموجود في register |
| 4 | فصل window-shim إلى modules حسب الاستخدام | تقليل window pollution |

---

## ملاحظات إضافية

### 10.1 ملاحظات التصميم

1. **عدم استخدام localStorage للجلسات:** Supabase SDK يتولى إدارة الجلسات في sessionStorage + الذاكرة. هذا جيد أمنياً.
2. **CSRF protection مخصص:** تطبيق double-submit cookie مع fingerprint binding - ليس قياسياً لكنه فعال ضد CSRF traditional.
3. **is_admin في public.users:** supersedes auth.users metadata - هذا التصميم صحيح لأنه يسمح بتغيير الصلاحيات دون إعادة مصادقة.

### 10.2 ملاحظات الأداء

1. **loadCurrentUser() يُستدعى في كل صفحة محمية:** يمكن تخزينه في sessionStorage (غير حساس) لتقليل طلقات DB.
2. **admin check query:** كل protected page يقوم بـ query منفصل للتحقق من is_admin.
3. **courses JSON file:** يُحمل بالكامل عند فتح صفحة التسجيل - يمكن تحميله بشكل تدريجي.

### 10.3 ملاحظات التوافق

1. **Supabase JS SDK v2:** يستخدم `createClient()` من `@supabase/supabase-js`.
2. **Auth State Change:** يستخدم `onAuthStateChange` (v2 API) بدلاً من `onAuthStateChange` (v1).
3. **detectSessionInUrl: false:** يتم التعامل مع tokens من URL بشكل يدوي في verify-email و reset-password.
