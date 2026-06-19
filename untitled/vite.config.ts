import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
