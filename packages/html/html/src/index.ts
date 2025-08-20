export * as MediaProvider from './media-provider.js';
export * as MediaThemeDefault from './skins/media-skin-default.js';

// New hook-style components
export { PlayButton } from './components/media-play-button.js';
export { MuteButton } from './components/media-mute-button.js';

export function defineVjsPlayer() {
  /** @TODO - Reimplement me (at least as a POC) (CJP) */
  // defineVideoProvider();
  // defineVideoDefaultSkin();
  // <video> is native, no need to define
}
