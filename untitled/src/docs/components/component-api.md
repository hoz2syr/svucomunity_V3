# Component API

## UI Components

### InputField
- الملف: `src/components/ui/InputField.tsx`
- الاستخدام: حقول إدخال قابلة لإعادة الاستخدام.
- props الأساسية:
  - `label`
  - `type`
  - `value`
  - `onChange`
  - `error`
  - `showSuccessIndicator`
  - `autoComplete`
  - `required`
- ملاحظات:
  - يدعم password toggle.
  - يدعم aria error binding.
  - يدعم success indicator.

### AuthButton
- الملف: `src/components/ui/AuthButton.tsx`
- الاستخدام: زر submit في auth forms.
- props الأساسية:
  - `defaultText`
  - `loadingText`
  - `isLoading`
  - `disabled`
- ملاحظات:
  - يستخدم motion button.
  - يدعم loading spinner.

### GlassCard
- الملف: `src/components/ui/GlassCard.tsx`
- الاستخدام: بطاقة glassmorphism.
- props:
  - `children`
  - `className`
- ملاحظات:
  - يعتمد على backdrop blur وgradient border.

### FadeIn
- الملف: `src/components/ui/FadeIn.tsx`
- الاستخدام: reveal on scroll.
- props:
  - `children`
  - `delay`
  - `className`
  - `blurLayer`
- ملاحظات:
  - يعتمد على `useInView`.

### Skeleton
- الملف: `src/components/ui/Skeleton.tsx`
- الاستخدام: placeholder loading.
- props:
  - `className`

### ServerError
- الملف: `src/components/ui/ServerError.tsx`
- الاستخدام: عرض أخطاء الخادم.
- props:
  - `error`

## Auth Components

### AuthCard
- الملف: `src/components/shared/AuthCard.tsx`
- الاستخدام: حاوية forms للـ login/register.
- props الأساسية:
  - `title`
  - `subtitle`
  - `children`
  - `submitText`
  - `loadingText`
  - `isLoading`
  - `serverError`
  - `logoGradient`
  - `googleButtonText`
  - `onGoogleClick`
  - `footerText`
  - `footerLinkText`
  - `footerLinkTo`
  - `onSubmit`

### ForgotPasswordModal
- الملف: `src/components/shared/ForgotPasswordModal.tsx`
- الاستخدام: modal لإعادة تعيين كلمة المرور.
- props الأساسية:
  - `isOpen`
  - `onClose`

### FeatureCard
- الملف: `src/components/dashboard/FeatureCard.tsx`
- الاستخدام: بطاقة ميزة قابلة لإعادة الاستخدام بتصميم glassmorphism.
- props الأساسية:
  - `title`
  - `description`
  - `icon`
  - `iconBg`
  - `iconColor`
  - `linkTo`
  - `linkLabel`
  - `index`
- ملاحظات:
  - يستخدم motion للأنيميشن عند الظهور.
  - يدعم تأثيرات hover على البطاقة والأيقونة.

### StudyGroupsCard
- الملف: `src/components/dashboard/StudyGroupsCard.tsx`
- الاستخدام: بطاقة ميزة المجموعات الدراسية.
- ملاحظات: يستخدم `FeatureCard` مع أيقونة `Users`.

### CourseMaterialsCard
- الملف: `src/components/dashboard/CourseMaterialsCard.tsx`
- الاستخدام: بطاقة ميزة مواد المقررات.
- ملاحظات: يستخدم `FeatureCard` مع أيقونة `BookOpen`.

### ScheduleExtractionCard
- الملف: `src/components/dashboard/ScheduleExtractionCard.tsx`
- الاستخدام: بطاقة ميزة استخراج الجدول.
- ملاحظات: يستخدم `FeatureCard` مع أيقونة `CalendarDays`.

### TestsCard
- الملف: `src/components/dashboard/TestsCard.tsx`
- الاستخدام: بطاقة ميزة الاختبارات.
- ملاحظات: يستخدم `FeatureCard` مع أيقونة `TestTube2`.

