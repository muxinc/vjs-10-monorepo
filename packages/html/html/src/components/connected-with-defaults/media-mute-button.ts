import { toConnectedMediaMuteButton } from "../connected/media-mute-button";
import { MediaMuteButton as BaseMediaMuteButton } from "../ui/media-mute-button";
const MediaMuteButton = toConnectedMediaMuteButton(BaseMediaMuteButton);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-mute-button')) {
  globalThis.customElements.define('media-mute-button', MediaMuteButton);
}

export { MediaMuteButton };
export default MediaMuteButton;
