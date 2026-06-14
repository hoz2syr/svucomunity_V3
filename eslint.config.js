import js from "@eslint/js";
import tsEslint from "typescript-eslint";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  // تجاهل المجلدات غير المرغوب فيها
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/.turbo/**",
      "eslint.config.js" // تجاهل ملف التكوين نفسه
    ]
  },
  // إعدادات أساسية لـ JS/TS
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,    // لـ process, Buffer, require?
        ...globals.es2021
      }
    },
    rules: {
      // تعطيل القاعدة الأصلية واستخدام قاعدة TypeScript فقط
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // السماح بالتعبيرات القصيرة (short-circuit)
      "@typescript-eslint/no-unused-expressions": ["error", { 
        allowShortCircuit: true,
        allowTernary: true 
      }]
    }
  },
  // تسامح لملفات تعريف الأنواع (.d.ts)
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-unused-vars": "off"
    }
  },
  // تسامح لملفات الاختبارات
  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
];