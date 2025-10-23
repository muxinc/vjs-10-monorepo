import { SVG_ICONS } from '@vjs-10/icons';

import { MediaChromeIcon } from './media-chrome-icon';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-play-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.volumeOff}
  `;
}

export class MediaVolumeOffIcon extends MediaChromeIcon {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-volume-off-icon', MediaVolumeOffIcon);
