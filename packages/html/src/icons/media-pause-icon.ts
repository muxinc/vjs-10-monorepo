import { SVG_ICONS } from '@videojs/icons';

import { MediaChromeIcon } from './media-chrome-icon';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    ${SVG_ICONS.pause}
  `;
}

export class MediaPauseIcon extends MediaChromeIcon {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-pause-icon', MediaPauseIcon);
