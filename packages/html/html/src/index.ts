export { CurrentTimeDisplay } from './components/media-current-time-display.js';
export { DurationDisplay } from './components/media-duration-display.js';
export { FullscreenButton } from './components/media-fullscreen-button.js';
export { MuteButton } from './components/media-mute-button.js';
export { PlayButton } from './components/media-play-button.js';
export { Popover } from './components/media-popover.js';
export { TimeSlider } from './components/media-time-slider.js';
export { Tooltip } from './components/media-tooltip.js';
export { VolumeSlider } from './components/media-volume-slider.js';
export * as MediaProvider from './media-provider.js';
export { MediaSkin } from './media-skin.js';
export * as MediaThemeDefault from './skins/media-skin-default.js';

export function defineVjsPlayer(): void {
  /** @TODO - Reimplement me (at least as a POC) (CJP) */
  // defineVideoProvider();
  // defineVideoDefaultSkin();
  // <video> is native, no need to define
}
