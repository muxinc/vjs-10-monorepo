export { CurrentTimeDisplay } from './components/media-current-time-display';
export { DurationDisplay } from './components/media-duration-display';
export { FullscreenButton } from './components/media-fullscreen-button';
export { MuteButton } from './components/media-mute-button';
export { PlayButton } from './components/media-play-button';
export { Popover } from './components/media-popover';
export { TimeSlider } from './components/media-time-slider';
export { Tooltip } from './components/media-tooltip';
export { VolumeSlider } from './components/media-volume-slider';
export { MediaContainer } from './media/media-container';
export { MediaProvider } from './media/media-provider';
export { MediaSkin } from './media/media-skin';

export function defineVjsPlayer(): void {
  /** @TODO - Reimplement me (at least as a POC) (CJP) */
  // defineVideoProvider();
  // defineVideoDefaultSkin();
  // <video> is native, no need to define
}
