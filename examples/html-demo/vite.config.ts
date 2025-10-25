import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  server: {
    port: 5174,
  },
  optimizeDeps: {
    exclude: ['@videojs/html'],
  },
});
