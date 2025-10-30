import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { VolumeSlider as CoreVolumeSlider } from '@videojs/core';
import { volumeSliderStateDefinition } from '@videojs/core/store';

import { setAttributes } from '@videojs/utils/dom';
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
    role: 'slider',
    tabindex: element.getAttribute('tabindex') ?? '0',
    'data-muted': state.muted.toString(),
    'data-volume-level': state.volumeLevel,
    'data-orientation': (element as any).orientation || 'horizontal',
    'aria-label': 'Volume',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
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

export class VolumeSliderRoot extends HTMLElement {
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
    return (this.getAttribute('orientation') as 'horizontal' | 'vertical') || 'horizontal';
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

    props['aria-valuenow'] = coreState._fillWidth.toString();

    setAttributes(this, props);
  }
}

/**
 * VolumeSlider Track component - Track element that captures pointer events
 */
export class VolumeSliderTrack extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Set this element as the track element in the core VolumeSlider
    const rootElement = this.closest('media-volume-slider') as any;
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

/**
 * VolumeSlider Progress component - Shows current progress
 */
export class VolumeSliderIndicatorElement extends HTMLElement {
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

/**
 * VolumeSlider Thumb component - Draggable thumb element
 */
export class VolumeSliderThumb extends HTMLElement {
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
      this.style.translate = '-50% -50%';
    } else {
      this.style.bottom = 'var(--slider-fill, 0%)';
      this.style.left = '50%';
      this.style.translate = '-50% 50%';
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
  const rootElement = element.closest('media-volume-slider') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeSlider Progress props hook
 */
export const getVolumeSliderProgressProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-volume-slider') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * VolumeSlider Thumb props hook
 */
export const getVolumeSliderThumbProps: PropsHook<Record<string, never>> = (_state, element) => {
  const rootElement = element.closest('media-volume-slider') as any;
  return {
    'data-orientation': rootElement?.orientation || 'horizontal',
  };
};

/**
 * Connected VolumeSlider Root component using hook-style architecture
 */
export const VolumeSliderRootElement: ConnectedComponentConstructor<{
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider | null;
}> = toConnectedHTMLComponent(VolumeSliderRoot, useVolumeSliderRootState, getVolumeSliderRootProps, 'VolumeSliderRoot');

/**
 * Connected VolumeSlider Track component
 */
export const VolumeSliderTrackElement: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderTrack,
  { keys: [], transform: () => ({}) },
  getVolumeSliderTrackProps,
  'VolumeSliderTrack',
);

/**
 * Connected VolumeSlider Progress component
 */
export const VolumeSliderProgressElement: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderIndicatorElement,
  { keys: [], transform: () => ({}) },
  getVolumeSliderProgressProps,
  'VolumeSliderProgress',
);

/**
 * Connected VolumeSlider Thumb component
 */
export const VolumeSliderThumbElement: ConnectedComponentConstructor<any> = toConnectedHTMLComponent(
  VolumeSliderThumb,
  { keys: [], transform: () => ({}) },
  getVolumeSliderThumbProps,
  'VolumeSliderThumb',
);

/**
 * Compound VolumeSlider component object
 */
export const VolumeSliderElement = Object.assign(
  {},
  {
    Root: VolumeSliderRootElement,
    Track: VolumeSliderTrackElement,
    Progress: VolumeSliderProgressElement,
    Thumb: VolumeSliderThumbElement,
  },
) as {
  Root: typeof VolumeSliderRootElement;
  Track: typeof VolumeSliderTrackElement;
  Progress: typeof VolumeSliderProgressElement;
  Thumb: typeof VolumeSliderThumbElement;
};
