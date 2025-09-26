import { cn } from '@/utils/element-utils';
import {
  fullscreenExitPaths,
  fullscreenPaths,
  mutePaths,
  pausePaths,
  playPaths,
  renderToString,
  volumeHighPaths,
  volumeLowPaths,
} from '@vjs-10/icons';

export const playIcon: string = renderToString({ class: cn('play-icon') }, playPaths);
export const pauseIcon: string = renderToString({ class: cn('pause-icon') }, pausePaths);

export const volumeHighIcon: string = renderToString({ class: cn('volume-high-icon') }, volumeHighPaths);
export const volumeLowIcon: string = renderToString({ class: cn('volume-low-icon') }, volumeLowPaths);
export const volumeOffIcon: string = renderToString({ class: cn('volume-off-icon') }, mutePaths);

export const fullscreenEnterIcon: string = renderToString({ class: cn('fullscreen-enter-icon') }, fullscreenPaths);
export const fullscreenExitIcon: string = renderToString({ class: cn('fullscreen-exit-icon') }, fullscreenExitPaths);
