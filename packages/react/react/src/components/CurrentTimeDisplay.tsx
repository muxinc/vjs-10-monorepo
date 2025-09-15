import { shallowEqual, useMediaSelector } from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';
import {
  currentTimeDisplayStateDefinition,
  formatDisplayTime,
} from '@vjs-10/media-store';

export const useCurrentTimeDisplayState = (_props: any) => {
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    currentTimeDisplayStateDefinition.stateTransform,
    shallowEqual,
  );

  // Current time display is read-only, no request methods needed
  return {
    currentTime: mediaState.currentTime,
    duration: mediaState.duration,
  } as const;
};

export type useCurrentTimeDisplayState = typeof useCurrentTimeDisplayState;
export type CurrentTimeDisplayState = ReturnType<useCurrentTimeDisplayState>;

export const useCurrentTimeDisplayProps = (
  props: React.PropsWithChildren<{ showRemaining?: boolean; [k: string]: any }>,
  _state: ReturnType<typeof useCurrentTimeDisplayState>,
) => {
  const baseProps: Record<string, any> = {
    /** external props spread last to allow for overriding */
    ...props,
  };

  return baseProps;
};

export type useCurrentTimeDisplayProps = typeof useCurrentTimeDisplayProps;
type CurrentTimeDisplayProps = ReturnType<useCurrentTimeDisplayProps>;

export const renderCurrentTimeDisplay = (
  props: CurrentTimeDisplayProps,
  state: CurrentTimeDisplayState,
) => {
  const { showRemaining, ...restProps } = props;

  /** @TODO Should this live here or elsewhere? (CJP) */
  const timeLabel =
    showRemaining && state.duration != null && state.currentTime != null
      ? formatDisplayTime(-(state.duration - state.currentTime))
      : formatDisplayTime(state.currentTime);

  return <span {...restProps}>{timeLabel}</span>;
};

export type renderCurrentTimeDisplay = typeof renderCurrentTimeDisplay;

export const CurrentTimeDisplay = toConnectedComponent(
  useCurrentTimeDisplayState,
  useCurrentTimeDisplayProps,
  renderCurrentTimeDisplay,
  'CurrentTimeDisplay',
);
export default CurrentTimeDisplay;
