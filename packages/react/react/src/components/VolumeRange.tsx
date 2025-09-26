import type { ConnectedComponent } from '../utils/component-factory';
import type { PropsWithChildren } from 'react';

import { useCallback, useMemo } from 'react';

import { VolumeRange as CoreVolumeRange } from '@vjs-10/core';
import { volumeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent, toContextComponent, useCore } from '../utils/component-factory';

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const useVolumeRangeRootState = (
  _props: any
): {
  volume: number;
  muted: boolean;
  volumeLevel: string;
  requestVolumeChange: (volume: number) => void;
  core: CoreVolumeRange;
} => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(volumeRangeStateDefinition.stateTransform, shallowEqual);
  const mediaMethods = useMemo(
    () => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore]
  );
  const core = useCore(CoreVolumeRange, { ...mediaState, ...mediaMethods });

  return {
    ...mediaState,
    ...mediaMethods,
    core,
  };
};

export const useVolumeRangeRootProps = (
  props: PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useVolumeRangeRootState>
) => {
  const { _fillWidth, _pointerWidth, _volumeText } = state.core.getState();

  return {
    ref: useCallback((el: HTMLDivElement) => {
      state.core?.attach(el);
    }, []),
    role: 'slider',
    'aria-label': 'Volume',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': _fillWidth,
    'aria-valuetext': _volumeText,
    'data-muted': state.muted,
    'data-volume-level': state.volumeLevel,
    style: {
      ...props.style,
      '--slider-fill': `${_fillWidth.toFixed(3)}%`,
      '--slider-pointer': `${_pointerWidth.toFixed(3)}%`,
    },
    ...props,
  } as PropsWithChildren<{ [k: string]: any }>;
};

type useVolumeRangeRootState = typeof useVolumeRangeRootState;
type useVolumeRangeRootProps = typeof useVolumeRangeRootProps;
type VolumeRangeRootProps = ReturnType<useVolumeRangeRootProps>;

export const renderVolumeRangeRoot = (props: VolumeRangeRootProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeRoot: ConnectedComponent<VolumeRangeRootProps, typeof renderVolumeRangeRoot> = toConnectedComponent(
  useVolumeRangeRootState,
  useVolumeRangeRootProps,
  renderVolumeRangeRoot,
  'VolumeRange.Root'
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export const useVolumeRangeTrackProps = (
  props: PropsWithChildren<Record<string, unknown>>,
  context: any
): PropsWithChildren<Record<string, unknown>> & { ref?: any } => {
  return {
    ref: useCallback((el: HTMLDivElement) => {
      context.core?.setState({ _trackElement: el });
    }, []),
    ...props,
  };
};

type useVolumeRangeTrackProps = typeof useVolumeRangeTrackProps;
type VolumeRangeTrackProps = ReturnType<useVolumeRangeTrackProps>;

export const renderVolumeRangeTrack = (props: VolumeRangeTrackProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeTrack: ConnectedComponent<VolumeRangeTrackProps, typeof renderVolumeRangeTrack> = toContextComponent(
  useVolumeRangeTrackProps,
  renderVolumeRangeTrack,
  'VolumeRange.Track'
);

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useVolumeRangeThumbProps = (
  props: React.HTMLAttributes<HTMLDivElement>
): React.HTMLAttributes<HTMLDivElement> => {
  return {
    ...props,
    style: {
      ...props.style,
      insetInlineStart: 'var(--slider-fill)',
      position: 'absolute' as const,
      top: '50%',
      transform: 'translate(-50%, -50%)',
    },
  };
};

type useVolumeRangeThumbProps = typeof useVolumeRangeThumbProps;
type VolumeRangeThumbProps = ReturnType<useVolumeRangeThumbProps>;

export const renderVolumeRangeThumb = (props: VolumeRangeThumbProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeThumb: ConnectedComponent<VolumeRangeThumbProps, typeof renderVolumeRangeThumb> = toContextComponent(
  useVolumeRangeThumbProps,
  renderVolumeRangeThumb,
  'VolumeRange.Thumb'
);

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useVolumeRangeProgressProps = (
  props: React.HTMLAttributes<HTMLDivElement>
): React.HTMLAttributes<HTMLDivElement> => {
  return {
    ...props,
    style: {
      ...props.style,
      width: 'var(--slider-fill, 0%)',
      position: 'absolute' as const,
      height: '100%',
    },
  };
};

type useVolumeRangeProgressProps = typeof useVolumeRangeProgressProps;
type VolumeRangeProgressProps = ReturnType<useVolumeRangeProgressProps>;

export const renderVolumeRangeProgress = (props: VolumeRangeProgressProps): JSX.Element => {
  return <div {...props} />;
};

const VolumeRangeProgress: ConnectedComponent<VolumeRangeProgressProps, typeof renderVolumeRangeProgress> =
  toContextComponent(useVolumeRangeProgressProps, renderVolumeRangeProgress, 'VolumeRange.Progress');

// ============================================================================
// EXPORTS
// ============================================================================

export const VolumeRange = Object.assign(
  {},
  {
    Root: VolumeRangeRoot,
    Track: VolumeRangeTrack,
    Thumb: VolumeRangeThumb,
    Progress: VolumeRangeProgress,
  }
) as {
  Root: typeof VolumeRangeRoot;
  Track: typeof VolumeRangeTrack;
  Thumb: typeof VolumeRangeThumb;
  Progress: typeof VolumeRangeProgress;
};

export default VolumeRange;
