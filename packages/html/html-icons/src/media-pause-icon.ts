import { MediaChromeIcon } from './media-chrome-icon.js';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <svg viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  `;
}

export class MediaPauseIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-pause-icon', MediaPauseIcon);