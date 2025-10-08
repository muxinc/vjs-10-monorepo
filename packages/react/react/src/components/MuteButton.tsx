import type { PropsWithChildren } from 'react';
import type { ConnectedComponent } from '../utils/component-factory';

import { muteButtonStateDefinition } from '@vjs-10/media-store';

import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';
import { useMemo } from 'react';

import { toConnectedComponent } from '../utils/component-factory';

export function useMuteButtonState(_props: any): {
  volumeLevel: string;
  muted: boolean;
  requestMute: () => void;
  requestUnmute: () => void;
} {
  const mediaStore = useMediaStore();

  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(muteButtonStateDefinition.stateTransform, shallowEqual);

  const methods = useMemo(() => muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch), [mediaStore]);

  return {
    volumeLevel: mediaState.volumeLevel,
    muted: mediaState.muted,
    requestMute: methods.requestMute,
    requestUnmute: methods.requestUnmute,
  } as const;
}

export type useMuteButtonState = typeof useMuteButtonState;
export type MuteButtonState = ReturnType<useMuteButtonState>;

export function useMuteButtonProps(props: PropsWithChildren, state: ReturnType<typeof useMuteButtonState>): PropsWithChildren<Record<string, unknown>> {
  const baseProps: Record<string, any> = {
    /** data attributes/props - non-boolean */
    'data-volume-level': state.volumeLevel,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    'aria-label': state.muted ? 'unmute' : 'mute',
    /** tooltip */
    'data-tooltip': state.muted ? 'Unmute' : 'Mute',
    /** external props spread last to allow for overriding */
    ...props,
  };

  // Handle boolean data attribute: present with empty string when true, absent when false
  if (state.muted) {
    baseProps['data-muted'] = '';
  }

  return baseProps;
}

export type useMuteButtonProps = typeof useMuteButtonProps;
type MuteButtonProps = ReturnType<useMuteButtonProps>;

export function renderMuteButton(props: MuteButtonProps, state: MuteButtonState): JSX.Element {
  return (
    <button
      {...props}
      onClick={() => {
        /** @ts-ignore */
        if (props.disabled) return;
        if (state.volumeLevel === 'off') {
          state.requestUnmute();
        } else {
          state.requestMute();
        }
      }}
    >
      {props.children}
    </button>
  );
}

export type renderMuteButton = typeof renderMuteButton;

export const MuteButton: ConnectedComponent<MuteButtonProps, typeof renderMuteButton> = toConnectedComponent(
  useMuteButtonState,
  useMuteButtonProps,
  renderMuteButton,
  'MuteButton',
);

export default MuteButton;
