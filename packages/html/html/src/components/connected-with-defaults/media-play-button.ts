import { PlayButton } from '../PlayButton.js';

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-play-button')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-play-button', PlayButton);
}

export { PlayButton as MediaPlayButton };
export default PlayButton;