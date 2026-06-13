import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/__tests__/**/*.test.{ts,tsx,js}',
      'packages/*/src/**/*.test.{ts,tsx,js}',
      'apps/*/src/**/*.test.{ts,tsx,js}',
      'apps/*/__tests__/**/*.test.{ts,tsx,js}'
    ],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text']
    }
  }
});
