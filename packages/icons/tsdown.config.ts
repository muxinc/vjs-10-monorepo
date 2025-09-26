import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/element/*'],
  platform: 'browser',
  format: 'es',
  sourcemap: true,
  clean: true,
  dts: {
    oxc: true,
  },
  loader: {
    '.svg': 'text',
  },
});
