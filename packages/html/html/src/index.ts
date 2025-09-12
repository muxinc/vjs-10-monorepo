export * as MediaProvider from './media-provider.js';
export * as MediaThemeDefault from './skins/media-skin-default.js';

// New hook-style components
export { PlayButton } from './components/media-play-button.js';
export { MuteButton } from './components/media-mute-button.js';
export { VolumeRange } from './components/media-volume-range.js';
export { FullscreenButton } from './components/media-fullscreen-button.js';
export { DurationDisplay } from './components/media-duration-display.js';

export function defineVjsPlayer() {
  /** @TODO - Reimplement me (at least as a POC) (CJP) */
  // defineVideoProvider();
  // defineVideoDefaultSkin();
  // <video> is native, no need to define
}
