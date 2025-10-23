import type { CurrentTimeDisplayState } from '@vjs-10/core/store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { currentTimeDisplayStateDefinition, formatDisplayTime } from '@vjs-10/core/store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

export class CurrentTimeDisplayBase extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };

  static observedAttributes: string[] = ['show-remaining'];

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

  get currentTime(): number {
    return this._state?.currentTime ?? 0;
  }

  get duration(): number {
    return this._state?.duration ?? 0;
  }

  get showRemaining(): boolean {
    return this.hasAttribute('show-remaining');
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === 'show-remaining' && this._state) {
      // Re-render with current state when show-remaining attribute changes
      this._update({}, this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    /** @TODO Should this live here or elsewhere? (CJP) */
    const timeLabel
      = this.showRemaining && state.duration != null && state.currentTime != null
        ? formatDisplayTime(-(state.duration - state.currentTime))
        : formatDisplayTime(state.currentTime);

    if (this.shadowRoot) {
      this.shadowRoot.textContent = timeLabel;
    }
  }
}

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

export const useCurrentTimeDisplayProps: PropsHook<{
  currentTime: number | undefined;
  duration: number | undefined;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

export const CurrentTimeDisplay: ConnectedComponentConstructor<CurrentTimeDisplayState> = toConnectedHTMLComponent(
  CurrentTimeDisplayBase,
  useCurrentTimeDisplayState,
  useCurrentTimeDisplayProps,
  'CurrentTimeDisplay',
);

// Register the custom element
if (!globalThis.customElements.get('media-current-time-display')) {
  globalThis.customElements.define('media-current-time-display', CurrentTimeDisplay);
}

export default CurrentTimeDisplay;
