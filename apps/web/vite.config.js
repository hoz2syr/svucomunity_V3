import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
  ],

  define: {
    'window.SVU_ENV': JSON.stringify({
      SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    }),
  },

  root: './apps/web',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './src/pages/login.html',
        register: './src/pages/register.html',
        dashboard: './src/pages/dashboard.html',
        'verify-email': './src/pages/verify-email.html',
        'reset-password': './src/pages/reset-password.html',
      },
      external: ['@sentry/browser'],
    },
    minify: 'esbuild',
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
  },

  server: {
    port: 3000,
    open: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  },

  preview: {
    port: 4173,
  },
});
