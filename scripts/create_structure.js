import fs from 'fs';
import path from 'path';

const root = 'C:\\Users\\hozai\\projects\\svu community v3.0.0_cleantree';

const files = [
  'package.json',
  'turbo.json',
  '.env.example',
  '.gitignore',
  '.editorconfig',
  'CODEOWNERS',
  'README.md',
  'CHANGELOG.md',
  'apps/web/package.json',
  'apps/web/vite.config.js',
  'apps/web/.env.example',
  'apps/web/index.html',
  'apps/web/src/js/modules/app.js',
  'apps/web/src/js/modules/auth/auth.js',
  'apps/web/src/js/modules/auth/session.js',
  'apps/web/src/js/modules/ui/modal.js',
  'apps/web/src/js/modules/ui/tooltip.js',
  'apps/web/src/js/modules/utils/constants.js',
  'apps/web/src/js/modules/utils/helpers.js',
  'apps/web/src/services/api.js',
  'apps/web/src/services/gemini.js',
  'apps/web/src/services/email.js',
  'apps/web/src/styles/main.css',
  'apps/web/src/styles/components.css',
  'apps/web/src/styles/utilities.css',
  'apps/web/src/types/index.d.ts',
  'apps/web/src/pages/login.html',
  'apps/courses/package.json',
  'apps/courses/vite.config.ts',
  'apps/courses/tsconfig.json',
  'apps/courses/index.html',
  'apps/courses/src/main.tsx',
  'apps/courses/src/App.tsx',
  'apps/courses/src/app/layout.tsx',
  'apps/schedule/package.json',
  'apps/schedule/vite.config.ts',
  'apps/schedule/tsconfig.json',
  'apps/schedule/index.html',
  'apps/schedule/src/App.tsx',
  'apps/schedule/src/app/layout.tsx',
  'apps/schedule/src/main.tsx',
  'apps/admin/package.json',
  'apps/admin/vite.config.ts',
  'apps/admin/tsconfig.json',
  'apps/admin/index.html',
  'apps/admin/src/App.tsx',
  'apps/admin/src/shared/layout/AdminLayout.tsx',
  'apps/admin/src/main.tsx',
  'packages/ui/package.json',
  'packages/ui/tsconfig.json',
  'packages/ui/src/components/Button/Button.tsx',
  'packages/ui/src/components/Button/index.ts',
  'packages/ui/src/components/Button/Button.test.tsx',
  'packages/ui/src/components/Card/Card.tsx',
  'packages/ui/src/components/Card/index.ts',
  'packages/ui/src/components/Card/Card.test.tsx',
  'packages/ui/src/components/Input/Input.tsx',
  'packages/ui/src/components/Input/index.ts',
  'packages/ui/src/components/Input/Input.test.tsx',
  'packages/ui/src/styles/globals.css',
  'packages/ui/src/index.ts',
  'packages/config/package.json',
  'packages/config/eslint/index.js',
  'packages/config/tsconfig/base.json',
  'packages/config/tsconfig/react.json',
  'packages/config/tsconfig/node.json',
  'packages/utils/package.json',
  'packages/utils/tsconfig.json',
  'packages/utils/src/date/formatters.ts',
  'packages/utils/src/validation/validators.ts',
  'packages/utils/src/storage/index.ts',
  'packages/utils/src/index.ts',
  'packages/supabase-client/package.json',
  'packages/supabase-client/src/client.ts',
  'packages/supabase-client/src/server.ts',
  'packages/supabase-client/src/middleware.ts',
  'packages/supabase-client/src/index.ts',
  'packages/supabase-client/README.md',
  'packages/types/package.json',
  'packages/types/tsconfig.json',
  'packages/types/src/user.ts',
  'packages/types/src/course.ts',
  'packages/types/src/group.ts',
  'packages/types/src/index.ts',
  'supabase/config.toml',
  'supabase/migrations/001_init.sql',
  'supabase/migrations/002_users.sql',
  'supabase/migrations/003_auth.sql',
  'supabase/migrations/004_courses.sql',
  'supabase/migrations/005_study_groups.sql',
  'supabase/migrations/006_resources.sql',
  'supabase/migrations/007_catalog.sql',
  'supabase/functions/gemini-proxy/index.ts',
  'supabase/functions/gemini-proxy/package.json',
  'supabase/functions/gemini-proxy/README.md',
  'supabase/functions/ocr-proxy/index.ts',
  'supabase/functions/ocr-proxy/package.json',
  'supabase/functions/send-email/index.ts',
  'supabase/functions/send-email/package.json',
  'supabase/seed/users.sql',
  'supabase/seed/courses.sql',
  'supabase/seed/groups.sql',
  'docs/README.md',
  'docs/architecture/overview.md',
  'docs/architecture/monorepo.md',
  'docs/architecture/database.md',
  'docs/api/gemini-proxy.md',
  'docs/api/ocr-proxy.md',
  'docs/api/send-email.md',
  'docs/guides/setup.md',
  'docs/guides/deployment.md',
  'docs/guides/contributing.md',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-web.yml',
  '.github/workflows/deploy-courses.yml',
  '.github/workflows/deploy-schedule.yml',
  'scripts/setup.sh',
  'scripts/migrate.sh',
  'scripts/seed.sh',
  'scripts/deploy-all.sh',
  'scripts/lint-all.sh',
  'design/README.md',
];

