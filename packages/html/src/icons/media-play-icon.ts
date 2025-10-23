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
    ${SVG_ICONS.play}
  `;
}

export class MediaPlayIcon extends MediaChromeIcon {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-play-icon', MediaPlayIcon);
