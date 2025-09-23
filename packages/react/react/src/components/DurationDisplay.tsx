import type { ConnectedComponent } from '../utils/component-factory';
import type { PropsWithChildren } from 'react';

import { durationDisplayStateDefinition, formatDisplayTime } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector } from '@vjs-10/react-media-store';

import { toConnectedComponent } from '../utils/component-factory';

export const useDurationDisplayState = (
  _props: any
): {
  duration: number;
} => {
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(durationDisplayStateDefinition.stateTransform, shallowEqual);

  // Duration display is read-only, no request methods needed
  return {
    duration: mediaState.duration ?? 0,
  };
};

export type useDurationDisplayState = typeof useDurationDisplayState;
export type DurationDisplayState = ReturnType<useDurationDisplayState>;

export const useDurationDisplayProps = (props: PropsWithChildren): PropsWithChildren<Record<string, unknown>> => {
  const baseProps: Record<string, any> = {
    /** external props spread last to allow for overriding */
    ...props,
  };

  return baseProps;
};

export type useDurationDisplayProps = typeof useDurationDisplayProps;
type DurationDisplayProps = ReturnType<useDurationDisplayProps>;

export const renderDurationDisplay = (props: DurationDisplayProps, state: DurationDisplayState): JSX.Element => {
  return <span {...props}>{formatDisplayTime(state.duration)}</span>;
};

export type renderDurationDisplay = typeof renderDurationDisplay;

export const DurationDisplay: ConnectedComponent<DurationDisplayProps, typeof renderDurationDisplay> =
  toConnectedComponent(useDurationDisplayState, useDurationDisplayProps, renderDurationDisplay, 'DurationDisplay');

export default DurationDisplay;
