# Dashboard Flow Diagram

```mermaid
graph TD
  A[DashboardPage]
  A --> B[DashboardLayout]
  A --> C[DashboardHeader]
  A --> D[EmptyDashboardState]
  A --> E[SettingsModal]
  A --> F[LogoutModal]
  A --> G[DeleteAccountModal]

  C --> H[NotificationMenu]
  C --> I[ProfileMenu]

  E --> J[ProfileSettingsForm]
  E --> K[SecuritySettingsForm]

  J --> L[profile.service.ts]
  K --> M[profile.service.ts]
  H --> N[notification.service.ts]
  F --> O[account.service.ts]
  G --> O
```

## Notes

- Dashboard is structurally present but functionally sparse.
- Notifications are fetched manually, not via TanStack Query.
- `EmptyDashboardState` is still a placeholder.
- `notificationStore` and `uiStore` are unused.
