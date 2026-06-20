# User Flows

## 1. Landing → Register

```txt
Home
  -> ابدأ الآن / اكتشف المنصة
  -> Login / Register
  -> AuthCard
  -> registerWithEmail
  -> success screen
```

### الحالة
- Landing مكتملة بصرياً.
- التسجيل موجود.
- success screen موجود.
- لا توجد تجربة داخلية بعد التسجيل.

## 2. Login → Dashboard

```txt
Home
  -> Login
  -> loginWithPassword
  -> Dashboard
```

### الحالة
- Login موجود.
- Google OAuth موجود.
- Forgot password موجود.
- GuestRoute هو النشط حالياً (يقبل الزائر).

## 3. Register → Login

```txt
Home
  -> Register
  -> registerWithEmail
  -> success screen
  -> Login
```

### الحالة
- موجود.
- لا يوجد redirect تلقائي إلى dashboard بعد التأكيد.

## 4. Dashboard → Settings

```txt
Dashboard
  -> Profile menu
  -> Settings
  -> ProfileSettingsForm أو SecuritySettingsForm
```

### الحالة
- موجود.
- غير مكتمل وظيفياً.

## 5. Dashboard → Logout

```txt
Dashboard
  -> Profile menu
  -> LogoutModal
  -> signOutCurrentUser
```

### الحالة
- موجود.
- يعمل على مستوى الواجهة.

## 6. Dashboard → Delete Account

```txt
Dashboard
  -> Profile menu
  -> DeleteAccountModal
  -> deleteOwnAccount
```

### الحالة
- موجود.
- يعتمد على Edge Function.

## 7. Landing → Coming Soon

```txt
Home
  -> ComingSoonSection
  -> email input
  -> local success state only
```

### الحالة
- موجود بصرياً.
- غير متصل بخدمة backend.

## 8. Landing → Interactive Map

```txt
Home
  -> FeaturesSection
  -> InteractiveMapSimulation
```

### الحالة
- موجود.
- simulation فقط.

## 9. Guest Mode Entry

```txt
Home / Login / Register
  -> GuestButton
  -> enableGuestMode()
  -> sessionStorage.setItem('svu-guest-mode', 'true')
  -> navigate /dashboard
  -> Dashboard renders without auth
```

### الحالة
- `GuestButton` متواجد في FinalCTASection و Login و Register.
- `GuestRoute` يسمح بالدخول إلى `/dashboard` بدون جلسة.
- الإشعارات والبيانات تعمل في وضع placeholder.
- لا يوجد واجهة فعلية للمجموعات أو المقررات أو الجدول داخل dashboard.
- `EmptyDashboardState` يعرض 4 بطاقات ميزات لكن الروابط الداخلية غير منفذة بعد.

## 10. Exam Feature Flow

```txt
Home
  -> copy Arabic AI prompt
  -> navigate /exam/create
  -> paste JSON или upload .json
  -> fill form (title, description, time limit)
  -> saveTest → localStorage
  -> navigate /exam/saved
  -> SavedTests shows grid of TestCards
  -> play / PDF / Word / delete
  -> PlayTest with timer and feedback modes
```

### الحالة
- ميزة كاملة ومستقلة.
- تستخدم localStorage (svu_tests_db).
- تصدير PDF و Word يعمل.
- Tests موجودة لكن Not interconnected مع Dashboard.
- BACKEND_SCHEMA.md موجود للتحويل لـ Supabase.
