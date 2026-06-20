# خطة العمل والمخطط النهائي للبنية

## الهدف النهائي

إكمال بنية `untitled/` بحيث تكون:

1. بنية React/TypeScript واضحة لا تخلط بين:
   - production components
   - Storybook stories
   - pages
   - services
   - hooks
   - types
   - stores
   - tests
   - docs
2. لا تعتمد أي صفحة أو مكون إنتاجي على ملفات داخل `src/stories`.
3. لا تستخدم الصفحات أو المكونات مباشرة `Supabase` إلا عبر:
   - `src/lib/supabase.ts`
   - `src/services/*`
   - feature service index files داخل `src/features/**/services/*`
4. تكون كل مهمة منفصلة بملف مهمة وملف جلسة خاص بها.
5. يمر المشروع بنجاح على:
   - `npm run lint`
   - `npm run build`
   - `npm run test`
   - `npm run build-storybook`

## حالة التنفيذ

الحالة النهائية: مكتملة.

تم تشغيل:
```bash
npm run lint
npm run build
npm run test
npm run build-storybook
```

النتيجة:
- `npm run lint`: نجح.
- `npm run build`: نجح مع تحذير chunk size فقط.
- `npm run test`: نجح، 11 ملفات اختبار و36 اختباراً.
- `npm run build-storybook`: نجح مع تحذير chunk size وتحذير عدم وجود MDX فقط.
- تم حذف `storybook-static/` بعد build-storybook.

---

## مخطط الملفات النهائي

```txt
untitled/
├── AGENTS.md
├── README.md
├── DEPLOYMENT.md
├── metadata.json
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.shims.d.ts
├── .env.example
├── .gitignore
├── .storybook/
│   ├── main.ts
│   └── preview.tsx
│
├── .kilo/
│   ├── rules.md
│   ├── tasks.md
│   └── sessions/
│       ├── 00-master-session.md
│       ├── 01-storybook-boundary.md
│       ├── 02-supabase-service-layer.md
│       ├── 03-auth-flow-refactor.md
│       ├── 04-dashboard-refactor.md
│       ├── 05-dashboard-modals-refactor.md
│       ├── 06-types-validation.md
│       ├── 07-landing-components-refactor.md
│       ├── 08-tests-ci.md
│       ├── 09-final-cleanup.md
│       └── 10-production-readiness.md
│
├── docs/
│   ├── README.md
│   ├── architecture/final-file-map-and-work-plan.md
│   ├── architecture/implementation-plan.md
│   ├── tasks/master-task-list.md
│   ├── tasks/10-production-readiness-plan.md
│   ├── business-rules.md
│   ├── supabase-setup.md
│   ├── edge-functions.md
│   └── diagrams/
│       ├── component-tree.md
│       └── erd.md
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── features/
│   │   ├── auth/services/index.ts
│   │   ├── profile/services/index.ts
│   │   ├── notifications/services/index.ts
│   │   └── account/services/index.ts
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── EmptyDashboardState.tsx
│   │   │   ├── useDashboardNotifications.ts
│   │   │   └── useDashboardState.ts
│   │   ├── AuthCallback.tsx
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── shared/
│   │   │   ├── AuthCard.tsx
│   │   │   └── ForgotPasswordModal.tsx
│   │   ├── dashboard/
│   │   │   ├── ModalOverlay.tsx
│   │   │   ├── LogoutModal.tsx
│   │   │   ├── DeleteAccountModal.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ProfileSettingsForm.tsx
│   │   │   ├── SecuritySettingsForm.tsx
│   │   │   ├── useProfileSettings.ts
│   │   │   ├── useSecuritySettings.ts
│   │   │   └── index.ts
│   │   ├── landing/
│   │   │   ├── HeroAddition.tsx
│   │   │   ├── ScrollIndicator.tsx
│   │   │   ├── ProblemsSection.tsx
│   │   │   ├── SolutionBridge.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ComingSoonSection.tsx
│   │   │   └── FinalCTASection.tsx
│   │   ├── ui/
│   │   │   ├── AuthButton.tsx
│   │   │   ├── FadeIn.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── ServerError.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── AuthBackground.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── InteractiveMap.tsx
│   │   ├── LandingSections.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── queryClient.ts
│   │   └── rateLimit.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── notification.service.ts
│   │   ├── account.service.ts
│   │   ├── environment.service.ts
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── notificationStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/
│   │   ├── useAuthForm.ts
│   │   ├── useRateLimit.ts
│   │   ├── useInView.ts
│   │   └── useParticleCanvas.ts
│   │
│   ├── schemas/
│   │   └── auth.schema.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── notification.ts
│   │   ├── profile.ts
│   │   ├── canvas.ts
│   │   ├── supabase.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── animation.ts
│   │   └── canvasRenderer.ts
│   │
│   └── stories/
│       ├── README.md
│       ├── Header.stories.ts
│       ├── ui/InputField.stories.tsx
│       ├── ui/AuthButton.stories.tsx
│       ├── ui/GlassCard.stories.tsx
│       ├── ui/ServerError.stories.tsx
│       └── ui/Skeleton.stories.tsx
│
├── tests/
│   ├── auth.test.tsx
│   ├── InputField.test.tsx
│   ├── Dashboard.test.tsx
│   ├── supabase.test.ts
│   ├── setup.ts
│   └── dashboard/
│       ├── LogoutModal.test.tsx
│       ├── DeleteAccountModal.test.tsx
│       └── SettingsModal.test.tsx
│   └── services/
│       ├── auth.service.test.ts
│       ├── profile.service.test.ts
│       ├── notification.service.test.ts
│       └── account.service.test.ts
│
└── supabase/
    ├── migrations/
    ├── seed/
    └── functions/
```

