# State & Data Flow

## State types

### Local React state
- auth forms
- dashboard menus
- modals
- landing states
- notification menu state

### React Hook Form
- login
- register
- profile settings
- security settings
- delete account

### Zustand
- `notificationStore`
- `uiStore`
- موجودتان لكن غير مستخدمتين في production حالياً

### TanStack Query
- `queryClient` موجود
- لا يستخدم فعلياً في جلب البيانات حالياً

## Data flow

```txt
Page
  -> Hook
  -> Service
  -> Supabase
  -> Result
  -> Page state
```

## Auth data flow

```txt
LoginPage / RegisterPage
  -> useAuthForm
  -> auth.service.ts
  -> Supabase
  -> AuthContext
  -> Redirect
```

## Dashboard data flow

```txt
DashboardPage
  -> useDashboardNotifications
  -> notification.service.ts
  -> Supabase
  -> notifications state
```

## Profile data flow

```txt
SettingsModal
  -> ProfileSettingsForm
  -> profile.service.ts
  -> Supabase
  -> result
```

## Account deletion flow

```txt
DashboardPage
  -> DeleteAccountModal
  -> account.service.ts
  -> Supabase Edge Function
  -> result
```

## ملاحظات

- `features/**/services/index.ts` موجودة لكن لا تزال mostly re-export.
- `src/lib/supabase.ts` يحتوي على legacy helpers.
- `src/services/*` هي الطبقة المفضلة حالياً.
- `stores` غير مستخدمة حالياً.
