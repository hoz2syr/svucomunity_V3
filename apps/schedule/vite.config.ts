import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()] as any,
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    cors: true,
  },
});
