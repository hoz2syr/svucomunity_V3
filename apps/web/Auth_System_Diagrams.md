# مخططات علاقات نظام المصادقة - SVU Community

## 1. مخطط البنية العامة (System Architecture)

```mermaid
graph TB
    subgraph "Frontend Apps"
        WEB["`apps/web
        (Vanilla JS SPA)`"]
        ADMIN["`apps/admin
        (React + shadcn/ui)`"]
        SCHEDULE["`apps/schedule
        (AI-powered)`"]
    end

    subgraph "Shared Packages"
        UI["`packages/ui
        useAuth.ts hook`"]
        CLIENT["`packages/supabase-client
        ├── client.ts (browser)
        ├── index.ts
        ├── server.ts (service role)
        └── middleware.ts`"]
        TYPES["`packages/types
        ├── user.ts
        └── auth-state.ts`"]
        UTILS["`packages/utils
        validation, sanitization`"]
    end

    subgraph "Supabase Backend"
        AUTH_USERS["`auth.users
        (GoTrue)`"]
        PUBLIC_USERS["`public.users
        ├── is_admin
        ├── is_active
        └── profile data`"]
    end

    subgraph "Database Layer"
        TRIGGERS["`Triggers
        ├── handle_new_user()
        └── handle_email_confirmed()`"]
        FUNCTIONS["`Database Functions
        ├── has_role()
        ├── get_user_roles()
        └── assert_admin()`"]
        RLS["`RLS Policies
        ├── users_read_own
        ├── users_read_admin
        └── users_update_own`"]
    end

    subgraph "Edge Functions"
        ADMIN_FN["`admin-actions
        ├── verifyCaller()
        ├── audit logging
        └── admin operations`"]
    end

    WEB --> CLIENT
    WEB --> UI
    ADMIN --> UI
    ADMIN --> CLIENT
    SCHEDULE --> CLIENT

    UI --> TYPES
    CLIENT --> TYPES

    CLIENT --> AUTH_USERS
    ADMIN_FN --> AUTH_USERS
    ADMIN_FN --> PUBLIC_USERS

    AUTH_USERS -->|"FK: id ON DELETE CASCADE"| PUBLIC_USERS

    AUTH_USERS --> TRIGGERS
    TRIGGERS --> PUBLIC_USERS

    FUNCTIONS --> PUBLIC_USERS
    RLS --> PUBLIC_USERS

    WEB -->|"Bearer token"| ADMIN_FN
    ADMIN -->|"Bearer token"| ADMIN_FN

    CLIENT -->|"auth.getSession()"| AUTH_USERS
    CLIENT -->|"auth.signInWithPassword()"| AUTH_USERS
    CLIENT -->|"auth.signUp()"| AUTH_USERS
    CLIENT -->|"auth.signOut()"| AUTH_USERS
```

---

## 2. مخطط تدفق تسجيل الدخول (Login Flow)

```mermaid
sequenceDiagram
    actor User as المستخدم
    participant Page as login.html
    participant LoginJS as page-login.js
    participant Core as core.js
    participant Config as config.js
    participant Supabase as Supabase Auth
    participant DB as public.users

    User->>Page: يفتح login.html
    Page->>LoginJS: DOMContentLoaded
    LoginJS->>LoginJS: checkExistingSession()
    LoginJS->>Supabase: db.auth.getUser()
    Supabase-->>LoginJS: user (أو null)

    alt جلسة نشطة
        LoginJS->>Core: loadCurrentUser(db)
        Core->>DB: SELECT FROM users WHERE id = auth.uid()
        DB-->>Core: profile data
        Core-->>LoginJS: cachedUser
        LoginJS->>User: redirect → dashboard.html
    else لا توجد جلسة
        LoginJS-->>Page: يعرض نموذج الدخول
        User->>Page: يدخل البريد + كلمة المرور
        Page->>LoginJS: handleLoginSubmit()

        LoginJS->>LoginJS: validate input
        alt خطأ في المدخلات
            LoginJS-->>User: showToast(error)
        else مدخلات صحيحة
            LoginJS->>Supabase: signInWithPassword({ email, password })
            Supabase-->>LoginJS: { session, user }

            LoginJS->>Core: loadCurrentUser(db)
            Core->>DB: SELECT FROM users WHERE id = auth.uid()
            DB-->>Core: profile data
            Core->>Core: cacheUser(profile)
            Core-->>LoginJS: userData

            LoginJS->>LoginJS: saveUserSession(userData)
            LoginJS-->>User: showToast("مرحباً بك!")
            LoginJS->>User: redirect → dashboard.html
        end
    end
```

