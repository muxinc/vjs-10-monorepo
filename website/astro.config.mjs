// @ts-check

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

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
});
