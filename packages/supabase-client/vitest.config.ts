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
      '@svu-community/supabase-client': path.resolve(__dirname, './src'),
      '@supabase/supabase-js': path.resolve(__dirname, '../../../node_modules/@supabase/supabase-js'),
    },
  },
});
