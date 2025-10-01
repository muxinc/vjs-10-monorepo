import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { TimeRange as CoreTimeRange } from '@vjs-10/core';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

type TimeRangeRootState = {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeRange | null;
};

export class TimeRangeRootBase extends HTMLElement {
  static readonly observedAttributes: readonly string[] = ['orientation'];

  _state: TimeRangeRootState | undefined;
  _core: CoreTimeRange | null = null;

  get currentTime(): number {
    return this._state?.currentTime ?? 0;
  }

  get duration(): number {
    return this._state?.duration ?? 0;
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this.getAttribute('orientation') as 'horizontal' | 'vertical' || 'horizontal';
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === 'orientation' && this._state) {
      this._render(useTimeRangeRootProps(this._state, this), this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    if (state && !this._core) {
      this._core = new CoreTimeRange();
      this._core.subscribe(() => this._render(useTimeRangeRootProps(state, this), state));
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

    this.setAttribute('role', 'slider');
    this.setAttribute('aria-label', props['aria-label'] || 'Seek');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-valuenow', coreState._fillWidth.toString());
    this.setAttribute('aria-valuetext', props['aria-valuetext'] || '');
    this.setAttribute('aria-orientation', props['aria-orientation']);

    this.setAttribute('data-current-time', state.currentTime.toString());
    this.setAttribute('data-duration', state.duration.toString());
    this.setAttribute('data-orientation', props['data-orientation']);
  }
}

export class TimeRangeTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Set this element as the track element in the core TimeRange
    const rootElement = this.closest('media-time-range-root') as any;
    if (rootElement?._state?.core) {
      rootElement._state.core.setState({ _trackElement: this });
    }
  }

  _update(props: any, _state: any): void {
    const orientation = props['data-orientation'] || 'horizontal';
    this.setAttribute('data-orientation', orientation);

    // Set appropriate dimensions based on orientation
    if (orientation === 'horizontal') {
      this.style.width = '100%';
      this.style.removeProperty('height');
    } else {
      this.style.height = '100%';
      this.style.removeProperty('width');
    }
  }
}

export class TimeRangeProgressBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-fill, 0%)';
    this.style.height = '100%';
  }

  _update(props: any, _state: any): void {
    const orientation = props['data-orientation'] || 'horizontal';
    this.setAttribute('data-orientation', orientation);

    // Set appropriate dimensions based on orientation
    if (orientation === 'horizontal') {
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

export class TimeRangePointerBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-pointer, 0%)';
    this.style.height = '100%';
  }

  _update(props: any, _state: any): void {
    const orientation = props['data-orientation'] || 'horizontal';
    this.setAttribute('data-orientation', orientation);

    // Set appropriate dimensions based on orientation
    if (orientation === 'horizontal') {
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

export class TimeRangeThumbBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
  }

  _update(props: any, _state: any): void {
    const orientation = props['data-orientation'] || 'horizontal';
    this.setAttribute('data-orientation', orientation);

    // Set appropriate positioning based on orientation
    if (orientation === 'horizontal') {
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

export const useTimeRangeRootState: StateHook<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeRange | null;
}> = {
  keys: timeRangeStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...timeRangeStateDefinition.stateTransform(rawState),
    ...timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    core: null,
  }),
};

export const useTimeRangeRootProps: PropsHook<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeRange | null;
}> = (state, element) => {
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
    ['data-orientation']: (element as any).orientation || 'horizontal',
    /** aria attributes/props */
    ['aria-label']: 'Seek',
    ['aria-valuetext']: `${currentTimeText} of ${durationText}`,
    ['aria-orientation']: (element as any).orientation || 'horizontal',
  };

  return baseProps;
};

export const useTimeRangeTrackProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-time-range-root') as any;
  return {
    ['data-orientation']: rootElement?.orientation || 'horizontal',
  };
};

export const useTimeRangeProgressProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-time-range-root') as any;
  return {
    ['data-orientation']: rootElement?.orientation || 'horizontal',
  };
};

export const useTimeRangePointerProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-time-range-root') as any;
  return {
    ['data-orientation']: rootElement?.orientation || 'horizontal',
  };
};

export const useTimeRangeThumbProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-time-range-root') as any;
  return {
    ['data-orientation']: rootElement?.orientation || 'horizontal',
  };
};

export const TimeRangeRoot: ConnectedComponentConstructor<{
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  core: CoreTimeRange | null;
}> = toConnectedHTMLComponent(TimeRangeRootBase, useTimeRangeRootState, useTimeRangeRootProps, 'TimeRangeRoot');

export const TimeRangeTrack: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeRangeTrackBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeTrackProps,
  'TimeRangeTrack'
);

export const TimeRangeProgress: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeRangeProgressBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeProgressProps,
  'TimeRangeProgress'
);

export const TimeRangePointer: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeRangePointerBase,
  { keys: [], transform: () => ({}) },
  useTimeRangePointerProps,
  'TimeRangePointer'
);

export const TimeRangeThumb: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  TimeRangeThumbBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeThumbProps,
  'TimeRangeThumb'
);

export const TimeRange = Object.assign(
  {},
  {
    Root: TimeRangeRoot,
    Track: TimeRangeTrack,
    Progress: TimeRangeProgress,
    Pointer: TimeRangePointer,
    Thumb: TimeRangeThumb,
  }
) as {
  Root: typeof TimeRangeRoot;
  Track: typeof TimeRangeTrack;
  Progress: typeof TimeRangeProgress;
  Pointer: typeof TimeRangePointer;
  Thumb: typeof TimeRangeThumb;
};

// Register custom elements
if (!globalThis.customElements.get('media-time-range-root')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range-root', TimeRangeRoot);
}

if (!globalThis.customElements.get('media-time-range-track')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range-track', TimeRangeTrack);
}

if (!globalThis.customElements.get('media-time-range-progress')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range-progress', TimeRangeProgress);
}

if (!globalThis.customElements.get('media-time-range-pointer')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range-pointer', TimeRangePointer);
}

if (!globalThis.customElements.get('media-time-range-thumb')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-time-range-thumb', TimeRangeThumb);
}

export default TimeRange;
