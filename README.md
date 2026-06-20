# SVU Community - مجتمع طلاب تقنية المعلومات

منصة ويب متكاملة لطلاب الجامعة السورية الافتراضية - قسم تقنية المعلومات. تهدف إلى تجميع المجموعات الدراسية، مقررات الكلية، وجدول الدراسة في مكان واحد مع ميزات ذكاء اصطناعي.

## البنية التقنية

### التقنيات الأساسية
- **React 19** — مكتبة واجهة المستخدم مع functional components و hooks
- **TypeScript 5.8** — تحقق أنماط صارم (strict mode)
- **Vite 6** — أداة بناء وتطوير سريعة
- **Tailwind CSS v4** — تنسيق عبر utility classes
- **Motion** — رسوم متحركة للواجهة
- **React Router v7** — تنقل بين الصفحات
- **Supabase** — مصادقة وقاعدة بيانات
- **Lucide React** — مكتبة أيقونات
- **React Hook Form + Zod** — إدارة نماذج وتحقق من البيانات
- **React Query (@tanstack/react-query)** — إدارة استعلامات وذاكرة تخزين مؤقت
- **Zustand** — إدارة حالة عامة (إشعارات، واجهة المستخدم)
- **Vitest + Testing Library** — اختبارات وحدة
- **Storybook 10** — توثيق وعرض مكونات UI

### لماذا هذه التقنيات؟

| التقنية | السبب |
|---------|-------|
| Vite | أسرع من Webpack، دعم TypeScript فوري، HMR سريع |
| Tailwind v4 | Vite plugin مدمج، أداء أفضل، CSS-first config |
| Motion | API بسيط، استيراد جزئي (`motion/react`), RTL-friendly |
| Supabase | بديل Firebase مفتوح المصدر، PostgreSQL خلفه, Auth مدمج |
| TypeScript strict | تقليل الأخطاء وقت التشغيل، تكامل أفضل مع IDE |
| Vitest | اختبار سريع ومتوافق مع jsdom |
| Storybook | عزل UI components عن production flow |

## خريطة الملفات

```txt
untitled/
├── index.html                 # نقطة دخول HTML
├── package.json               # تبعيات المشروع
├── package-lock.json          # قفل الإصدارات
├── vite.config.ts             # إعداد Vite + aliases
├── tsconfig.json              # إعداد TypeScript
├── vitest.config.ts           # إعداد Vitest
├── .env.example               # متغيرات البيئة المطلوبة
├── README.md                  # هذا الملف
│
├── src/
│   ├── main.tsx               # نقطة دخول React
│   ├── App.tsx                # الجذر الرئيسي للـ routes
│   ├── index.css              # تنسيقات عامة + utilities مخصصة
│   ├── vite-env.d.ts          # مرجع أنواع Vite
│   │
│   ├── lib/
│   │   ├── supabase.ts        # lazy Supabase client + دوال مساعدة
│   │   ├── queryClient.ts     # React Query client
│   │   └── rateLimit.ts       # rate limit utility
│   │
│   ├── services/
│   │   ├── auth.service.ts    # login/register/callback/forgot password
│   │   ├── profile.service.ts # fetch/update profile + password
│   │   ├── notification.service.ts # notifications
│   │   ├── account.service.ts # sign out/delete account
│   │   ├── environment.service.ts # env/error utilities
│   │   └── index.ts           # service barrel
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # إدارة حالة المصادقة global
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── AuthBackground.tsx
│   │   ├── InteractiveMap.tsx
│   │   ├── LandingSections.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   └── landing/
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard/
│   │   ├── AuthCallback.tsx
│   │   └── NotFound.tsx
│   │
│   ├── hooks/
│   ├── stores/
│   ├── schemas/
│   ├── types/
│   ├── utils/
│   ├── features/**/services/
│   └── stories/
│
├── tests/
│   ├── auth.test.tsx
│   ├── InputField.test.tsx
│   ├── Dashboard.test.tsx
│   ├── supabase.test.ts
│   ├── setup.ts
│   ├── dashboard/
│   └── services/
│
└── supabase/
    ├── migrations/
    ├── seed/
    └── functions/
```

## القرارات المعمارية

### 1. Client-Side Rendering فقط
المشروع يعمل بالكامل في المتصفح (SPA). لا يوجد SSR. السبب:
- Vite يبني static assets فقط
- Supabase Auth يعمل client-side بشكل طبيعي
- Canvas animations تحتاج DOM مباشرة

### 2. Lazy Supabase client
لا يتم إنشاء Supabase client عند import. يتم إنشاؤه فقط عند استدعاء دالة تحتاج Supabase فعلياً. عند نقص البيئة:
- لا تُقرأ session.
- لا يُعرض نجاح وهمي.
- لا يتم الاشتراك في `onAuthStateChange`.
- تظهر رسالة واضحة عند محاولة تنفيذ عملية تحتاج Supabase.

### 3. Service Layer للمصادقة والبيانات
لا تضع pages/components Supabase calls مباشرة. كل عمليات Supabase تمر عبر:
- `src/lib/supabase.ts`
- `src/services/**`
- feature service index files داخل `src/features/**/services/**`

### 4. Component Organization
- `components/ui/` — atomic components مثل `InputField`, `AuthButton`, `GlassCard`
- `components/layout/` — Navbar, Footer, Header
- `components/dashboard/` — dashboard modals/forms
- `components/landing/` — landing page sections
- `pages/` — route-level composition
- `pages/Dashboard/` — dashboard-specific components/hooks
- `stories/` — Storybook فقط وتستورد من production components

