import { MediaChromeIcon } from './media-chrome-icon.js';
import { SVG_ICONS } from '@vjs-10/icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    ${SVG_ICONS.pause}
  `;
}

export class MediaPauseIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-pause-icon', MediaPauseIcon);