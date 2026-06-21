# تقرير مراجعة أمنية شاملة - نظام المصادقة والحسابات
**المشروع:** SVU Community v3.0.0_cleantree
**تاريخ المراجعة:** 2026-06-21
**النطاق:** نظام التسجيل، تسجيل الدخول، المصادقة، إدارة الجلسات، حماية الحسابات، الصلاحيات

---

## ملخص تنفيذي

| النظام | الحالة | الملاحظات |
|--------|--------|-----------|
| تسجيل الحساب (Email/Google) | يعمل | Edge Function + rate limiting |
| تسجيل الدخول (Email/Google) | يعمل | Edge Function + rate limiting |
| استعادة كلمة المرور | يعمل | عبر Supabase SMTP |
| إدارة الجلسات | يعمل | Supabase HTTP-only cookies |
| وضع الزائر (Guest Mode) | يعمل | sessionStorage |
| حذف الحساب | يعمل | Edge Function + audit log |
| تغيير كلمة المرور | يعمل | signInWithPassword + updateUser |
| تنبيه انتهاء الجلسة | يعمل | JWT decode + polling 30 ثانية |

---

## 1. منطق العمل الحالي لكل نظام

### 1.1 نظام إنشاء الحساب (Registration)

```
المستخدم → صفحة /register
  ├── يملأ: الاسم + البريد + كلمة المرور (min 8 أحرف)
  ├── Zod validation (registerSchema)
  ├── Client-side rate limiter: 5 محاولات / 5 دقائق
  ├── Server-side (Edge Function auth-register):
  │     ├── IP-based rate limiting: 3 محاولات / 2 دقيقة
  │     ├── Password min 8 chars
  │     └── supabaseAdmin.auth.signUp()
  ├── إذا نجح:
  │     ├── يظهر شاشة تأكيد إرسال الرابط
  │     └── يرسل Supabase رابط تأكيد إلى البريد
  └── المستخدم يضغط الرابط → /auth/callback
        ├── completeAuthCallback()
        ├── upsertProfile (frontend)
        ├── handle_new_user trigger (backend)
        └── navigate('/dashboard')
```

### 1.2 نظام تسجيل الدخول (Login)

```
المستخدم → صفحة /login
  ├── يملأ: البريد + كلمة المرور (min 6 أحرف في Schema!)
  ├── Zod validation (loginSchema - min 6 chars)
  ├── Client-side rate limiter: 5 محاولات / 5 دقائق
  ├── Server-side (Edge Function auth-login):
  │     ├── IP-based rate limiting: 5 محاولات / 1 دقيقة
  │     └── supabaseAdmin.auth.signInWithPassword()
  ├── إذا نجح:
  │     ├── client.auth.setSession(access_token, refresh_token)
  │     └── navigate('/dashboard')
  ├── إذا فشل:
  │     └── recordAttempt(true) → زيادة العداد
  └── Google OAuth:
        ├── signInWithOAuth(provider: 'google')
        ├── redirectTo: /auth/callback
        └── navigate('/dashboard')
```

### 1.3 نظام المصادقة (Authentication)

```
AuthContext.tsx (مثبت على مستوى التطبيق)
  ├── onMount:
  │     ├── completeAuthCallback() → getSession()
  │     ├── setSession(result.data.session)
  │     └── subscribe listenAuthChanges()
  ├── onAuthStateChange event:
  │     ├── SIGNED_IN → setSession → refreshProfile
  │     ├── SIGNED_OUT → setSession(null) → setProfile(null)
  │     ├── TOKEN_REFRESHED → setSession (new tokens)
  │     └── USER_UPDATED → refreshProfile
  └── Session expiry tracking:
        ├── decodeJwt(access_token) → exp claim
        ├── Polling every 30 ثانية
        └── sessionExpiring = true إذا تبقى < 5 دقائق
```

### 1.4 نظام الجلسات (Session Management)

```
تخزين الجلسة:
  ├── HTTP-only cookies (Supabase-managed):
  │     ├── sb-{ref}-auth-token
  │     └── sb-{ref}-refresh-token
  ├── JWT expiry: 24 ساعة (86400 ثانية)
  ├── Refresh token rotation: مفعل
  └── Refresh token reuse interval: 60 ثانية

بدأ الجلسة:
  ├── Client → Edge Function (login/register)
  ├── Edge Function يرجع access_token + refresh_token
  ├── client.auth.setSession() → يضع الكوكيز
  └── onAuthStateChange fires SIGNED_IN

تجديد الجلسة:
  ├── Supabase SDK يقوم بشكل تلقائي (داخلياً)
  └── التطبيق يلاحظ عبر onAuthStateChange(TOKEN_REFRESHED)

انتهاء الجلسة:
  ├── انتهاء JWT (24 ساعة)
  ├── signOutCurrentUser() → client.auth.signOut()
  └── USER_UPDATED / SIGNED_OUT event
```

