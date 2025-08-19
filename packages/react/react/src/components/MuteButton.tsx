import { useMediaDispatch, useMediaSelector } from '@vjs-10/react-media-store';
import * as React from 'react';
import type { ElementType, PropsWithChildren } from 'react';

type DefaultMuteButtonState = { volumeLevel: string; muted: boolean };
type DefaultMuteButtonEventCallbacks = {
  onmediamuterequest: (event: Pick<CustomEvent, 'type'>) => void;
  onmediaunmuterequest: (event: Pick<CustomEvent, 'type'>) => void;
};
type ComponentType = ElementType<
  PropsWithChildren<
    Partial<DefaultMuteButtonState & DefaultMuteButtonEventCallbacks>
  >
>;

export const useMuteButtonState = (_props: any) => {
  /** @TODO Fix type issues with hooks (CJP) */
  const volumeLevel = useMediaSelector(
    (state: any) => state.mediaVolumeLevel,
  ) as string;
  const muted = useMediaSelector((state: any) => state.mediaMuted) as boolean;

  const dispatch = useMediaDispatch();
  const requestMute = React.useCallback(() => {
    dispatch({ type: 'mediamuterequest' });
  }, [dispatch]);
  const requestUnmute = React.useCallback(() => {
    dispatch({ type: 'mediaunmuterequest' });
  }, [dispatch]);

  return {
    volumeLevel,
    muted,
    requestMute,
    requestUnmute,
  } as const;
};

export type useMuteButtonState = typeof useMuteButtonState;
export type MuteButtonState = ReturnType<useMuteButtonState>;

export const useMuteButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useMuteButtonState>,
) => {
  return {
    /** data attributes/props */
    ['data-muted']: state.muted,
    ['data-volume-level']: state.volumeLevel,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    ['aria-label']: state.muted ? 'unmute' : 'mute',
    /** tooltip */
    ['data-tooltip']: state.muted ? 'Unmute' : 'Mute',
    /** external props spread last to allow for overriding */
    ...props,
  };
};

export type useMuteButtonProps = typeof useMuteButtonProps;
type MuteButtonProps = ReturnType<useMuteButtonProps>;

export const renderMuteButton = (
  props: MuteButtonProps,
  state: MuteButtonState,
) => {
  return (
    <button
      {...props}
      onClick={() => {
        /** @ts-ignore */
        if (props.disabled) return;
        if (state.muted) {
          state.requestUnmute();
        } else {
          state.requestMute();
        }
      }}
    >
      {props.children}
    </button>
  );
};

export type renderMuteButton = typeof renderMuteButton;

export const toConnectedComponent = (
  useStateHook: useMuteButtonState,
  usePropsHook: useMuteButtonProps,
  defaultRender: renderMuteButton,
  displayName: string,
) => {
  const ConnectedComponent = ({
    render = defaultRender,
    ...props
  }: MuteButtonProps & { render: renderMuteButton }) => {
    const connectedState = useStateHook(props);
    const connectedProps = usePropsHook(props, connectedState);
    return render(connectedProps, connectedState);
  };

  ConnectedComponent.displayName = displayName;
  return ConnectedComponent;
};

export const MuteButton = toConnectedComponent(
  useMuteButtonState,
  useMuteButtonProps,
  renderMuteButton,
  'MuteButton',
);
export default MuteButton;
