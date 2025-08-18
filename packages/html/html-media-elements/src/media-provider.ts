import { ProviderMixin } from '@open-wc/context-protocol';
import { createMediaStore } from '@vjs-10/media-store';

export class MediaProvider extends ProviderMixin(HTMLElement) {
  contexts = {
    mediaStore: () => {
      return createMediaStore();
    },
  };
}

customElements.define('media-provider', MediaProvider);
