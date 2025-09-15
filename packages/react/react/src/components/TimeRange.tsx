import * as React from 'react';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

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

const calculateSeekTimeFromPointerEvent = (
  e: React.PointerEvent<HTMLDivElement>,
  duration: number
): number => {
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = calculatePointerRatio(e.clientX, rect);
  return calculateSeekTimeFromRatio(ratio, duration);
};

// ============================================================================
// ROOT COMPONENT
// ============================================================================

interface TimeRangeRootContextValue {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  pointerPosition: number | null;
  setPointerPosition: (position: number | null) => void;
  hovering: boolean;
  setHovering: (hovering: boolean) => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  setTrackRef: (ref: HTMLDivElement | null) => void;
}

const TimeRangeRootContext = React.createContext<TimeRangeRootContextValue | null>(null);

export const useTimeRangeRootContext = (): TimeRangeRootContextValue => {
  const context = React.useContext(TimeRangeRootContext);
  if (!context) {
    throw new Error('useTimeRangeRootContext must be used within a TimeRange.Root component');
  }
  return context;
};

export const useTimeRangeRootState = (_props: any) => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(timeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = React.useMemo(
    () => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore]
  );

  const { requestSeek } = methods;
  const [pointerPosition, setPointerPosition] = React.useState<number | null>(null);
  const [hovering, setHovering] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [trackRef, setTrackRef] = React.useState<HTMLDivElement | null>(null);

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
  } as const;
};

export const useTimeRangeRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useTimeRangeRootState>
) => {
  // When dragging, use pointer position for immediate feedback; otherwise use current time
  const sliderFill =
    state.dragging && state.pointerPosition !== null
      ? state.pointerPosition
      : state.duration > 0
        ? (state.currentTime / state.duration) * 100
        : 0;

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      state.setDragging(true);
      const seekTime = calculateSeekTimeFromPointerEvent(e, state.duration);
      state.requestSeek(seekTime);

      // Capture pointer events to ensure we receive move and up events even if pointer leaves element
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [state.setDragging, state.requestSeek, state.duration]
  );

  const handlePointerMove = React.useCallback(
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

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (state.dragging && state.trackRef && state.pointerPosition !== null) {
        const seekTime = calculateSeekTimeFromRatio(state.pointerPosition, state.duration);
        state.requestSeek(seekTime);
      }
      state.setDragging(false);
    },
    [
      state.dragging,
      state.trackRef,
      state.pointerPosition,
      state.requestSeek,
      state.duration,
      state.setDragging,
    ]
  );

  const handlePointerEnter = React.useCallback(() => {
    state.setHovering(true);
  }, [state.setHovering]);

  const handlePointerLeave = React.useCallback(() => {
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
      '--slider-fill': `${Math.round(sliderFill)}%`,
      '--slider-pointer':
        state.hovering && state.pointerPosition !== null
          ? `${Math.round(state.pointerPosition)}%`
          : '0%',
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    ...props,
  } as React.PropsWithChildren<{ [k: string]: any }>;
};

type useTimeRangeRootState = typeof useTimeRangeRootState;
type useTimeRangeRootProps = typeof useTimeRangeRootProps;
type TimeRangeRootState = ReturnType<useTimeRangeRootState>;
type TimeRangeRootProps = ReturnType<useTimeRangeRootProps>;

export const renderTimeRangeRoot = (props: TimeRangeRootProps, state: TimeRangeRootState) => {
  const contextValue: TimeRangeRootContextValue = React.useMemo(
    () => ({
      currentTime: state.currentTime,
      duration: state.duration,
      requestSeek: state.requestSeek,
      pointerPosition: state.pointerPosition,
      setPointerPosition: state.setPointerPosition,
      hovering: state.hovering,
      setHovering: state.setHovering,
      dragging: state.dragging,
      setDragging: state.setDragging,
      setTrackRef: state.setTrackRef,
    }),
    [
      state.currentTime,
      state.duration,
      state.requestSeek,
      state.pointerPosition,
      state.setPointerPosition,
      state.hovering,
      state.setHovering,
      state.dragging,
      state.setDragging,
      state.setTrackRef,
    ]
  );

  return (
    <TimeRangeRootContext.Provider value={contextValue}>
      <div style={props.style} {...props}>
        {props.children}
      </div>
    </TimeRangeRootContext.Provider>
  );
};

const TimeRangeRoot = toConnectedComponent(
  useTimeRangeRootState,
  useTimeRangeRootProps,
  renderTimeRangeRoot,
  'TimeRange.Root'
);

// ============================================================================
// TRACK COMPONENT
// ============================================================================

export const useTimeRangeTrackProps = (props: React.PropsWithChildren<{ [k: string]: any }>) => {
  const { setTrackRef } = useTimeRangeRootContext();

  return {
    ref: setTrackRef,
    ...props,
  };
};

type useTimeRangeTrackProps = typeof useTimeRangeTrackProps;
type TimeRangeTrackProps = ReturnType<useTimeRangeTrackProps>;

export const renderTimeRangeTrack = (props: TimeRangeTrackProps) => {
  return <div {...props} />;
};

const TimeRangeTrack = toContextComponent(
  useTimeRangeTrackProps,
  renderTimeRangeTrack,
  'TimeRange.Track'
);

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useTimeRangeThumbProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
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

export const renderTimeRangeThumb = (props: TimeRangeThumbProps) => {
  return <div {...props} />;
};

const TimeRangeThumb = toContextComponent(
  useTimeRangeThumbProps,
  renderTimeRangeThumb,
  'TimeRange.Thumb'
);

// ============================================================================
// POINTER COMPONENT
// ============================================================================

export const useTimeRangePointerProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
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

export const renderTimeRangePointer = (props: TimeRangePointerProps) => {
  return <div {...props} />;
};

const TimeRangePointer = toContextComponent(
  useTimeRangePointerProps,
  renderTimeRangePointer,
  'TimeRange.Pointer'
);

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useTimeRangeProgressProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
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

export const renderTimeRangeProgress = (props: TimeRangeProgressProps) => {
  return <div {...props} />;
};

const TimeRangeProgress = toContextComponent(
  useTimeRangeProgressProps,
  renderTimeRangeProgress,
  'TimeRange.Progress'
);

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
