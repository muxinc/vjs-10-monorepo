import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts', // V2 CLI (V1 CLI in src-v1/cli.ts preserved for reference)
  },
  platform: 'node',
  format: 'esm',
  sourcemap: true,
  clean: true,
  dts: {
    oxc: true,
  },
  treeshake: true,
  // Bundle all dependencies (including Babel)
  bundleDeps: true,
});
