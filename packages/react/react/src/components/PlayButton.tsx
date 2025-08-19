import { useMediaDispatch, useMediaSelector } from '@vjs-10/react-media-store';
import * as React from 'react';

export const usePlayButtonState = (_props: any) => {
  /** @TODO Fix type issues with hooks (CJP) */
  const paused = useMediaSelector(
    (state: any) => typeof state.mediaPaused !== 'boolean' || state.mediaPaused,
  ) as boolean;

  const dispatch = useMediaDispatch();
  const requestPlay = React.useCallback(() => {
    dispatch({ type: 'mediaplayrequest' });
  }, [dispatch]);
  const requestPause = React.useCallback(() => {
    dispatch({ type: 'mediapauserequest' });
  }, [dispatch]);

  return {
    paused,
    requestPlay,
    requestPause,
  } as const;
};

export type usePlayButtonState = typeof usePlayButtonState;
export type PlayButtonState = ReturnType<usePlayButtonState>;

export const usePlayButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof usePlayButtonState>,
) => {
  const baseProps = {
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

export const toConnectedComponent = (
  useStateHook: usePlayButtonState,
  usePropsHook: usePlayButtonProps,
  defaultRender: renderPlayButton,
  displayName: string,
) => {
  const ConnectedComponent = ({
    render = defaultRender,
    ...props
  }: PlayButtonProps & { render?: renderPlayButton }) => {
    const connectedState = useStateHook(props);
    const connectedProps = usePropsHook(props, connectedState);
    return render(connectedProps, connectedState);
  };

  ConnectedComponent.displayName = displayName;
  return ConnectedComponent;
};

export const PlayButton = toConnectedComponent(
  usePlayButtonState,
  usePlayButtonProps,
  renderPlayButton,
  'PlayButton',
);
export default PlayButton;