import type { PropsWithChildren } from 'react';
import type { ConnectedComponent } from '../utils/component-factory';

import { playButtonStateDefinition } from '@vjs-10/media-store';

import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { useMemo } from 'react';

import { toConnectedComponent } from '../utils/component-factory';

export function usePlayButtonState(_props: any): {
  paused: boolean;
  requestPlay: () => void;
  requestPause: () => void;
} {
  const mediaStore = useMediaStore();

  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(playButtonStateDefinition.stateTransform, shallowEqual);

  const methods = useMemo(() => playButtonStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  return {
    paused: mediaState.paused,
    requestPlay: methods.requestPlay,
    requestPause: methods.requestPause,
  };
}

export type usePlayButtonState = typeof usePlayButtonState;
export type PlayButtonState = ReturnType<usePlayButtonState>;

export function usePlayButtonProps(props: Record<string, unknown>, state: ReturnType<typeof usePlayButtonState>): PropsWithChildren<Record<string, unknown>> {
  const baseProps: Record<string, any> = {
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    'aria-label': state.paused ? 'play' : 'pause',
    /** tooltip */
    'data-tooltip': state.paused ? 'Play' : 'Pause',
    /** external props spread last to allow for overriding */
    ...props,
  };

  // Handle boolean data attribute: present with empty string when true, absent when false
  if (state.paused) {
    baseProps['data-paused'] = '';
  }

  return baseProps;
}

export type usePlayButtonProps = typeof usePlayButtonProps;
type PlayButtonProps = ReturnType<usePlayButtonProps>;

export function renderPlayButton(props: PlayButtonProps, state: PlayButtonState): JSX.Element {
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
}

export type renderPlayButton = typeof renderPlayButton;

export const PlayButton: ConnectedComponent<PlayButtonProps, typeof renderPlayButton> = toConnectedComponent(
  usePlayButtonState,
  usePlayButtonProps,
  renderPlayButton,
  'PlayButton',
);

export default PlayButton;