const contents = {
  'package.json': JSON.stringify({
    name: 'svu-community',
    version: '0.1.0',
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: { dev: 'turbo run dev', build: 'turbo run build', lint: 'turbo run lint' },
    devDependencies: { turbo: 'latest', typescript: 'latest' },
    packageManager: 'npm@10.2.0'
  }, null, 2),

  'turbo.json': JSON.stringify({
    pipeline: {
      build: { dependsOn: ['^build'], outputs: ['dist/**', '.next/**'] },
      lint: { dependsOn: ['^build'] },
      test: { dependsOn: ['build'], outputs: ['coverage/**'] },
      dev: { cache: false, persistent: true }
    }
  }, null, 2),

  '.env.example': `NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
`,

  '.gitignore': `node_modules
dist
build
coverage
.next
out
.turbo
.env.local
.env.*.local
*.log
`,

  '.editorconfig': `root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
`,

  CODEOWNERS: `* @svu-community/core
`,

  'README.md': `# SVU Community

Monorepo for web, courses, schedule, and admin apps.

## Getting started
\`\`\`bash
npm install
npm run dev
\`\`\`
`,

  'CHANGELOG.md': `# Changelog

All notable changes will be documented here.
`,

  'apps/web/package.json': JSON.stringify({
    name: '@svu-community/web',
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', lint: 'eslint src', preview: 'vite preview' },
    dependencies: {}
  }, null, 2),

  'apps/web/vite.config.js': `import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': '/src',
      '@utils': '/packages/utils/src',
      '@types': '/packages/types/src'
    }
  }
});
`,

  'apps/web/.env.example': `VITE_API_URL=http://localhost:3001
`,

  'apps/web/index.html': `<!DOCTYPE html>
<html>
  <head><title>SVU Community Web</title></head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/js/modules/app.js"></script>
  </body>
</html>
`,

  'apps/web/src/js/modules/app.js': `import { initRouter } from './utils/helpers.js';
import { initModals } from './ui/modal.js';

initRouter();
initModals();
`,

  'apps/web/src/js/modules/auth/auth.js': `export function requireAuth() {
  return true;
}
`,

  'apps/web/src/js/modules/auth/session.js': `export function getSession() {
  return localStorage.getItem('svu_session');
}

export function setSession(token) {
  localStorage.setItem('svu_session', token);
}

export function clearSession() {
  localStorage.removeItem('svu_session');
}
`,

  'apps/web/src/js/modules/ui/modal.js': `export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

export function initModals() {
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
}
`,

  'apps/web/src/js/modules/ui/tooltip.js': `export function showTooltip(el, text) {
  el.setAttribute('title', text);
}

export function hideTooltip(el) {
  el.removeAttribute('title');
}
`,

  'apps/web/src/js/modules/utils/constants.js': `export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const APP_NAME = 'SVU Community';
`,

  'apps/web/src/js/modules/utils/helpers.js': `export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US');
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function initRouter() {
  // TODO
}
`,

  'apps/web/src/services/api.js': `const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function api(path, opts = {}) {
  const res = await fetch(\`\${BASE}\${path}\`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
`,

  'apps/web/src/services/gemini.js': `import { api } from './api.js';

export async function generateResponse(prompt) {
  return api('/api/gemini/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
}
`,

  'apps/web/src/services/email.js': `import { api } from './api.js';

export async function sendEmail(to, subject, html) {
  return api('/api/email/send', {
    method: 'POST',
    body: JSON.stringify({ to, subject, html })
  });
}
`,

  'apps/web/src/styles/main.css': `:root {
  --color-primary: #2563eb;
  --color-bg: #ffffff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
}
`,

  'apps/web/src/styles/components.css': `button {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.modal {
  display: none;
}

.modal.open {
  display: block;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
`,

  'apps/web/src/styles/utilities.css': `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hidden {
  display: none;
}
`,

  'apps/web/src/types/index.d.ts': `export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface Course {
  id: string;
  title: string;
  code: string;
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
}
`,

  'apps/web/src/pages/login.html': `<!DOCTYPE html>
<html>
<body>
  <div id="login-root"></div>
  <script type="module" src="/src/js/modules/auth/auth.js"></script>
</body>
</html>
`,

  'apps/courses/package.json': JSON.stringify({
    name: '@svu-community/courses',
    version: '0.0.0',
    private: true,
    scripts: { dev: 'vite', build: 'tsc -b && vite build', lint: 'eslint src --ext ts,tsx', preview: 'vite preview' }
  }, null, 2),

  'apps/courses/vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/ui/src'),
      '@utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src')
    }
  }
});
`,

  'apps/courses/tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@shared/*': ['../../packages/ui/src/*'],
        '@utils/*': ['../../packages/utils/src'],
        '@types/*': ['../../packages/types/src']
      }
    },
    include: ['src']
  }, null, 2),

  'apps/courses/index.html': `<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'apps/courses/src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@shared/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  'apps/courses/src/App.tsx': `import { Layout } from './app/layout';

