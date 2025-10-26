import { SVG_ICONS } from '@videojs/icons';

import { MediaChromeIcon } from './media-chrome-icon';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-fullscreen-exit-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.fullscreenExitAlt}
  `;
}

export class MediaFullscreenExitAltIcon extends MediaChromeIcon {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-fullscreen-exit-alt-icon', MediaFullscreenExitAltIcon);
