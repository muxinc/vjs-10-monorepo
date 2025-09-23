import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  platform: 'neutral',
  format: 'es',
  sourcemap: true,
  clean: true,
  dts: {
    oxc: true,
  },
});
