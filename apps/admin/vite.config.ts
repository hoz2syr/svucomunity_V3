import { defineConfig } from 'vite/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: './apps/admin',
  plugins: [tsconfigPaths(), react(), tailwindcss()]
});
