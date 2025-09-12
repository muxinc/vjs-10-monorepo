import { MediaChromeIcon } from './media-chrome-icon.js';
import { SVG_ICONS } from '@vjs-10/icons';

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
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-fullscreen-enter-icon', MediaFullscreenEnterIcon);