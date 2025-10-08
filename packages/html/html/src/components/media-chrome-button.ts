import { namedNodeMapToObject } from '../utils/element-utils.js';

export function getTemplateHTML(
  this: typeof MediaChromeButton,
  _attrs: Record<string, string>,
  _props: Record<string, any> = {},
): string {
  return /* html */ `
    <style>
      /*
        NOTE: Even though primitives should aim to be "unstyled" in their core definitions, we should
        still add pointer-events, as this defines functionality. (CJP)
      */
      :host {
        pointer-events: auto;
      }
    </style>
    <slot>
    </slot>
  `;
}

export class MediaChromeButton extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };

  static getTemplateHTML: typeof getTemplateHTML = getTemplateHTML;

  constructor() {
    super();

    if (!this.shadowRoot) {
      // Set up the Shadow DOM if not using Declarative Shadow DOM.
      this.attachShadow((this.constructor as typeof MediaChromeButton).shadowRootOptions);

      const attrs = namedNodeMapToObject(this.attributes);
      const html = (this.constructor as typeof MediaChromeButton).getTemplateHTML(attrs);
      // From MDN: setHTMLUnsafe should be used instead of ShadowRoot.innerHTML
      // when a string of HTML may contain declarative shadow roots.
      const shadowRoot = this.shadowRoot as unknown as ShadowRoot;
      shadowRoot.setHTMLUnsafe ? shadowRoot.setHTMLUnsafe(html) : (shadowRoot.innerHTML = html);
    }

    this.addEventListener('click', this);
  }

  handleEvent(_event: Event): void {}
}
