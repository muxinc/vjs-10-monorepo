import { MediaChromeIcon } from './media-chrome-icon.js';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-play-icon-display, inline-flex);
      }
    </style>
    <svg viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  `;
}

export class MediaPlayIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-play-icon', MediaPlayIcon);