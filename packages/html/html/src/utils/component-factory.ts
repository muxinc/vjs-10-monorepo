import { ConsumerMixin } from '@open-wc/context-protocol';

/**
 * Generic types for HTML component hooks pattern
 * Mirrors the React hooks architecture for consistency
 */
export type StateHook<T = any> = {
  keys: string[];
  transform: (rawState: any) => T;
};

export type PropsHook<T = any> = (state: T, element: HTMLElement) => void;

export type EventsHook = {
  events: string[];
  handler: (event: CustomEvent, mediaStore: any) => void;
};

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
export const toConnectedHTMLComponent = <TState = any>(
  BaseClass: CustomElementConstructor,
  stateHook: StateHook<TState>,
  propsHook: PropsHook<TState>,
  eventsHook: EventsHook,
  displayName?: string
) => {
  const ConnectedComponent = class extends ConsumerMixin(BaseClass) {
    static get observedAttributes(): string[] {
      return [
        // @ts-ignore
        ...(super.observedAttributes ?? [])
      ];
    }

    _mediaStore: any;
    _state: TState | undefined;

    contexts = {
      mediaStore: (mediaStore: any) => {
        this._mediaStore = mediaStore;
        
        // Subscribe to media store state changes
        // Split into two phases: state transformation, then props update
        this._mediaStore.subscribeKeys(
          stateHook.keys,
          (rawState: any) => {
            // Phase 1: Transform raw media store state (state concern)
            this._state = stateHook.transform(rawState);
            
            // Phase 2: Update element attributes/properties (props concern)
            if (this._state !== undefined) {
              // @ts-ignore - Element property access
              propsHook(this._state, this);
            }
          }
        );
      }
    };

    connectedCallback(): void {
      super.connectedCallback?.();
      
      // Set up event listeners
      eventsHook.events.forEach(eventType => {
        // @ts-ignore - Element property access
        this.addEventListener(eventType, this);
      });
    }

    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      
      // Clean up event listeners
      eventsHook.events.forEach(eventType => {
        // @ts-ignore - Element property access
        this.removeEventListener(eventType, this);
      });
    }

    handleEvent(event: CustomEvent): void {
      // @ts-ignore
      super.handleEvent?.(event);
      
      // Delegate to event hook if media store is available
      if (this._mediaStore) {
        eventsHook.handler(event, this._mediaStore);
      }
    }
  };

  // Set display name for debugging and dev tools
  if (displayName) {
    Object.defineProperty(ConnectedComponent, 'name', { value: displayName });
  }

  return ConnectedComponent;
};