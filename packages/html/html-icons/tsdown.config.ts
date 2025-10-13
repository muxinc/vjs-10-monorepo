import path from 'node:path';
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  platform: 'browser',
  format: 'es',
  sourcemap: true,
  clean: true,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  dts: {
    oxc: true,
  },
  loaders: {
    '.svg': 'text',
  },
});
