export { CurrentTimeDisplay } from './components/media-current-time-display.js';
export { DurationDisplay } from './components/media-duration-display.js';

export { FullscreenButton } from './components/media-fullscreen-button.js';
export { MuteButton } from './components/media-mute-button.js';
// New hook-style components
export { PlayButton } from './components/media-play-button.js';
export { VolumeRange } from './components/media-volume-range.js';
export * as MediaProvider from './media-provider.js';
export * as MediaThemeDefault from './skins/media-skin-default.js';

export function defineVjsPlayer(): void {
  /** @TODO - Reimplement me (at least as a POC) (CJP) */
  // defineVideoProvider();
  // defineVideoDefaultSkin();
  // <video> is native, no need to define
}