### 1.5 نظام الزائر (Guest Mode)

```
المستخدم ← يضغط "المتابعة كزائر"
  ├── enableGuestMode(profile?)
  ├── sessionStorage['svu-guest-mode'] = 'true'
  ├── localStorage['svu-guest-profile'] = {name, email}
  └── navigate('/dashboard')

GuestRoute.tsx (يعمل كحارس للطرق):
  ├── إذا session موجود → يسمح بالدخول
  ├── إذا isGuest = true → يسمح بالدخول
  └──否则 → redirect('/login')

انتهاء وضع الزائر:
  └── تسجيل دخول بحساب حقيقي → isGuest = false تلقائياً
```

### 1.6 نظام حماية الحسابات (Account Protection)

```
الطبقة الأولى: Client-side Rate Limiting
  ├── useRateLimit hook (localStorage)
  ├── 5 محاولات فاشلة / 5 دقائق
  └── يعمل قبل إرسال الطلب

الطبقة الثانية: Server-side Rate Limiting (Edge Functions)
  ├── rate_limits table (PostgreSQL)
  ├── IP-based keys
  │     ├── login:{IP} → 5/دقيقة
  │     ├── register:{IP} → 3/دقيقتين
  │     └── خصم الحساب → 3/دقيقة
  └──429 Too Many Requests

الطبقة الثالثة: RLS (Row Level Security)
  ├── auth.uid() = id على جميع عمليات profiles
  ├── auth.uid() IS NOT NULL guard على جميع Politices
  ├── from embed role change trigger
  └── لا يمكن تعديل الدور من العميل

الطبقة الرابعة: Edge Function Auth
  ├── delete-account: verify_jwt = true
  └── admin لا يمكن حذف حسابه (403)

الطبقة الخامسة: CSP (Content Security Policy)
  ├── connect-src محدود بـ *.supabase.co + *.googleapis.com
  ├── frame-src: Supabase + Google accounts فقط
  └── form-action: self + Supabase + Google

الطبقة السادسة: CORS
  ├── ALLOWED_ORIGINS env variable
  ├── Whitelist فقط
  └── 403 لغير المدرج في القائمة
```

---

## 2. الصلاحيات: زائر مقابل مسجل

### 2.1 الزائر (Guest Mode)

