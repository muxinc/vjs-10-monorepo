import type { Constructor, CustomElement } from '@open-wc/context-protocol';

import { ConsumerMixin } from '@open-wc/context-protocol';

export function getTemplateHTML() {
  return /* html */ `
    <slot name="media"></slot>
    <slot></slot>
  `;
}

const CustomElementConsumer: Constructor<CustomElement> = ConsumerMixin(HTMLElement);

export class MediaContainer extends CustomElementConsumer {
  static shadowRootOptions = { mode: 'open' as ShadowRootMode };
  static getTemplateHTML: () => string = getTemplateHTML;

  _mediaStore: any;
  _mediaSlot: HTMLSlotElement;
  contexts = {
    mediaStore: (mediaStore: any): void => {
      this._mediaStore = mediaStore;
      this._handleMediaSlotChange();
      this._registerContainerStateOwner();
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

  connectedCallback(): void {
    super.connectedCallback?.();
    this._registerContainerStateOwner();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this._unregisterContainerStateOwner();
  }

  _registerContainerStateOwner = (): void => {
    if (!this._mediaStore) return;
    this._mediaStore.dispatch({ type: 'containerstateownerchangerequest', detail: this });
  };

  _unregisterContainerStateOwner = (): void => {
    if (!this._mediaStore) return;
    this._mediaStore.dispatch({ type: 'containerstateownerchangerequest', detail: null });
  };

  _handleMediaSlotChange = (): void => {
    const media = this._mediaSlot.assignedElements({ flatten: true })[0];
    this._mediaStore.dispatch({ type: 'mediastateownerchangerequest', detail: media });
  };
}

// @ts-ignore - Custom elements type compatibility
if (!customElements.get('media-container')) {
  customElements.define('media-container', MediaContainer);
}
