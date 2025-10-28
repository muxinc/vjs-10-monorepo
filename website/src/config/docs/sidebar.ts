import type { Sidebar } from '@/types/docs';

export const sidebar: Sidebar = [
  { sidebarLabel: 'Writing guides', slug: 'how-to/write-guides', devOnly: true },
  { sidebarLabel: 'Getting started', contents: [{ slug: 'concepts/under-construction' }] },
  {
    sidebarLabel: 'Components',
    contents: [
      { slug: 'resources/play-button' },
      { slug: 'resources/mute-button' },
      { slug: 'resources/fullscreen-button' },
      { slug: 'resources/time-slider' },
      { slug: 'resources/volume-slider' },
    ],
  },
  // {
  //   sidebarLabel: 'Getting started',
  //   contents: [
  //     { slug: 'concepts/everyone' },
  //   ],
  // },
  // {
  //   sidebarLabel: 'Concepts',
  //   contents: [
  //     { slug: 'concepts/react-only', frameworks: ['react'] },
  //     { slug: 'concepts/tailwind-only', styles: ['tailwind'] },
  //   ],
  // },
  // {
  //   sidebarLabel: 'How-To Guides',
  //   contents: [
  //     { slug: 'how-to/everyone' },
  //   ],
  // },
];
