import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

export const useTimeRangeState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    timeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek: methods.requestSeek,
  } as const;
};

export type useTimeRangeState = typeof useTimeRangeState;
export type TimeRangeState = ReturnType<useTimeRangeState>;

export const useTimeRangeProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  _state: ReturnType<typeof useTimeRangeState>,
) => {
  // Since renderTimeRange now uses compound components, we only need to pass through
  // the basic props that would be useful for the Root container
  return {
    /** data attributes for debugging/integration */
    'data-current-time': _state.currentTime,
    'data-duration': _state.duration,
    /** external props spread last to allow for overriding */
    ...props,
  };
};

export type useTimeRangeProps = typeof useTimeRangeProps;
type TimeRangeProps = ReturnType<useTimeRangeProps>;

// Component-specific state and props functions

// Root component - no state needed, just basic props
export const useRootState = (_props: any) => {
  return {} as const;
};

export const useRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  _state: ReturnType<typeof useRootState>,
) => {
  return {
    ...props,
  };
};

export type useRootState = typeof useRootState;
export type useRootProps = typeof useRootProps;
type RootState = ReturnType<useRootState>;
type RootProps = ReturnType<useRootProps>;

// Track component - needs currentTime and duration for ARIA
export const useTrackState = (_props: any) => {
  const mediaState = useMediaSelector(
    timeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
  } as const;
};

export const useTrackProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useTrackState>,
) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeText = formatTime(state.currentTime);
  const durationText = formatTime(state.duration);

  return {
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': (state.currentTime / state.duration) * 100,
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type useTrackState = typeof useTrackState;
export type useTrackProps = typeof useTrackProps;
type TrackState = ReturnType<useTrackState>;
type TrackProps = ReturnType<useTrackProps>;

// Thumb component - needs currentTime and duration for positioning
export const useThumbState = (_props: any) => {
  const mediaState = useMediaSelector(
    timeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
  } as const;
};

export const useThumbProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
  state: ReturnType<typeof useThumbState>,
) => {
  const ratio = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return {
    style: {
      position: 'absolute' as const,
      left: `${ratio}%`,
      transform: 'translateX(-50%)',
      width: '16px',
      height: '16px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      border: '2px solid #007bff',
      cursor: 'pointer',
      zIndex: 2,
      top: '50%',
      marginTop: '-8px',
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type useThumbState = typeof useThumbState;
export type useThumbProps = typeof useThumbProps;
type ThumbState = ReturnType<useThumbState>;
type ThumbProps = ReturnType<useThumbProps>;

// Pointer component - needs duration and requestSeek for click handling
export const usePointerState = (_props: any) => {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(
    timeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => timeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    duration: mediaState.duration,
    requestSeek: methods.requestSeek,
  } as const;
};

export const usePointerProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
  state: ReturnType<typeof usePointerState>,
) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = (x / rect.width) * 100;
    const seekTime = (ratio / 100) * state.duration;
    state.requestSeek(seekTime);
  };

  return {
    onClick: handleClick,
    style: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      cursor: 'pointer',
      zIndex: 1,
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type usePointerState = typeof usePointerState;
export type usePointerProps = typeof usePointerProps;
type PointerState = ReturnType<usePointerState>;
type PointerProps = ReturnType<usePointerProps>;

// Progress component - needs currentTime and duration for width
export const useProgressState = (_props: any) => {
  const mediaState = useMediaSelector(
    timeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
  } as const;
};

export const useProgressProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
  state: ReturnType<typeof useProgressState>,
) => {
  const ratio = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return {
    style: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      height: '100%',
      width: `${ratio}%`,
      backgroundColor: '#007bff',
      borderRadius: 'inherit',
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type useProgressState = typeof useProgressState;
export type useProgressProps = typeof useProgressProps;
type ProgressState = ReturnType<useProgressState>;
type ProgressProps = ReturnType<useProgressProps>;

// Compound Components

const renderRoot = (
  props: RootProps,
  _state: RootState,
) => {
  return (
    <div 
      style={{
        position: 'relative',
        minWidth: '100px',
        ...props.style,
      }}
      {...props}
    >
      {props.children}
    </div>
  );
};

const Root = toConnectedComponent(
  useRootState,
  useRootProps,
  renderRoot,
  'TimeRange.Root',
);

const renderTrack = (
  props: TrackProps,
  _state: TrackState,
) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        ...props.style,
      }}
      {...props}
    >
      {props.children}
    </div>
  );
};

const Track = toConnectedComponent(
  useTrackState,
  useTrackProps,
  renderTrack,
  'TimeRange.Track',
);

const renderThumb = (
  props: ThumbProps,
  _state: ThumbState,
) => {
  return (
    <div
      {...props}
    />
  );
};

const Thumb = toConnectedComponent(
  useThumbState,
  useThumbProps,
  renderThumb,
  'TimeRange.Thumb',
);

const renderPointer = (
  props: PointerProps,
  _state: PointerState,
) => {
  return (
    <div
      {...props}
    />
  );
};

const Pointer = toConnectedComponent(
  usePointerState,
  usePointerProps,
  renderPointer,
  'TimeRange.Pointer',
);

const renderProgress = (
  props: ProgressProps,
  _state: ProgressState,
) => {
  return (
    <div
      {...props}
    />
  );
};

const Progress = toConnectedComponent(
  useProgressState,
  useProgressProps,
  renderProgress,
  'TimeRange.Progress',
);

export const renderTimeRange = (
  props: TimeRangeProps,
  _state: TimeRangeState,
) => {
  return (
    <TimeRange.Root {...props}>
      <TimeRange.Track>
        <TimeRange.Progress />
        <TimeRange.Pointer />
      </TimeRange.Track>
      <TimeRange.Thumb />
    </TimeRange.Root>
  );
};

export type renderTimeRange = typeof renderTimeRange;

/**
 * @TODO When implementing compound components, this function may need to be swapped out, modified, or augmented in some way or another. (CJP)
 */
const TimeRangeComponent = toConnectedComponent(
  useTimeRangeState,
  useTimeRangeProps,
  renderTimeRange,
  'TimeRange',
);

// Create compound component with proper typing
export const TimeRange = Object.assign(TimeRangeComponent, {
  Root,
  Track,
  Thumb,
  Pointer,
  Progress,
}) as typeof TimeRangeComponent & {
  Root: typeof Root;
  Track: typeof Track;
  Thumb: typeof Thumb;
  Pointer: typeof Pointer;
  Progress: typeof Progress;
};

export default TimeRange;
