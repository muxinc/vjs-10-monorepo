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
  _state: TimeRangeRootState | undefined;
  _core: CoreTimeRange | null = null;

  get currentTime(): number {
    return this._state?.currentTime ?? 0;
  }

  get duration(): number {
    return this._state?.duration ?? 0;
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

    this.setAttribute('data-current-time', state.currentTime.toString());
    this.setAttribute('data-duration', state.duration.toString());
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

  _update(_props: any, _state: any): void {
    // Track doesn't need much state management
  }
}

export class TimeRangeProgressBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-fill, 0%)';
    this.style.height = '100%';
  }

  _update(_props: any, _state: any): void {
    // Progress updates are handled by CSS custom properties
  }
}

export class TimeRangePointerBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-pointer, 0%)';
    this.style.height = '100%';
  }

  _update(_props: any, _state: any): void {
    // Pointer updates are handled by CSS custom properties
  }
}

export class TimeRangeThumbBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.top = '50%';
    this.style.left = 'var(--slider-fill, 0%)';
    this.style.transform = 'translate(-50%, -50%)';
  }

  _update(_props: any, _state: any): void {
    // Thumb updates are handled by CSS custom properties
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
  };

  return baseProps;
};

export const useTimeRangeTrackProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

export const useTimeRangeProgressProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

export const useTimeRangePointerProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

export const useTimeRangeThumbProps: PropsHook<{}> = (_state, _element) => {
  return {};
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
