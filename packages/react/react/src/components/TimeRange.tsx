import type { ConnectedComponent } from '../utils/component-factory';

import { useCallback, useMemo } from 'react';

import { TimeRange as CoreTimeRange } from '@vjs-10/core';
import { timeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent, toContextComponent, useCore } from '../utils/component-factory';

export namespace TimeRange {
  export interface State {
    currentTime: number;
    duration: number;
    requestSeek: (time: number) => void;
    core: CoreTimeRange;
    orientation: 'horizontal' | 'vertical';
  }

  export interface Props extends React.ComponentProps<'div'> {
    orientation?: 'horizontal' | 'vertical';
  }
}

interface TimeRangeRenderProps extends React.ComponentProps<'div'> {
  'data-orientation'?: 'horizontal' | 'vertical';
  'data-current-time'?: number;
  'data-duration'?: number;
}

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const useTimeRangeRootState = (props: TimeRange.Props): TimeRange.State => {
  const { orientation = 'horizontal' } = props;
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(timeRangeStateDefinition.stateTransform, shallowEqual);
  const mediaMethods = useMemo(() => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);
  const core = useCore(CoreTimeRange, { ...mediaState, ...mediaMethods });

  return {
    ...mediaState,
    ...mediaMethods,
    orientation,
    core,
  };
};

export const useTimeRangeRootProps = (props: TimeRange.Props, state: TimeRange.State): TimeRangeRenderProps => {
  const { _fillWidth, _pointerWidth, _currentTimeText, _durationText } = state.core.getState();

  const { children, className, id, style, orientation = 'horizontal' } = props;

  return {
    ref: useCallback((el: HTMLDivElement) => {
      state.core?.attach(el);
    }, []),
    id,
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': _fillWidth,
    'aria-valuetext': `${_currentTimeText} of ${_durationText}`,
    'aria-orientation': orientation,
    'data-orientation': orientation,
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    className,
    style: {
      ...style,
      '--slider-fill': `${_fillWidth.toFixed(3)}%`,
      '--slider-pointer': `${_pointerWidth.toFixed(3)}%`,
    } as React.CSSProperties,
    children,
  };
};

type useTimeRangeRootState = typeof useTimeRangeRootState;
type useTimeRangeRootProps = typeof useTimeRangeRootProps;

export const renderTimeRangeRoot = (props: TimeRangeRenderProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeRoot: ConnectedComponent<TimeRange.Props, typeof renderTimeRangeRoot> = toConnectedComponent(
  useTimeRangeRootState,
  useTimeRangeRootProps,
  renderTimeRangeRoot,
  'TimeRange.Root'
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export const useTimeRangeTrackProps = (
  props: React.ComponentProps<'div'>,
  context: TimeRange.State
): TimeRangeRenderProps => {
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
};

type useTimeRangeTrackProps = typeof useTimeRangeTrackProps;

export const renderTimeRangeTrack = (props: TimeRangeRenderProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeTrack: ConnectedComponent<React.ComponentProps<'div'>, typeof renderTimeRangeTrack> = toContextComponent(
  useTimeRangeTrackProps,
  renderTimeRangeTrack,
  'TimeRange.Track'
);

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useTimeRangeThumbProps = (
  props: React.ComponentProps<'div'>,
  context: TimeRange.State
): TimeRangeRenderProps => {
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
};

type useTimeRangeThumbProps = typeof useTimeRangeThumbProps;

export const renderTimeRangeThumb = (props: TimeRangeRenderProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeThumb: ConnectedComponent<React.ComponentProps<'div'>, typeof renderTimeRangeThumb> = toContextComponent(
  useTimeRangeThumbProps,
  renderTimeRangeThumb,
  'TimeRange.Thumb'
);

// ============================================================================
// POINTER COMPONENT
// ============================================================================

export const useTimeRangePointerProps = (
  props: React.ComponentProps<'div'>,
  context: TimeRange.State
): TimeRangeRenderProps => {
  return {
    'data-orientation': context.orientation,
    ...props,
    style: {
      ...props.style,
      [context.orientation === 'horizontal' ? 'width' : 'height']: 'var(--slider-pointer, 0%)',
      [context.orientation === 'horizontal' ? 'height' : 'width']: '100%',
      position: 'absolute' as const,
    },
  };
};

type useTimeRangePointerProps = typeof useTimeRangePointerProps;

export const renderTimeRangePointer = (props: TimeRangeRenderProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangePointer: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderTimeRangePointer
> = toContextComponent(useTimeRangePointerProps, renderTimeRangePointer, 'TimeRange.Pointer');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useTimeRangeProgressProps = (
  props: React.ComponentProps<'div'>,
  context: TimeRange.State
): TimeRangeRenderProps => {
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
};

type useTimeRangeProgressProps = typeof useTimeRangeProgressProps;

export const renderTimeRangeProgress = (props: TimeRangeRenderProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeProgress: ConnectedComponent<
  React.ComponentProps<'div'>,
  typeof renderTimeRangeProgress
> = toContextComponent(useTimeRangeProgressProps, renderTimeRangeProgress, 'TimeRange.Progress');

// ============================================================================
// EXPORTS
// ============================================================================

export const TimeRange = Object.assign(
  {},
  {
    Root: TimeRangeRoot,
    Track: TimeRangeTrack,
    Thumb: TimeRangeThumb,
    Pointer: TimeRangePointer,
    Progress: TimeRangeProgress,
  }
) as {
  Root: typeof TimeRangeRoot;
  Track: typeof TimeRangeTrack;
  Thumb: typeof TimeRangeThumb;
  Pointer: typeof TimeRangePointer;
  Progress: typeof TimeRangeProgress;
};

export default TimeRange;
