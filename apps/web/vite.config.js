import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

function ensureVendorInPublic() {
  const vendorDir = join(process.cwd(), 'vendor');
  const publicVendorDir = join(process.cwd(), 'public', 'vendor');

  if (!existsSync(vendorDir)) {
    return;
  }

  function recursiveCopy(src, dest) {
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'vendor') {
          continue;
        }
        if (!existsSync(destPath)) {
          mkdirSync(destPath, { recursive: true });
        }
        recursiveCopy(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  if (!existsSync(publicVendorDir)) {
    mkdirSync(publicVendorDir, { recursive: true });
  } else {
    readdirSync(publicVendorDir, { withFileTypes: true }).forEach((entry) => {
      const targetPath = join(publicVendorDir, entry.name);
      if (entry.isDirectory()) {
        readdirSync(targetPath, { recursive: true });
      }
    });
  }

  recursiveCopy(vendorDir, publicVendorDir);
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    {
      name: 'copy-vendor-to-public',
      buildStart() {
        ensureVendorInPublic();
      },
    },
  ],

  base: '/',
  publicDir: 'public',

  define: {
    'window.SVU_ENV': JSON.stringify({
      SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    }),
  },

  root: '.',
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './src/pages/login.html',
        register: './src/pages/register.html',
        dashboard: './src/pages/dashboard.html',
        courses: './src/pages/courses.html',
        admin: './src/pages/admin.html',
        'verify-email': './src/pages/verify-email.html',
        'reset-password': './src/pages/reset-password.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      external: ['@sentry/browser'],
    },
    minify: 'esbuild',
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
  },

  server: {
    port: 3000,
    open: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  },

  preview: {
    port: 4173,
  },
});