---

## حدود كل طبقة

### `src/pages/`
مسؤولة عن الصفحة ككل:
- جمع المكونات
- تمرير props
- routing-level state
- calling feature hooks/services

لا تضع فيها:
- استعلامات Supabase مباشرة
- نماذج معقدة منفصلة
- modal logic كبير

### `src/components/`
مكونات قابلة لإعادة الاستخدام:
- `ui/` atomic components
- `layout/` shell components
- `shared/` shared domain-neutral components
- `dashboard/` dashboard-specific UI
- `landing/` landing page sections

لا تضع فيها:
- stories
- mocks production
- Supabase calls مباشرة إلا عبر service/hook

### `src/services/`
طبقة خدمات عامة:
- auth
- profile
- notification
- account
- environment/error utilities

لا تضع فيها:
- JSX
- React state
- UI logic

### `src/stories/`
مسؤولة فقط عن Storybook:
- stories
- decorators
- mocks
- fixtures
- docs MDX

لا تضع فيها:
- production components
- CSS مستخدم من production
- imports إلى components production من stories

### `src/types/`
مسؤولة عن الأنماط المشتركة:
- auth input/output types
- profile types
- notification types
- canvas types
- Supabase helper types

لا تضع فيها:
- business logic
- validation runtime
- Supabase calls

### `src/schemas/`
مسؤولة عن validation:
- auth schema
- profile schema
- security schema

لا تضع فيها:
- UI state
- Supabase calls

---

## حدود التعقيد المطلوبة

### الواجهة الأمامية

- الكود واضح وقابل للتعديل.
- حالات الخطأ والنجاح والتحميل تُضاف فقط عند الحاجة الفعلية.
- لا تُبنى أنظمة UI عامة زائدة عن الحاجة.
- الاختبارات تُكتب للflows الحرجة والمكونات ذات السلوك المهم، وليس لكل مكون.

### طبقة العميل

- تخدم UX و no-env behavior.
- لا تُعامل كطبقة أمان لأنها قابلة للتعديل من المتصفح.
- لا تعتمد على rate limit أو authorization في المتصفح فقط.

### طبقة الخادم و Supabase

- هي الطبقة الأهم للأمان والبيانات.
- RLS والمigrations والـ Edge Functions تحتاج اختبارات وتوثيق أقوى.
- أي عملية حساسة مثل حذف الحساب يجب أن تكون قابلة للاختبار والمراجعة.

### التوثيق

- كل توثيق يوضح الحالة الحالية وخطة الإنتاج.
- كل بنية مهمة يجب أن يكون لها مخطط ملفات أو diagram.
- لا تُنشأ تقارير متكررة أو ملفات جلسة داخل `docs/`.

