import { SVG_ICONS } from '@videojs/icons';

import { MediaChromeIcon } from './media-chrome-icon';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-fullscreen-enter-icon-display, inline-flex);
      }
    </style>
    ${SVG_ICONS.fullscreenEnter}
  `;
}

export class MediaFullscreenEnterIcon extends MediaChromeIcon {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-fullscreen-enter-icon', MediaFullscreenEnterIcon);
