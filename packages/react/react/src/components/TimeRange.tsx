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
  state: ReturnType<typeof useTimeRangeState>,
) => {
  const ratio = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTimeText = formatTime(state.currentTime);
  const durationText = formatTime(state.duration);

  const baseProps: Record<string, any> = {
    /** input properties */
    type: 'range',
    min: '0',
    max: '100',
    step: '0.1',
    value: ratio,
    /** aria attributes/props */
    'aria-label': 'Seek',
    'aria-valuetext': `${currentTimeText} of ${durationText}`,
    /** data attributes */
    'data-current-time': state.currentTime,
    'data-duration': state.duration,
    /** external props spread last to allow for overriding */
    ...props,
  };

  return baseProps;
};

export type useTimeRangeProps = typeof useTimeRangeProps;
type TimeRangeProps = ReturnType<useTimeRangeProps>;

export const renderTimeRange = (
  props: TimeRangeProps,
  state: TimeRangeState,
) => {
  return (
    <input
      {...props}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        /** @ts-ignore */
        if (props.disabled) return;
        const ratio = parseFloat(e.target.value) / 100;
        const seekTime = ratio * state.duration;
        state.requestSeek(seekTime);
      }}
    />
  );
};

export type renderTimeRange = typeof renderTimeRange;

export const TimeRange = toConnectedComponent(
  useTimeRangeState,
  useTimeRangeProps,
  renderTimeRange,
  'TimeRange',
);
export default TimeRange;