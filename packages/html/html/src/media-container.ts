import { ConsumerMixin } from '@open-wc/context-protocol';

export function getTemplateHTML() {
  return /* html */`
    <slot name="media"></slot>
    <slot></slot>
  `;
}

// @ts-ignore - Custom element constructor compatibility
export class MediaContainer extends ConsumerMixin(HTMLElement) {
  static shadowRootOptions = { mode: 'open' as ShadowRootMode };
  static getTemplateHTML = getTemplateHTML;

  _mediaStore: any;
  _mediaSlot: HTMLSlotElement;

  contexts = {
    mediaStore: (mediaStore: any) => {
      this._mediaStore = mediaStore;
      this._handleMediaSlotChange();
    },
  };

  constructor() {
    super();

    // @ts-ignore - Shadow DOM property access
    if (!this.shadowRoot) {
      // @ts-ignore - Shadow DOM property access
      this.attachShadow((this.constructor as typeof MediaContainer).shadowRootOptions);
      // @ts-ignore - Shadow DOM property access
      this.shadowRoot!.innerHTML = (this.constructor as typeof MediaContainer).getTemplateHTML();
    }

    // @ts-ignore - Shadow DOM property access
    this._mediaSlot = this.shadowRoot!.querySelector('slot[name=media]') as HTMLSlotElement;
    this._mediaSlot.addEventListener('slotchange', this._handleMediaSlotChange);
  }

  _handleMediaSlotChange = () => {
    const media = this._mediaSlot.assignedElements({ flatten: true })[0];
    this._mediaStore.dispatch({ type: 'mediaelementchangerequest', detail: media });
  };
}

// @ts-ignore - Custom elements type compatibility
customElements.define('media-container', MediaContainer);
