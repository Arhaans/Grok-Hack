import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built into the Prism app at /store/ (see `pnpm store:build` in the root package.json).
// Images stay at /images/... and are served by the Prism app's public/images.
export default defineConfig({
  plugins: [react()],
  base: '/store/',
  build: { copyPublicDir: false },
  server: {
    port: 5175,
    host: true,
    proxy: { '/api': 'http://localhost:3100' }
  }
});
