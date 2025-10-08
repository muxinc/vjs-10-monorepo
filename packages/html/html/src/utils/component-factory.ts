import { ConsumerMixin } from '@open-wc/context-protocol';

/**
 * Generic types for HTML component hooks pattern
 * Mirrors the React hooks architecture for consistency
 */
export interface StateHook<T = any> {
  keys: string[];
  transform: (rawState: any, mediaStore: any) => T;
}

export type PropsHook<T = any, P = any> = (state: T, element: HTMLElement) => P;

export interface ConnectedComponentConstructor<State> {
  new (state: State): HTMLElement;
}

/**
 * Generic factory function to create connected HTML components using hooks pattern.
 * Provides equivalent functionality to React's toConnectedComponent but for custom elements.
 *
 * @param BaseClass - Base custom element class to extend
 * @param stateHook - Hook that defines state keys and transformation logic
 * @param propsHook - Hook that handles element attributes and properties based on state
 * @param eventsHook - Hook that defines event handling logic
 * @param displayName - Display name for debugging
 * @returns Connected custom element class with media store integration
 */
export function toConnectedHTMLComponent<State = any>(BaseClass: CustomElementConstructor, stateHook: StateHook<State>, propsHook: PropsHook<State>, displayName?: string): ConnectedComponentConstructor<State> {
  const ConnectedComponent = class extends ConsumerMixin(BaseClass) {
    static get observedAttributes(): string[] {
      return [
        // @ts-ignore
        ...(super.observedAttributes ?? []),
      ];
    }

    _mediaStore: any;

    contexts = {
      mediaStore: (mediaStore: any) => {
        this._mediaStore = mediaStore;

        // Subscribe to media store state changes
        // Split into two phases: state transformation, then props update
        this._mediaStore.subscribeKeys(stateHook.keys, (rawState: any) => {
          // Phase 1: Transform raw media store state (state concern)
          const state = stateHook.transform(rawState, mediaStore);

          // Phase 2: Update element attributes/properties (props concern)
          // @ts-ignore - Element property access
          const props = propsHook(state ?? {}, this);
          // @ts-ignore
          this._update(props, state, mediaStore);
        });
      },
    };

    connectedCallback(): void {
      super.connectedCallback?.();
    }

    disconnectedCallback(): void {
      super.disconnectedCallback?.();
    }

    handleEvent(event: CustomEvent): void {
      // @ts-ignore
      super.handleEvent?.(event);
    }
  };

  // Set display name for debugging and dev tools
  if (displayName) {
    Object.defineProperty(ConnectedComponent, 'name', { value: displayName });
  }

  return ConnectedComponent;
}
