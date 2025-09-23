import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';
import type { VolumeRangeState } from '@vjs-10/media-store';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

// Utility functions for pointer position and volume calculations
const calculatePointerRatio = (clientX: number, rect: DOMRect): number => {
  const x = clientX - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

const calculateVolumeFromRatio = (ratio: number): number => {
  return ratio / 100;
};

const calculateVolumeFromPointerEvent = (event: PointerEvent): number => {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const ratio = calculatePointerRatio(event.clientX, rect);
  return calculateVolumeFromRatio(ratio);
};

/**
 * VolumeRange Root component - Main container with pointer event handling
 */
export class VolumeRangeRootBase extends HTMLElement {
  _state:
    | {
        volume: number;
        muted: boolean;
        volumeLevel: string;
        requestVolumeChange: (volume: number) => void;
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

  handleEvent(event: Event): void {
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
    const volume = calculateVolumeFromPointerEvent(event);
    this._state!.requestVolumeChange(volume);

    // Capture pointer events
    this.setPointerCapture(event.pointerId);
  }

  private _handlePointerMove(event: PointerEvent) {
    if (!this._trackElement) return;

    const rect = this._trackElement.getBoundingClientRect();
    const ratio = calculatePointerRatio(event.clientX, rect);
    this._pointerPosition = ratio;

    if (this._dragging) {
      const volume = calculateVolumeFromRatio(ratio);
      this._state!.requestVolumeChange(volume);
    }
  }

  private _handlePointerUp(event: PointerEvent) {
    this.releasePointerCapture(event.pointerId);

    if (this._dragging && this._trackElement && this._pointerPosition !== null) {
      const volume = calculateVolumeFromRatio(this._pointerPosition);
      this._state!.requestVolumeChange(volume);
    }
    this._dragging = false;
  }

  private _handlePointerEnter() {
    this._hovering = true;
  }

  private _handlePointerLeave() {
    this._hovering = false;
  }

  get volume(): number | undefined {
    return this._state?.volume;
  }

  get muted(): boolean {
    return this._state?.muted ?? false;
  }

  get volumeLevel(): string {
    return this._state?.volumeLevel ?? 'high';
  }

  _update(props: any, state: any): void {
    this._state = state;

    // Find track element
    this._trackElement = this.querySelector('media-volume-range-track') as HTMLElement;

    // Calculate slider fill percentage
    const sliderFill =
      this._dragging && this._pointerPosition !== null
        ? this._pointerPosition
        : state.muted
          ? 0
          : state.volume * 100;

    // Update CSS custom properties
    this.style.setProperty('--slider-fill', `${Math.round(sliderFill)}%`);
    this.style.setProperty(
      '--slider-pointer',
      this._hovering && this._pointerPosition !== null ? `${Math.round(this._pointerPosition)}%` : '0%'
    );

    // Update ARIA attributes
    this.setAttribute('role', 'slider');
    this.setAttribute('aria-label', props['aria-label'] || 'Volume');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-valuenow', sliderFill.toString());
    this.setAttribute('aria-valuetext', props['aria-valuetext'] || '');

    // Update data attributes
    this.setAttribute('data-muted', state.muted.toString());
    this.setAttribute('data-volume-level', state.volumeLevel);
  }
}

/**
 * VolumeRange Track component - Track element that captures pointer events
 */
export class VolumeRangeTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  _update(_props: any, _state: any): void {
    // Track doesn't need much state management
  }
}

/**
 * VolumeRange Progress component - Shows current progress
 */
export class VolumeRangeProgressBase extends HTMLElement {
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

/**
 * VolumeRange Thumb component - Draggable thumb element
 */
export class VolumeRangeThumbBase extends HTMLElement {
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

/**
 * VolumeRange Root state hook - equivalent to React's useVolumeRangeRootState
 * Handles media store state subscription and transformation
 */
export const useVolumeRangeRootState: StateHook<{
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

/**
 * VolumeRange Root props hook - equivalent to React's useVolumeRangeRootProps
 * Handles element attributes and properties based on state
 */
export const useVolumeRangeRootProps: PropsHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
}> = (state, _element) => {
  const volumeText = `${Math.round(state.muted ? 0 : state.volume * 100)}%`;

  const baseProps: Record<string, any> = {
    /** data attributes/props */
    ['data-muted']: state.muted.toString(),
    ['data-volume-level']: state.volumeLevel,
    /** aria attributes/props */
    ['aria-label']: 'Volume',
    ['aria-valuetext']: volumeText,
  };

  return baseProps;
};

/**
 * VolumeRange Track props hook
 */
export const useVolumeRangeTrackProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * VolumeRange Progress props hook
 */
export const useVolumeRangeProgressProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * VolumeRange Thumb props hook
 */
export const useVolumeRangeThumbProps: PropsHook<{}> = (_state, _element) => {
  return {};
};

/**
 * Connected VolumeRange Root component using hook-style architecture
 */
export const VolumeRangeRoot: ConnectedComponentConstructor<VolumeRangeState> = toConnectedHTMLComponent(
  VolumeRangeRootBase,
  useVolumeRangeRootState,
  useVolumeRangeRootProps,
  'VolumeRangeRoot'
);

/**
 * Connected VolumeRange Track component
 */
export const VolumeRangeTrack: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeTrackBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeTrackProps,
  'VolumeRangeTrack'
);

/**
 * Connected VolumeRange Progress component
 */
export const VolumeRangeProgress: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeProgressBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeProgressProps,
  'VolumeRangeProgress'
);

/**
 * Connected VolumeRange Thumb component
 */
export const VolumeRangeThumb: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeThumbBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeThumbProps,
  'VolumeRangeThumb'
);

/**
 * Compound VolumeRange component object
 */
export const VolumeRange = Object.assign(
  {},
  {
    Root: VolumeRangeRoot,
    Track: VolumeRangeTrack,
    Progress: VolumeRangeProgress,
    Thumb: VolumeRangeThumb,
  }
) as {
  Root: typeof VolumeRangeRoot;
  Track: typeof VolumeRangeTrack;
  Progress: typeof VolumeRangeProgress;
  Thumb: typeof VolumeRangeThumb;
};

// Register custom elements
if (!globalThis.customElements.get('media-volume-range-root')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-volume-range-root', VolumeRangeRoot);
}

if (!globalThis.customElements.get('media-volume-range-track')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-volume-range-track', VolumeRangeTrack);
}

if (!globalThis.customElements.get('media-volume-range-progress')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-volume-range-progress', VolumeRangeProgress);
}

if (!globalThis.customElements.get('media-volume-range-thumb')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-volume-range-thumb', VolumeRangeThumb);
}

export default VolumeRange;
