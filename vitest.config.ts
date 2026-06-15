import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  test: {
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'packages/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    globals: true,
    environment: 'jsdom',
    alias: {
      '@': '/src',
      '@sentry/browser': '/src/js/modules/page-dashboard/sentry-stub.js',
    },
    hooksTimeout: 5000,
    setupFiles: ['packages/ui/src/test-setup.ts'],
    deps: {
      inline: [/^@sentry/],
    },
  },
});
