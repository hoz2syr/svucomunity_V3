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
│       ├── core/
│       │   ├── adapters/
│       │   │   ├── localStorageTestStorage.test.ts
│       │   │   └── supabaseTestStorage.test.ts
│       │   └── storage/
│       │       └── localStorageTestStorage.test.ts
│       ├── hooks/
│       │   ├── useCoreSavedTests.test.ts
│       │   ├── useCorePlayTest.test.ts
│       │   ├── useTestCreator.test.ts
│       │   ├── usePromptPreferences.test.ts
│       │   └── usePromptGenerator.test.ts
│       └── services/
│           └── exam.supabase.test.ts
├── lib/
│   └── supabase.callback.test.ts
├── pages/
│   ├── Home.test.tsx
│   └── Login.test.tsx
├── schemas/
│   └── auth.schema.test.ts
├── stores/
│   └── notificationStore.test.ts
├── contexts/
│   └── AuthContext.test.ts
├── lib/
│   └── queryClient.test.ts
└── utils/
    └── validators.test.ts
```

### تغطية الاختبارات

| المجال | الحالة | عدد الاختبارات |
|---|---|---|
| Auth | ممتاز | 11 (core + callback) |
| Auth service | ممتاز | 5 |
| Supabase tests | Good | 5 |
| Dashboard components | جيد | 21 |
| Exam feature | جيد جداً | 68+ (core + hooks + adapter + service + component) |
| Landing sections | جيد | 9 |
| ProtectedRoute | موجود لكن غير موصول | 3 |
| notificationStore | جيد | 4 |
| Custom hooks | جيد | 23 |
| Validity/schemas | جيد | 2 |
| Total | | 274 test cases |

### ملاحظات
- `lib/supabase.callback.test.ts` يغطي سيناريوهات `handleAuthCallback` (RLS/no-env).
- `tests/features/exam/` لها تغطية ممتازة تشمل core layer جديد و adapter و service mapper.
- `tests/components/ProtectedRoute.test.tsx` موجود لكن المكون غير موصول — يمكن حذفه لاحقاً.
- `tests/dashboard/landing/` موجود لكن ملف landing المحلي في `src/components/landing/` لا يزال بدون تغطية كاملة.
- `Zustand stores` و `TanStack Query` لهما اختبارات لكنهما غير مستخدمين في production حالياً.
- `src/lib/rateLimit.ts.spec.ts` خارج نمط vitest الحالي — يحتاج نقل أو تحديث config.
