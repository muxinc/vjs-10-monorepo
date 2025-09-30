import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    strictPort: false, // Allow fallback to another port if 5174 is taken
  },
  build: {
    outDir: 'dist',
  },
});