### GuestButton
- الملف: `src/components/shared/GuestButton.tsx`
- الاستخدام: زر دخول كزائر مشترك بين Landing و Login و Register.
- ملاحظات:
  - يستدعي `enableGuestMode()` من `GuestContext`.
  - ينتقل إلى `/dashboard` بعد التفعيل.

### GuestRoute
- الملف: `src/components/GuestRoute.tsx`
- الاستخدام: حماية مسارات وضع الزائر.
- ملاحظات:
  - يسمح بالوصول بدون جلسة Supabase إذا كان `isGuest` مفعلاً.

### GuestContext
- الملف: `src/contexts/GuestContext.tsx`
- الاستخدام: إدارة حالة وضع الزائر.
- يخزن الحالة في `sessionStorage` تحت المفتاح `svu-guest-mode`.

## Dashboard Components

### DashboardHeader
- الملف: `src/pages/Dashboard/DashboardHeader.tsx`
- الاستخدام: header داخل dashboard.
- props الأساسية:
  - `user`
  - `isNotificationsOpen`
  - `unreadCount`
  - `notificationsLoading`
  - `notificationsError`
  - `notifications`
  - `isProfileMenuOpen`
  - `onToggleNotifications`
  - `onToggleProfile`
  - `onOpenSettings`
  - `onOpenLogout`
  - `onOpenDelete`

### SettingsModal
- الملف: `src/components/dashboard/SettingsModal.tsx`
- الاستخدام: modal للإعدادات.
- props:
  - `user`
  - `tab`
  - `setTab`
  - `onClose`

### ProfileSettingsForm
- الملف: `src/components/dashboard/ProfileSettingsForm.tsx`
- الاستخدام: تعديل الاسم واسم المستخدم والبريد.
- props:
  - `userId`
  - `initial`
  - `onSubmit`

### SecuritySettingsForm
- الملف: `src/components/dashboard/SecuritySettingsForm.tsx`
- الاستخدام: تغيير كلمة المرور.
- props:
  - `onSubmit`

### DeleteAccountModal
- الملف: `src/components/dashboard/DeleteAccountModal.tsx`
- الاستخدام: تأكيد حذف الحساب.
- props:
  - `username`
  - `onClose`
  - `onConfirm`

### LogoutModal
- الملف: `src/components/dashboard/LogoutModal.tsx`
- الاستخدام: تأكيد تسجيل الخروج.
- props:
  - `onClose`
  - `onConfirm`

### ModalOverlay
- الملف: `src/components/dashboard/ModalOverlay.tsx`
- الاستخدام: overlay عام للمودالات.
- props:
  - `children`
  - `onClose`
  - `titleId`
  - `descriptionId`
  - `ariaLabel`

## Landing Components

### HeroAddition
- الملف: `src/components/landing/HeroAddition.tsx`
- الاستخدام: hero card.
- props: لا توجد.

### FeaturesSection
- الملف: `src/components/landing/FeaturesSection.tsx`
- الاستخدام: عرض الميزات.
- props: لا توجد.

### ComingSoonSection
- الملف: `src/components/landing/ComingSoonSection.tsx`
- الاستخدام: قسم coming soon.
- props: لا توجد.

## Special Components

### InteractiveMapSimulation
- الملف: `src/components/InteractiveMap.tsx`
- الاستخدام: محاكاة مخطط المقررات.
- props: لا توجد.
- ملاحظات:
  - ليس متصلاً ببيانات حقيقية.

### GuestRoute
- الملف: `src/components/GuestRoute.tsx`
- الاستخدام: يسمح بالوصول للمسارات العامة (Dashboard + Exam).
- يقبل: المُسجِّل + الزائر (Guest Mode).
- يعيد التوجيه لـ `/login` إذا لم تكن هناك جلسة ولا وضع زائر.

### ProtectedRoute
- الملف: `src/components/ProtectedRoute.tsx`
- الاستخدام: **محجوز لميزة المجموعات (Study Groups) المستقبلية.**
- السلوك: يسمح للمُسجِّلين فقط — يمنع الزوار (Guest Mode).
- الإدراج في `App.tsx`: غير موصول حالياً — جاهز للاستخدام عند بناء ميزة المجموعات.
- props:
  - `children`
