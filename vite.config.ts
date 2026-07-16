import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import compression from 'vite-plugin-compression';

// ─────────────────────────────────────────────────────────────────────────────
// Content-Security-Policy
//
// Development: Vite's HMR requires 'unsafe-inline' and 'unsafe-eval' for the
//              script injected into the page. These are safe in a local dev
//              context where the only origin is localhost.
//
// Production: 'unsafe-inline' and 'unsafe-eval' are stripped from script-src.
//             The built output (static JS files loaded via <script src="...">)
//             does not need them. Production CSP is the responsibility of the
//             hosting layer (Netlify _headers, Cloudflare Pages, etc.).
//             Duplicate this hardened policy in your hosting configuration.
//
// ─────────────────────────────────────────────────────────────────────────────

const DEV_CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.google.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.ocr.space https://*.ocr.space ws:",
  "frame-src https://*.supabase.co https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "upgrade-insecure-requests",
].join('; ');

const PROD_CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.google.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.ocr.space https://*.ocr.space ws:",
  "frame-src https://*.supabase.co https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "upgrade-insecure-requests",
].join('; ');

export default defineConfig(() => {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    plugins: [
      react(),
      tailwindcss(),
      compression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
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
        'Content-Security-Policy': isDev ? DEV_CSP_HEADER : PROD_CSP_HEADER,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      reportCompressedSize: true,
      cssCodeSplit: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-router': ['react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-motion': ['motion'],
            'vendor-mermaid': ['mermaid'],
            'vendor-docx': ['docx'],
            'vendor-katex': ['katex'],
          },
        },
      },
    },
  };
});
