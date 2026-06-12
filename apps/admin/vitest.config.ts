import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8'
    }
  }
});
