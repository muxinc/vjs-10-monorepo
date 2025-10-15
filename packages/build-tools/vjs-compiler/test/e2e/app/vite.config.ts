import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Multi-page app configuration
  // NOTE: Vite automatically discovers all HTML files in src/ during dev.
  // The build.rollupOptions.input is only needed for production builds.
  // Since we're primarily using this for dev/testing, we can rely on
  // automatic discovery. Add specific entries here if needed for prod builds.
  build: {
    rollupOptions: {
      input: {
        // Add specific build targets here if needed
        // All HTML files in src/ are auto-discovered during dev
      },
    },
  },

  // Dev server configuration
  server: {
    port: 5175,
    open: false,
  },
});
