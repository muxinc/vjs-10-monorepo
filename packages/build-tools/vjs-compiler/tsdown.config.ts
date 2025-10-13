import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src-v1/cli.ts',
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
