import {
  toConnectedHTMLComponent,
  StateHook,
  PropsHook,
} from '../utils/component-factory';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

/**
 * @TODO Should we use a base "range" superclass or just duplicate shared code? (CJP)
 **/
export class TimeRangeBase extends HTMLElement {
  _state:
    | {
        currentTime: number;
        duration: number;
        requestSeek: (time: number) => void;
      }
    | undefined;
  _input: HTMLInputElement;

  constructor() {
    super();
    /**
     * @TODO This is just a simple render function to demonstrate functionality.
     * A full implementation will need to implement a "compound component" architecture and likely should use templates. (CJP)
     **/
    this._input = document.createElement('input');
    this._input.type = 'range';
    this._input.min = '0';
    this._input.max = '100';
    this._input.step = '0.1';
    this._input.addEventListener('input', this);
    this.appendChild(this._input);
  }

  handleEvent(event: Event) {
    const { type } = event;
    const state = this._state;
    if (state) {
      if (type === 'input') {
        const ratio = parseFloat(this._input.value) / 100;
        const seekTime = ratio * state.duration;
        state.requestSeek(seekTime);
      }
    }
  }

  get currentTime() {
    return this._state?.currentTime;
  }

  get duration() {
    return this._state?.duration;
  }

  _update(props: any, state: any) {
    this._state = state;
    const ratio =
      state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    this._input.value = ratio.toString();
    this._input.max = '100';
    this._input.setAttribute('aria-label', props['aria-label']);
    this._input.setAttribute('aria-valuetext', props['aria-valuetext']);
    this._input.disabled = props.disabled ?? false;

    // Update data attributes for styling
    this.setAttribute('data-current-time', props['data-current-time']);
    this.setAttribute('data-duration', props['data-duration']);
  }
}

/**
 * TimeRange state hook - equivalent to React's useTimeRangeState
 * Handles media store state subscription and transformation
 */
export const useTimeRangeState: StateHook<{
  currentTime: number;
  duration: number;
}> = {
  keys: timeRangeStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...timeRangeStateDefinition.stateTransform(rawState),
    ...timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

/**
 * TimeRange props hook - equivalent to React's useTimeRangeProps
 * Handles element attributes and properties based on state
 */
export const useTimeRangeProps: PropsHook<{
  currentTime: number;
  duration: number;
}> = (state, _element) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeText = formatTime(state.currentTime);
  const durationText = formatTime(state.duration);

  const baseProps: Record<string, any> = {
    /** data attributes/props */
    ['data-current-time']: state.currentTime.toString(),
    ['data-duration']: state.duration.toString(),
    /** aria attributes/props */
    ['aria-label']: 'Seek',
    ['aria-valuetext']: `${currentTimeText} of ${durationText}`,
    /** input props */
    disabled: false,
  };

  return baseProps;
};

/**
 * Connected TimeRange component using hook-style architecture
 * Equivalent to React's TimeRange = toConnectedComponent(...)
 */
export const TimeRange = toConnectedHTMLComponent(
  TimeRangeBase,
  useTimeRangeState,
  useTimeRangeProps,
  'TimeRange',
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-time-range')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range', TimeRange);
}

export default TimeRange;