### 5. Dashboard Refactor
`src/pages/Dashboard.tsx` re-export فقط. المنطق مقسم إلى:
- `src/pages/Dashboard/Dashboard.tsx`
- `DashboardHeader.tsx`
- `DashboardLayout.tsx`
- `EmptyDashboardState.tsx`
- `useDashboardNotifications.ts`
- `useDashboardState.ts`

### 6. Modal Refactor
لا يوجد منطق modal مركزي كبير. كل modal/form في ملف مستقل:
- `LogoutModal.tsx`
- `DeleteAccountModal.tsx`
- `SettingsModal.tsx`
- `ProfileSettingsForm.tsx`
- `SecuritySettingsForm.tsx`
- `ModalOverlay.tsx`

### 7. Styling Approach
- Tailwind v4 مع `@theme` لخطوط مخصصة
- ألوان داكنة (`#060a1f`, `#0a0f2e`) مع cyan → indigo
- `backdrop-blur` و `bg-opacity` للتأثير الزجاجي

### 8. Error Boundary
`ErrorBoundary` يلف الأقسام الحساسة في `Home.tsx` لمنع انهيار التطبيق كاملاً إذا فشل component معين.

### 9. Protected Route Pattern
كل protected route يتحقق من `session` قبل عرض المحتوى. إذا لا يوجد session → redirect إلى `/login`.

## تدفق البيانات (Data Flow)

```txt
User Action → Component State → Validation → Service → Supabase/AuthContext Update → UI Re-render
```

### تدفق تسجيل الدخول:
1. المستخدم يملأ النموذج في `Login.tsx`
2. `validators.ts` و Zod schema تتحقق من البريد وكلمة المرور
3. `loginWithPassword()` في `auth.service.ts` يتعامل مع Supabase
4. Supabase يرجع `session` + `error`
5. `AuthContext` يسمع التغيير عبر `onAuthStateChange`
6. UI يحدث الحالة تلقائياً

### تدفق Google OAuth:
1. المستخدم يضغط "تسجيل الدخول عبر Google"
2. `signInWithGoogle()` يفتح نافذة Google
3. المستخدم يختار حساب
4. Google يعيد توجيه إلى `/auth/callback`
5. `completeAuthCallback()` يتعامل مع Supabase
6. `navigate('/dashboard')` يرسل المستخدم إلى لوحة التحكم

## البيانات في Supabase

### جدول `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  provider TEXT NOT NULL DEFAULT 'email',
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### RLS Policies
```sql
-- المستخدم يرى بروفايله فقط
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- المستخدم يحدّث بروفايله فقط
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- المستخدم ينشئ بروفايله فقط
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- المستخدم يحذف بروفايله فقط
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);
```

### جدول `notifications`
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```

### RLS Policies
```sql
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
```

### RLS Policies
```sql
-- المستخدم يرى بروفايله فقط
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- المستخدم يحدث بروفايله فقط
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## الأمان

| Layer | الآلية |
|-------|--------|
| **Authentication** | Supabase Auth (email/password + Google OAuth) |
| **Authorization** | RLS Policies على كل جدول |
| **UI Protection** | `ProtectedRoute` يمنع الوصول بدون جلسة |
| **Session Management** | Supabase يدير refresh token تلقائياً |
| **Input Validation** | Zod schemas + React Hook Form + `src/utils/validators.ts` |
| **XSS Prevention** | لا يوجد `dangerouslySetInnerHTML`، حقول إدخال بتمرير صريح |
| **CSP** | `<meta http-equiv="Content-Security-Policy">` في `index.html` |
| **Rate Limiting** | تقييد محاولات تسجيل الدخول عبر `localStorage` كإجراء UX فقط |
| **No-env Safety** | لا crash عند نقص `.env.local` |

## كيفية التشغيل

1. تثبيت التبعيات: `npm install`
2. إنشاء `.env.local` من `.env.example`:
   ```txt
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. تشغيل الخادم: `npm run dev`
4. فتح `http://localhost:3000`

## أوامر npm

| الأمر | الوصف |
|--------|-------|
| `npm run dev` | تشغيل خادم التطوير |
| `npm run build` | بناء للإنتاج |
| `npm run preview` | معاينة البناء |
| `npm run lint` | تحقق TypeScript |
| `npm run test` | تشغيل Vitest |
| `npm run test:coverage` | تشغيل Vitest مع coverage |
| `npm run storybook` | تشغيل Storybook dev server |
| `npm run build-storybook` | بناء Storybook static |

## حالة الاختبارات

- `tests/auth.test.tsx` يغطي auth flows.
- `tests/supabase.test.ts` يغطي lazy/no-env Supabase behavior.
- `tests/services/*.test.ts` يغطي service layer.
- `tests/dashboard/*.test.tsx` يغطي dashboard modals.
- `tests/InputField.test.tsx` يغطي UI input behavior.
- `tests/setup.ts` يثبت mocks للـ jsdom.

## ملاحظات للتطوير المستقبلي

- [x] إضافة React Hook Form + Zod للنماذج
- [x] إضافة React Query للاستعلامات وذاكرة تخزين مؤقت
- [x] إضافة Zustand لإدارة الحالة العامة
- [x] نظام إشعارات حقيقي عبر Supabase + جدول `notifications`
- [x] Service layer لـ Supabase
- [x] Lazy Supabase client بدون crash عند نقص `.env.local`
- [ ] تحسين جاهزية الإنتاج عبر المهمة 10
- [ ] تحسين SEO بـ React Helmet
- [x] Storybook لتوثيق المكونات
- [x] تفكيك Dashboard و Modals
- [ ] تحسين SEO بـ React Helmet
- [ ] إضافة PWA support
- [ ] تحليل حجم الحزمة (`rollup-plugin-visualizer`)
- [ ] إضافة Husky + lint-staged لمنع كود غير مطابق
