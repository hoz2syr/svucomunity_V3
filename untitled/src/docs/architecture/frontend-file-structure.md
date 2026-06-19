# بنية الملفات والمجلدات

## الشجرة الحالية

```txt
src/
├── main.tsx
├── App.tsx
├── index.css
├── vite-env.d.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── shared/
│   │   ├── AuthCard.tsx
│   │   └── ForgotPasswordModal.tsx
│   ├── dashboard/
│   │   ├── ModalOverlay.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── DeleteAccountModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ProfileSettingsForm.tsx
│   │   ├── SecuritySettingsForm.tsx
│   │   ├── useProfileSettings.ts
│   │   ├── useSecuritySettings.ts
│   │   └── index.ts
│   ├── landing/
│   │   ├── HeroAddition.tsx
│   │   ├── ScrollIndicator.tsx
│   │   ├── ProblemsSection.tsx
│   │   ├── SolutionBridge.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── ComingSoonSection.tsx
│   │   └── FinalCTASection.tsx
│   ├── ui/
│   │   ├── AuthButton.tsx
│   │   ├── FadeIn.tsx
│   │   ├── GlassCard.tsx
│   │   ├── InputField.tsx
│   │   ├── ServerError.tsx
│   │   └── Skeleton.tsx
│   ├── AuthBackground.tsx
│   ├── ErrorBoundary.tsx
│   ├── InteractiveMap.tsx
│   ├── LandingSections.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── features/
│   ├── account/services/index.ts
│   ├── profile/services/index.ts
│   ├── notifications/services/index.ts
│   └── auth/services/index.ts
├── hooks/
│   ├── useAuthForm.ts
│   ├── useRateLimit.ts
│   ├── useInView.ts
│   └── useParticleCanvas.ts
├── lib/
│   ├── supabase.ts
│   ├── queryClient.ts
│   └── rateLimit.ts
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── AuthCallback.tsx
│   ├── NotFound.tsx
│   └── Dashboard/
│       ├── Dashboard.tsx
│       ├── DashboardHeader.tsx
│       ├── DashboardLayout.tsx
│       ├── EmptyDashboardState.tsx
│       ├── useDashboardNotifications.ts
│       └── useDashboardState.ts
├── schemas/
│   └── auth.schema.ts
├── services/
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── notification.service.ts
│   ├── account.service.ts
│   ├── environment.service.ts
│   └── index.ts
├── stores/
│   ├── notificationStore.ts
│   └── uiStore.ts
├── types/
│   ├── auth.ts
│   ├── notification.ts
│   ├── profile.ts
│   ├── canvas.ts
│   ├── supabase.ts
│   └── index.ts
├── utils/
│   ├── validators.ts
│   ├── canvasRenderer.ts
│   └── animation.ts
└── stories/
    ├── Header.stories.ts
    ├── ui/*.stories.tsx
    └── README.md
```

## تقسيم المسؤوليات

| المجلد | المسؤولية |
|---|---|
| `pages` | صفحات كاملة ومسارات التطبيق |
| `components/layout` | Navbar وFooter وHeader |
| `components/ui` | مكونات واجهة قابلة لإعادة الاستخدام |
| `components/dashboard` | مكونات لوحة التحكم |
| `components/landing` | أجزاء الصفحة الرئيسية |
| `components/shared` | مكونات مشتركة بين auth والواجهة |
| `hooks` | Hooks مخصصة للواجهة والمنطق التفاعلي |
| `services` | طبقة الوصول إلى Supabase والعمليات الخلفية |
| `stores` | Zustand stores |
| `types` | تعريفات TypeScript |
| `schemas` | Zod validation schemas |
| `utils` | دوال مساعدة عامة |
| `stories` | Storybook stories فقط |

## ملاحظات مهمة

- `src/stories` لا يجب أن يستورده أي ملف إنتاجي.
- `features/**/services/index.ts` موجودة لكن معظم المنطق لا يزال في `src/services`.
- `src/lib/supabase.ts` يحتوي على دوال legacy بجانب الدالة الأساسية `getSupabaseClient`.
- `src/pages/Dashboard/EmptyDashboardState.tsx` يشير إلى أن لوحة التحكم غير مكتملة وظيفياً.
