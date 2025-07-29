import { ConsumerMixin } from '@open-wc/context-protocol';

// NOTE: This should be fairly generic code that could itself be abstracted into configuration for a more generic factory implementation. (CJP)
export const toConnectedMediaPlayButton = (BaseClass = HTMLElement) => {
  return class MediaPlayButton extends ConsumerMixin(BaseClass) {
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
          ['mediaPaused'],
          ({ mediaPaused }: any) => {
            // NOTE: We may want to assume setting properties instead of attributes here to leave things generic for
            // complex values. That allows implementors to decide what to do if/when the property is set.
            // Using `this.toggleAttribute('mediapaused', mediaPaused);` should also work if that's preferred.
            /** @ts-ignore */
            this.mediaPaused = mediaPaused;
            this.toggleAttribute('data-paused', mediaPaused);
          },
        );
      },
    };

    connectedCallback(): void {
      super.connectedCallback?.();
      this.addEventListener('mediaplayrequest', this);
      this.addEventListener('mediapauserequest', this);
    }

    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      this.removeEventListener('mediaplayrequest', this);
      this.removeEventListener('mediapauserequest', this);
    }

    handleEvent(event: CustomEvent) {
      /** @ts-ignore */
      super.handleEvent?.(event);
      if (
        this.#mediaStore &&
        ['mediaplayrequest', 'mediapauserequest'].includes(event.type)
      ) {
        const { type, detail } = event;
        this.#mediaStore.dispatch({ type, detail });
      }
    }
  };
};
