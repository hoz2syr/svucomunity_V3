# تقرير تحليل تطبيق SVU Community

## 1. نظرة عامة على المشروع

**الاسم:** SVU Community  
**الإصدار:** 2.0.0 (الواجهة الأمامية)  
**الوصف:** منصة مجتمعية للطلاب في الجامعة السورية الافتراضية – مجتمع تقنية المعلومات  
**الغرض:** توفير منصة تعليمية متكاملة للطلاب تشمل المجموعات الدراسية، تصفح المقررات، استخراج الجدول بالذكاء الاصطناعي، والملف الشخصي.

---

## 2. تقنية البنية التحتية (Tech Stack)

### الواجهة الأمامية (Frontend)
- vanilla JavaScript (ES Modules)
- Vite 8 كمحزّم بناء وتطوير
- Tailwind CSS v4 عبر `@tailwindcss/vite`
- خط Cairo ومتغيرات CSS للتصميم

### الأدوات والبناء (Build Tools)
- **Turborepo** في الجذر لإدارة الأعمال الفرعية (monorepo)
- **Vite** مع إعدادات تعدد نقاط الدخول (multi-page)
- **TypeScript** للتحقق النوعي في الجذر

### خدمات خارجية (External Services)
- **Supabase** كـ Backend كخدمة (BaaS):
  - المصادقة (Authentication)
  - قاعدة بيانات PostgreSQL
- **Gemini API** لاستخراج الجدول الدراسي من الصور
- **Resend** (متاح عبر `VITE_RESEND_API_KEY`) لإرسال البريد الإلكتروني

### المتصفح والتخزين
- localStorage لإدارة الجلسة والسمات
- Session timeout 15 دقيقة (من `SECURITY_CONFIG`)
- remember-me يتيح 7 أيام

---

## 3. هيكل المشروع

```
apps/web/
├── index.html                 # الصفحة الرئيسية (تسجيل دخول / تسجيل جديد)
├── env.js                     # إعدادات البيئة (Dev fallback)
├── vite.config.js             # إعدادات Vite
├── package.json               # تبعيات الواجهة
├── CRITICAL_FIXES_PLAN.md     # خطة الإصلاحات الحرجة
├── .env.example               # متغيرات البيئة المطلوبة
├── public/                    # أصل ثابت (صور، خطوط)
├── src/
│   ├── app.js                 # نقطة دخول التطبيق
│   ├── types/index.d.ts       # تعريفات TypeScript
│   ├── js/modules/
│   │   ├── core.js            # إدارة الجلسة، السمة، الأدوات الأساسية
│   │   ├── config.js          # إعدادات التطبيق وتهيئة Supabase
│   │   ├── auth/              # وحدات المصادقة
│   │   │   ├── auth.js
│   │   │   ├── auth-guard.js
│   │   │   └── session.js
│   │   ├── i18n.js            # نظام الترجمة (عربي/إنجليزي)
│   │   ├── shared.js          # أدوات مشتركة (Toast, Modal, Courses)
│   │   ├── page-*.js          # منطق كل صفحة
│   │   ├── feedback.js        # نظام التقييم والملاحظات
│   │   └── tour.js            # جولة تعريفية تفاعلية (Onboarding)
│   ├── services/
│   │   ├── api.js             # عميل API مع Timeout
│   │   ├── email.js           # إرسال البريد
│   │   └── gemini.js          # تكامل Gemini
│   ├── pages/                 # HTML متعدد الصفحات
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── verify-email.html
│   │   ├── reset-password.html
│   │   └── account-locked.html
│   └── styles/
└── tests/
    ├── unit/                  # فارغ حالياً
    └── e2e/                   # فارغ حالياً
```

---

## 4. البنية المعمارية (Architecture Overview)

### التصميم التقني
- **التطبيق متعدد الصفحات (MPA):** كل صفحة HTML لها ملف JS مستقل يتحمل منطقها
- **بدون إطار عمل:** vanilla JS مع ES Modules
- **CSP صارم:** محدد في `index.html` لمنع XSS وtrusted origins
- **Monorepo:** جذر المشروع يدير `apps/web` و `apps/courses` و `app/schedule`

### تدفق البيانات
1. المستخدم يدخل الصفحة
2. `env.js` يعرّف `window.SVU_ENV`
3. الوحدة الرئيسية تُحدّد السمة واللغة
4. `config.js` يهيئ Supabase
5. صفحات المصادقة تستدعي `verifySessionWithServer`
6. `localStorage` يُستخدم كنسخة احتياطية مع تأكيد من الخادم

### إدارة الحالة (State Management)
- لا توجد مكتبة حالة مركزية
- الاعتماد على `localStorage` مع `safeStorage*` wrappers
- تحديثات DOM مباشرة عبر `document.getElementById`

---

## 5. المصادقة والصلاحيات

### آلية تسجيل الدخول
- Supabase Auth (signInWithPassword)
- إعادة توجيه عبر المستخدم (username/email) إلى البريد الإلكتروني
- حفظ الجلسة في localStorage مع تشفير بسيط (`escapeHtml`)
- "remember-me" يمدّد الجلسة لـ 7 أيام

### Auth Guard
- `auth-guard.js` يتحقق من:
  1. اتصال Supabase
  2. صلاحية الجلسة على الخادم (`verifySessionWithServer`)
  3. وجود بيانات المستخدم
  4. صلاحيات المشرف (`requireAdmin`)

