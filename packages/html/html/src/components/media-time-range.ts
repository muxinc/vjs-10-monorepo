import {
  toConnectedHTMLComponent,
  StateHook,
  PropsHook,
} from '../utils/component-factory';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

// Utility functions for pointer position and seek time calculations
const calculatePointerRatio = (clientX: number, rect: DOMRect): number => {
  const x = clientX - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

const calculateSeekTimeFromRatio = (ratio: number, duration: number): number => {
  return (ratio / 100) * duration;
};

const calculateSeekTimeFromPointerEvent = (
  event: PointerEvent,
  duration: number
): number => {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const ratio = calculatePointerRatio(event.clientX, rect);
  return calculateSeekTimeFromRatio(ratio, duration);
};

/**
 * TimeRange Root component - Main container with pointer event handling
 */
export class TimeRangeRootBase extends HTMLElement {
  _state:
    | {
        currentTime: number;
        duration: number;
        requestSeek: (time: number) => void;
      }
    | undefined;
  _trackElement: HTMLElement | null = null;
  _pointerPosition: number | null = null;
  _hovering: boolean = false;
  _dragging: boolean = false;

  constructor() {
    super();
    
    // Add pointer event listeners
    this.addEventListener('pointerdown', this);
    this.addEventListener('pointermove', this);
    this.addEventListener('pointerup', this);
    this.addEventListener('pointerenter', this);
    this.addEventListener('pointerleave', this);
  }

  handleEvent(event: Event) {
    const { type } = event;
    const state = this._state;
    if (!state) return;

    switch (type) {
      case 'pointerdown':
        this._handlePointerDown(event as PointerEvent);
        break;
      case 'pointermove':
        this._handlePointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this._handlePointerUp(event as PointerEvent);
        break;
      case 'pointerenter':
        this._handlePointerEnter();
        break;
      case 'pointerleave':
        this._handlePointerLeave();
        break;
    }
  }

  private _handlePointerDown(event: PointerEvent) {
    event.preventDefault();
    this._dragging = true;
    const seekTime = calculateSeekTimeFromPointerEvent(event, this._state!.duration);
    this._state!.requestSeek(seekTime);
    
    // Capture pointer events
    this.setPointerCapture(event.pointerId);
  }

  private _handlePointerMove(event: PointerEvent) {
    if (!this._trackElement) return;

    const rect = this._trackElement.getBoundingClientRect();
    const ratio = calculatePointerRatio(event.clientX, rect);
    this._pointerPosition = ratio;

    if (this._dragging) {
      const seekTime = calculateSeekTimeFromRatio(ratio, this._state!.duration);
      this._state!.requestSeek(seekTime);
    }
  }

  private _handlePointerUp(event: PointerEvent) {
    this.releasePointerCapture(event.pointerId);
    
    if (this._dragging && this._trackElement && this._pointerPosition !== null) {
      const seekTime = calculateSeekTimeFromRatio(this._pointerPosition, this._state!.duration);
      this._state!.requestSeek(seekTime);
    }
    this._dragging = false;
  }

  private _handlePointerEnter() {
    this._hovering = true;
  }

  private _handlePointerLeave() {
    this._hovering = false;
  }

  get currentTime() {
    return this._state?.currentTime;
  }

  get duration() {
    return this._state?.duration;
  }

  _update(props: any, state: any) {
    this._state = state;
    
    // Find track element
    this._trackElement = this.querySelector('media-time-range-track') as HTMLElement;
    
    // Calculate slider fill percentage
    const sliderFill = this._dragging && this._pointerPosition !== null
      ? this._pointerPosition
      : state.duration > 0
        ? (state.currentTime / state.duration) * 100
        : 0;

    // Update CSS custom properties
    this.style.setProperty('--slider-fill', `${Math.round(sliderFill)}%`);
    this.style.setProperty('--slider-pointer', 
      this._hovering && this._pointerPosition !== null
        ? `${Math.round(this._pointerPosition)}%`
        : '0%'
    );

    // Update ARIA attributes
    this.setAttribute('role', 'slider');
    this.setAttribute('aria-label', props['aria-label'] || 'Seek');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-valuenow', sliderFill.toString());
    this.setAttribute('aria-valuetext', props['aria-valuetext'] || '');
    
    // Update data attributes
    this.setAttribute('data-current-time', state.currentTime.toString());
    this.setAttribute('data-duration', state.duration.toString());
  }
}

/**
 * TimeRange Track component - Track element that captures pointer events
 */
export class TimeRangeTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  _update(_props: any, _state: any) {
    // Track doesn't need much state management
  }
}

/**
 * TimeRange Progress component - Shows current progress
 */
export class TimeRangeProgressBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-fill, 0%)';
    this.style.height = '100%';
  }

  _update(_props: any, _state: any) {
    // Progress updates are handled by CSS custom properties
  }
}

/**
 * TimeRange Pointer component - Shows hover position
 */
export class TimeRangePointerBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.width = 'var(--slider-pointer, 0%)';
    this.style.height = '100%';
  }

  _update(_props: any, _state: any) {
    // Pointer updates are handled by CSS custom properties
  }
}

/**
 * TimeRange Thumb component - Draggable thumb element
 */
export class TimeRangeThumbBase extends HTMLElement {
  constructor() {
    super();
    this.style.position = 'absolute';
    this.style.top = '50%';
    this.style.left = 'var(--slider-fill, 0%)';
    this.style.transform = 'translate(-50%, -50%)';
  }

  _update(_props: any, _state: any) {
    // Thumb updates are handled by CSS custom properties
  }
}

/**
 * TimeRange Root state hook - equivalent to React's useTimeRangeRootState
 * Handles media store state subscription and transformation
 */
export const useTimeRangeRootState: StateHook<{
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
 * TimeRange Root props hook - equivalent to React's useTimeRangeRootProps
 * Handles element attributes and properties based on state
 */
export const useTimeRangeRootProps: PropsHook<{
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
  };

  return baseProps;
};

/**
 * TimeRange Track props hook
 */
export const useTimeRangeTrackProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * TimeRange Progress props hook
 */
export const useTimeRangeProgressProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * TimeRange Pointer props hook
 */
export const useTimeRangePointerProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * TimeRange Thumb props hook
 */
export const useTimeRangeThumbProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * Connected TimeRange Root component using hook-style architecture
 */
export const TimeRangeRoot = toConnectedHTMLComponent(
  TimeRangeRootBase,
  useTimeRangeRootState,
  useTimeRangeRootProps,
  'TimeRangeRoot',
);

/**
 * Connected TimeRange Track component
 */
export const TimeRangeTrack = toConnectedHTMLComponent(
  TimeRangeTrackBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeTrackProps,
  'TimeRangeTrack',
);

/**
 * Connected TimeRange Progress component
 */
export const TimeRangeProgress = toConnectedHTMLComponent(
  TimeRangeProgressBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeProgressProps,
  'TimeRangeProgress',
);

/**
 * Connected TimeRange Pointer component
 */
export const TimeRangePointer = toConnectedHTMLComponent(
  TimeRangePointerBase,
  { keys: [], transform: () => ({}) },
  useTimeRangePointerProps,
  'TimeRangePointer',
);

/**
 * Connected TimeRange Thumb component
 */
export const TimeRangeThumb = toConnectedHTMLComponent(
  TimeRangeThumbBase,
  { keys: [], transform: () => ({}) },
  useTimeRangeThumbProps,
  'TimeRangeThumb',
);

/**
 * Compound TimeRange component object
 */
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
