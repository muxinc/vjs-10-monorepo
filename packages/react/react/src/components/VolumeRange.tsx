import type { ConnectedComponent } from '../utils/component-factory';
import type { ChangeEvent, PropsWithChildren } from 'react';

import { useMemo } from 'react';

import { volumeRangeStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent } from '../utils/component-factory';

export const useVolumeRangeState = (
  _props: any
): {
  volume: number;
  muted: boolean;
  volumeLevel: 'off' | 'low' | 'medium' | 'high';
  requestVolumeChange: (volume: number) => void;
} => {
  const mediaStore = useMediaStore();

  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(volumeRangeStateDefinition.stateTransform, shallowEqual);

  const methods = useMemo(() => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  return {
    volume: mediaState.volume,
    muted: mediaState.muted,
    volumeLevel: mediaState.volumeLevel,
    requestVolumeChange: methods.requestVolumeChange,
  };
};

export type useVolumeRangeState = typeof useVolumeRangeState;

export type VolumeRangeState = ReturnType<useVolumeRangeState>;

export const useVolumeRangeProps = (
  props: PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useVolumeRangeState>
): Record<string, any> => {
  const displayValue = state.muted ? 0 : state.volume;

  const baseProps: Record<string, any> = {
    /** @TODO These should probably be defined in the render function (CJP) */
    /** input properties */
    type: 'range',
    min: '0',
    max: '1',
    step: '0.01',
    value: displayValue,
    /** aria attributes/props */
    'aria-label': 'Volume',
    'aria-valuetext': `${Math.round(displayValue * 100)}%`,
    /** data attributes */
    'data-muted': state.muted,
    'data-volume-level': state.volumeLevel,
    /** external props spread last to allow for overriding */
    ...props,
  };

  return baseProps;
};

export type useVolumeRangeProps = typeof useVolumeRangeProps;
type VolumeRangeProps = ReturnType<useVolumeRangeProps>;

/**
 * @TODO This is just a simple render function to demonstrate functionality.
 * A full implementation will need to implement a "compound component" architecture. (CJP)
 **/
export const renderVolumeRange = (props: VolumeRangeProps, state: VolumeRangeState): JSX.Element => {
  return (
    <input
      {...props}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        /** @ts-ignore */
        if (props.disabled) return;
        state.requestVolumeChange(parseFloat(e.target.value));
      }}
    />
  );
};

export type renderVolumeRange = typeof renderVolumeRange;

/**
 * @TODO When implementing compound components, this function may need to be swapped out, modified, or augmented in some way or another. (CJP)
 */
export const VolumeRange: ConnectedComponent<VolumeRangeProps, typeof renderVolumeRange> = toConnectedComponent(
  useVolumeRangeState,
  useVolumeRangeProps,
  renderVolumeRange,
  'VolumeRange'
);

export default VolumeRange;
