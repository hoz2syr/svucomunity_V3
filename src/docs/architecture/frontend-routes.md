# مسارات الواجهة

## المسارات الحالية

| المسار | المكون | الحماية |
|---|---|---|
| `/` | `Home` | عام |
| `/login` | `LoginPage` | عام |
| `/register` | `RegisterPage` | عام |
| `/auth/callback` | `AuthCallback` | عام |
| `/dashboard` | `DashboardPage` عبر `GuestRoute` | عام (يدعم الزائر) |
| `/exam` | `ExamHome` عبر `GuestRoute` + `ExamLayout` | عام |
| `/exam/create` | `CreateTest` عبر `GuestRoute` + `ExamLayout` | عام |
| `/exam/saved` | `SavedTests` عبر `GuestRoute` + `ExamLayout` | عام |
| `/exam/play/:id` | `PlayTest` عبر `GuestRoute` + `ExamLayout` | عام |
| `*` | `NotFoundPage` | عام |

## مخطط المسارات

```mermaid
graph TD
  A[/] --> H[Home]
  B[/login] --> I[LoginPage]
  C[/register] --> J[RegisterPage]
  D[/auth/callback] --> K[AuthCallback]
  E[/dashboard] --> L[GuestRoute]
  L --> M[DashboardPage]
  F[/exam] --> N[GuestRoute]
  N --> O[ExamLayout]
  O --> P[ExamHome]
  F1[/exam/create] --> N1[GuestRoute]
  N1 --> O1[ExamLayout]
  O1 --> P1[CreateTest]
  F2[/exam/saved] --> N2[GuestRoute]
  N2 --> O2[ExamLayout]
  O2 --> P2[SavedTests]
  F3[/exam/play/:id] --> N3[GuestRoute]
  N3 --> O3[ExamLayout]
  O3 --> P3[PlayTest]
  G[*] --> Q[NotFoundPage]
```

## سلوك كل مسار

### `/`
- تعرض الصفحة الرئيسية.
- تحتوي على: Navbar، Hero، LandingSections، Footer.

### `/login`
- نموذج تسجيل الدخول.
- Email/password + Google OAuth + Forgot password modal.

### `/register`
- نموذج إنشاء الحساب.
- Email/password + Google OAuth + success state.

### `/auth/callback`
- تستلم redirect من Supabase وتكمل الجلسة.

### `/dashboard`
- محمي بـ `GuestRoute` (يقبل المُسجّل والزائر).
- الزائر يحصل على بيانات تجريبية placeholder.

### `/exam`, `/exam/create`, `/exam/saved`, `/exam/play/:id`
- كلها تستخدم `GuestRoute` + `ExamLayout`.
- ميزة الاختبارات مستقلة تماماً داخل `features/exam/`.

## ملاحظات

- المسارات تعتمد على `react-router-dom`.
- `ProtectedRoute` غير مستخدم حالياً في `App.tsx` — محجوز لميزة **المجموعات (Study Groups)** المستقبلية التي ستكون متاحة للمُسجّلين فقط.
