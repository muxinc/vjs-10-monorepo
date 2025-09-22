const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const postcss = require('rollup-plugin-postcss');

module.exports = [
  // ESM build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    watch: {
      clearScreen: false,
    },
    external: [
      'react',
      '@vjs-10/react-icons',
      '@vjs-10/react-media-elements',
      '@vjs-10/react-media-store',
      '@vjs-10/media',
    ],
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      commonjs(),
      postcss({
        modules: true,
        extract: false, // Don't extract CSS to separate file
        inject: true, // Inject CSS into JS bundle
        minimize: false,
        sourceMap: true,
      }),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        outDir: 'dist',
      }),
    ],
  },
  // CommonJS build
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    watch: {
      clearScreen: false,
    },
    external: [
      'react',
      '@vjs-10/react-icons',
      '@vjs-10/react-media-elements',
      '@vjs-10/react-media-store',
      '@vjs-10/media',
    ],
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      commonjs(),
      postcss({
        modules: true,
        extract: false, // Don't extract CSS for CJS build
        inject: true, // Inject CSS into JS bundle
        minimize: false,
        sourceMap: true,
      }),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false,
        outDir: 'dist',
      }),
    ],
  },
];
