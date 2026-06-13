import js from '@eslint/js'
import globals from 'globals'

export default [
  { files: ['**/*.{js,jsx}'], languageOptions: { parserOptions: { ecmaVersion: 2024, sourceType: 'module', ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } }, plugins: { js: js }, extends: ['js/recommended'] },
  { ignores: ['dist/', 'node_modules/', '*.config.js', 'coverage/'] }
]
