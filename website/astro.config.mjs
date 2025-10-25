// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import rehypePrepareCodeBlocks from './src/utils/rehypePrepareCodeBlocks';
import remarkConditionalHeadings from './src/utils/remarkConditionalHeadings';
import { remarkReadingTime } from './src/utils/remarkReadingTime.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://v10.videojs.org',
  trailingSlash: 'never',
  adapter: vercel(),
  integrations: [
    mdx({ extendMarkdownConfig: true }),
    sitemap(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '18' }]],
      },
    }),
  ],
  prefetch: true,

  markdown: {
    // a lot of these are defaults but I'm setting them just to be explicit
    smartypants: true,
    gfm: true,
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'gruvbox-light-hard',
        dark: 'gruvbox-dark-medium',
      },
      // TODO shiki transformers
    },
    remarkPlugins: [remarkConditionalHeadings, remarkReadingTime],
    rehypePlugins: [rehypePrepareCodeBlocks],
  },

  image: {
    domains: ['image.mux.com'],
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@videojs/react'],
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
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
