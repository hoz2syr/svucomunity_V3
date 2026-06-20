import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.google.com https://fonts.googleapis.com https://fonts.gstatic.com ws:",
  "frame-src https://*.supabase.co https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "upgrade-insecure-requests",
].join('; ');

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
      headers: {
        'Content-Security-Policy': CSP_HEADER,
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
