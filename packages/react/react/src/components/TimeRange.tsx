import type { ConnectedComponent } from '../utils/component-factory';
import type { PointerEvent, PropsWithChildren } from 'react';

import { useCallback, useMemo, useState } from 'react';

import { timeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Utility functions for pointer position and seek time calculations
const calculatePointerRatio = (clientX: number, rect: DOMRect): number => {
  const x = clientX - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
};

const calculateSeekTimeFromRatio = (ratio: number, duration: number): number => {
  return (ratio / 100) * duration;
};

const calculateSeekTimeFromPointerEvent = (e: PointerEvent<HTMLDivElement>, duration: number): number => {
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = calculatePointerRatio(e.clientX, rect);
  return calculateSeekTimeFromRatio(ratio, duration);
};

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const useTimeRangeRootState = (
  _props: any
): {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  pointerPosition: number | null;
  setPointerPosition: (pos: number | null) => void;
  hovering: boolean;
  setHovering: (hovering: boolean) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  trackRef: HTMLDivElement | null;
  setTrackRef: (el: HTMLDivElement | null) => void;
} => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(timeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = useMemo(() => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  const { requestSeek } = methods;
  const [pointerPosition, setPointerPosition] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [trackRef, setTrackRef] = useState<HTMLDivElement | null>(null);

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek,
    pointerPosition,
    setPointerPosition,
    hovering,
    setHovering,
    dragging,
    setDragging,
    trackRef,
    setTrackRef,
  };
};

export const useTimeRangeRootProps = (
  props: PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useTimeRangeRootState>
) => {
  // When dragging, use pointer position for immediate feedback; otherwise use current time
  const sliderFill =
    state.dragging && state.pointerPosition !== null
      ? state.pointerPosition
      : state.duration > 0
        ? (state.currentTime / state.duration) * 100
        : 0;

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      state.setDragging(true);
      const seekTime = calculateSeekTimeFromPointerEvent(e, state.duration);
      state.requestSeek(seekTime);

      // Capture pointer events to ensure we receive move and up events even if pointer leaves element
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [state.setDragging, state.requestSeek, state.duration]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!state.trackRef) return;

      const rect = state.trackRef.getBoundingClientRect();
      const ratio = calculatePointerRatio(e.clientX, rect);
      state.setPointerPosition(ratio);

      if (state.dragging) {
        const seekTime = calculateSeekTimeFromRatio(ratio, state.duration);
        state.requestSeek(seekTime);
      }
    },
    [state.trackRef, state.setPointerPosition, state.dragging, state.requestSeek, state.duration]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (state.dragging && state.trackRef && state.pointerPosition !== null) {
        const seekTime = calculateSeekTimeFromRatio(state.pointerPosition, state.duration);
        state.requestSeek(seekTime);
      }
      state.setDragging(false);
    },
    [state.dragging, state.trackRef, state.pointerPosition, state.requestSeek, state.duration, state.setDragging]
  );

  const handlePointerEnter = useCallback(() => {
    state.setHovering(true);
  }, [state.setHovering]);

  const handlePointerLeave = useCallback(() => {
    state.setHovering(false);
  }, [state.setHovering]);

  const currentTimeText = formatTime(state.currentTime);
  const durationText = formatTime(state.duration);

  return {
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': sliderFill,
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    style: {
      ...props.style,
      '--slider-fill': `${sliderFill.toFixed(3)}%`,
      '--slider-pointer':
        state.hovering && state.pointerPosition !== null ? `${state.pointerPosition.toFixed(3)}%` : '0%',
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
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
  const { setTrackRef } = context;

  return {
    ref: setTrackRef,
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

export const useTimeRangeThumbProps = (props: React.HTMLAttributes<HTMLDivElement>): React.HTMLAttributes<HTMLDivElement> => {
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

export const useTimeRangePointerProps = (props: React.HTMLAttributes<HTMLDivElement>): React.HTMLAttributes<HTMLDivElement> => {
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

export const useTimeRangeProgressProps = (props: React.HTMLAttributes<HTMLDivElement>): React.HTMLAttributes<HTMLDivElement> => {
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
