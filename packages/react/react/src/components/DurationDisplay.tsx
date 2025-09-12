import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';
import { durationDisplayStateDefinition, formatDisplayTime } from '@vjs-10/media-store';

export const useDurationDisplayState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    durationDisplayStateDefinition.stateTransform,
    shallowEqual,
  );

  // Duration display is read-only, no request methods needed
  return {
    duration: mediaState.duration,
  } as const;
};

export type useDurationDisplayState = typeof useDurationDisplayState;
export type DurationDisplayState = ReturnType<useDurationDisplayState>;

export const useDurationDisplayProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useDurationDisplayState>,
) => {
  const baseProps: Record<string, any> = {
    /** external props spread last to allow for overriding */
    ...props,
  };

  return baseProps;
};

export type useDurationDisplayProps = typeof useDurationDisplayProps;
type DurationDisplayProps = ReturnType<useDurationDisplayProps>;

export const renderDurationDisplay = (
  props: DurationDisplayProps,
  state: DurationDisplayState,
) => {
  return (
    <span {...props}>
      {formatDisplayTime(state.duration)}
    </span>
  );
};

export type renderDurationDisplay = typeof renderDurationDisplay;

export const DurationDisplay = toConnectedComponent(
  useDurationDisplayState,
  useDurationDisplayProps,
  renderDurationDisplay,
  'DurationDisplay',
);
export default DurationDisplay;