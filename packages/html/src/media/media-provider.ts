import type { Constructor, CustomElement } from '@open-wc/context-protocol';
import type { MediaStore } from '@videojs/core/store';

import { ProviderMixin } from '@open-wc/context-protocol';
import { createMediaStore } from '@videojs/core/store';

const ProviderHTMLElement: Constructor<CustomElement & HTMLElement> = ProviderMixin(HTMLElement);

export class MediaProviderElement extends ProviderHTMLElement {
  contexts = {
    mediaStore: (): MediaStore => {
      return createMediaStore();
    },
  };
}