---

## 3. مخطط تدفق التسجيل (Register Flow)

```mermaid
sequenceDiagram
    actor User as المستخدم
    participant Page as register.html
    participant RegisterJS as page-register.js
    participant Validation as validation.js
    participant API as register-api.js
    participant State as register-state.js
    participant Supabase as Supabase Auth
    participant DB as public.users

    User->>Page: يفتح register.html
    Page->>RegisterJS: DOMContentLoaded
    RegisterJS->>State: resolveDb() + fetchMajors()
    State-->>RegisterJS: db + majors list
    RegisterJS-->>Page: يعرض النموذج

    User->>Page: يملأ جميع الحقول
    Page->>RegisterJS: submitRegisterForm()
    RegisterJS->>Validation: validateAll(inputs)

    alt خطأ تحقق
        RegisterJS-->>User: showToast(error)
    else تحقق نجح
        RegisterJS->>DB: pre-check: SELECT username FROM users WHERE username = ?
        DB-->>RegisterJS: result

        alt اسم المستخدم موجود
            RegisterJS-->>User: showToast("اسم المستخدم مسجل")
        else
            RegisterJS->>DB: pre-check: SELECT email FROM users WHERE email = ?
            DB-->>RegisterJS: result

            alt البريد موجود
                RegisterJS-->>User: showToast("البريد مسجل")
            else
                RegisterJS->>Supabase: signUp({ email, password, data: {...} })

                alt خطأ في التسجيل
                    Supabase-->>RegisterJS: error
                    RegisterJS-->>User: showToast(error)
                else نجح
                    Supabase-->>RegisterJS: { user, session }
                    RegisterJS->>RegisterJS: store email in localStorage

                    alt session موجود (تأكيد تلقائي)
                        RegisterJS->>User: redirect → login.html
                    else
                        RegisterJS->>User: redirect → verify-email.html?email=...
                    end
                end
            end
        end
    end
```

---

## 4. مخطط تدفق تأكيد البريد (Email Verification Flow)

```mermaid
sequenceDiagram
    actor User as المستخدم
    participant Email as عميل البريد
    participant Page as verify-email.html
    participant VerifyJS as page-verify-email.js
    participant Supabase as Supabase Auth

    User->>Email: يضغط على رابط التأكيد
    Email->>Page: يفتح verify-email.html#access_token=XXX&type=signup

    Page->>VerifyJS: DOMContentLoaded
    VerifyJS->>VerifyJS: parse URL hash

    alt type === 'signup'
        VerifyJS->>Supabase: setSession({ access_token, refresh_token })
        Supabase-->>VerifyJS: { session }

        VerifyJS-->>User: showSuccess("تم تأكيد البريد")

        Note over VerifyJS: بعد 3 ثوانٍ
        VerifyJS->>Supabase: signOut()
        Supabase-->>VerifyJS: success
        VerifyJS->>User: redirect → login.html

    else type === 'recovery'
        VerifyJS->>User: redirect → reset-password.html + hash

    else بدون token
        VerifyJS-->>User: showError("لم يتم العثور على رابط التفعيل")
    end

    Note over VerifyJS: في حالة فشل الإرسال
    User->>Page: يضغط "إعادة إرسال"
    Page->>VerifyJS: resendVerification()
    VerifyJS->>VerifyJS: استخراج email (3 مستويات fallback)
    VerifyJS->>Supabase: resend({ type: 'signup', email })
    Supabase-->>VerifyJS: success
    VerifyJS-->>User: showToast("تم إرسال الرابط مرة أخرى")
```

---

## 5. مخطط تدفق إعادة تعيين كلمة المرور (Password Reset Flow)

