import type { Sidebar } from '@/types/docs';

export const sidebar: Sidebar = [
  { sidebarLabel: 'Writing guides', slug: 'how-to/write-guides', devOnly: true },
  { slug: 'concepts/coming-soon' },
  {
    sidebarLabel: 'Components',
    contents: [
      { slug: 'components/play-button', sidebarLabel: 'PlayButton' },
      { slug: 'components/mute-button', sidebarLabel: 'MuteButton' },
      { slug: 'components/fullscreen-button', sidebarLabel: 'FullscreenButton' },
      { slug: 'components/time-slider', sidebarLabel: 'TimeSlider' },
      { slug: 'components/volume-slider', sidebarLabel: 'VolumeSlider' },
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
