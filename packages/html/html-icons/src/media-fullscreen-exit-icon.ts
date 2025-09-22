import { SVG_ICONS } from '@vjs-10/icons';

import { MediaChromeIcon } from './media-chrome-icon.js';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-fullscreen-exit-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.fullscreenExit}
  `;
}

export class MediaFullscreenExitIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-fullscreen-exit-icon', MediaFullscreenExitIcon);
