# Stories & Tests

## Storybook

### الإعداد
- `.storybook/main.ts`
- `.storybook/preview.tsx`

### Storybook Stories الموجودة

```txt
src/stories/
├── Header.stories.ts
└── ui/
    ├── InputField.stories.tsx
    ├── AuthButton.stories.tsx
    ├── GlassCard.stories.tsx
    ├── Skeleton.stories.tsx
    └── ServerError.stories.tsx
```

### ملاحظات
- `src/stories` مخصص للـ Storybook فقط.
- لا يجب أن يستورده أي كود إنتاجي.
- Storybook أساسي — يحتاج expand.

---

## Vitest

### الإعداد
- `vitest.config.ts`
- Environment: `jsdom`
- Setup: `tests/setup.ts`
- Alias: `@` → project root
- Timeout: 30s

### Pattern الالتقاط
- `tests/**/*.test.{ts,tsx}` فقط
- `src/lib/rateLimit.ts.spec.ts` **غير مُلتقط** (موجود داخل `src/` وليس `tests/`)

### ملفات الاختبار الموجودة

```txt
tests/
├── auth.test.tsx
├── Dashboard.test.tsx
├── InputField.test.tsx
├── supabase.test.ts
├── dashboard/
│   ├── SettingsModal.test.tsx
│   ├── DeleteAccountModal.test.tsx
│   ├── LogoutModal.test.tsx
│   ├── FeatureCard.test.tsx
│   ├── StudyGroupsCard.test.tsx
│   ├── CourseMaterialsCard.test.tsx
│   ├── ScheduleExtractionCard.test.tsx
│   ├── TestsCard.test.tsx
│   └── EmptyDashboardState.test.tsx
├── landing/
│   └── FinalCTASection.test.tsx
├── shared/
│   ├── GuestButton.test.tsx
│   └── AuthCard.test.tsx
├── services/
│   ├── auth.service.test.ts
│   ├── profile.service.test.ts
│   ├── account.service.test.ts
│   └── notification.service.test.ts
├── components/
│   ├── ProtectedRoute.test.tsx
│   ├── AuthBackground.test.tsx
│   ├── ui/
│   │   ├── ServerError.test.tsx
│   │   ├── Skeleton.test.tsx
│   │   ├── GlassCard.test.tsx
│   │   ├── FadeIn.test.tsx
│   │   └── AuthButton.test.tsx
│   ├── dashboard/
│   │   ├── useSecuritySettings.test.ts
│   │   └── useProfileSettings.test.ts
│   ├── layout/
│   │   ├── Navbar.test.tsx
│   │   └── Footer.test.tsx
│   │   └── Header.test.tsx
│   └── landing/
│       ├── HeroAddition.test.tsx
│       ├── ScrollIndicator.test.tsx
│       ├── ProblemsSection.test.tsx
│       ├── SolutionBridge.test.tsx
│       ├── FeaturesSection.test.tsx
│       ├── HowItWorksSection.test.tsx
│       ├── ComingSoonSection.test.tsx
│       └── FinalCTASection.test.tsx
├── hooks/
│   ├── useRateLimit.test.ts
│   ├── useRateLimit.integration.test.ts
│   ├── useInView.test.ts
│   ├── useAuthForm.test.ts
│   └── useParticleCanvas.test.ts
├── features/
│   └── exam/
│       ├── store.test.ts
│       ├── utils.test.ts
│       ├── components/
│       │   ├── Skeletons.test.tsx
│       │   └── ErrorState.test.tsx
│       └── hooks/
│           ├── useTestCreator.test.ts
│           └── usePromptPreferences.test.ts
├── pages/
│   ├── Home.test.tsx
│   └── Login.test.tsx
├── schemas/
│   └── auth.schema.test.ts
├── stores/
│   ├── uiStore.test.ts
│   └── notificationStore.test.ts
├── contexts/
│   └── AuthContext.test.ts
├── lib/
│   └── queryClient.test.ts
└── utils/
    └── validators.test.ts
```

### تغطية الاختبارات

| المجال | الحالة |
|---|---|
| Auth | جيد |
| Dashboard components | جيد |
| Exam feature | جيد (store, utils, hooks, components) |
| Landing sections | ضعيف (FinalCTASection فقط) |
| ProtectedRoute | موجود لكن غير موصول — اختباراته قديمة |
| ErrorBoundary | غير مختبر |
| Integration | Partial (useRateLimit.integration.test.ts) |

### ملاحظات
- `src/lib/rateLimit.ts.spec.ts` خارج نمط vitest الحالي — يحتاج نقل أو تحديث config.
- `tests/features/exam/` لها تغطية جيدة.
- `tests/components/ProtectedRoute.test.tsx` موجود لكن المكون غير موصول — يمكن حذفه أو تحويله.
- `tests/dashboard/landing/` موجود لكن ملف landing المحلي في `src/components/landing/` لا يزال بدون تغطية كافية.
- `Zustand stores` و `TanStack Query` لهما اختبارات لكنهما غير مستخدمين في production.
