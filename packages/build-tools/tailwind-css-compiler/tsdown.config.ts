import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: 'src/index.ts',
    platform: 'browser',
    format: 'es',
    sourcemap: true,
    clean: true,
    dts: {
      oxc: true,
    },
  },
  {
    entry: 'src/cli.ts',
    platform: 'node',
    format: 'es',
    sourcemap: true,
    dts: {
      oxc: true,
    },
  },
]);