# Stories & Tests

## Storybook

### الملف
- `.storybook/main.ts`
- `.storybook/preview.tsx`

### stories الموجودة

```txt
src/stories/
├── Header.stories.ts
└── ui/
    ├── InputField.stories.tsx
    ├── AuthButton.stories.tsx
    ├── GlassCard.stories.tsx
    ├── Skeleton.stories.tsx
    └── ServerError.stories.tsx
```

### ملاحظات
- `src/stories` مخصص للـ Storybook فقط.
- لا يجب أن يستورده أي كود إنتاجي.
- Storybook موجود لكنه غير غني بعد.

## Vitest

### الملفات الموجودة

```txt
tests/
├── auth.test.tsx
├── Dashboard.test.tsx
├── InputField.test.tsx
├── supabase.test.ts
├── dashboard/
│   ├── SettingsModal.test.tsx
│   ├── DeleteAccountModal.test.tsx
│   └── LogoutModal.test.tsx
└── services/
    ├── auth.service.test.ts
    ├── profile.service.test.ts
    ├── account.service.test.ts
    └── notification.service.test.ts
```

### إعدادات الاختبار
- `vitest.config.ts`
- environment: `jsdom`
- setup: `tests/setup.ts`

## ملاحظات

- تغطية auth و dashboard shell جيدة نسبياً.
- لا توجد تغطية كافية لـ landing sections.
- لا توجد تغطية كافية لـ ProtectedRoute.
- لا توجد تغطية كافية لـ ErrorBoundary.
- لا توجد تغطية كافية لـ hooks.
- `src/lib/rateLimit.ts.spec.ts` لا يتم تضمينه في `vitest.config.ts` الحالي.
