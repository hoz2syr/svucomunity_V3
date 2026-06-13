import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { files: ['**/*.{ts,tsx}'], plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh }, rules: { 'react-hooks/rules-of-hooks': 'error', 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] } },
  { files: ['**/*.{ts,tsx}'], languageOptions: { parserOptions: { ecmaVersion: 2024, sourceType: 'module', ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } }, plugins: { js: js }, extends: ['js/recommended'] },
  { ignores: ['dist/', 'node_modules/', '*.config.ts'] }
]
