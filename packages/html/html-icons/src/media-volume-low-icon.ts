import { SVG_ICONS } from '@vjs-10/icons';

import { MediaChromeIcon } from './media-chrome-icon.js';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-play-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.volumeLow}
  `;
}

export class MediaVolumeLowIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-volume-low-icon', MediaVolumeLowIcon);
