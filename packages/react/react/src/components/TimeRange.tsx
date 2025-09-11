import * as React from 'react';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Context value for TimeRange component providing time and seek functionality
 */
interface TimeRangeContextValue {
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats time in seconds to MM:SS format
 * @param time - Time in seconds
 * @returns Formatted time string
 */
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TimeRangeContext = React.createContext<TimeRangeContextValue | null>(null);

/**
 * Hook to access TimeRange context
 * @throws Error if used outside of TimeRange.Root component
 * @returns TimeRange context value
 */
export const useTimeRangeContext = (): TimeRangeContextValue => {
  const context = React.useContext(TimeRangeContext);
  if (!context) {
    throw new Error('useTimeRangeContext must be used within a TimeRange.Root component');
  }
  return context;
};

/**
 * Shared state logic for TimeRange components
 * @param _props - Component props (unused)
 * @returns TimeRange state with currentTime, duration, requestSeek, and pointer state
 */
const useTimeRangeStateLogic = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(timeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = React.useMemo(
    () => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore]
  );

  const [mousePosition, setMousePosition] = React.useState<number | null>(null);
  const [hovering, setHovering] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [trackRef, setTrackRef] = React.useState<HTMLDivElement | null>(null);

  // Global pointer event handlers for drag functionality
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

/**
 * Hook for TimeRange state (legacy - kept for backward compatibility)
 * @deprecated Use useRootState instead
 */
export const useTimeRangeState = useTimeRangeStateLogic;

/**
 * Hook for TimeRange props (legacy - kept for backward compatibility)
 * @deprecated Use useRootProps instead
 */
export const useTimeRangeProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  _state: ReturnType<typeof useTimeRangeStateLogic>
) => {
  return {
    /** data attributes for debugging/integration */
    'data-current-time': _state.currentTime,
    'data-duration': _state.duration,
    /** external props spread last to allow for overriding */
    ...props,
  };
};

// ============================================================================
// COMPONENT HOOKS
// ============================================================================

/**
 * Hook for Root component state
 * @param _props - Component props (unused)
 * @returns Root component state
 */
export const useRootState = useTimeRangeStateLogic;

/**
 * Hook for Root component props
 * @param props - Component props
 * @param state - Root component state
 * @returns Root component props with data attributes and pointer event handlers
 */
