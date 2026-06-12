import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
    },
  },
  resolve: {
    alias: {
      '@svu-community/utils': path.resolve(__dirname, './src'),
    },
  },
});
