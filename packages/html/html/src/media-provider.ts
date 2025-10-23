import type { Constructor, CustomElement } from '@open-wc/context-protocol';
import type { MediaStore } from '@vjs-10/core/store';

import { ProviderMixin } from '@open-wc/context-protocol';
import { createMediaStore } from '@vjs-10/core/store';

export const CustomElementProvider: Constructor<CustomElement> = ProviderMixin(HTMLElement);

export class MediaProvider extends CustomElementProvider {
  contexts = {
    mediaStore: (): MediaStore => {
      return createMediaStore();
    },
  };
}

// @ts-ignore - Custom elements type compatibility
customElements.define('media-provider', MediaProvider);
