
import { MediaChromeButton } from './media-chrome-button';

export class MediaPlayButton extends MediaChromeButton {

  static get observedAttributes() {
    return ['mediapaused'];
  }

  handleClick() {
    const type = this.mediaPaused ? 'mediaplayrequest' : 'mediapauserequest';
    this.dispatchEvent(new CustomEvent(type));
  }

  get mediaPaused() {
    return this.hasAttribute('mediapaused');
  }

  set mediaPaused(value: boolean) {
    this.toggleAttribute('mediapaused', !!value);
  }
}
