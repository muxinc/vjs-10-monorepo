import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';
import { muteButtonStateDefinition } from '@vjs-10/media-store';

export const useMuteButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    muteButtonStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    volumeLevel: mediaState.volumeLevel,
    muted: mediaState.muted,
    requestMute: methods.requestMute,
    requestUnmute: methods.requestUnmute,
  } as const;
};

export type useMuteButtonState = typeof useMuteButtonState;
export type MuteButtonState = ReturnType<useMuteButtonState>;

export const useMuteButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useMuteButtonState>,
) => {
  const baseProps: Record<string, any> = {
    /** data attributes/props - non-boolean */
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

  // Handle boolean data attribute: present with empty string when true, absent when false
  if (state.muted) {
    baseProps['data-muted'] = '';
  }

  return baseProps;
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

export const MuteButton = toConnectedComponent(
  useMuteButtonState,
  useMuteButtonProps,
  renderMuteButton,
  'MuteButton',
);
export default MuteButton;
