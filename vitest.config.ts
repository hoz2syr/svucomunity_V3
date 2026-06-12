import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/__tests__/**/*.test.{ts,tsx}',
      'packages/*/src/**/*.test.{ts,tsx}'
    ],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text']
    }
  }
});
