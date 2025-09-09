import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    // Keep all dependencies external for library builds
    /^@vjs-10\//,
    /^[^.]/,
  ],
  // Disable tsup's dts generation - we'll use tsc directly
  dts: false,
});