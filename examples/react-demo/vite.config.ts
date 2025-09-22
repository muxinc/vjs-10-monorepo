import type { UserConfig } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default {
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Listen on any interface
    port: 5173,
    watch: {
      ignored: [],
    },
  },
  optimizeDeps: {
    exclude: ['@vjs/react'], // Don’t prebundle, keeps rebuilds fast.
  },
} satisfies UserConfig;
