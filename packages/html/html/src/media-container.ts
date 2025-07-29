import { ConsumerMixin } from '@open-wc/context-protocol';

export function getTemplateHTML() {
  return /* html */`
    <slot name="media"></slot>
    <slot></slot>
  `;
}

export class MediaContainer extends ConsumerMixin(HTMLElement) {
  static shadowRootOptions = { mode: 'open' as ShadowRootMode };
  static getTemplateHTML = getTemplateHTML;

  #mediaStore: any;
  #mediaSlot: HTMLSlotElement;

  contexts = {
    mediaStore: (mediaStore: any) => {
      this.#mediaStore = mediaStore;
      this.#handleMediaSlotChange();
    },
  };

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof MediaContainer).shadowRootOptions);
      this.shadowRoot!.innerHTML = (this.constructor as typeof MediaContainer).getTemplateHTML();
    }

    this.#mediaSlot = this.shadowRoot!.querySelector('slot[name=media]') as HTMLSlotElement;
    this.#mediaSlot.addEventListener('slotchange', this.#handleMediaSlotChange);
  }

  #handleMediaSlotChange = () => {
    const media = this.#mediaSlot.assignedElements({ flatten: true })[0];
    this.#mediaStore.dispatch({ type: 'mediaelementchangerequest', detail: media });
  };
}

customElements.define('media-container', MediaContainer);
