# مسارات الواجهة

## المسارات الحالية

| المسار | المكون | الحماية |
|---|---|---|
| `/` | `Home` | عام |
| `/login` | `LoginPage` | عام |
| `/register` | `RegisterPage` | عام |
| `/auth/callback` | `AuthCallback` | عام |
| `/dashboard` | `DashboardPage` عبر `ProtectedRoute` | محمي |
| `*` | `NotFoundPage` | عام |

## مخطط المسارات

```mermaid
graph TD
  A[/] --> H[Home]
  B[/login] --> I[LoginPage]
  C[/register] --> J[RegisterPage]
  D[/auth/callback] --> K[AuthCallback]
  E[/dashboard] --> L[ProtectedRoute]
  L --> M[DashboardPage]
  F[*] --> N[NotFoundPage]
```

## السلوك

### `/`
- تعرض الصفحة الرئيسية.
- تحتوي على:
  - Navbar
  - Hero
  - LandingSections
  - Footer

### `/login`
- تعرض نموذج تسجيل الدخول.
- تدعم:
  - Email/password
  - Google OAuth
  - Forgot password modal

### `/register`
- تعرض نموذج إنشاء الحساب.
- تدعم:
  - Email/password
  - Google OAuth
  - success state بعد التسجيل

### `/auth/callback`
- تستلم redirect من Supabase.
- تكمل الجلسة.
- توجه إلى `/dashboard` أو `/login` حسب الحالة.

### `/dashboard`
- محمية بواسطة `ProtectedRoute`.
- تتطلب جلسة فعالة.
- إذا لم تكن الجلسة موجودة، تعيد التوجيه إلى `/login`.

## ملاحظات

- `ProtectedRoute` موجود في `src/components/ProtectedRoute.tsx`.
- المسارات تعتمد على `react-router-dom`.
- لا توجد حماية إضافية داخل الصفحة نفسها.
