# Component Tree

```mermaid
graph TD
  A[App]
  A --> B[Home]
  A --> C[Login]
  A --> D[Register]
  A --> E[AuthCallback]
  A --> F[ProtectedRoute]
  F --> G[Dashboard]
  A --> H[NotFound]

  B --> I[Navbar]
  B --> J[HeroAddition]
  B --> K[LandingSections]
  B --> L[Footer]

  K --> M[ProblemsSection]
  K --> N[SolutionBridge]
  K --> O[FeaturesSection]
  K --> P[HowItWorksSection]
  K --> Q[ComingSoonSection]
  K --> R[FinalCTASection]

  O --> S[InteractiveMapSimulation]

  C --> T[AuthCard]
  C --> U[InputField]
  C --> V[ForgotPasswordModal]
  C --> W[AuthButton]

  D --> T
  D --> U
  D --> W

  G --> X[DashboardLayout]
  G --> Y[DashboardHeader]
  G --> Z[EmptyDashboardState]
  G --> AA[SettingsModal]
  G --> AB[LogoutModal]
  G --> AC[DeleteAccountModal]

  AA --> AD[ProfileSettingsForm]
  AA --> AE[SecuritySettingsForm]
```

## Notes

- `src/components/ui` contains low-level reusable pieces.
- `src/components/landing` contains the landing page sections.
- `src/components/dashboard` contains dashboard-specific modals and forms.
- `src/pages` contains page-level orchestration.
- `src/stories` is not part of the production tree.
