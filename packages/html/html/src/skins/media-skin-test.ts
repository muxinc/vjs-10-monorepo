import { MediaSkin } from '../media-skin';

import '../media-container';
import '../components/media-play-button';
import '../components/media-mute-button';
import '../components/media-fullscreen-button';
import '../components/media-duration-display';
import '../components/media-current-time-display';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <media-container>
      <slot name="media" slot="media"></slot>
      <div>
        <media-current-time-display show-remaining></media-current-time-display>
        <media-duration-display></media-duration-display>
        <media-fullscreen-button>
          <media-play-icon></media-play-icon>
          <media-pause-icon></media-pause-icon>
        </media-fullscreen-button>
        <media-play-button>
          <media-fullscreen-enter-icon></media-fullscreen-enter-icon>
          <media-fullscreen-exit-icon></media-fullscreen-exit-icon>
        </media-play-button>
        <media-mute-button>
          <media-volume-high-icon></media-volume-high-icon>
          <media-volume-low-icon></media-volume-low-icon>
          <media-volume-off-icon></media-volume-off-icon>
        </media-mute-button>
      </div>
    </media-container>
  `;
}

export class MediaSkinTest extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export default MediaSkinTest;

customElements.define('media-skin-test', MediaSkinTest);