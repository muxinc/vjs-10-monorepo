import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    store: './src/store/index.ts',
    icons: './src/icons/index.ts',
    'skins/default': './src/skins/default/index.ts',
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
  loaders: {
    '.svg': 'text',
  },
});
