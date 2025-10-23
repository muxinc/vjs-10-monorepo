import type { Constructor, CustomElement } from '@open-wc/context-protocol';
import type { MediaStore } from '@videojs/core/store';

import { ProviderMixin } from '@open-wc/context-protocol';
import { createMediaStore } from '@videojs/core/store';

const ProviderHTMLElement: Constructor<CustomElement> = ProviderMixin(HTMLElement);

export class MediaProvider extends ProviderHTMLElement {
  contexts = {
    mediaStore: (): MediaStore => {
      return createMediaStore();
    },
  };
}

// @ts-expect-error - fix types after (Rahim)
customElements.define('media-provider', MediaProvider);
