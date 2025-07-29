export function getTemplateHTML() {
  return /* html */ `
    <style>
      :host {
        display: block;
      }

      media-container {
        display: block;
        width: 100%;
        height: 100%;
      }
    </style>
    <slot></slot>
  `;
}

export class MediaSkin extends HTMLElement {
  static shadowRootOptions = { mode: 'open' as ShadowRootMode };
  static getTemplateHTML = getTemplateHTML;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof MediaSkin).shadowRootOptions);
      this.shadowRoot!.innerHTML = (this.constructor as typeof MediaSkin).getTemplateHTML();
    }
  }
}

if (!customElements.get('media-skin')) {
  customElements.define('media-skin', MediaSkin);
}
