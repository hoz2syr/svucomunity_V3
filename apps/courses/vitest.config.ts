import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/components/ui': path.resolve(__dirname, '../../packages/ui/src/components/ui'),
      '@shared/lib': path.resolve(__dirname, '../../packages/ui/src/lib'),
      '@svu-community/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@/lib/utils': path.resolve(__dirname, './src/lib/utils'),
    },
  },
});
