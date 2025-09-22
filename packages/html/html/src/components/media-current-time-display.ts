import { currentTimeDisplayStateDefinition, formatDisplayTime } from '@vjs-10/media-store';

import { PropsHook, StateHook, toConnectedHTMLComponent } from '../utils/component-factory';

export class CurrentTimeDisplayBase extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };
  static observedAttributes = ['show-remaining'];

  _state:
    | {
        currentTime: number | undefined;
        duration: number | undefined;
      }
    | undefined;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof CurrentTimeDisplayBase).shadowRootOptions);
    }
  }

  get currentTime() {
    return this._state?.currentTime;
  }

  get duration() {
    return this._state?.duration;
  }

  get showRemaining() {
    return this.hasAttribute('show-remaining');
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
    if (name === 'show-remaining' && this._state) {
      // Re-render with current state when show-remaining attribute changes
      this._update({}, this._state);
    }
  }

  _update(_props: any, state: any) {
    this._state = state;

    /** @TODO Should this live here or elsewhere? (CJP) */
    const timeLabel =
      this.showRemaining && state.duration != null && state.currentTime != null
        ? formatDisplayTime(-(state.duration - state.currentTime))
        : formatDisplayTime(state.currentTime);

    if (this.shadowRoot) {
      this.shadowRoot.textContent = timeLabel;
    }
  }
}

/**
 * CurrentTimeDisplay state hook - equivalent to React's useCurrentTimeDisplayState
 * Handles media store state subscription and transformation
 */
export const useCurrentTimeDisplayState: StateHook<{
  currentTime: number | undefined;
  duration: number | undefined;
}> = {
  keys: [...currentTimeDisplayStateDefinition.keys],
  transform: (rawState, _mediaStore) => ({
    ...currentTimeDisplayStateDefinition.stateTransform(rawState),
    // Current time display is read-only, so no request methods needed
  }),
};

/**
 * CurrentTimeDisplay props hook - equivalent to React's useCurrentTimeDisplayProps
 * Handles element attributes and properties based on state
 */
export const useCurrentTimeDisplayProps: PropsHook<{
  currentTime: number | undefined;
  duration: number | undefined;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

/**
 * Connected CurrentTimeDisplay component using hook-style architecture
 * Equivalent to React's CurrentTimeDisplay = toConnectedComponent(...)
 */
export const CurrentTimeDisplay = toConnectedHTMLComponent(
  CurrentTimeDisplayBase,
  useCurrentTimeDisplayState,
  useCurrentTimeDisplayProps,
  'CurrentTimeDisplay'
);

// Register the custom element
if (!globalThis.customElements.get('media-current-time-display')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-current-time-display', CurrentTimeDisplay);
}

export default CurrentTimeDisplay;
