import { ProviderMixin } from '@open-wc/context-protocol';
import { createMediaStore } from '@vjs-10/media-store';

// @ts-ignore - Custom element constructor compatibility
export class MediaProvider extends ProviderMixin(HTMLElement) {
  contexts = {
    mediaStore: () => {
      return createMediaStore();
    },
  };
}

// @ts-ignore - Custom elements type compatibility
customElements.define('media-provider', MediaProvider);
