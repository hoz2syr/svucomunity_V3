# packages/config — Re-establishment Report

## 📋 ملخص
أعيد بناء حزمة `@svu-community/config` لتصبح حزمة إعدادات مشتركة في المونوربو، بدلاً من كونها هيكلاً فارغاً (stub) بدون نقطة دخول فعلية.

## 🏗️ القرار المعماري

`packages/config` أصبحت حزمة **"إعدادات أدوات مشتركة/مكتفية ذاتياً" (Self-Contained Shared Tool Configs)**:

| ما داخل الحزمة | الوصف |
|---|---|
| `packages/config/eslint/` | قواعد ESLint الأساسية للمشروع |
| `packages/config/tailwind/` | إعدادات Tailwind (ألوان، مسارات الملفات) |
| `packages/config/vite/` | إعدادات Vite Test (jsdom) |
| `packages/config/tsconfig/` | قوالب tsconfig: `base.json`, `node.json`, `react.json` |

| ما **بدون** الحزمة | الوصف |
|---|---|
| `apps/web/src/js/modules/config.js` | إعدادات التطبيق (Supabase URLs، الأمن، الثيم) — تبقى معزولة في `apps/web` |

## ✅ الملفات التي تم تعديلها أو إنشاؤها

### 1. `packages/config/index.js` (جديد)
```js
export { default as eslint } from './eslint/index.js';
export { default as tailwind } from './tailwind/index.js';
export { default as vite } from './vite/index.js';
```
يعمل كنقطة دخول وحيدة (~barrel file~) للحزمة.

### 2. `packages/config/package.json` (معدّل)
```json
{
  "name": "@svu-community/config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "module": "index.js",
  "exports": {
    ".": { "import": "./index.js", "default": "./index.js" },
    "./eslint": { "import": "./eslint/index.js", "default": "./eslint/index.js" },
    "./tailwind": { "import": "./tailwind/index.js", "default": "./tailwind/index.js" },
    "./vite": { "import": "./vite/index.js", "default": "./vite/index.js" }
  }
}
```
التعديلات:
- أضيف `"type": "module"` لمنع تضارب ESM/CommonJS
- أضيف `"module"` لأدوات البناء القديمة
- أضيف `exports` لكل ملف فرعي لتمكين الاستيراد المباشر:
  ```js
  import { tailwind } from '@svu-community/config';
  // أو
  import tailwindConfig from '@svu-community/config/tailwind';
  ```

### 3. `packages/config/eslint/index.js` (تحويل ESM)
```js
export default [
  "eslint:recommended",
  { rules: { "no-unused-vars": "error", "prefer-const": "error", "no-var": "error" } }
];
```

### 4. `packages/config/vite/index.js` (تحويل ESM)
```js
export default {
  test: { environment: 'jsdom' }
};
```

### 5. `packages/config/tsconfig/base.json` (جديد — مُكتَب)
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmit": true
  }
}
```

### 6. `packages/config/tsconfig/node.json` (جديد — مُكتَب)
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

### 7. `packages/config/tsconfig/react.json` (جديد — مُكتَب)
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

## 📁 بنية الحزمة النهائية

```
packages/config/
├── index.js
├── package.json
├── eslint/
│   └── index.js
├── tailwind/
│   └── index.js
├── vite/
│   └── index.js
└── tsconfig/
    ├── base.json
    ├── node.json
    └── react.json
```

## 🔗 طريقة الاستخدام (مثال)

```js
// في تطبيق أو حزمة أخرى:
import { tailwind, eslint, vite } from '@svu-community/config';

// Tailwind
/** @type {import('tailwindcss').Config} */
const twConfig = {
  ...tailwind,
  content: ['./apps/web/**/*.{js,jsx,ts,tsx}'],
};

// Vite Test
export default defineConfig({
  test: vite.test,
});
```

## ⚠️ ملاحظات

| البند | التفاصيل |
|---|---|
| **ليس تطبيقياً بعد** | لا يوجد حتى الآن أيّ import فعلي لـ `@svu-community/config` في `apps/` أو `packages/` — هذه هي "مرحلة إعادة Establishment". |
| **إعدادات التطبيق** | `apps/web/src/js/modules/config.js` يبقى منفصلاً (Supabase URLs، الأمن، الثيم) — "تطبيق محلي" لا مكان له في الحزمة المشتركة. |
| **الخطوة التالية** | استبدال إعدادات الأدوات المُكررة في كل تطبيق/حزمة باستيراد من `@svu-community/config`. |

---
تاريخ التقرير: 2026-06-13
المسؤول: Kilo (AI Assistant)