```mermaid
sequenceDiagram
    actor User as المستخدم
    participant LoginPage as login.html
    participant ResetPage as reset-password.html
    participant ResetJS as page-reset-password.js
    participant Supabase as Supabase Auth

    User->>LoginPage: يضغط "نسيت كلمة المرور؟"
    LoginPage->>User: يعرض Modal
    User->>LoginPage: يدخل البريد الإلكتروني
    LoginPage->>Supabase: resetPasswordForEmail(email, { redirectTo })
    Supabase-->>LoginPage: success
    LoginPage-->>User: showToast("تم إرسال الرابط")

    Note over User: يفتح البريد ويضغط الرابط
    User->>ResetPage: يفتح reset-password.html#access_token=XXX&type=recovery

    ResetPage->>ResetJS: DOMContentLoaded
    ResetJS->>ResetJS: parse URL hash

    alt type === 'recovery' && access_token
        ResetJS->>Supabase: setSession({ access_token, refresh_token })
        Supabase-->>ResetJS: session established

        ResetJS-->>User: يعرض نموذج كلمة المرور الجديدة
        User->>ResetPage: يدخل كلمة مرور + تأكيد
        ResetPage->>ResetJS: submit handler
        ResetJS->>ResetJS: validate (>= 8 chars + match)
        ResetJS->>Supabase: updateUser({ password })
        Supabase-->>ResetJS: success

        ResetJS-->>User: showSuccess("تم تغيير كلمة المرور")
        ResetJS->>User: [بعد 3 ثوانٍ] redirect → login.html

    else بدون token
        ResetJS->>Supabase: getUser()
        Supabase-->>ResetJS: no session
        ResetJS-->>User: showError("رابط غير صالح")
    end
```

---

## 6. مخطط تدفق المشرف (Admin Flow)

```mermaid
sequenceDiagram
    actor Admin as المشرف
    participant AdminPage as admin.html
    participant AdminAuth as admin/auth.js
    participant AdminAPI as adminApi.js
    participant EdgeFn as admin-actions (Edge Function)
    participant Supabase as Supabase (service role)
    participant DB as public.users

    Admin->>AdminPage: يفتح admin.html
    AdminPage->>AdminAuth: checkAdminAccess()

    AdminAuth->>AdminAuth: isLoggedIn()
    AdminAuth->>Supabase: verifySessionWithServer()
    Supabase-->>AdminAuth: isValid

    alt غير مصادق
        AdminAuth->>Admin: redirect → login.html
    else مصادق
        AdminAuth->>DB: SELECT is_admin, is_active FROM users WHERE id = ?
        DB-->>AdminAuth: { is_admin, is_active }

        alt ليس مشرف أو غير نشط
            AdminAuth-->>Admin: showAccessDenied()
            AdminAuth->>Admin: [بعد ثانيتين] redirect → index.html
        else مشرف ونشط
            AdminAuth-->>AdminPage: يعرض لوحة المشرف
        end
    end

    Note over AdminPage: ينفذ إجراء إداري
    Admin->>AdminPage: يضغط "تعيين مشرف"
    AdminPage->>AdminAPI: makeAdmin(userId)
    AdminAPI->>AdminAPI: validateUserId()
    AdminAPI->>AdminAPI: prevent self-action

    AdminAPI->>Supabase: getSession() → access_token
    Supabase-->>AdminAPI: { access_token }

    AdminAPI->>EdgeFn: functions.invoke('admin-actions', {
        headers: { Authorization: Bearer token },
        body: { action: 'makeAdmin', payload: { userId } }
    })

    EdgeFn->>EdgeFn: verifyCaller()
    EdgeFn->>Supabase: getUser(token)
    Supabase-->>EdgeFn: user
    EdgeFn->>DB: SELECT is_admin, is_active FROM users WHERE id = user.id
    DB-->>EdgeFn: profile

    alt غير مصرح
        EdgeFn-->>AdminAPI: 401/403 error
    else مصرح
        EdgeFn->>EdgeFn: log to admin_audit_log
        EdgeFn->>DB: UPDATE users SET is_admin = true WHERE id = userId
        DB-->>EdgeFn: success
        EdgeFn-->>AdminAPI: { ok: true }
        AdminAPI-->>Admin: showToast("تم التحديث")
    end
```

---

