import type { ConnectedComponent } from '../utils/component-factory';
import type { TimeRangeState as CoreTimeRangeState } from '@vjs-10/core';
import type { MutableRefObject, PropsWithChildren } from 'react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TimeRange as CoreTimeRange } from '@vjs-10/core';
import { timeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const useTimeRangeRootState = (
  _props: any
): {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  coreRef: MutableRefObject<CoreTimeRange | null>;
} => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(timeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = useMemo(() => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  const { requestSeek } = methods;

  const [_coreState, onCoreStateChange] = useState<CoreTimeRangeState | null>(null);
  const coreRef = useRef<CoreTimeRange | null>(null);
  if (!coreRef.current) {
    coreRef.current = new CoreTimeRange();
  }

  useEffect(() => {
    if (coreRef.current) {
      coreRef.current.onStateChange(onCoreStateChange);
    }
  }, [coreRef]);

  coreRef.current.setState({
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek,
  });

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek,
    coreRef,
  };
};

export const useTimeRangeRootProps = (
  props: PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useTimeRangeRootState>
) => {
  const {
    _fillWidth = 0,
    _pointerWidth = 0,
    _currentTimeText = '0',
    _durationText = '0',
  } = state.coreRef.current?.getState() ?? {};

  return {
    ref: useCallback((el: HTMLDivElement) => {
      state.coreRef.current?.attach(el);
    }, []),
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': _fillWidth,
    'aria-valuetext': `${_currentTimeText} of ${_durationText}`,
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    style: {
      ...props.style,
      '--slider-fill': `${_fillWidth.toFixed(3)}%`,
      '--slider-pointer': `${_pointerWidth.toFixed(3)}%`,
    },
    ...props,
  } as PropsWithChildren<{ [k: string]: any }>;
};

type useTimeRangeRootState = typeof useTimeRangeRootState;
type useTimeRangeRootProps = typeof useTimeRangeRootProps;
type TimeRangeRootProps = ReturnType<useTimeRangeRootProps>;

export const renderTimeRangeRoot = (props: TimeRangeRootProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeRoot: ConnectedComponent<TimeRangeRootProps, typeof renderTimeRangeRoot> = toConnectedComponent(
  useTimeRangeRootState,
  useTimeRangeRootProps,
  renderTimeRangeRoot,
  'TimeRange.Root'
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export const useTimeRangeTrackProps = (
  props: PropsWithChildren<Record<string, unknown>>,
  context: any
): PropsWithChildren<Record<string, unknown>> & { ref?: any } => {
  return {
    ref: useCallback((el: HTMLDivElement) => {
      context.coreRef.current?.setState({ _trackElement: el });
    }, []),
    ...props,
  };
};

type useTimeRangeTrackProps = typeof useTimeRangeTrackProps;
type TimeRangeTrackProps = ReturnType<useTimeRangeTrackProps>;

export const renderTimeRangeTrack = (props: TimeRangeTrackProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeTrack: ConnectedComponent<TimeRangeTrackProps, typeof renderTimeRangeTrack> = toContextComponent(
  useTimeRangeTrackProps,
  renderTimeRangeTrack,
  'TimeRange.Track'
);

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useTimeRangeThumbProps = (
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

type useTimeRangeThumbProps = typeof useTimeRangeThumbProps;
type TimeRangeThumbProps = ReturnType<useTimeRangeThumbProps>;

export const renderTimeRangeThumb = (props: TimeRangeThumbProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeThumb: ConnectedComponent<TimeRangeThumbProps, typeof renderTimeRangeThumb> = toContextComponent(
  useTimeRangeThumbProps,
  renderTimeRangeThumb,
  'TimeRange.Thumb'
);

// ============================================================================
// POINTER COMPONENT
// ============================================================================

export const useTimeRangePointerProps = (
  props: React.HTMLAttributes<HTMLDivElement>
): React.HTMLAttributes<HTMLDivElement> => {
  return {
    ...props,
    style: {
      ...props.style,
      width: 'var(--slider-pointer, 0%)',
      position: 'absolute' as const,
      height: '100%',
    },
  };
};

type useTimeRangePointerProps = typeof useTimeRangePointerProps;
type TimeRangePointerProps = ReturnType<useTimeRangePointerProps>;

export const renderTimeRangePointer = (props: TimeRangePointerProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangePointer: ConnectedComponent<TimeRangePointerProps, typeof renderTimeRangePointer> = toContextComponent(
  useTimeRangePointerProps,
  renderTimeRangePointer,
  'TimeRange.Pointer'
);

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useTimeRangeProgressProps = (
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

type useTimeRangeProgressProps = typeof useTimeRangeProgressProps;
type TimeRangeProgressProps = ReturnType<useTimeRangeProgressProps>;

export const renderTimeRangeProgress = (props: TimeRangeProgressProps): JSX.Element => {
  return <div {...props} />;
};

const TimeRangeProgress: ConnectedComponent<TimeRangeProgressProps, typeof renderTimeRangeProgress> =
  toContextComponent(useTimeRangeProgressProps, renderTimeRangeProgress, 'TimeRange.Progress');

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
