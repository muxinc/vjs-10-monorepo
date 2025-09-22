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
  // Generate TypeScript declarations with custom config
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },
});
