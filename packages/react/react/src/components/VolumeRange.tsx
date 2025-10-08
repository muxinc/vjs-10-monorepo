import type { ConnectedComponent } from '../utils/component-factory';

import { VolumeRange as CoreVolumeRange } from '@vjs-10/core';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { useCallback, useMemo } from 'react';

import { toConnectedComponent, toContextComponent, useCore } from '../utils/component-factory';

export namespace VolumeRange {
  export interface State {
    volume: number;
    muted: boolean;
    volumeLevel: string;
    requestVolumeChange: (volume: number) => void;
    core: CoreVolumeRange;
    orientation: 'horizontal' | 'vertical';
  }

  export interface Props extends React.ComponentProps<'div'> {
    orientation?: 'horizontal' | 'vertical';
  }
}

interface VolumeRangeRenderProps extends React.ComponentProps<'div'> {
  'data-orientation'?: 'horizontal' | 'vertical';
  'data-muted'?: boolean;
  'data-volume-level'?: string;
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export function useVolumeRangeRootState(props: VolumeRange.Props): VolumeRange.State {
  const { orientation = 'horizontal' } = props;
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(volumeRangeStateDefinition.stateTransform, shallowEqual);
  const mediaMethods = useMemo(
    () => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );
  const core = useCore(CoreVolumeRange, { ...mediaState, ...mediaMethods });

  return {
    ...mediaState,
    ...mediaMethods,
    orientation,
    core,
  };
}

export function useVolumeRangeRootProps(props: VolumeRange.Props, state: VolumeRange.State): VolumeRangeRenderProps {
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

type useVolumeRangeRootState = typeof useVolumeRangeRootState;
type useVolumeRangeRootProps = typeof useVolumeRangeRootProps;

export function renderVolumeRangeRoot(props: VolumeRangeRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeRangeRoot: ConnectedComponent<VolumeRange.Props, typeof renderVolumeRangeRoot> = toConnectedComponent(
  useVolumeRangeRootState,
  useVolumeRangeRootProps,
  renderVolumeRangeRoot,
  'VolumeRange.Root',
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export function useVolumeRangeTrackProps(props: React.ComponentProps<'div'>, context: VolumeRange.State): VolumeRangeRenderProps {
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

type useVolumeRangeTrackProps = typeof useVolumeRangeTrackProps;

export function renderVolumeRangeTrack(props: VolumeRangeRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeRangeTrack: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeRangeTrack
> = toContextComponent(useVolumeRangeTrackProps, renderVolumeRangeTrack, 'VolumeRange.Track');

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export function useVolumeRangeThumbProps(props: React.ComponentProps<'div'>, context: VolumeRange.State): VolumeRangeRenderProps {
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

type useVolumeRangeThumbProps = typeof useVolumeRangeThumbProps;

export function renderVolumeRangeThumb(props: VolumeRangeRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeRangeThumb: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeRangeThumb
> = toContextComponent(useVolumeRangeThumbProps, renderVolumeRangeThumb, 'VolumeRange.Thumb');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export function useVolumeRangeProgressProps(props: React.ComponentProps<'div'>, context: VolumeRange.State): VolumeRangeRenderProps {
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

type useVolumeRangeProgressProps = typeof useVolumeRangeProgressProps;

export function renderVolumeRangeProgress(props: VolumeRangeRenderProps): JSX.Element {
  return <div {...props} />;
}

const VolumeRangeProgress: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderVolumeRangeProgress
> = toContextComponent(useVolumeRangeProgressProps, renderVolumeRangeProgress, 'VolumeRange.Progress');

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
  },
) as {
  Root: typeof VolumeRangeRoot;
  Track: typeof VolumeRangeTrack;
  Thumb: typeof VolumeRangeThumb;
  Progress: typeof VolumeRangeProgress;
};

export default VolumeRange;
