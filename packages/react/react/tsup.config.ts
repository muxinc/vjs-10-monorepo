import { defineConfig } from 'tsup';
import cssPlugin from 'esbuild-css-modules-plugin';

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
  },
  format: ['cjs', 'esm'],
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  external: [
    // Keep all dependencies external for library builds
    /^@vjs-10\//,
    /^[^.]/,
  ],
  // Add esbuild plugin for CSS modules
  esbuildPlugins: [cssPlugin()],
  esbuildOptions(options, context) {
    options.outbase = './src'; // Ensure 'src' is the base for output paths
  },
  // Generate TypeScript declarations with custom config
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },
});
