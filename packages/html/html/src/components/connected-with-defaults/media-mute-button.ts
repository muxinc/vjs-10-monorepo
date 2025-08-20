import { MuteButton } from '../MuteButton.js';

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-mute-button')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-mute-button', MuteButton);
}

export { MuteButton as MediaMuteButton };
export default MuteButton;