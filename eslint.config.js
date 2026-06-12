const js = require("@eslint/js");
const tsEslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const globals = require("globals");

module.exports = [
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
      globals: globals.browser
    },
    plugins: {
      "@typescript-eslint": tsEslint,
      react
    },
    rules: {
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off"
    }
  },
  {
    files: ["apps/web/src/js/**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: globals.browser
    },
    plugins: {
      "@typescript-eslint": tsEslint
    },
    rules: {
      "no-unused-vars": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off"
    }
  }
];
