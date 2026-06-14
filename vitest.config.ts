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
    },
    hooksTimeout: 5000,
  },
});
