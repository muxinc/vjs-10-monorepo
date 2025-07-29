
import { MediaChromeButton } from './media-chrome-button';

export class MediaMuteButton extends MediaChromeButton {

  static get observedAttributes() {
    return ['mediavolumelevel', 'mediamuted'];
  }

  handleClick() {
    const type = this.mediaMuted ? 'mediaunmuterequest' : 'mediamuterequest';
    this.dispatchEvent(new CustomEvent(type));
  }

  get mediaMuted() {
    return this.hasAttribute('mediamuted');
  }

  set mediaMuted(value: boolean) {
    this.toggleAttribute('mediamuted', !!value);
  }

  get mediaVolumeLevel() {
    return this.getAttribute('mediavolumelevel');
  }

  set mediaVolumeLevel(value: string | null | undefined) {
    if (value == null) {
      this.removeAttribute('mediavolumelevel');
    } else {
      this.setAttribute('mediavolumelevel', value);
    }
  }
}
