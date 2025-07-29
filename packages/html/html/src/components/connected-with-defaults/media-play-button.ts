import { toConnectedMediaPlayButton } from "../connected/media-play-button";
import { MediaPlayButton as BaseMediaPlayButton } from "../ui/media-play-button";
const MediaPlayButton = toConnectedMediaPlayButton(BaseMediaPlayButton);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-play-button')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-play-button', MediaPlayButton);
}

export { MediaPlayButton };
export default MediaPlayButton;
