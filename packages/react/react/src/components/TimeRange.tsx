import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent, toContextComponent } from '../utils/component-factory';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

// Root context for TimeRange component
interface TimeRangeContextValue {
  currentTime: number;
  duration: number;
  requestSeek: (time: number) => void;
}

const TimeRangeContext = React.createContext<TimeRangeContextValue | null>(null);

export const useTimeRangeContext = () => {
  const context = React.useContext(TimeRangeContext);
  if (!context) {
    throw new Error('useTimeRangeContext must be used within a TimeRange.Root component');
  }
  return context;
};

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

// Component-specific state and props functions

// Root component - provides context to children
export const useRootState = (_props: any) => {
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
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
    requestSeek: methods.requestSeek,
  } as const;
};

export const useRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useRootState>,
) => {
  return {
    /** data attributes for debugging/integration */
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    /** external props spread last to allow for overriding */
    ...props,
  } as React.PropsWithChildren<{ [k: string]: any }>;
};

export type useRootState = typeof useRootState;
export type useRootProps = typeof useRootProps;
type RootState = ReturnType<useRootState>;
type RootProps = ReturnType<useRootProps>;

// Track component - uses context for currentTime and duration
export const useTrackProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
) => {
  const { currentTime, duration } = useTimeRangeContext();
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeText = formatTime(currentTime);
  const durationText = formatTime(duration);

  return {
    role: 'slider',
    'aria-label': 'Seek',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': (currentTime / duration) * 100,
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type useTrackProps = typeof useTrackProps;
type TrackProps = ReturnType<useTrackProps>;

// Thumb component - uses context for currentTime and duration
export const useThumbProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
) => {
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

export type useThumbProps = typeof useThumbProps;
type ThumbProps = ReturnType<useThumbProps>;

// Pointer component - uses context for duration and requestSeek
export const usePointerProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
) => {
  const { duration, requestSeek } = useTimeRangeContext();
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = (x / rect.width) * 100;
    const seekTime = (ratio / 100) * duration;
    requestSeek(seekTime);
  };

  return {
    onClick: handleClick,
    style: {
      ...props.style,
    },
    ...props,
  } as React.HTMLAttributes<HTMLDivElement>;
};

export type usePointerProps = typeof usePointerProps;
type PointerProps = ReturnType<usePointerProps>;

// Progress component - uses context for currentTime and duration
export const useProgressProps = (
  props: React.HTMLAttributes<HTMLDivElement>,
) => {
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

export type useProgressProps = typeof useProgressProps;
type ProgressProps = ReturnType<useProgressProps>;

// Compound Components

const renderRoot = (
  props: RootProps,
  state: RootState,
) => {
  const contextValue: TimeRangeContextValue = {
    currentTime: state.currentTime,
    duration: state.duration,
    requestSeek: state.requestSeek,
  };

  return (
    <TimeRangeContext.Provider value={contextValue}>
      <div 
        style={props.style}
        {...props}
      >
        {props.children}
      </div>
    </TimeRangeContext.Provider>
  );
};

const Root = toConnectedComponent(
  useRootState,
  useRootProps,
  renderRoot,
  'TimeRange.Root',
);

const renderTrack = (props: TrackProps) => {
  return (
    <div
      style={props.style}
      {...props}
    >
      {props.children}
    </div>
  );
};

const Track = toContextComponent(
  useTrackProps,
  renderTrack,
  'TimeRange.Track',
);

const renderThumb = (props: ThumbProps) => {
  return (
    <div
      {...props}
    />
  );
};

const Thumb = toContextComponent(
  useThumbProps,
  renderThumb,
  'TimeRange.Thumb',
);

const renderPointer = (props: PointerProps) => {
  return (
    <div
      {...props}
    />
  );
};

const Pointer = toContextComponent(
  usePointerProps,
  renderPointer,
  'TimeRange.Pointer',
);

const renderProgress = (props: ProgressProps) => {
  return (
    <div
      {...props}
    />
  );
};

const Progress = toContextComponent(
  useProgressProps,
  renderProgress,
  'TimeRange.Progress',
);

// Create compound component with proper typing
export const TimeRange = Object.assign({}, {
  Root,
  Track,
  Thumb,
  Pointer,
  Progress,
}) as {
  Root: typeof Root;
  Track: typeof Track;
  Thumb: typeof Thumb;
  Pointer: typeof Pointer;
  Progress: typeof Progress;
};

export default TimeRange;
