import { defineConfig } from 'tsdown';
import buildStyles from './build/build-styles.ts';

export default defineConfig({
  entry: 'src/index.ts',
  platform: 'browser',
  format: 'es',
  sourcemap: true,
  clean: true,
  alias: {
    '@': new URL('./src', import.meta.url).pathname,
  },
  dts: {
    oxc: true,
  },
  hooks: {
    'build:done': async () => {
      await buildStyles();
    },
  },
});
