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
│   │   ├── ForgotPasswordModal.tsx
│   │   └── GuestButton.tsx
│   ├── dashboard/
│   │   ├── ModalOverlay.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── DeleteAccountModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ProfileSettingsForm.tsx
│   │   ├── SecuritySettingsForm.tsx
│   │   ├── useProfileSettings.ts
│   │   ├── useSecuritySettings.ts
│   │   ├── FeatureCard.tsx
│   │   ├── StudyGroupsCard.tsx
│   │   ├── CourseMaterialsCard.tsx
│   │   ├── ScheduleExtractionCard.tsx
│   │   ├── TestsCard.tsx
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
│   ├── GuestRoute.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── GuestContext.tsx
├── features/
│   └── exam/
│       ├── index.ts
│       ├── components/
│       │   ├── ExamLayout.tsx
│       │   ├── ExamNavbar.tsx
│       │   ├── Skeletons.tsx
│       │   ├── ErrorState.tsx
│       │   ├── TestCard.tsx
│       │   ├── StarRating.tsx
│       │   └── Loading.tsx
│       └── src/
│           ├── types.ts
│           ├── pages/
│           │   ├── Home.tsx
│           │   ├── CreateTest.tsx
│           │   ├── PlayTest.tsx
│           │   └── SavedTests.tsx
│           ├── hooks/
│           │   ├── usePlayTest.ts
│           │   ├── useSavedTests.ts
│           │   ├── useCoreSavedTests.ts
│           │   ├── useTestCreator.ts
│           │   ├── useTestActions.ts
│           │   ├── useTestMigration.ts
│           │   ├── usePromptPreferences.ts
│           │   ├── usePromptGenerator.ts
│           │   ├── useCopyToClipboard.ts
│           │   └── index.ts
│           └── lib/
│               ├── store.ts        # localStorage CRUD
│               ├── export.ts       # PDF / Word exporters
│               └── utils.ts
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
    └── ui/
        ├── InputField.stories.tsx
        ├── AuthButton.stories.tsx
        ├── GlassCard.stories.tsx
        ├── Skeleton.stories.tsx
        └── ServerError.stories.tsx
```

> **ملاحظة:** `features/*/services/index.ts` (account, profile, notifications, auth) موجودة لكن تُعيد تصدير `src/services/` ولا تُستورد في `App.tsx`.

## تقسيم المسؤوليات

| المجلد | المسؤولية |
|---|---|
| `pages` | صفحات كاملة ومسارات التطبيق |
| `components/layout` | Navbar وFooter وHeader |
| `components/ui` | مكونات واجهة قابلة لإعادة الاستخدام |
| `components/dashboard` | مكونات لوحة التحكم والنماذج |
| `components/landing` | أجزاء الصفحة الرئيسية |
| `components/shared` | مكونات مشتركة بين auth والواجهة |
| `components/GuestRoute.tsx` | يسمح للمُسجّل والزائر بالدخول |
| `components/ProtectedRoute.tsx` | **محجوز لميزة المجموعات (Study Groups) — يمنع الزوار فقط** |
| `features/exam` | ميزة الاختبارات كاملة (self-contained) |
| `hooks` | Hooks مخصصة للواجهة والمنطق التفاعلي |
| `services` | طبقة الوصول إلى Supabase |
| `stores` | Zustand stores (غير مستخدمة حالياً) |
| `types` | تعريفات TypeScript |
| `schemas` | Zod validation schemas |
| `utils` | دوال مساعدة عامة |
| `stories` | Storybook stories فقط |

## ملاحظات مهمة

- `stories/` لا يجب أن يستورده أي ملف إنتاجي.
- `features/exam/` ميزة مستقلة كاملة — localStorage + PDF/Word export + vitest coverage.
- `GuestRoute` يُستخدم حالياً لجميع المسارات بما فيها `/dashboard`.
- `ProtectedRoute` غير مستخدم حالياً — مُحجزم لميزة **المجموعات** المستقبلية.
- `src/lib/supabase.ts` يحتوي على دوال legacy بجانب `getSupabaseClient`.
- `stores` ({notificationStore, uiStore}) غير مستخدمة في production حالياً.
- `TanStack Query` مُهيأ لكن لا يستخدم فعلياً لجلب البيانات.
