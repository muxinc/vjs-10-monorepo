import type { ConnectedComponent } from '../utils/component-factory';

<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
import { VolumeSlider as CoreVolumeSlider } from '@vjs-10/core';

import { volumeSliderStateDefinition } from '@vjs-10/media-store';
=======
import { VolumeRange as CoreVolumeRange } from '@vjs-10/core';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { useCallback, useMemo } from 'react';

import { toConnectedComponent, toContextComponent, useCore } from '../utils/component-factory';

export interface VolumeSliderState {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeSlider;
  orientation: 'horizontal' | 'vertical';
}

export interface VolumeSliderProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

interface VolumeSliderRenderProps extends React.ComponentProps<'div'> {
  'data-orientation'?: 'horizontal' | 'vertical';
  'data-muted'?: boolean;
  'data-volume-level'?: string;
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export function useVolumeSliderRootState(props: VolumeSliderProps): VolumeSliderState {
  const { orientation = 'horizontal' } = props;
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(volumeSliderStateDefinition.stateTransform, shallowEqual);
  const mediaMethods = useMemo(
<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
    () => volumeSliderStateDefinition.createRequestMethods(mediaStore.dispatch),
=======
    () => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
    [mediaStore],
  );
  const core = useCore(CoreVolumeSlider, { ...mediaState, ...mediaMethods });

  return {
    ...mediaState,
    ...mediaMethods,
    orientation,
    core,
  };
}

export function useVolumeSliderRootProps(props: VolumeSliderProps, state: VolumeSliderState): VolumeSliderRenderProps {
  const { _fillWidth, _pointerWidth, _volumeText } = state.core.getState();

  const { children, className, id, style, orientation = 'horizontal' } = props;

  return {
    ref: useCallback((el: HTMLDivElement) => {
      if (!el) return;
      state.core?.attach(el);
    }, []),
    id,
    role: 'slider',
    'aria-label': 'Volume',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': _fillWidth,
    'aria-valuetext': _volumeText,
    'aria-orientation': orientation,
    'data-orientation': orientation,
    'data-muted': state.muted,
    'data-volume-level': state.volumeLevel,
    className,
    style: {
      ...style,
      '--slider-fill': `${_fillWidth.toFixed(3)}%`,
      '--slider-pointer': `${_pointerWidth.toFixed(3)}%`,
    } as React.CSSProperties,
    children,
  };
}

export function renderVolumeSliderRoot(props: VolumeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
const VolumeSliderRoot: ConnectedComponent<VolumeSliderProps, typeof renderVolumeSliderRoot> = toConnectedComponent(
  useVolumeSliderRootState,
  useVolumeSliderRootProps,
  renderVolumeSliderRoot,
  'VolumeSlider.Root',
=======
const VolumeRangeRoot: ConnectedComponent<VolumeRange.Props, typeof renderVolumeRangeRoot> = toConnectedComponent(
  useVolumeRangeRootState,
  useVolumeRangeRootProps,
  renderVolumeRangeRoot,
  'VolumeRange.Root',
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
export function useVolumeSliderTrackProps(props: React.ComponentProps<'div'>, context: VolumeSliderState): VolumeSliderRenderProps {
=======
export function useVolumeRangeTrackProps(
  props: React.ComponentProps<'div'>,
  context: VolumeRange.State,
): VolumeRangeRenderProps {
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
  return {
    ref: useCallback((el: HTMLDivElement) => {
      context.core?.setState({ _trackElement: el });
    }, []),
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: '100%',
    },
  };
}

export function renderVolumeSliderTrack(props: VolumeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeSliderTrack: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeSliderTrack
> = toContextComponent(useVolumeSliderTrackProps, renderVolumeSliderTrack, 'VolumeSlider.Track');

// ============================================================================
// THUMB COMPONENT
// ============================================================================

<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
export function getVolumeSliderThumbProps(props: React.ComponentProps<'div'>, context: VolumeSliderState): VolumeSliderRenderProps {
=======
export function useVolumeRangeThumbProps(
  props: React.ComponentProps<'div'>,
  context: VolumeRange.State,
): VolumeRangeRenderProps {
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'insetInlineStart' : 'insetBlockEnd']: 'var(--slider-fill)',
      [context.orientation === 'horizontal' ? 'top' : 'left']: '50%',
      translate: context.orientation === 'horizontal' ? '-50% -50%' : '-50% 50%',
      position: 'absolute' as const,
    },
  };
}

export function renderVolumeSliderThumb(props: VolumeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeSliderThumb: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeSliderThumb
> = toContextComponent(getVolumeSliderThumbProps, renderVolumeSliderThumb, 'VolumeSlider.Thumb');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export function getVolumeSliderProgressProps(props: React.ComponentProps<'div'>, context: VolumeSliderState): VolumeSliderRenderProps {
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: 'var(--slider-fill, 0%)',
      [context.orientation === 'horizontal' ? 'height' : 'width']: '100%',
      [context.orientation === 'horizontal' ? 'top' : 'bottom']: '0',
      position: 'absolute' as const,
    },
  };
}

export function renderVolumeSliderProgress(props: VolumeSliderRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeSliderProgress: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeSliderProgress
> = toContextComponent(getVolumeSliderProgressProps, renderVolumeSliderProgress, 'VolumeSlider.Progress');

// ============================================================================
// EXPORTS
// ============================================================================

export const VolumeSlider = Object.assign(
  {},
  {
<<<<<<< HEAD:packages/react/react/src/components/VolumeSlider.tsx
    Root: VolumeSliderRoot,
    Track: VolumeSliderTrack,
    Thumb: VolumeSliderThumb,
    Progress: VolumeSliderProgress,
=======
    Root: VolumeRangeRoot,
    Track: VolumeRangeTrack,
    Thumb: VolumeRangeThumb,
    Progress: VolumeRangeProgress,
>>>>>>> 33bb24e (applying lint:fix):packages/react/react/src/components/VolumeRange.tsx
  },
) as {
  Root: typeof VolumeSliderRoot;
  Track: typeof VolumeSliderTrack;
  Thumb: typeof VolumeSliderThumb;
  Progress: typeof VolumeSliderProgress;
};

export default VolumeSlider;
