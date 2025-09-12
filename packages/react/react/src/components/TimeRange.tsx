import * as React from 'react';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ============================================================================
// ROOT COMPONENT
// ============================================================================

interface TimeRangeRootContextValue {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
  mousePosition: number | null;
  setMousePosition: (position: number | null) => void;
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

  const [mousePosition, setMousePosition] = React.useState<number | null>(null);
  const [hovering, setHovering] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [trackRef, setTrackRef] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!dragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!trackRef) return;

      const rect = trackRef.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const seekTime = (ratio / 100) * mediaState.duration;
      methods.requestSeek(seekTime);
    };

    const handleGlobalPointerUp = () => {
      setDragging(false);
    };

    document.addEventListener('pointermove', handleGlobalPointerMove);
    document.addEventListener('pointerup', handleGlobalPointerUp);

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [dragging, trackRef, mediaState.duration, methods]);

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek: methods.requestSeek,
    mousePosition,
    setMousePosition,
    hovering,
    setHovering,
    dragging,
    setDragging,
    setTrackRef,
  } as const;
};

export const useTimeRangeRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useTimeRangeRootState>
) => {
  const { currentTime, duration, hovering, mousePosition } = state;
  const sliderFill = duration > 0 ? (currentTime / duration) * 100 : 0;

  const calculateSeekTime = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(100, (x / rect.width) * 100));
      return (ratio / 100) * state.duration;
    },
    [state.duration]
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      state.setDragging(true);
      const seekTime = calculateSeekTime(e);
      state.requestSeek(seekTime);
    },
    [state.setDragging, state.requestSeek, calculateSeekTime]
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      state.setMousePosition(percentage);

      if (state.dragging) {
        const seekTime = calculateSeekTime(e);
        state.requestSeek(seekTime);
      }
    },
    [state.setMousePosition, state.dragging, state.requestSeek, calculateSeekTime]
  );

  const handlePointerUp = React.useCallback(() => {
    state.setDragging(false);
  }, [state.setDragging]);

  const handlePointerEnter = React.useCallback(() => {
    state.setHovering(true);
  }, [state.setHovering]);

  const handlePointerLeave = React.useCallback(() => {
    state.setHovering(false);
    state.setMousePosition(null);
  }, [state.setHovering, state.setMousePosition]);

  const currentTimeText = formatTime(currentTime);
  const durationText = formatTime(duration);

  return {
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': (currentTime / duration) * 100,
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    style: {
      ...props.style,
      '--slider-fill': `${Math.round(sliderFill)}%`,
      '--slider-pointer': hovering && mousePosition !== null ? `${Math.round(mousePosition)}%` : '0%',
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
  const contextValue: TimeRangeRootContextValue = {
    currentTime: state.currentTime,
    duration: state.duration,
    requestSeek: state.requestSeek,
    mousePosition: state.mousePosition,
    setMousePosition: state.setMousePosition,
    hovering: state.hovering,
    setHovering: state.setHovering,
    dragging: state.dragging,
    setDragging: state.setDragging,
    setTrackRef: state.setTrackRef,
  };

  return (
    <TimeRangeRootContext.Provider value={contextValue}>
      <div style={props.style} {...props}>
        {props.children}
      </div>
    </TimeRangeRootContext.Provider>
  );
};

const TimeRangeRoot = toConnectedComponent(useTimeRangeRootState, useTimeRangeRootProps, renderTimeRangeRoot, 'TimeRange.Root');

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

const TimeRangeTrack = toContextComponent(useTimeRangeTrackProps, renderTimeRangeTrack, 'TimeRange.Track');

// ============================================================================
// THUMB COMPONENT
// ============================================================================

export const useTimeRangeThumbProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

type useTimeRangeThumbProps = typeof useTimeRangeThumbProps;
type TimeRangeThumbProps = ReturnType<useTimeRangeThumbProps>;

export const renderTimeRangeThumb = (props: TimeRangeThumbProps) => {
  return <div {...props} />;
};

const TimeRangeThumb = toContextComponent(useTimeRangeThumbProps, renderTimeRangeThumb, 'TimeRange.Thumb');

// ============================================================================
// POINTER COMPONENT
// ============================================================================

export const useTimeRangePointerProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

type useTimeRangePointerProps = typeof useTimeRangePointerProps;
type TimeRangePointerProps = ReturnType<useTimeRangePointerProps>;

export const renderTimeRangePointer = (props: TimeRangePointerProps) => {
  return <div {...props} />;
};

const TimeRangePointer = toContextComponent(useTimeRangePointerProps, renderTimeRangePointer, 'TimeRange.Pointer');

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export const useTimeRangeProgressProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

type useTimeRangeProgressProps = typeof useTimeRangeProgressProps;
type TimeRangeProgressProps = ReturnType<useTimeRangeProgressProps>;

export const renderTimeRangeProgress = (props: TimeRangeProgressProps) => {
  return <div {...props} />;
};

const TimeRangeProgress = toContextComponent(useTimeRangeProgressProps, renderTimeRangeProgress, 'TimeRange.Progress');

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
