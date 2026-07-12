# Dashboard Flow Diagram

```mermaid
graph TD
  A[DashboardPage]
  A --> B[DashboardLayout]
  A --> C[DashboardHeader]
  A --> D[EmptyDashboardState]
  D --> D1[StudyGroupsCard]
  D --> D2[CourseMaterialsCard]
  D --> D3[ScheduleExtractionCard]
  D --> D4[TestsCard]
  A --> E[SettingsModal]
  A --> F[LogoutModal]
  A --> G[DeleteAccountModal]

  C --> H[NotificationMenu]
  C --> I[ProfileMenu]

  E --> J[ProfileSettingsForm]
  E --> K[SecuritySettingsForm]
```

## Notes

- Dashboard shell is present and functional.
- EmptyDashboardState now renders 4 feature cards via separate components.
- Guest mode short-circuits notifications in guest mode.
- `notificationStore` is unused.
