import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    globals: true,
    environment: 'happy-dom',
    alias: {
      '@sentry/browser': '/src/js/modules/page-dashboard/sentry-stub.js',
    },
    coverage: {
      provider: 'v8',
    },
  },
});
