import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';
import type { VolumeRangeState } from '@vjs-10/media-store';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

export class VolumeRangeBase extends HTMLElement {
  _state:
    | {
        volume: number;
        muted: boolean;
        volumeLevel: string;
        requestVolumeChange: (volume: number) => void;
      }
    | undefined;

  _input: HTMLInputElement;

  constructor() {
    super();
    /**
     * @TODO This is just a simple placeholder input to demonstrate functionality.
     * A full implementation will need to implement a "compound component" architecture and likely should use templates. (CJP)
     **/
    this._input = document.createElement('input');
    this._input.type = 'range';
    this._input.min = '0';
    this._input.max = '1';
    this._input.step = '0.01';
    this._input.addEventListener('input', this);
    this.appendChild(this._input);
  }

  handleEvent(event: Event): void {
    const { type } = event;
    const state = this._state;
    if (state) {
      if (type === 'input') {
        state.requestVolumeChange(parseFloat(this._input.value));
      }
    }
  }

  get volume(): number {
    return this._state?.volume ?? 0;
  }

  get muted(): boolean {
    return this._state?.muted ?? false;
  }

  get volumeLevel(): string {
    return this._state?.volumeLevel ?? 'high';
  }

  _update(props: any, state: any): void {
    this._state = state;
    const displayValue = state.muted ? 0 : state.volume;
    this._input.value = displayValue.toString();
    this._input.setAttribute('aria-label', props['aria-label']);
    this._input.setAttribute('aria-valuetext', props['aria-valuetext']);
    this._input.disabled = props.disabled ?? false;

    // Update data attributes for styling
    this.setAttribute('data-volume-level', props['data-volume-level']);
    this.toggleAttribute('data-muted', props['data-muted']);
  }
}

export const useVolumeRangeState: StateHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
}> = {
  keys: volumeRangeStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...volumeRangeStateDefinition.stateTransform(rawState),
    ...volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const useVolumeRangeProps: PropsHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
}> = (state, _element) => {
  const displayValue = state.muted ? 0 : state.volume;

  const baseProps: Record<string, any> = {
    /** data attributes/props */
    ['data-muted']: state.muted,
    ['data-volume-level']: state.volumeLevel,
    /** aria attributes/props */
    ['aria-label']: 'Volume',
    ['aria-valuetext']: `${Math.round(displayValue * 100)}%`,
    /** input props */
    disabled: false,
  };

  return baseProps;
};

// @TODO When implementing compound components, this function may need to be swapped out, modified, or augmented in some way or another. (CJP)

export const VolumeRange: ConnectedComponentConstructor<VolumeRangeState> = toConnectedHTMLComponent(
  VolumeRangeBase,
  useVolumeRangeState,
  useVolumeRangeProps,
  'VolumeRange'
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-volume-range')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-volume-range', VolumeRange);
}

export default VolumeRange;
