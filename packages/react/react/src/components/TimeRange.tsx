import * as React from 'react';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { timeRangeStateDefinition } from '@vjs-10/media-store';

import { toConnectedComponent, toContextComponent } from '../utils/component-factory';

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

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TimeRangeContext = React.createContext<TimeRangeContextValue | null>(null);

export const useTimeRangeContext = (): TimeRangeContextValue => {
  const context = React.useContext(TimeRangeContext);
  if (!context) {
    throw new Error('useTimeRangeContext must be used within a TimeRange.Root component');
  }
  return context;
};

const useRootState = (_props: any) => {
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

const useRootProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useRootState>
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

type useRootState = typeof useRootState;
type useRootProps = typeof useRootProps;
type RootState = ReturnType<useRootState>;
type RootProps = ReturnType<useRootProps>;

const useTrackProps = (props: React.PropsWithChildren<{ [k: string]: any }>) => {
  const { setTrackRef } = useTimeRangeContext();

  return {
    ref: setTrackRef,
    ...props,
  };
};

const useThumbProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

const usePointerProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

const useProgressProps = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return {
    ...props,
  };
};

type useTrackProps = typeof useTrackProps;
type useThumbProps = typeof useThumbProps;
type usePointerProps = typeof usePointerProps;
type useProgressProps = typeof useProgressProps;

type TrackProps = ReturnType<useTrackProps>;
type ThumbProps = ReturnType<useThumbProps>;
type PointerProps = ReturnType<usePointerProps>;
type ProgressProps = ReturnType<useProgressProps>;

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

const renderTrack = (props: TrackProps) => {
  return <div {...props} />;
};

const renderThumb = (props: ThumbProps) => {
  return <div {...props} />;
};

const renderPointer = (props: PointerProps) => {
  return <div {...props} />;
};

const renderProgress = (props: ProgressProps) => {
  return <div {...props} />;
};


const Root = toConnectedComponent(useRootState, useRootProps, renderRoot, 'TimeRange.Root');

const Track = toContextComponent(useTrackProps, renderTrack, 'TimeRange.Track');

const Thumb = toContextComponent(useThumbProps, renderThumb, 'TimeRange.Thumb');

const Pointer = toContextComponent(usePointerProps, renderPointer, 'TimeRange.Pointer');

const Progress = toContextComponent(useProgressProps, renderProgress, 'TimeRange.Progress');


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
