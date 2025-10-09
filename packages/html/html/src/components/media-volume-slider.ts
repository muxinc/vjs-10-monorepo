import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { VolumeSlider as CoreVolumeSlider } from '@vjs-10/core';
import { volumeSliderStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';

/**
 * VolumeSlider Root props hook - equivalent to React's useVolumeSliderRootProps
 * Handles element attributes and properties based on state
 */
export const getVolumeSliderRootProps: PropsHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider | null;
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
 * VolumeSlider Root component - Main container with pointer event handling
 */
interface VolumeSliderRootState {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider | null;
}

export class VolumeSliderRootBase extends HTMLElement {
  static readonly observedAttributes: readonly string[] = ['orientation'];

  _state: VolumeSliderRootState | undefined;
  _core: CoreVolumeSlider | null = null;

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
      this._render(getVolumeSliderRootProps(this._state, this), this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    if (state && !this._core) {
      this._core = new CoreVolumeSlider();
      this._core.subscribe(() => this._render(getVolumeSliderRootProps(state, this), state));
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
 * VolumeSlider Track component - Track element that captures pointer events
 */
export class VolumeSliderTrackBase extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Set this element as the track element in the core VolumeSlider
    const rootElement = this.closest('media-volume-slider-root') as any;
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
 * VolumeSlider Progress component - Shows current progress
 */
export class VolumeSliderProgressBase extends HTMLElement {
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
 * VolumeSlider Thumb component - Draggable thumb element
 */
export class VolumeSliderThumbBase extends HTMLElement {
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
 * VolumeSlider Root state hook - equivalent to React's useVolumeSliderRootState
 * Handles media store state subscription and transformation
 */
export const useVolumeSliderRootState: StateHook<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider | null;
}> = {
  keys: volumeSliderStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...volumeSliderStateDefinition.stateTransform(rawState),
    ...volumeSliderStateDefinition.createRequestMethods(mediaStore.dispatch),
    core: null,
  }),
};

/**
 * VolumeSlider Track props hook
 */
export const getVolumeSliderTrackProps: PropsHook<Record<string, never>> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeSlider Progress props hook
 */
export const getVolumeSliderProgressProps: PropsHook<Record<string, never>> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeSlider Thumb props hook
 */
export const getVolumeSliderThumbProps: PropsHook<Record<string, never>> = (_state, element) => {
  // Get orientation from parent root element if not provided in state
  const rootElement = element.closest('media-volume-slider-root') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * Connected VolumeSlider Root component using hook-style architecture
 */
export const VolumeSliderRoot: ConnectedComponentConstructor<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider | null;
}> = toConnectedHTMLComponent(VolumeSliderRootBase, useVolumeSliderRootState, getVolumeSliderRootProps, 'VolumeSliderRoot');

/**
 * Connected VolumeSlider Track component
 */
export const VolumeSliderTrack: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderTrackBase,
  { keys: [], transform: () => ({}) },
  getVolumeSliderTrackProps,
  'VolumeSliderTrack',
);

/**
 * Connected VolumeSlider Progress component
 */
export const VolumeSliderProgress: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderProgressBase,
  { keys: [], transform: () => ({}) },
  getVolumeSliderProgressProps,
  'VolumeSliderProgress',
);

/**
 * Connected VolumeSlider Thumb component
 */
export const VolumeSliderThumb: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderThumbBase,
  { keys: [], transform: () => ({}) },
  getVolumeSliderThumbProps,
  'VolumeSliderThumb',
);

/**
 * Compound VolumeSlider component object
 */
export const VolumeSlider = Object.assign(
  {},
  {
    Root: VolumeSliderRoot,
    Track: VolumeSliderTrack,
    Progress: VolumeSliderProgress,
    Thumb: VolumeSliderThumb,
  },
) as {
  Root: typeof VolumeSliderRoot;
  Track: typeof VolumeSliderTrack;
  Progress: typeof VolumeSliderProgress;
  Thumb: typeof VolumeSliderThumb;
};

// Register custom elements
if (!globalThis.customElements.get('media-volume-slider-root')) {
  globalThis.customElements.define('media-volume-slider-root', VolumeSliderRoot);
}

if (!globalThis.customElements.get('media-volume-slider-track')) {
  globalThis.customElements.define('media-volume-slider-track', VolumeSliderTrack);
}

if (!globalThis.customElements.get('media-volume-slider-progress')) {
  globalThis.customElements.define('media-volume-slider-progress', VolumeSliderProgress);
}

if (!globalThis.customElements.get('media-volume-slider-thumb')) {
  globalThis.customElements.define('media-volume-slider-thumb', VolumeSliderThumb);
}

export default VolumeSlider;
