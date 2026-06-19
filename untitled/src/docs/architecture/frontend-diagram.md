# مخطط الواجهة

## الهدف

توثيق مخطط Frontend للمشروع الحالي داخل `src`.

## المخطط العام

```mermaid
graph TD
  A[main.tsx] --> B[App.tsx]
  B --> C[QueryClientProvider]
  B --> D[AuthProvider]
  B --> E[BrowserRouter]
  B --> F[ErrorBoundary]
  F --> G[Routes]

  G --> H[Home]
  G --> I[Login]
  G --> J[Register]
  G --> K[AuthCallback]
  G --> L[ProtectedRoute]
  G --> M[NotFound]

  L --> N[Dashboard]

  H --> O[Navbar]
  H --> P[HeroAddition]
  H --> Q[LandingSections]
  H --> R[Footer]

  Q --> S[ProblemsSection]
  Q --> T[SolutionBridge]
  Q --> U[FeaturesSection]
  Q --> V[HowItWorksSection]
  Q --> W[ComingSoonSection]
  Q --> X[FinalCTASection]

  I --> Y[AuthCard]
  I --> Z[InputField]
  I --> AA[ForgotPasswordModal]
  I --> AB[AuthButton]

  J --> Y
  J --> Z
  J --> AB

  N --> AC[DashboardLayout]
  N --> AD[DashboardHeader]
  N --> AE[EmptyDashboardState]
  N --> AF[SettingsModal]
  N --> AG[LogoutModal]
  N --> AH[DeleteAccountModal]

  AF --> AI[ProfileSettingsForm]
  AF --> AJ[SecuritySettingsForm]
```

## الملاحظات المهمة

- `App.tsx` هو نقطة دخول الواجهة.
- `AuthProvider` موجود داخل `contexts/AuthContext.tsx`.
- `ProtectedRoute` يحمي `/dashboard`.
- `Home` يجمع كل أجزاء الصفحة الرئيسية.
- `Dashboard` لا يزال عبارة عن shell إلى حد كبير.
- `src/stories` مخصص لـ Storybook فقط ولا يجب أن يستورده أي كود إنتاجي.
