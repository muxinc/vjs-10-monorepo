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

  // Resolve workspace packages
  resolve: {
    alias: {
      '@vjs-10/react': resolve(__dirname, '../../../../../../packages/react/react/src'),
      '@vjs-10/react-icons': resolve(__dirname, '../../../../../../packages/react/react-icons/src'),
      '@vjs-10/html': resolve(__dirname, '../../../../../../packages/html/html/src'),
      '@vjs-10/html-icons': resolve(__dirname, '../../../../../../packages/html/html-icons/src'),
      // React package internal alias (used by toasted skin)
      '@': resolve(__dirname, '../../../../../../packages/react/react/src'),
    },
  },
});
