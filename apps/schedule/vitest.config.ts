import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src/'),
      '@services/supabase': path.resolve(__dirname, './src/services/supabase'),
      '@lib/utils': path.resolve(__dirname, './src/lib/utils'),
    },
  },
});