function App() {
  return <Layout />;
}

export default App;
`,

  'apps/courses/src/app/layout.tsx': `export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="app-layout">{children}</div>;
}
`,

  'apps/schedule/package.json': JSON.stringify({
    name: '@svu-community/schedule',
    version: '0.0.0',
    private: true,
    scripts: { dev: 'vite', build: 'vite build', lint: 'eslint src --ext ts,tsx' }
  }, null, 2),

  'apps/schedule/vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/ui/src'),
      '@utils': path.resolve(__dirname, '../../packages/utils/src')
    }
  }
});
`,

  'apps/schedule/tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'] }
    },
    include: ['src']
  }, null, 2),

  'apps/schedule/index.html': `<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'apps/schedule/src/App.tsx': `import { Layout } from './app/layout';

function App() {
  return <Layout />;
}

export default App;
`,

  'apps/schedule/src/app/layout.tsx': `export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="app-layout">{children}</div>;
}
`,

  'apps/schedule/src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  'apps/admin/package.json': JSON.stringify({
    name: '@svu-community/admin',
    version: '0.0.0',
    private: true,
    scripts: { dev: 'vite', build: 'vite build', lint: 'eslint src --ext ts,tsx' }
  }, null, 2),

  'apps/admin/vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/ui/src')
    }
  }
});
`,

  'apps/admin/tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'], '@shared/*': ['../../packages/ui/src/*'] }
    },
    include: ['src']
  }, null, 2),

  'apps/admin/index.html': `<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'apps/admin/src/App.tsx': `import { AdminLayout } from './shared/layout/AdminLayout';

function App() {
  return <AdminLayout />;
}