| الميزة | مسموح؟ | التفاصيل |
|--------|--------|----------|
| الوصول لـ /dashboard | نعم | عبر GuestRoute |
| الوصول لـ /exam/* | نعم | عبر GuestRoute |
| تسجيل الدخول بحساب Google | نعم | OAuth |
| إنشاء حساب جديد | نعم | Registration |
| نسيت كلمة المرور | نعم | resetPassword |
| المتابعة كزائر | نعم | GuestButton |
| حذف الحساب | لا | يتطلب جلسة حقيقية |
| تغيير كلمة المرور | لا | يتطلب جلسة حقيقية |
| تحديث الملف الشخصي | لا | يتطلب جلسة حقيقية |

### 2.2 المستخدم المسجل (Authenticated User)

| الميزة | مسموح؟ | التفاصيل |
|--------|--------|----------|
| الوصول لـ /dashboard | نعم | session موجود |
| الوصول لـ /exam/* | نعم | session موجود |
| تسجيل الخروج | نعم | signOut |
| تغيير كلمة المرور | نعم | updatePassword |
| حذف الحساب | نعم | deleteOwnAccount |
| تعديل الملف الشخصي | نعم | RLS: auth.uid() = id |
| مسؤول النظام (admin) | محدود | لا يستطيع حذف الحساب |

---

## 3. نقاط الضعف الأمنية والثغرات

### 3.1 ثغرات حرجة (CRITICAL)

#### ❌ CRITICAL-1: عدم تطابق طول كلمة المرور بين Login و Register
- **الملف:** `src/schemas/auth.schema.ts`
- **المشكلة:** Login Schema يسمح بـ 6 أحرف (`min(8)` في Register لكن `min(6)` في Login)
- **الموقع:** السطر 6 في loginSchema مقابل السطر 16 في registerSchema
- **الخطر:** مستخدم يمكنه التسجيل بـ 8 أحرف ثم إذا قام بتغيير كلمة المرور،_login_ يقبل 6 أحرف
- **التأثير:** ضعف أمني في كلمات المرور
- **الإصلاح:** توحيد الشرط إلى min(8) في كلا المخططين

#### ❌ CRITICAL-2: معالجة صامتة لأخطاء RLS في AuthContext
- **الملف:** `src/contexts/AuthContext.tsx:62-70`
- **المشكلة:** `result.error` يتم تجاهله في عملية التهيئة
- **الموقع:** `setSession(result.data.session)` يعمل حتى لو كان هناك خطأ
- **الخطر:** المستخدم يرى حالة مسجل دخول لكن الملف الشخصي فارغ بدون خطأ ظاهر
- **التأثير:** حالة واجهة غير متسقة

### 3.2 ثغرات عالية الخطورة (HIGH)

#### ⚠️ HIGH-1: مهلة AuthCallback قصيرة جداً
- **الملف:** `src/pages/AuthCallback.tsx:41`
- **المشكلة:** 10 ثوانِ مهلة (في الـ timeout) + 30 ثانية مهلة كلية
- **الخطر:** لشبكات بطيئة أو مزود OAuth متأخر
- **التأثير:** فشل المصادقة دون إمكانية إعادة المحاولة يدوياً

#### ⚠️ HIGH-2: لا يوجد CSRF token في الطلبات المخصصة
- **الملف:** `src/services/account.service.ts:71`
- **المشكلة:** invoke Edge Function بدون CSRF protection
- **الخطر:** CSRF attack على delete-account
- **التأثير:** حذف حساب دون قصد

#### ⚠️ HIGH-3: GuestProfile في localStorage بدون تشفير
- **الملف:** `src/contexts/GuestContext.tsx:49`
- **المشكلة:** بيانات الزائر (الاسم، البريد) مخزنة في localStorage بنص واضح
- **الخطر:** XSS يمكن أن يسرق بيانات الزائر
- **التأثير:** تسرب بيانات شخصية

#### ⚠️ HIGH-4: عمليات upsert مكررة للملف الشخصي
- **الملف:** `src/lib/supabase.ts:132-144` + Migration 004
- **المشكلة:** upsertProfile في الـ frontend + trigger في الـ backend
- **الخطر:** حمل زائد على قاعدة البيانات + تعارضات محتملة
- **التأثير:** أداء + احتمالية أخطاء

### 3.3 ثغرات متوسطة الخطورة (MEDIUM)

#### ⚡ MEDIUM-1: Rate Limiting يعتمد على localStorage
- **الملف:** `src/hooks/useRateLimit.ts`
- **المشكلة:** يمكن حذف localStorage Manualy أو استخدام وضع التخفي
- **الخطر:** تخطي الحماية من Brute Force
- **التأثير:** محاولات تخمين غير محدودة من ناحية العميل

#### ⚡ MEDIUM-2: ProtectedRoute غير موصول في App.tsx
- **الملف:** `src/App.tsx`
- **المشكلة:** ProtectedRoute موجود لكن لا يُستخدم
- **الخطر:** إذا تم استخدامه لاحقاً بدون تصحيح، لن يحمي anything
- **التأثير:** ثغرة في التصريح إذا تم تفعيله بشكل خاطئ

#### ⚡ MEDIUM-3: لا يوجد 2FA أو MFA
- **الملف:** `supabase/config.toml` + Supabase Dashboard
- **المشكلة:** لا يوجد مصادقة ثنائية
- **الخطر:** اختراق الحساب إذا تسرب كلمة المرور
- **التأثير:** أمان الحساب يعتمد فقط على كلمة المرور

#### ⚡ MEDIUM-4: AuthCallback يسمح بالتنقل حتى مع وجود جلسة جزئية
- **الملف:** `src/pages/AuthCallback.tsx:21-23`
- **المشكلة:** إذا كان `result.data?.session` موجوداً مع `result.error`، ينتقل إلى dashboard
- **الخطر:** حالة جلسة غير مكتملة
- **التأثير:** تصريح محتمل بدون تحقق كامل

#### ⚡ MEDIUM-5: لا يوجد logging لأحداث تسجيل الدخول
- **الملف:** نظام المصادقة بالكامل
- **المشكلة:** لا يتم تسجيل محاولات تسجيل الدخول الناجحة/الفاشلة
- **الخطر:** لا يمكن تتبع الاختراقات
- **التأثير:** عدم القدرة على اكتشاف الهجمات

### 3.4 ثغرات منخفضة الخطورة (LOW)

#### ℹ️ LOW-1: indirection غير ضرورية في environment.service.ts
- `hasSupabaseEnv` و `missingSupabaseEnvMessage` معاد تصديرهما بدون فائدة

#### ℹ️ LOW-2: sessionStorageGuestMode غير متزامن عبر tabs
- كل تب يخزن حالة الزائر بشكل منفصل

#### ℹ️ LOW-3: Auto-complete适当的 على الحقول
- email: "email" ✓
- password login: "current-password" ✓
- password register: "new-password" ✓
- security form: لا يوجد autoComplete

---

## 4. إحصائيات الجودة

### 4.1 ملخص الأمان

| الفئة | العدد |
|-------|-------|
| حرجة (CRITICAL) | 2 |
| عالية (HIGH) | 4 |
| متوسطة (MEDIUM) | 5 |
| منخفضة (LOW) | 3 |
| **إجمالي المشاكل** | **14** |

### 4.2 ما يعمل بشكل صحيح

✅ Supabase Auth مع HTTP-only cookies (أفضل من localStorage)
✅ JWT 24 ساعة مع refresh token rotation
✅ RLS policies على جميع الجداول الحساسة
✅ Role change prevention trigger
✅ IP-based rate limiting على Edge Functions
✅ Client-side rate limiting كطبقة إضافية
✅ Email confirmation مفعل (double_confirm_changes)
✅ CORS whitelist على Edge Functions
✅ CSP headers(configurate في vite.config.ts)
✅ Admin لا يمكنه حذف حسابه
✅ Audit log لعمليات الحذف
✅ 405 Method Not Allowed على Edge Functions
✅ 403 على origins غير مسموحة
✅ Password min 8 chars على Register و Security
✅ Zod validation على جميع المدخلات

---

## 5. التوصيات والإصلاحات المطلوبة

### 5.1 إصلاحات فورية (P0 - يجب تنفيذها الآن)

```typescript
// 1. توحيد طول كلمة المرور في auth.schema.ts
export const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد غير صحيحة').max(255),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128), // كان min(6)
});

// 2. معالجة صريحة لأخطاء RLS في AuthContext.tsx
const init = async () => {
  try {
    const result = await completeAuthCallback();
    if (!mounted) return;
    setEnvMissing(false);

    if (result.error) {
      setError(result.error.message);
      setSession(null);
      setProfile(null);
      return; // إضافة هذا
    }

    setError(null);
    setSession(result.data.session);
    if (result.data.session) {
      await refreshProfileForUser(result.data.session.user.id);
    }
  } catch (error) {
    // ...
  } finally {
    if (mounted) setLoading(false);
  }
};
```

### 5.2 إصلاحات عالية الأولوية (P1 - خلال أسبوع)

```typescript
// 3. زيادة مهلة AuthCallback
// AuthCallback.tsx - تغيير 10 ثوانِ إلى 15 ثانية

// 4. إضافة CSRF token للطلبات المخصصة
// على Edge Function delete-account والطلبات الأخرى

// 5. تشفير GuestProfile في localStorage
// استخدام Base64 encoding أو simple XOR cipher

// 6. إزالة upsertProfile المكرر من supabase.ts
// الاعتماد على trigger فقط في قاعدة البيانات

// 7. إضافة login audit log
// جدول login_attempts في قاعدة البيانات
// Edge Function يسجل كل محاولة (نجاح/فشل)
```

### 5.3 إصلاحات متوسطة الأولوية (P2 - خلال شهر)

```typescript
// 8. تفعيل ProtectedRoute للصفحات الحساسة
// App.tsx: إضافة ProtectedRoute حول /dashboard

// 9. إضافة 2FA/MFA support
// استخدام Supabase MFA أو WebAuthn

// 10. تخزين بيانات الزائر في sessionStorage أيضاً
// وليس localStorage فقط

// 11. إضافة autoComplete لـ SecuritySettingsForm
// current_password: "current-password"
// new_password: "new-password"
```

### 5.4 توصيات إضافية (P3 - تحسينات)

1. **إضافة Content-Security-Policy nonce** بدلاً من القائمة الثابتة
2. **تسجيل جميع محاولات تسجيل الدخول** في جدول login_attempts مع IP و user-agent
3. **إضافة CAPTCHA** بعد 3 محاولات فاشلة (بدلاً من الاعتماد فقط على Rate Limiting)
4. **تشفير البيانات الحساسة** في قاعدة البيانات (مثل phone)
5. **إضافة WebAuthn/FIDO2** كخيار مصادقة بدون كلمة مرور
6. **مراجعة RLS policies بشكل دوري** (كل 3 أشهر)
7. **إضافة Security Headers إضافية**: X-Frame-Options, X-Content-Type-Options
8. **تحديث Deno std** من 0.168.0 إلى إصدار أحدث
9. **إضافة tests لـ Edge Functions** (الآن لا توجد tests لها)

---

## 6. مخطط البنية الحالية

```
┌─────────────────────────────────────────────────────────────┐
│                      المستخدم (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │   Auth UI Layer  │  │   Guest UI Layer  │                 │
│  │  - LoginPage     │  │  - GuestButton    │                 │
│  │  - RegisterPage  │  │  - GuestContext   │                 │
│  │  - AuthCallback  │  │                  │                 │
│  └────────┬────────┘  └──────────────────┘                 │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────┐          │
│  │              AuthContext (State Manager)        │          │
│  │  - session, profile, loading, expiry           │          │
│  └────────┬──────────────────────────────────────┘          │
│           │                                                  │
│  ┌────────▼──────────────────────────────────────┐          │
│  │            Supabase Client (SDK)                │          │
│  │  - HTTP-only cookies (sb-*-auth-token)         │          │
│  │  - JWT 24h + Refresh Rotation                  │          │
│  └────────┬──────────────────────────────────────┘          │
│           │                                                  │
│           │ HTTPS / CORS                                    │
│           ▼                                                  │
├─────────────────────────────────────────────────────────────┤
│                  Edge Functions (Deno)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │  auth-login  │  │auth-register │  │delete-account│       │
│  │  - Rate Limit│  │ - Rate Limit│  │ - Rate Limit │       │
│  │  - signIn... │  │ - signUp... │  │ - admin check│       │
│  │  - IP key    │  │ - IP key    │  │ - audit log  │       │
│  └──────────────┘  └──────────────┘  └─────────────┘       │
│           │                  │                  │            │
│           └──────────────────┼──────────────────┘            │
│                              ▼                               │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Auth (Backend)                    │
│  - auth.users (managed by Supabase)                          │
│  - JWT generation/validation                                 │
│  - Email confirmation                                        │
│  - OAuth providers                                           │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │   profiles   │  │   rate_limits│  │admin_audit_ │       │
│  │  - RLS ON    │  │  - IP keys   │  │    log      │       │
│  │  - auth.uid()│  │  - counters  │  │  - RLS ON   │       │
│  │  - role guard│  │              │  │             │       │
│  └──────────────┘  └──────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. خطة التنفيذ المقترحة

### المرحلة 1: إصلاحات حرجة (يوم واحد)
1. توحيد طول كلمة المرور (min 8 في loginSchema)
2. معالجة صريحة لأخطاء RLS في AuthContext
3. إضافة logging لمنطق تسجيل الدخول

### المرحلة 2: إصلاحات عالية الأولوية (أسبوع)
1. زيادة مهلة AuthCallback
2. إضافة CSRF protection
3. تشفير GuestProfile
4. إزالة upsert المكرر

### المرحلة 3: تدعيم النظام (شهر)
1. تفعيل ProtectedRoute للصفحات الحساسة
2. إعداد 2FA
3. تحسين Rate Limiting (captcha بعد 3 محاولات)
4. إضافة Security Headers إضافية

---

## 8. الخلاصة

نظام المصادقة الحالي **يعمل بشكل جيد** مع طبقات حماية متعددة (Client Rate Limit + Server Rate Limit + RLS + CSP + CORS). الأساسيات سليمة، لكن هناك **14 مشكلة أمنية** تحتاج للمعالجة:

- **2 حرجة** - تتطلب إصلاح فوري
- **4 عالية** - تتطلب إصلاح خلال أسبوع
- **5 متوسطة** - تحسين خلال شهر
- **3 منخفضة** - تحسينات إضافية

أقوى نقاط القوة: HTTP-only cookies، RLS policies صارمة، Edge Function auth، refresh token rotation.
أضعف نقاط الضعف: عدم تطابق كلمة المرور، غياب 2FA، localStorage للبيانات الحساسة، عدم تسجيل الأحداث الأمنية.
