const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\hozai\\projects\\svu community v3.0.0_cleantree';

const files = {
  'apps/web/package.json': JSON.stringify({ name: '@svu-community/web', version: '0.0.0', private: true, scripts: { dev: 'vite', build: 'vite build', lint: 'eslint src' } }, null, 2) + '\n',
  'apps/web/vite.config.js': `import { defineConfig } from 'vite';\n\nexport default defineConfig({\n  root: '.',\n  publicDir: 'public',\n  resolve: {\n    alias: {\n      '@': '/src',\n      '@utils': '/packages/utils/src',\n      '@types': '/packages/types/src'\n    }\n  }\n});\n`,
  'apps/web/.env.example': 'VITE_API_URL=http://localhost:3001\n',
  'apps/web/index.html': '<!DOCTYPE html>\n<html>\n  <head><title>SVU Community Web</title></head>\n  <body><div id="app"></div><script type="module" src="/src/js/modules/app.js"></script></body>\n</html>\n',
  'apps/web/src/js/modules/app.js': "import { initRouter } from './utils/helpers.js';\nimport { initModals } from './ui/modal.js';\ninitRouter();\ninitModals();\n",
  'apps/web/src/js/modules/auth/auth.js': 'export function requireAuth() { return true; }\n',
  'apps/web/src/js/modules/auth/session.js': 'export function getSession() { return localStorage.getItem("svu_session"); }\nexport function setSession(token) { localStorage.setItem("svu_session", token); }\nexport function clearSession() { localStorage.removeItem("svu_session"); }\n',
  'apps/web/src/js/modules/ui/modal.js': 'export function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add("open"); }\nexport function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove("open"); }\nexport function initModals() {\n  document.querySelectorAll("[data-modal]").forEach(btn => {\n    btn.addEventListener("click", () => openModal(btn.dataset.modal));\n  });\n}\n',
  'apps/web/src/js/modules/ui/tooltip.js': 'export function showTooltip(el, text) { el.setAttribute("title", text); }\nexport function hideTooltip(el) { el.removeAttribute("title"); }\n',
  'apps/web/src/js/modules/utils/constants.js': "export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';\nexport const APP_NAME = 'SVU Community';\n",
  'apps/web/src/js/modules/utils/helpers.js': "export function formatDate(date) { return new Date(date).toLocaleDateString('en-US'); }\nexport function debounce(fn, ms = 300) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }\nexport function initRouter() { /* TODO */ }\n",
  'apps/web/src/services/api.js': "const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';\nexport async function api(path, opts = {}) {\n  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...opts.headers }, ...opts });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}\n",
  'apps/web/src/services/gemini.js': "import { api } from './api.js';\nexport async function generateResponse(prompt) {\n  return api('/api/gemini/generate', { method: 'POST', body: JSON.stringify({ prompt }) });\n}\n",
  'apps/web/src/services/email.js': "import { api } from './api.js';\nexport async function sendEmail(to, subject, html) {\n  return api('/api/email/send', { method: 'POST', body: JSON.stringify({ to, subject, html }) });\n}\n",
  'apps/web/src/styles/main.css': ':root { --color-primary: #2563eb; --color-bg: #fff; }\n* { box-sizing: border-box; }\nbody { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); }\n',
  'apps/web/src/styles/components.css': 'button { background: var(--color-primary); color: #fff; border: none; padding: .5rem 1rem; border-radius: 4px; }\n.modal { display: none; }\n.modal.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.5); }\n',
  'apps/web/src/styles/utilities.css': '.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }\n.hidden { display: none; }\n',
  'apps/web/src/types/index.d.ts': "export interface User { id: string; email: string; name?: string; role: 'user' | 'admin'; }\nexport interface Course { id: string; title: string; code: string; }\nexport interface Group { id: string; name: string; courseId: string; }\n",
  'apps/web/src/pages/login.html': '<!DOCTYPE html>\n<html>\n<body>\n  <div id="login-root"></div>\n  <script type="module" src="/src/js/modules/auth/auth.js"></script>\n</body>\n</html>\n',
  'apps/courses/package.json': JSON.stringify({ name: '@svu-community/courses', version: '0.0.0', private: true, scripts: { dev: 'vite', build: 'tsc -b && vite build', lint: 'eslint src --ext ts,tsx' } }, null, 2) + '\n',
  'apps/courses/vite.config.ts': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      '@': path.resolve(__dirname, './src'),\n      '@shared': path.resolve(__dirname, '../../packages/ui/src'),\n      '@utils': path.resolve(__dirname, '../../packages/utils/src'),\n      '@types': path.resolve(__dirname, '../../packages/types/src')\n    }\n  }\n});\n`,
  'apps/courses/tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2020', useDefineForClassFields: true, lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', skipLibCheck: true, moduleResolution: 'bundler', allowImportingTsExtensions: true, isolatedModules: true, moduleDetection: 'force', noEmit: true, jsx: 'react-jsx', strict: true, noUnusedLocals: true, noUnusedParameters: true, baseUrl: '.', paths: { '@/*': ['./src/*'], '@shared/*': ['../../packages/ui/src/*'], '@utils/*': ['../../packages/utils/src/*'], '@types/*': ['../../packages/types/*'] } }, include: ['src'] }, null, 2) + '\n',
  'apps/courses/index.html': '<!DOCTYPE html>\n<html>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
  'apps/courses/src/main.tsx': "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport '@shared/styles/globals.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
  'apps/courses/src/App.tsx': "import { Layout } from './app/layout';\n\nfunction App() {\n  return <Layout />;\n}\n\nexport default App;\n",
  'apps/courses/src/app/layout.tsx': 'export function Layout({ children }: { children: React.ReactNode }) {\n  return <div className="app-layout">{children}</div>;\n}\n',
};

for (const [rel, content] of Object.entries(files)) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('created', rel);
}
