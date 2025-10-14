import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Multi-page app configuration
  build: {
    rollupOptions: {
      input: {
        // React pages
        'react-00-structural': resolve(__dirname, 'src/react/00-structural.html'),
        'react-01-minimal': resolve(__dirname, 'src/react/01-minimal.html'),

        // Web Component pages
        'wc-00-structural': resolve(__dirname, 'src/wc/00-structural.html'),
        'wc-01-minimal': resolve(__dirname, 'src/wc/01-minimal.html'),
      },
    },
  },

  // Dev server configuration
  server: {
    port: 5175,
    open: false,
  },
});
