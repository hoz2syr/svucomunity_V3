# توثيق المكونات

## تقسيم المكونات

### Layout
- `Navbar`
- `Footer`
- `Header`

### UI
- `InputField`
- `AuthButton`
- `GlassCard`
- `FadeIn`
- `Skeleton`
- `ServerError`

### Landing
- `HeroAddition`
- `ScrollIndicator`
- `ProblemsSection`
- `SolutionBridge`
- `FeaturesSection`
- `HowItWorksSection`
- `ComingSoonSection`
- `FinalCTASection`

### Dashboard
- `Dashboard`
- `DashboardHeader`
- `DashboardLayout`
- `EmptyDashboardState`
- `FeatureCard`
- `StudyGroupsCard`
- `CourseMaterialsCard`
- `ScheduleExtractionCard`
- `TestsCard`
- `SettingsModal`
- `ProfileSettingsForm`
- `SecuritySettingsForm`
- `LogoutModal`
- `DeleteAccountModal`
- `ModalOverlay`

### Shared
- `AuthCard`
- `ForgotPasswordModal`

### Special
- `InteractiveMap`
- `ProtectedRoute`
- `ErrorBoundary`
- `AuthBackground`

## ملاحظات عامة

- معظم المكونات مكتوبة كـ function components.
- الواجهة تعتمد على Tailwind classes داخل المكونات.
- لا توجد مكتبة components منفصلة خارج `src/components`.
- `src/components/ui` هو أقرب مجلد إلى طبقة Design System.
- `src/components/dashboard` يحتوي على منطق dashboard وmodals.
- `src/components/landing` يحتوي على أجزاء الصفحة الرئيسية.
- `src/components/layout` مخصص للـ global layout.

## حالة الاكتمال

- Landing: مكتمل بصرياً.
- Auth: مكتمل بصرياً ووظيفياً.
- Dashboard: الهيكل موجود لكن المحتوى غير مكتمل.
- Settings: موجود لكن غير كامل وظيفياً.
- InteractiveMap: simulation فقط.
