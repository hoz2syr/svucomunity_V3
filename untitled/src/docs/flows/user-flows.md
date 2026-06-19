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
- ProtectedRoute موجود.

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

## ملخص

- الواجهة تغطي المسارات الأساسية.
- التجربة بعد تسجيل الدخول غير مكتملة.
- لا توجد واجهة فعلية للمجموعات أو المقررات أو الجدول داخل dashboard.
