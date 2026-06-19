# Auth Flow Diagram

```mermaid
sequenceDiagram
  participant U as User
  participant P as Page
  participant H as Hook
  participant S as Service
  participant A as AuthContext
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

## Notes

- `AuthContext` is the central auth state holder.
- `ProtectedRoute` depends on `AuthContext`.
- `src/services/auth.service.ts` is the main auth service.
- `src/lib/supabase.ts` still has legacy auth helpers.
