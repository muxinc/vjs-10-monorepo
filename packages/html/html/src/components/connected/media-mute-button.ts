// @ts-ignore - Module resolution issues with @open-wc/context-protocol
import { ConsumerMixin } from '@open-wc/context-protocol';

// NOTE: This should be fairly generic code that could itself be abstracted into configuration for a more generic factory implementation. (CJP)
export const toConnectedMediaMuteButton = (BaseClass = HTMLElement) => {
  // @ts-ignore - Custom element constructor compatibility
  return class MediaMuteButton extends ConsumerMixin(BaseClass) {
    static get observedAttributes(): string[] {
      return [
        // @ts-ignore
        ...(super.observedAttributes ?? []),
        'mediapaused',
      ];
    }

    #mediaStore: any;

    contexts = {
      mediaStore: (mediaStore: any) => {
        this.#mediaStore = mediaStore;

        this.#mediaStore.subscribeKeys(
          ['mediaVolumeLevel', 'mediaMuted'],
          ({ mediaVolumeLevel, mediaMuted }: any) => {
            /** @ts-ignore */
            this.mediaVolumeLevel = mediaVolumeLevel;
            /** @ts-ignore */
            this.mediaMuted = mediaMuted;
            // @ts-ignore - Element property access
            this.setAttribute('data-volume-level', mediaVolumeLevel);
            // @ts-ignore - Element property access
            this.toggleAttribute('data-muted', mediaMuted);
          },
        );
      },
    };

    connectedCallback(): void {
      super.connectedCallback?.();
      // @ts-ignore - Element property access
      this.addEventListener('mediamuterequest', this);
      // @ts-ignore - Element property access
      this.addEventListener('mediaunmuterequest', this);
    }

    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      // @ts-ignore - Element property access
      this.removeEventListener('mediamuterequest', this);
      // @ts-ignore - Element property access
      this.removeEventListener('mediaunmuterequest', this);
    }

    handleEvent(event: CustomEvent) {
      /** @ts-ignore */
      super.handleEvent?.(event);
      if (
        this.#mediaStore &&
        ['mediamuterequest', 'mediaunmuterequest'].includes(event.type)
      ) {
        const { type, detail } = event;
        this.#mediaStore.dispatch({ type, detail });
      }
    }
  };
};
