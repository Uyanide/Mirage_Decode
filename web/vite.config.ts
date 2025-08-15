import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import VitePluginPackageVersion from 'vite-plugin-package-version';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePluginPackageVersion()],
  worker: {
    format: 'es', // or 'module'
  },
});
