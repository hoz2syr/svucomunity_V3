# توثيق الواجهة - SVU Community

هذا المجلد يحتوي على توثيق Frontend للمشروع الحالي داخل:

```txt
untitled/src
```

## الملفات المتوفرة

### Architecture
- `architecture/frontend-diagram.md`
- `architecture/frontend-file-structure.md`
- `architecture/frontend-routes.md`

### Components
- `components/components.md`
- `components/component-api.md`

### Design
- `design/design-system.md`

### Flows
- `flows/user-flows.md`
- `flows/auth-flow.md`
- `flows/dashboard-flow.md`

### Other
- `state-data-flow.md`
- `ui-ux-review.md`
- `stories-and-tests.md`
- `frontend-checklist.md`

### Diagrams
- `diagrams/frontend-component-tree.md`
- `diagrams/frontend-auth-flow.md`
- `diagrams/frontend-dashboard-flow.md`

## ملخص سريع

- `src` هو المجلد الأساسي للواجهة.
- الواجهة مبنية بـ React + TypeScript + Vite.
- هناك فصل واضح بين:
  - `pages`
  - `components`
  - `hooks`
  - `services`
  - `stores`
  - `types`
  - `schemas`
  - `utils`
  - `stories`
- التصميم العام يعتمد على Glassmorphism + Dark Theme + Motion.
- التوثيق هنا يغطي البنية، المكونات، التصميم، التدفقات، والاختبارات.