## 7. مخطط قاعدة البيانات (ER Diagram)

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
        text encrypted_password
        timestamp email_confirmed_at
        timestamp confirmed_at
        timestamp last_sign_in_at
        json raw_app_meta_data
        json raw_user_meta_data
        timestamp created_at
        timestamp updated_at
    }

    public_users {
        uuid id PK "FK → auth.users.id ON DELETE CASCADE"
        text email
        text username UK
        boolean is_admin "DEFAULT: false"
        boolean is_active "DEFAULT: true"
        timestamp created_at
        timestamp updated_at
    }

    public_study_groups {
        uuid id PK
        text course_code
        text title
        text description
        uuid creator_id "FK → public.users.id"
        timestamp created_at
    }

    public_group_members {
        uuid group_id FK "→ study_groups.id"
        uuid user_id FK "→ users.id"
        timestamp joined_at
    }

    public_courses {
        uuid id PK
        text code UK
        text name
        text major
        integer year
        integer semester
    }

    public_course_resources {
        uuid id PK
        text course_code FK
        text title
        text url
        text type
    }

    public_settings {
        text key PK
        jsonb value
        timestamp updated_at
    }

    public_admin_audit_log {
        uuid id PK
        uuid caller_id
        text action
        json payload
        text ip_address
        text user_agent
        timestamp created_at
    }

    auth_users ||--|| public_users : "creates"
    public_users ||--o{ public_study_groups : "creates"
    public_users ||--o{ public_group_members : "joins"
    public_study_groups ||--o{ public_group_members : "contains"
    public_courses ||--o{ public_course_resources : "has"
```

---

## 8. مخطط تدفق المصادقة الكامل (Complete Auth Flow)

```mermaid
flowchart TD
    Start([البداية: المستخدم يفتح التطبيق]) --> CheckDB{تم تهيئة<br/>Supabase؟}
    CheckDB -->|لا| Error1[عرض خطأ + redirect login]
    CheckDB -->|نعم| CheckSession{الجلسة<br/>نشطة؟}

    CheckSession -->|لا| ShowLogin[عرض نموذج تسجيل الدخول]
    CheckSession -->|نعم| LoadProfile[جلب الملف الشخصي من public.users]
    LoadProfile --> CheckActive{المستخدم<br/>نشط؟}
    CheckActive -->|لا| Deactivated[عرض "تم تعطيل الحساب"]
    CheckActive -->|نعم| CacheUser[تخزين المستخدم في الذاكرة]
    CacheUser --> CheckAdmin{مطلوب<br/>صلاحيات مشرف؟}
    CheckAdmin -->|لا| ShowDashboard[عرض لوحة التحكم]
    CheckAdmin -->|نعم| CheckAdminRole{is_admin<br/>= true؟}
    CheckAdminRole -->|لا| AccessDenied[عرض "غير مصرح"]
    CheckAdminRole -->|نعم| ShowAdmin[عرض لوحة المشرف]

    ShowLogin --> UserInputs[المستخدم يدخل البريد + كلمة المرور]
    UserInputs --> ValidateInput{مدخلات<br/>صحيحة؟}
    ValidateInput -->|لا| ShowError[عرض خطأ]
    ValidateInput -->|نعم| CallSignIn[call db.auth.signInWithPassword]

    CallSignIn --> SignInSuccess{نجح<br/>تسجيل الدخول؟}
    SignInSuccess -->|لا| ShowAuthError[عرض "البريد أو كلمة المرور غير صحيحة"]
    SignInSuccess -->|نعم| LoadProfile

    ShowError --> ShowLogin
    ShowAuthError --> ShowLogin

    Deactivated --> RedirectLogin[redirect → login.html]
    AccessDenied --> RedirectIndex[redirect → index.html]
    Error1 --> RedirectLogin
```

---

## 9. مخطط حماية CSRF (CSRF Protection Architecture)

```mermaid
flowchart LR
    subgraph "Browser"
        SessionStorage["sessionStorage
        svu_csrf_token = {fp}:{token}"]
        Cookie["Cookie
        svu_csrf_token = {fp}:{token}
        SameSite=Lax
        Secure (HTTPS only)"]
        Fingerprint["Browser Fingerprint
        UA + Language + Timezone + Screen"]
    end

    subgraph "CSRF Module (csrf.js)"
        GetToken["getCsrfToken()"]
        SetCookie["setCsrfCookie()"]
        ApplyHeader["applyCsrfToSupabase()"]
        ValidateEvent["validateCsrfFromEvent()"]
    end

    subgraph "Supabase Client"
        FromInterceptor["db.from() interceptor
        adds x-csrf-token header"]
        Query["Supabase Query"]
    end

    Fingerprint --> GetToken
    GetToken --> SessionStorage
    GetToken --> SetCookie
    SetCookie --> Cookie

    GetToken --> ApplyHeader
    ApplyHeader --> FromInterceptor
    FromInterceptor --> Query

    Query -->|"Header: x-csrf-token"| Server
    Query -->|"Cookie: svu_csrf_token"| Server

    subgraph "Server (if any)"
        ValidateServer["Validate cookie == header token"]
    end
```

---

## 10. مخطط أمان المشرف (Admin Security Layers)

```mermaid
flowchart TD
    Request[طلب إجراء إداري] --> Layer1{الطبقة 1:<br/>JWT Token صالح؟}
    Layer1 -->|لا| Reject401[401 Unauthorized]
    Layer1 -->|نعم| Layer2{الطبقة 2:<br/>is_admin = true؟}
    Layer2 -->|لا| Reject403[403 Forbidden]
    Layer2 -->|نعم| Layer3{الطبقة 3:<br/>is_active = true؟}
    Layer3 -->|لا| Reject403
    Layer3 -->|نعم| Layer4{الطبقة 4:<br/>منع إلغاء صلاحيات النفس}
    Layer4 -->|نعم| Allow[تنفيذ الإجراء]
    Layer4 -->|لا| Reject400[400 cannot_revoke_self]

    Allow --> LogAction[تسجيل في admin_audit_log]
    LogAction --> Execute[تنفيذ الإجراء]
    Execute --> Response[إرجاع النتيجة]

    Reject401 --> Response
    Reject403 --> Response
    Reject400 --> Response
```

---

## 11. مخطط الامتدادات (Extension Points)

```mermaid
mindmap
  root((نظام المصادقة))
    التدفقات
      Login
      Register
      Verify Email
      Reset Password
      OAuth Google
      Admin Actions
    الطبقات
      Presentation
      Logic
      Shared
      Auth Guard
      Client
    الأمان
      CSP
      CSRF
      XSS Prevention
      RLS
      Rate Limiting
      Audit Logging
    قاعدة البيانات
      auth.users
      public.users
      Triggers
      Functions
      RLS Policies
    الاختبارات
      E2E Login
      E2E Register
      E2E Reset
      E2E Verify
      Unit Auth Guard
```

---

## 12. ملخص التدفقات والعلاقات

### 12.1 تدفقات المصادقة الأساسية

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           التدفقات الأساسية                                 │
├──────────────────┬─────────────────────────────────────────────────────────┤
│ التسجيل          │ register.html → validate → pre-check → signUp         │
│                  │ → [session? login.html : verify-email.html]          │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ تأكيد البريد     │ verify-email.html → setSession → signOut → login    │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ تسجيل الدخول     │ login.html → checkExistingSession →                     │
│                  │ signInWithPassword → loadCurrentUser → dashboard      │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ إعادة التعيين    │ login.html → resetPasswordForEmail                    │
│                  │ → reset-password.html#token → setSession → updateUser │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ Google OAuth     │ useAuth.ts → signInWithOAuth → redirect → callback    │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ المشرف           │ admin.html → checkAdminAccess → admin-actions EF     │
│                  │ (JWT + role check + audit log)                        │
└──────────────────┴─────────────────────────────────────────────────────────┘
```

### 12.2 الفروقات بين التطبيقات

| العنصر | apps/web | apps/admin (React) | apps/schedule |
|--------|----------|-------------------|---------------|
| UI Framework | Vanilla JS + HTML | React 19 + shadcn/ui | React (AI-powered) |
| Auth Hook | window-shim + core.js | useAuth.ts | (يعتمد على web) |
| Admin Gate | admin/auth.js | App.tsx validateAccess | N/A |
| Session Storage | sessionStorage | React state + SDK | N/A |
| CSRF | مخصص (csrf.js) | وارث من supabase-client | N/A |

### 12.3 أسباب استخدام كل تقنية

| التقنية | السبب |
|----------|--------|
| Supabase Auth | توفير مصادقة مُدارة مع JWT + تحديث تلقائي |
| sessionStorage | أفضل من localStorage للجلسات (تُنظف عند إغلاق المتصفح) |
| RLS Policies | حماية على مستوى قاعدة البيانات حتى لو تم تجاوز العميل |
| SECURITY DEFINER | تنفيذ دوال صلاحيات بأمان في DB |
| CSRF double-submit | حماية إضافية ضد CSRF مع fingerprint binding |
| CSP headers | منع حقن نصوص ضارة |
| escapeHtml() | منع XSS في إخراج البيانات |
| Sentry redaction | منع تسرب بيانات حساسة في تتبع الأخطاء |
| handle_email_confirmed trigger | إنشاء ملف مستخدم فقط بعد تأكيد البريد |
