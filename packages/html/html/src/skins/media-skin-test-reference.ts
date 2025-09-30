import { MediaSkin } from '../media-skin';

import '../media-container';
import '../components/media-play-button';
import '../components/media-mute-button';
import '../components/media-volume-range';
import '../components/media-time-range';
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
        <div></div>
        <div>
          <media-play-button>
            <media-play-icon></media-play-icon>
            <media-pause-icon></media-pause-icon>
          </media-play-button>
          <media-current-time-display show-remaining></media-current-time-display>
          <media-duration-display></media-duration-display>
          <media-mute-button>
            <media-volume-high-icon></media-volume-high-icon>
            <media-volume-low-icon></media-volume-low-icon>
            <media-volume-off-icon></media-volume-off-icon>
          </media-mute-button>
          <media-fullscreen-button>
            <media-fullscreen-enter-icon></media-fullscreen-enter-icon>
            <media-fullscreen-exit-icon></media-fullscreen-exit-icon>
          </media-fullscreen-button>
        </div>
      </div>
    </media-container>
  `;
}

export class MediaSkinTestReference extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export default MediaSkinTestReference;

customElements.define('media-skin-test-reference', MediaSkinTestReference);