---

## خطة العمل بالترتيب

### المرحلة 1: تثبيت حدود Storybook
الحالة: مكتملة.
الهدف:
- إزالة اعتماد production على `src/stories`.
- تنظيف `src/stories` من components الإنتاجية.
- جعل Storybook يستورد من `src/components`.

ملف الجلسة:
- `.kilo/sessions/01-storybook-boundary.md`

### المرحلة 2: بناء Service Layer لـ Supabase
الحالة: مكتملة.
الهدف:
- نقل كل عمليات Supabase من الصفحات والمكونات إلى services.
- تثبيت lazy client behavior.
- منع أي crash عند نقص `.env.local`.

ملف الجلسة:
- `.kilo/sessions/02-supabase-service-layer.md`

### المرحلة 3: إعادة تنظيم Auth flow
الحالة: مكتملة.
الهدف:
- توحيد تسجيل الدخول، التسجيل، Google OAuth، callback، forgot password.
- إبقاء UI في pages/components ومنطق Supabase في services.

ملف الجلسة:
- `.kilo/sessions/03-auth-flow-refactor.md`

### المرحلة 4: تفكيك Dashboard
الحالة: مكتملة.
الهدف:
- استخراج `DashboardHeader`.
- استخراج `DashboardLayout`.
- استخراج `EmptyDashboardState`.
- نقل state إلى hooks.

ملف الجلسة:
- `.kilo/sessions/04-dashboard-refactor.md`

### المرحلة 5: تفكيك Modals
الحالة: مكتملة.
الهدف:
- كل modal في ملف مستقل.
- profile/security forms في مكونات منفصلة.
- Supabase operations تنتقل إلى services/hooks.

ملف الجلسة:
- `.kilo/sessions/05-dashboard-modals-refactor.md`

### المرحلة 6: توحيد Types و Validation
الحالة: مكتملة.
الهدف:
- توحيد `Profile`.
- توحيد `Notification`.
- توحيد auth input types.
- إزالة casting غير الآمن قدر الإمكان.

ملف الجلسة:
- `.kilo/sessions/06-types-validation.md`

### المرحلة 7: تنظيف Landing components
الحالة: مكتملة.
الهدف:
- فصل landing sections إلى مكونات واضحة.
- الحفاظ على التصميم الحالي.
- تقليل التكرار دون تغيير السلوك.

ملف الجلسة:
- `.kilo/sessions/07-landing-components-refactor.md`

### المرحلة 8: اختبارات و CI
الحالة: مكتملة.
الهدف:
- إضافة/تحديث tests للـ services.
- تثبيت Vitest setup.
- التأكد من أن `npm run test` يعمل.

ملف الجلسة:
- `.kilo/sessions/08-tests-ci.md`

### المرحلة 9: تنظيف نهائي
الحالة: مكتملة.
الهدف:
- تشغيل lint/build/storybook/test.
- تحديث docs.
- حذف files المؤقتة إن وجدت.
- عدم ترك imports خاطئة.

ملف الجلسة:
- `.kilo/sessions/09-final-cleanup.md`

---

## شروط اكتمال البنية الصحيحة

تعتبر البنية مكتملة فقط عندما تتحقق هذه الشروط:

1. لا يوجد import من `src/components/**` إلى `src/stories/**`.
2. لا يوجد import من `src/pages/**` مباشرة إلى `getSupabaseClient` أو `supabase`.
3. كل عمليات Supabase موجودة داخل `src/lib/supabase.ts` أو `src/services/**` أو `src/features/**/services/**`.
4. كل صفحة تستورد components/services/hooks فقط.
5. كل story موجودة داخل `src/stories/**` وتستورد من production components.
6. `src/stories/**` لا يحتوي على components إنتاجية.
7. `npm run lint` نظيف.
8. `npm run build` نظيف.
9. `npm run test` نظيف.
10. `npm run build-storybook` نظيف.
11. لا توجد ملفات `.env.local` أو secrets في git.
12. لا توجد migrations معدلة إلا إذا كان هناك ملف مهمة مخصص لذلك.
13. لا توجد ملفات generated مثل `storybook-static/` محفوظة في working tree.
