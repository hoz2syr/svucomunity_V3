export default [
  "eslint:recommended",
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error"
    }
  }
];
