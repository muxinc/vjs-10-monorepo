import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { TimeSlider as CoreTimeSlider } from '@vjs-10/core';
import { timeSliderStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';
import { setAttributes } from '../utils/element-utils';

interface TimeSliderRootState {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeSlider | null;
}

/**
 * TimeSlider Root props hook - equivalent to React's useTimeSliderRootProps
 * Handles element attributes and properties based on state
 */
export const getTimeSliderRootProps: PropsHook<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeSlider | null;
}> = (state, element) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeText = formatTime(state.currentTime);
  const durationText = formatTime(state.duration);

  const baseProps: Record<string, any> = {
    role: 'slider',
    tabindex: element.getAttribute('tabindex') ?? '0',
    'data-current-time': state.currentTime.toString(),
    'data-duration': state.duration.toString(),
    'data-orientation': (element as any).orientation || 'horizontal',
    'aria-label': 'Seek',
    'aria-valuemin': '0',
    'aria-valuemax': Math.round(state.duration).toString(),
    'aria-valuenow': Math.round(state.currentTime).toString(),
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    'aria-orientation': (element as any).orientation || 'horizontal',
  };

  return baseProps;
};

export class TimeSliderRootBase extends HTMLElement {
  static readonly observedAttributes: readonly string[] = ['orientation'];

  _state: TimeSliderRootState | undefined;
  _core: CoreTimeSlider | null = null;

  get currentTime(): number {
    return this._state?.currentTime ?? 0;
  }

  get duration(): number {
    return this._state?.duration ?? 0;
  }

  get orientation(): 'horizontal' | 'vertical' {
    return (this.getAttribute('orientation') as 'horizontal' | 'vertical') || 'horizontal';
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === 'orientation' && this._state) {
      this._render(getTimeSliderRootProps(this._state, this), this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    if (state && !this._core) {
      this._core = new CoreTimeSlider();
      this._core.subscribe(() => this._render(getTimeSliderRootProps(state, this), state));
      this._core.attach(this);
      state.core = this._core;
    }

    this._core?.setState(state);
  }

  _render(props: any, state: any): void {
    const coreState = state?.core?.getState();
    if (!coreState) return;

    this.style.setProperty('--slider-fill', `${Math.round(coreState._fillWidth)}%`);
    this.style.setProperty('--slider-pointer', `${Math.round(coreState._pointerWidth)}%`);

    setAttributes(this, props);
  }
}

export class TimeSliderTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Set this element as the track element in the core TimeSlider
    const rootElement = this.closest('media-time-slider-root') as any;
    if (rootElement?._state?.core) {
      rootElement._state.core.setState({ _trackElement: this });
    }
  }

  _update(props: any, _state: any): void {
    setAttributes(this, props);

    if (props['data-orientation'] === 'horizontal') {
      this.style.width = '100%';
      this.style.removeProperty('height');
    } else {
      this.style.height = '100%';
      this.style.removeProperty('width');
    }
  }
}

export class TimeSliderProgressBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-fill, 0%)';
    this.style.height = '100%';
  }

  _update(props: any, _state: any): void {
    setAttributes(this, props);

    if (props['data-orientation'] === 'horizontal') {
      this.style.width = 'var(--slider-fill, 0%)';
      this.style.height = '100%';
      this.style.top = '0';
      this.style.removeProperty('bottom');
    } else {
      this.style.height = 'var(--slider-fill, 0%)';
      this.style.width = '100%';
      this.style.bottom = '0';
      this.style.removeProperty('top');
    }
  }
}

export class TimeSliderPointerBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-pointer, 0%)';
    this.style.height = '100%';
  }

  _update(props: any, _state: any): void {
    setAttributes(this, props);

    if (props['data-orientation'] === 'horizontal') {
      this.style.width = 'var(--slider-pointer, 0%)';
      this.style.height = '100%';
      this.style.top = '0';
      this.style.removeProperty('bottom');
    } else {
      this.style.height = 'var(--slider-pointer, 0%)';
      this.style.width = '100%';
      this.style.bottom = '0';
      this.style.removeProperty('top');
    }
  }
}

export class TimeSliderThumbBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
  }

  _update(props: any, _state: any): void {
    setAttributes(this, props);

    // Set appropriate positioning based on orientation
    if (props['data-orientation'] === 'horizontal') {
      this.style.left = 'var(--slider-fill, 0%)';
      this.style.top = '50%';
      this.style.transform = 'translate(-50%, -50%)';
    } else {
      this.style.bottom = 'var(--slider-fill, 0%)';
      this.style.left = '50%';
      this.style.transform = 'translate(-50%, 50%)';
    }
  }
}

export const useTimeSliderRootState: StateHook<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeSlider | null;
}> = {
  keys: timeSliderStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...timeSliderStateDefinition.stateTransform(rawState),
    ...timeSliderStateDefinition.createRequestMethods(mediaStore.dispatch),
    core: null,
  }),
};

export const getTimeSliderTrackProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-time-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

export const getTimeSliderProgressProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-time-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

export const getTimeSliderPointerProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-time-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

export const getTimeSliderThumbProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-time-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

export const TimeSliderRoot: ConnectedComponentConstructor<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeSlider | null;
}> = toConnectedHTMLComponent(TimeSliderRootBase, useTimeSliderRootState, getTimeSliderRootProps, 'TimeSliderRoot');

export const TimeSliderTrack: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeSliderTrackBase,
  { keys: [], transform: () => ({}) },
  getTimeSliderTrackProps,
  'TimeSliderTrack',
);

export const TimeSliderProgress: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeSliderProgressBase,
  { keys: [], transform: () => ({}) },
  getTimeSliderProgressProps,
  'TimeSliderProgress',
);

export const TimeSliderPointer: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeSliderPointerBase,
  { keys: [], transform: () => ({}) },
  getTimeSliderPointerProps,
  'TimeSliderPointer',
);

export const TimeSliderThumb: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeSliderThumbBase,
  { keys: [], transform: () => ({}) },
  getTimeSliderThumbProps,
  'TimeSliderThumb',
);

export const TimeSlider = Object.assign(
  {},
  {
    Root: TimeSliderRoot,
    Track: TimeSliderTrack,
    Progress: TimeSliderProgress,
    Pointer: TimeSliderPointer,
    Thumb: TimeSliderThumb,
  },
) as {
  Root: typeof TimeSliderRoot;
  Track: typeof TimeSliderTrack;
  Progress: typeof TimeSliderProgress;
  Pointer: typeof TimeSliderPointer;
  Thumb: typeof TimeSliderThumb;
};

if (!globalThis.customElements.get('media-time-slider-root')) {
  globalThis.customElements.define('media-time-slider-root', TimeSliderRoot);
}

if (!globalThis.customElements.get('media-time-slider-track')) {
  globalThis.customElements.define('media-time-slider-track', TimeSliderTrack);
}

if (!globalThis.customElements.get('media-time-slider-progress')) {
  globalThis.customElements.define('media-time-slider-progress', TimeSliderProgress);
}

if (!globalThis.customElements.get('media-time-slider-pointer')) {
  globalThis.customElements.define('media-time-slider-pointer', TimeSliderPointer);
}

if (!globalThis.customElements.get('media-time-slider-thumb')) {
  globalThis.customElements.define('media-time-slider-thumb', TimeSliderThumb);
}

export default TimeSlider;
