# توثيق المكونات

## تقسيم المكونات

### Layout
- `Navbar`
- `Footer`
- `Header`

### UI Primitives
- `InputField`
- `AuthButton`
- `GlassCard`
- `FadeIn`
- `Skeleton`
- `ServerError`

### Auth
- `AuthCard`
- `ForgotPasswordModal`
- `GuestButton`
- `AuthBackground`

### Dashboard
- `DashboardLayout`
- `DashboardHeader`
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

### Landing
- `HeroAddition`
- `ScrollIndicator`
- `ProblemsSection`
- `SolutionBridge`
- `FeaturesSection`
- `HowItWorksSection`
- `ComingSoonSection`
- `FinalCTASection`
- `LandingSections`
- `InteractiveMap`

### Exam Feature (features/exam)
- `ExamLayout`
- `ExamNavbar`
- `TestCard`
- `Skeletons` (TestCardSkeleton, PlayTestSkeleton)
- `ErrorState`
- `Loading`

### Route Guards
- `GuestRoute` — نشط، يُستخدم في جميع المسارات العامة (Dashboard + Exam)
- `ProtectedRoute` — **محجوز لميزة المجموعات المستقبلية**، غير موصول في App.tsx

### Special
- `ErrorBoundary`

## ملاحظات عامة

- معظم المكونات مكتوبة كـ function components.
- الواجهة تعتمد على Tailwind classes داخل المكونات.
- لا توجد مكتبة components منفصلة خارج `src/components`.
- `src/components/ui` هو أقرب مجلد إلى طبقة Design System.
- `src/components/dashboard` يحتوي على منطق dashboard و modals.
- `src/components/landing` يحتوي على أجزاء الصفحة الرئيسية.
- `src/components/shared` مخصص للمكونات المشتركة بين auth والواجهة.

## حالة الاكتمال

| المجال | الحالة |
|---|---|
| Landing | مكتمل بصرياً |
| Auth | مكتمل بصرياً ووظيفياً |
| Dashboard shell | مكتمل |
| Dashboard content | Placeholder (4 بطاقات ميزات) |
| Exam feature | مكتمل (self-contained) |
| Study Groups | غير منشأ بعد (ProtectedRoute محجوز) |
| Settings | موجود جزئياً |
| InteractiveMap | simulation فقط |
| Design tokens | غير مركزي (مطلوب مستقبلاً) |
| Accessibility | متوسط — يحتاج تحسين |
