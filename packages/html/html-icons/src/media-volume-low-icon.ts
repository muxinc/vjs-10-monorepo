import { MediaChromeIcon } from './media-chrome-icon.js';

const lowIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`;

export function getTemplateHTML() {
  return /* html */ `
    ${MediaChromeIcon.getTemplateHTML()}
    <style>
      :host {
        display: var(--media-play-icon-display, inline-flex);
      }
    </style>
    ${lowIcon}
  `;
}

export class MediaVolumeLowIcon extends MediaChromeIcon {
  static getTemplateHTML = getTemplateHTML;
}

customElements.define('media-volume-low-icon', MediaVolumeLowIcon);
