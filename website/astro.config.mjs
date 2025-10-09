// @ts-check

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

import { generateDocsRedirects } from './src/utils/docs/astroRedirects.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://videojs.org',
  integrations: [mdx(), sitemap(), react()],
  redirects: generateDocsRedirects(),
  prefetch: true,

  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument-sans',
      weights: ['600', '500', '400'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',

    }, {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-ibm-plex-mono',
      weights: ['600', '400'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
      optimizedFallbacks: true,
      display: 'swap',
    }],
  },
});
