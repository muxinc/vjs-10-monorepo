import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    store: './src/store/index.ts',
    icons: './src/icons/index.ts',
    'skins/frosted': './src/skins/frosted/index.ts',
    'skins/minimal': './src/skins/minimal/index.ts',
  },
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
  loader: {
    '.svg': 'text',
    '.css': 'text',
  },
});
