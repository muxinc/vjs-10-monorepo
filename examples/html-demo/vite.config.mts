import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    port: 5174,
    strictPort: false, // Allow Vite to try other ports if 5174 is taken
  },
});
