import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { VolumeRange as CoreVolumeRange } from '@vjs-10/core';
import { volumeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

/**
 * VolumeRange Root component - Main container with pointer event handling
 */
interface VolumeRangeRootState {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeRange | null;
}

export class VolumeRangeRootBase extends HTMLElement {
  static readonly observedAttributes: readonly string[] = ['orientation'];

  _state: VolumeRangeRootState | undefined;
  _core: CoreVolumeRange | null = null;

  get volume(): number | undefined {
    return this._state?.volume;
  }

  get muted(): boolean {
    return this._state?.muted ?? false;
  }

  get volumeLevel(): string {
    return this._state?.volumeLevel ?? 'high';
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this.getAttribute('orientation') as 'horizontal' | 'vertical' || 'horizontal';
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === 'orientation' && this._state) {
      this._render(useVolumeRangeRootProps(this._state, this), this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    if (state && !this._core) {
      this._core = new CoreVolumeRange();
      this._core.subscribe(() => this._render(useVolumeRangeRootProps(state, this), state));
      this._core.attach(this);
      state.core = this._core;
    }

    this._core?.setState(state);
  }

  _render(props: any, state: any): void {
    const coreState = state?.core?.getState();
    if (!coreState) return;

    this.style.setProperty('--slider-fill', `${coreState._fillWidth.toFixed(3)}%`);
    this.style.setProperty('--slider-pointer', `${coreState._pointerWidth.toFixed(3)}%`);

    this.setAttribute('role', 'slider');
    this.setAttribute('aria-label', props['aria-label'] || 'Volume');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.setAttribute('aria-valuenow', coreState._fillWidth.toString());
    this.setAttribute('aria-valuetext', props['aria-valuetext'] || '');
    this.setAttribute('aria-orientation', props['aria-orientation']);

    this.setAttribute('data-muted', state.muted.toString());
    this.setAttribute('data-volume-level', state.volumeLevel);
    this.setAttribute('data-orientation', props['data-orientation']);
  }
}

/**
 * VolumeRange Track component - Track element that captures pointer events
 */
export class VolumeRangeTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Set this element as the track element in the core VolumeRange
    const rootElement = this.closest('media-volume-range-root') as any;
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

/**
 * VolumeRange Thumb component - Draggable thumb element
 */
export class VolumeRangeThumbBase extends HTMLElement {
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

/**
 * VolumeRange Root state hook - equivalent to React's useVolumeRangeRootState
 * Handles media store state subscription and transformation
 */
export const useVolumeRangeRootState: StateHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeRange | null;
}> = {
  keys: volumeRangeStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...volumeRangeStateDefinition.stateTransform(rawState),
    ...volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    core: null,
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
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeRange | null;
}> = (state, element) => {
  const volumeText = `${Math.round(state.muted ? 0 : state.volume * 100)}%`;

  const baseProps: Record<string, any> = {
    /** data attributes/props */
    'data-muted': state.muted.toString(),
    'data-volume-level': state.volumeLevel,
    'data-orientation': (element as any).orientation || 'horizontal',
    /** aria attributes/props */
    'aria-label': 'Volume',
    'aria-valuetext': volumeText,
    'aria-orientation': (element as any).orientation || 'horizontal',
  };

  return baseProps;
};

/**
 * VolumeRange Track props hook
 */
export const useVolumeRangeTrackProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-range-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeRange Progress props hook
 */
export const useVolumeRangeProgressProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-range-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeRange Thumb props hook
 */
export const useVolumeRangeThumbProps: PropsHook<{}> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-range-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * Connected VolumeRange Root component using hook-style architecture
 */
export const VolumeRangeRoot: ConnectedComponentConstructor<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeRange | null;
}> = toConnectedHTMLComponent(VolumeRangeRootBase, useVolumeRangeRootState, useVolumeRangeRootProps, 'VolumeRangeRoot');

/**
 * Connected VolumeRange Track component
 */
export const VolumeRangeTrack: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeTrackBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeTrackProps,
  'VolumeRangeTrack',
);

/**
 * Connected VolumeRange Progress component
 */
export const VolumeRangeProgress: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeProgressBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeProgressProps,
  'VolumeRangeProgress',
);

/**
 * Connected VolumeRange Thumb component
 */
export const VolumeRangeThumb: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeRangeThumbBase,
  { keys: [], transform: () => ({}) },
  useVolumeRangeThumbProps,
  'VolumeRangeThumb',
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
  },
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