export default App;
`,

  'apps/admin/src/shared/layout/AdminLayout.tsx': `export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar" />
      <main className="content">{children}</main>
    </div>
  );
}
`,

  'apps/admin/src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  'packages/ui/package.json': JSON.stringify({
    name: '@svu-community/ui',
    version: '0.0.0',
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': { import: './src/index.ts', types: './src/index.ts' },
      './styles.css': './src/styles/globals.css'
    },
    files: ['src']
  }, null, 2),

  'packages/ui/tsconfig.json': JSON.stringify({
    compilerOptions: { composite: true, strict: true, skipLibCheck: true, module: 'ESNext', moduleResolution: 'bundler', declaration: true },
    include: ['src']
  }, null, 2),

  'packages/ui/src/components/Button/Button.tsx': `export function Button() {
  return null;
}
`,
  'packages/ui/src/components/Button/index.ts': `export { Button } from './Button';`,
  'packages/ui/src/components/Button/Button.test.tsx': `import { render } from '@testing-library/react';
import { Button } from './Button';

test('Button', () => {
  render(<Button />);
});
`,

  'packages/ui/src/components/Card/Card.tsx': `export function Card() {
  return null;
}
`,
  'packages/ui/src/components/Card/index.ts': `export { Card } from './Card';`,
  'packages/ui/src/components/Card/Card.test.tsx': ``,

  'packages/ui/src/components/Input/Input.tsx': `export function Input() {
  return null;
}
`,
  'packages/ui/src/components/Input/index.ts': `export { Input } from './Input';`,
  'packages/ui/src/components/Input/Input.test.tsx': ``,

  'packages/ui/src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;
`,

  'packages/ui/src/index.ts': `export * from './index';`,

  'packages/config/package.json': JSON.stringify({
    name: '@svu-community/config',
    version: '0.0.0',
    private: true
  }, null, 2),

  'packages/config/eslint/index.js': `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
};
`,

  'packages/config/tsconfig/base.json': JSON.stringify({
    compilerOptions: { composite: true, strict: true, skipLibCheck: true, module: 'ESNext', moduleResolution: 'bundler', declaration: true }
  }, null, 2),

  'packages/config/tsconfig/react.json': JSON.stringify({
    extends: './base.json',
    compilerOptions: { jsx: 'react-jsx' },
    include: ['src']
  }, null, 2),

  'packages/config/tsconfig/node.json': JSON.stringify({
    extends: './base.json',
    compilerOptions: { module: 'ESNext', moduleResolution: 'bundler' }
  }, null, 2),

  'packages/utils/package.json': JSON.stringify({
    name: '@svu-community/utils',
    version: '0.0.0',
    main: './src/index.ts',
    types: './src/index.ts'
  }, null, 2),

  'packages/utils/tsconfig.json': JSON.stringify({
    compilerOptions: { composite: true, strict: true, skipLibCheck: true, module: 'ESNext', moduleResolution: 'bundler', declaration: true },
    include: ['src']
  }, null, 2),

  'packages/utils/src/date/formatters.ts': `export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 250) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
`,

  'packages/utils/src/validation/validators.ts': `export function isEmail(value: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
}

export function required(value: string): boolean {
  return value.trim().length > 0;
}

export function minLength(min: number) {
  return (value: string) => value.trim().length >= min;
}
`,

  'packages/utils/src/storage/index.ts': `const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  }
};

export { storage };
`,

  'packages/utils/src/index.ts': `export * from './date/formatters';
export * from './validation/validators';
export { storage } from './storage';
`,

  'packages/supabase-client/package.json': JSON.stringify({
    name: '@svu-community/supabase-client',
    version: '0.0.0',
    main: './src/index.ts',
    types: './src/index.ts'
  }, null, 2),

  'packages/supabase-client/src/client.ts': `import { createClient } from '@supabase/supabase-js';

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}
`,

  'packages/supabase-client/src/server.ts': `export async function getServerClient() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(url, key);
}
`,

  'packages/supabase-client/src/middleware.ts': `export { createBrowserClient } from './client';
export { getServerClient } from './server';
`,

  'packages/supabase-client/src/index.ts': `export { createBrowserClient } from './client';
export { getServerClient } from './server';
export { createBrowserClient, getServerClient } from './middleware';
`,

  'packages/supabase-client/README.md': `# Supabase Client

Shared Supabase client factory.
`,

  'packages/types/package.json': JSON.stringify({
    name: '@svu-community/types',
    version: '0.0.0',
    main: './src/index.ts',
    types: './src/index.ts'
  }, null, 2),

  'packages/types/tsconfig.json': JSON.stringify({
    compilerOptions: { composite: true, strict: true, skipLibCheck: true, module: 'ESNext', moduleResolution: 'bundler', declaration: true },
    include: ['src']
  }, null, 2),

  'packages/types/src/user.ts': `export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}
`,

  'packages/types/src/course.ts': `export interface Course {
  id: string;
  title: string;
  code: string;
  instructorId: string;
  groupIds?: string[];
}
`,

  'packages/types/src/group.ts': `export interface Group {
  id: string;
  name: string;
  courseId?: string;
  members?: string[];
}
`,

  'packages/types/src/index.ts': `export * from './user';
export * from './course';
export * from './group';
`,

  'supabase/config.toml': `project_id = "svu-community"
`,

  'supabase/migrations/001_init.sql': `create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text unique not null,
  description text,
  created_at timestamptz default now()
);
`,

  'supabase/migrations/002_users.sql': `alter table public.profiles enable row level security;
`,

  'supabase/migrations/003_auth.sql': `create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);
`,

  'supabase/migrations/004_courses.sql': `create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text unique not null,
  description text,
  created_at timestamptz default now()
);
`,

  'supabase/migrations/005_study_groups.sql': `create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references public.courses(id) on delete cascade,
  created_at timestamptz default now()
);
`,

  'supabase/migrations/006_resources.sql': `create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  url text,
  created_at timestamptz default now()
);
`,

  'supabase/migrations/007_catalog.sql': `create table if not exists public.catalog (
  id uuid primary key default gen_random_uuid(),
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
`,

  'supabase/functions/gemini-proxy/index.ts': `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { prompt } = await req.json();
    return new Response(JSON.stringify({ reply: 'Gemini stub' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
`,

  'supabase/functions/gemini-proxy/package.json': JSON.stringify({
    name: 'gemini-proxy',
    version: '1.0.0',
    main: 'index.ts'
  }, null, 2),

  'supabase/functions/gemini-proxy/README.md': `# Gemini Proxy

Proxy for Gemini API calls with auth and rate limiting.
`,

  'supabase/functions/ocr-proxy/index.ts': `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { imageBase64 } = await req.json();
    return new Response(JSON.stringify({ text: 'OCR stub' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
`,

  'supabase/functions/ocr-proxy/package.json': JSON.stringify({
    name: 'ocr-proxy',
    version: '1.0.0',
    main: 'index.ts'
  }, null, 2),

  'supabase/functions/send-email/index.ts': `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { to, subject, html } = await req.json();
    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
`,

  'supabase/functions/send-email/package.json': JSON.stringify({
    name: 'send-email',
    version: '1.0.0',
    main: 'index.ts'
  }, null, 2),

  'supabase/seed/users.sql': `insert into public.profiles (id, email, name, role)
values ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin', 'admin');
`,

  'supabase/seed/courses.sql': `insert into public.courses (id, title, code, description)
values ('00000000-0000-0000-0000-000000000001', 'Course 1', 'CS101', 'Sample course');
`,

  'supabase/seed/groups.sql': `insert into public.study_groups (id, name, course_id)
values ('00000000-0000-0000-0000-000000000001', 'Group 1', '00000000-0000-0000-0000-000000000001');
`,

  'docs/README.md': `# Documentation

See architecture, API, and guides folders.
`,

  'docs/architecture/overview.md': `# Architecture Overview

## Monorepo Layout

Apps: web, courses, schedule, admin.
Shared packages: ui, config, utils, supabase-client, types.
Backend: Supabase migrations + edge functions.
`,

  'docs/architecture/monorepo.md': `# Monorepo

Uses Turborepo with npm workspaces.
`,

  'docs/architecture/database.md': `# Database

Uses Supabase Postgres.

Migrations ordered in supabase/migrations/.
Run supabase/seed/*.sql for local data.
`,

  'docs/api/gemini-proxy.md': `# Gemini Proxy

Proxy for Gemini API calls with auth and rate limiting.
`,

  'docs/api/ocr-proxy.md': `# OCR Proxy

Proxy to external OCR provider.
`,

  'docs/api/send-email.md': `# Send Email

Transactional email edge function.
`,

  'docs/guides/setup.md': `# Setup

1. npm install
2. cp .env.example .env.local
3. npm run dev
`,

  'docs/guides/deployment.md': `# Deployment

- web: Cloudflare Pages
- courses/schedule/admin: Vercel
- supabase edge functions: Supabase
`,

  'docs/guides/contributing.md': `# Contributing

- Use feature branches
- Run lint before PR
- Update docs
`,

  '.github/workflows/ci.yml': `name: ci

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
`,

  '.github/workflows/deploy-web.yml': `name: deploy-web

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/**'
      - 'turbo.json'
      - 'package.json'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build --filter=@svu-community/web
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: svu-community-web
          directory: apps/web/dist
          gitHubToken: \${{ secrets.GITHUB_TOKEN }}
`,

  '.github/workflows/deploy-courses.yml': `name: deploy-courses

on:
  push:
    branches: [main]
    paths:
      - 'apps/courses/**'
      - 'packages/**'
      - 'turbo.json'
      - 'package.json'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build --filter=@svu-community/courses
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel pull --yes --environment=production --token=\$VERCEL_TOKEN
          vercel build --prod --token=\$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=\$VERCEL_TOKEN
        working-directory: apps/courses
`,

  '.github/workflows/deploy-schedule.yml': `name: deploy-schedule

on:
  push:
    branches: [main]
    paths:
      - 'apps/schedule/**'
      - 'packages/**'
      - 'turbo.json'
      - 'package.json'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build --filter=@svu-community/schedule
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
        run: |
          vercel pull --yes --environment=production --token=\$VERCEL_TOKEN
          vercel build --prod --token=\$VERCEL_TOKEN
          vercel deploy --prebuilt --prod --token=\$VERCEL_TOKEN
        working-directory: apps/schedule
`,

  'scripts/setup.sh': `#!/usr/bin/env bash
set -euo pipefail

echo 'Setting up SVU Community...'
npm install
npx turbo run build
echo 'Setup complete.'
`,

  'scripts/migrate.sh': `#!/usr/bin/env bash
set -euo pipefail

echo 'Running migrations...'
supabase db push
echo 'Migrations applied.'
`,

  'scripts/seed.sh': `#!/usr/bin/env bash
set -euo pipefail

echo 'Seeding database...'
psql "$DATABASE_URL" -f supabase/seed/users.sql
psql "$DATABASE_URL" -f supabase/seed/courses.sql
psql "$DATABASE_URL" -f supabase/seed/groups.sql
echo 'Seed data loaded.'
`,

  'scripts/deploy-all.sh': `#!/usr/bin/env bash
set -euo pipefail

echo 'Deploying all apps...'
./scripts/migrate.sh
npx turbo run build
echo 'Deployment complete.'
`,

  'scripts/lint-all.sh': `#!/usr/bin/env bash
set -euo pipefail

echo 'Linting all packages...'
npx turbo run lint
echo 'Lint complete.'
`,

  'design/README.md': `# Design

Figma mockups and exported assets live here.
`,
};

let created = 0;
let skipped = 0;
for (const rel of files) {
  const full = path.join(root, rel);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(full)) {
    skipped++;
    continue;
  }
  fs.writeFileSync(full, contents[rel], 'utf8');
  created++;
}
console.log(`created: ${created}, skipped: ${skipped}`);
