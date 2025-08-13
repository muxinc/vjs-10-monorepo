const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    external: (id) => {
      // Don't externalize relative imports (starts with . or /)
      if (id.startsWith('.') || id.startsWith('/')) return false;
      // Don't externalize absolute paths (local files)
      if (id.includes('/') && !id.startsWith('@')) return false;
      // Externalize all npm packages (including scoped ones)
      return true;
    },
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        outDir: 'dist',
      }),
    ],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: (id) => {
      // Don't externalize relative imports (starts with . or /)
      if (id.startsWith('.') || id.startsWith('/')) return false;
      // Don't externalize absolute paths (local files)
      if (id.includes('/') && !id.startsWith('@')) return false;
      // Externalize all npm packages (including scoped ones)
      return true;
    },
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        outDir: 'dist',
      }),
    ],
  },
];