export const useRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useRootState>
) => {
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

      // If dragging, update the seek time
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

  return {
    /** data attributes for debugging/integration */
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    /** pointer event handlers */
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    /** external props spread last to allow for overriding */
    ...props,
  } as React.PropsWithChildren<{ [k: string]: any }>;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type useTimeRangeState = typeof useTimeRangeState;
export type TimeRangeState = ReturnType<useTimeRangeState>;
export type useTimeRangeProps = typeof useTimeRangeProps;
export type useRootState = typeof useRootState;
export type useRootProps = typeof useRootProps;
type RootState = ReturnType<useRootState>;
type RootProps = ReturnType<useRootProps>;

/**
 * Hook for Track component props
 * @param props - Component props
 * @returns Track component props with accessibility attributes
 */
export const useTrackProps = (props: React.PropsWithChildren<{ [k: string]: any }>) => {
  const { currentTime, duration, setTrackRef } = useTimeRangeContext();

  const currentTimeText = formatTime(currentTime);
  const durationText = formatTime(duration);

  return {
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': (currentTime / duration) * 100,
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    ref: setTrackRef,
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

/**
 * Hook for Thumb component props
 * @param props - Component props
 * @returns Thumb component props with positioning
 */
export const useThumbProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { currentTime, duration } = useTimeRangeContext();
  const ratio = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    style: {
      left: `${ratio}%`,
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

/**
 * Hook for Pointer component props
 * @param props - Component props
 * @returns Pointer component props with hover indication
 */
export const usePointerProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { hovering, mousePosition } = useTimeRangeContext();

  const pointerStyle: React.CSSProperties = {
    width: hovering && mousePosition !== null ? `${mousePosition}%` : '0%',
    ...props.style,
  };

  return {
    style: pointerStyle,
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

/**
 * Hook for Progress component props
 * @param props - Component props
 * @returns Progress component props with width styling
 */
export const useProgressProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { currentTime, duration } = useTimeRangeContext();
  const ratio = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    style: {
      width: `${ratio}%`,
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

// ============================================================================
// COMPONENT TYPE DEFINITIONS
// ============================================================================

export type useTrackProps = typeof useTrackProps;
export type useThumbProps = typeof useThumbProps;
export type usePointerProps = typeof usePointerProps;
export type useProgressProps = typeof useProgressProps;

type TrackProps = ReturnType<useTrackProps>;
type ThumbProps = ReturnType<useThumbProps>;
type PointerProps = ReturnType<usePointerProps>;
type ProgressProps = ReturnType<useProgressProps>;

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Render function for Root component
 * @param props - Root component props
 * @param state - Root component state
 * @returns JSX element
 */
const renderRoot = (props: RootProps, state: RootState) => {
  const contextValue: TimeRangeContextValue = {
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
    <TimeRangeContext.Provider value={contextValue}>
      <div style={props.style} {...props}>
        {props.children}
      </div>
    </TimeRangeContext.Provider>
  );
};

/**
 * Render function for Track component
 * @param props - Track component props
 * @returns JSX element
 */
const renderTrack = (props: TrackProps) => {
  return (
    <div style={props.style} {...props}>
      {props.children}
    </div>
  );
};

/**
 * Render function for Thumb component
 * @param props - Thumb component props
 * @returns JSX element
 */
const renderThumb = (props: ThumbProps) => {
  return <div {...props} />;
};

/**
 * Render function for Pointer component
 * @param props - Pointer component props
 * @returns JSX element
 */
const renderPointer = (props: PointerProps) => {
  return <div {...props} />;
};

/**
 * Render function for Progress component
 * @param props - Progress component props
 * @returns JSX element
 */
const renderProgress = (props: ProgressProps) => {
  return <div {...props} />;
};

// ============================================================================
// COMPOUND COMPONENTS
// ============================================================================

/**
 * Root component that provides context to all child components
 */
const Root = toConnectedComponent(useRootState, useRootProps, renderRoot, 'TimeRange.Root');

/**
 * Track component that renders the slider track
 */
const Track = toContextComponent(useTrackProps, renderTrack, 'TimeRange.Track');

/**
 * Thumb component that renders the slider thumb
 */
const Thumb = toContextComponent(useThumbProps, renderThumb, 'TimeRange.Thumb');

/**
 * Pointer component that handles click-to-seek functionality
 */
const Pointer = toContextComponent(usePointerProps, renderPointer, 'TimeRange.Pointer');

/**
 * Progress component that shows the current progress
 */
const Progress = toContextComponent(useProgressProps, renderProgress, 'TimeRange.Progress');

// ============================================================================
// COMPOUND COMPONENT EXPORT
// ============================================================================

/**
 * TimeRange compound component
 *
 * Usage:
 * ```tsx
 * <TimeRange.Root>
 *   <TimeRange.Track>
 *     <TimeRange.Progress />
 *     <TimeRange.Thumb />
 *     <TimeRange.Pointer />
 *   </TimeRange.Track>
 * </TimeRange.Root>
 * ```
 *
 * Note: The Track component handles click-to-seek functionality.
 * The Pointer component shows a visual indication of mouse position on hover.
 */
export const TimeRange = Object.assign(
  {},
  {
    Root,
    Track,
    Thumb,
    Pointer,
    Progress,
  }
) as {
  Root: typeof Root;
  Track: typeof Track;
  Thumb: typeof Thumb;
  Pointer: typeof Pointer;
  Progress: typeof Progress;
};

export default TimeRange;
