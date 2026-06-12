import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: 'src/**/*.{test,spec}.{js,ts}',
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
    },
  },
});
