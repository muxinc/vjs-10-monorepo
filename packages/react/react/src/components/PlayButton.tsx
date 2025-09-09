import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';
import { playButtonStateDefinition } from './state-definitions/play-button';

export const usePlayButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    playButtonStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => playButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    paused: mediaState.paused,
    requestPlay: methods.requestPlay,
    requestPause: methods.requestPause,
  } as const;
};

export type usePlayButtonState = typeof usePlayButtonState;
export type PlayButtonState = ReturnType<usePlayButtonState>;

export const usePlayButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof usePlayButtonState>,
) => {
  const baseProps: Record<string, any> = {
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    ['aria-label']: state.paused ? 'play' : 'pause',
    /** tooltip */
    ['data-tooltip']: state.paused ? 'Play' : 'Pause',
    /** external props spread last to allow for overriding */
    ...props,
  };

  // Handle boolean data attribute: present with empty string when true, absent when false
  if (state.paused) {
    baseProps['data-paused'] = '';
  }

  return baseProps;
};

export type usePlayButtonProps = typeof usePlayButtonProps;
type PlayButtonProps = ReturnType<usePlayButtonProps>;

export const renderPlayButton = (
  props: PlayButtonProps,
  state: PlayButtonState,
) => {
  return (
    <button
      {...props}
      onClick={() => {
        /** @ts-ignore */
        if (props.disabled) return;
        if (state.paused) {
          state.requestPlay();
        } else {
          state.requestPause();
        }
      }}
    >
      {props.children}
    </button>
  );
};

export type renderPlayButton = typeof renderPlayButton;

export const PlayButton = toConnectedComponent(
  usePlayButtonState,
  usePlayButtonProps,
  renderPlayButton,
  'PlayButton',
);
export default PlayButton;
