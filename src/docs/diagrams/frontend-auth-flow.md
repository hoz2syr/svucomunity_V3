# Auth Flow Diagram

```mermaid
sequenceDiagram
  participant U as User
  participant P as Page
  participant H as Hook
  participant S as Service
  participant A as AuthContext
  participant G as GuestContext
  participant B as Supabase

  U->>P: submit login/register
  P->>H: useAuthForm
  H->>S: loginWithPassword / registerWithEmail
  S->>B: auth.signInWithPassword / auth.signUp
  B-->>S: session / error
  S-->>H: result
  H-->>P: loading / server error
  P->>A: session update
  A-->>P: redirect
```

## مكونات المصادقة

| المكون | الحالة |
|---|---|
| `AuthContext` | نشط |
| `GuestContext` | نشط |
| `GuestRoute` | **نشط** — يُستخدم في App.tsx |
| `ProtectedRoute` | **محجوز** — لميزة المجموعات |

## ملاحظات

- `AuthContext` هو مركز حالة المصادقة.
- `GuestRoute` يعتمد على `AuthContext` + `GuestContext`.
- `src/services/auth.service.ts` هو الخدمة الرئيسية للمصادقة.
- `src/lib/supabase.ts` يحتوي على دوال legacy بجانب `getSupabaseClient`.
- `loginSchema` يسمح بـ 6 أحرف، بينما `registerSchema` يطلب 8 أحرف.
