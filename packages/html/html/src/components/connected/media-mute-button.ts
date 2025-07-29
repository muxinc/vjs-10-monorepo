import { ConsumerMixin } from '@open-wc/context-protocol';

// NOTE: This should be fairly generic code that could itself be abstracted into configuration for a more generic factory implementation. (CJP)
export const toConnectedMediaMuteButton = (BaseClass = HTMLElement) => {
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
            this.setAttribute('data-volume-level', mediaVolumeLevel);
            this.toggleAttribute('data-muted', mediaMuted);
          },
        );
      },
    };

    connectedCallback(): void {
      super.connectedCallback?.();
      this.addEventListener('mediamuterequest', this);
      this.addEventListener('mediaunmuterequest', this);
    }

    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      this.removeEventListener('mediamuterequest', this);
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