### إدارة المستخدمين
- الأدوار: `user` and `admin`
- التحقق من `is_admin` و `is_active` من قاعدة البيانات
- قفل الحساب عبر صفحة `account-locked.html`

### طرق كلمة المرور
- نسيت كلمة المرور (Forgot Password)
- إعادة تعيين (Reset Password)
- تفعيل البريد الإلكتروني (Email Verification)

---

## 6. التكاملات والخدمات

### Supabase
- **الاستخدام:** مصادقة + قاعدة بيانات
- **التهيئة:** في `config.js` مع `persistSession: false`
- **السرية:** `anonKey` في المتغيرات العامة

### Gemini API
- **الغرض:** استخراج المواد من صورة الجدول (Schedule OCR)
- **الوصول:** عبر `services/gemini.js` و API endpoint `/api/gemini/generate`

### البريد الإلكتروني
- **الغرض:** إرسال روابط إعادة التعيين وتفعيل الحساب
- **الوصول:** عبر `services/email.js` و API endpoint `/api/email/send`

### ملف Courses
- **المصدر:** `svu_courses.json` ثابت (10MB max)
- **الترتيب:** مفتاح حسب التخصص (major)
- **الاستخدام:** عرض المقررات والتصنيف

---

## 7. الواجهة وتجربة المستخدم (UI/UX)

### نظام الألوان والسمة
- وضع داكن/فاتح/نظام (system)
- تخزين في localStorage (`svu_theme`)
- CSS Variables + Tailwind v4

### التدوين (Typography)
- خط Cairo من Google Fonts

### نظام الترجمة (i18n)
- ثنائي اللغة: عربي (افتراضي) / إنجليزي
- `data-i18n` attribute-based
- 300+ مفتاح ترجمة

### المكونات التفاعلية
- **Toast notifications** (success/error)
- **Modals** (forgot password, feedback)
- **Onboarding Tour** (v8 مع MutationObserver)
- **Password strength meter**
- **Phone formatter** per country

### التصميم المتجاوب
- CSS Grid + Flexbox
- RTL/LTR ديناميكي

---

## 8. الميزات والوحدات الرئيسية

| الوحدة | الوصف |
|--------|-------|
| Login | تسجيل دخول عبر username/email, remember-me, forgot password |
| Register | إنشاء حساب مع اختيار التخصص والهاتف والدولة |
| Dashboard | لوحة تحكم بالملف الشخصي والوصول للوظائف |
| Groups | مجموعات دراسية (قابل للتوسع) |
| Materials | تصنيف المقررات حسب السنة والتصنيف |
| Schedule | رفع صورة واستخراج الجدول بالذكاء الاصطناعي |
| Profile | تعديل البيانات وعرض الإحصائيات |
| Feedback | تقييم إلزامي بعد الجولة التعريفية |
| Tour | جولة تعريفية بـ 7 خطوات |

---

## 9. المشاكل الحرجة المعروفة (CRITICAL_FIXES_PLAN.md)

1. **حماية XSS في localStorage** – تطبيق `escapeHtml` على جميع القيم المُخزّنة
2. **توحيد معالجة الأخطاء** – استخدام `handleLoginError` في كل مكان
3. **التحقق من الجلسة مع الخادم** – `verifySessionWithServer`
4. **إزالة تكرار DOMContentLoaded** – تنظيم مستمعي الأحداث
5. **توحيد منطق المودال** – في `shared.js`
6. **صفحة account-locked.html** – تم إنشاؤها

---

## 10. الإعدادات والتكوين (Configuration)

### متغيرات البيئة
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
VITE_RESEND_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### إعدادات Vite
- **Port:** 3000 (dev), 4173 (preview)
- **Build:** multi-page مع 6 تخطيطات
- **minify:** esbuild
- **define:** `window.SVU_ENV` من البيئة

---

## 11. إعدادات الأمان (Security Considerations)

### المطبقة
- CSP header في HTML
- `escapeHtml` لمنع XSS
- HTTPS enforced في Supabase URL
- `localStorage` مع `try/catch`

### الثغرات المحتملة
- `VITE_*` متغيرات مرئية في العميل (لا يمكن إخفاؤها)
- session token عشوائي بسيط (`svu_` prefix)
- لا يوجد CSRF token
- ملف `env.js` في `.gitignore`

---

## 12. الاختبارات (Testing)

- **unit/** – فارغ (لا توجد اختبارات وحدة حالياً)
- **e2e/** – فارغ (لا توجد اختبارات E2E حالياً)
- **توصية:** إضافة Vitest للاختبارات الوحدة و Playwright للاختبارات الشاملة

---

## 13. قرارات معمارية بارزة

1. **بدون React/Vue:** vanilla JS لتقليل الاعتماديات
2. **Tailwind v4 في Vite:** أسرع من الإصدارات القديمة
3. **CSP صارمة:** أمان أولي API
4. **صفحات متعددة بدلاً من SPA:** SEO أبسط
5. **localStorage للجلسة:** بدون ضرورة خادم sessions
6. **Static + Supabase:** لا خادم Node.js مطلوب للنشر

---

## 14. التوصيات المستقبلية

1. إضافة اختبارات الوحدة (Vitest)
2. تدقيق أمني شامل
3. تنفيذ `account-locked.html`
4. توحيد event listeners في ملف مركزي
5. إضافة CI/CD pipeline
6. توثيق API endpoints
7. مراقبة الأخطاء (Sentry)

---

*تم إنشاء هذا التقرير بناءً على تحليل الكود المصدري.*
