import {
  shallowEqual,
  // useMediaDispatch,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import * as React from 'react';
import { toConnectedComponent } from '../utils/component-factory';

/**
 * MuteButton state hook - equivalent to React's useMuteButtonState
 * Handles media store state subscription and transformation
 */
export const muteButtonStateDef = {
  keys: ['muted', 'volumeLevel'],
  stateTransform: (rawState: any) => ({
    muted: rawState.muted ?? false,
    volumeLevel: rawState.volumeLevel ?? 'off',
  }),
  /** @TODO Consider "promoting" this up to state-mediator defs + media store (CJP) */
  requestMethods: (mediaStore: ReturnType<typeof useMediaStore>) => {
    return {
      requestMute() {
        const type = 'muterequest';
        mediaStore.dispatch({ type });
      },
      requestUnmute() {
        const type = 'unmuterequest';
        mediaStore.dispatch({ type });
      },
    };
  },
} as const;

export const useMuteButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(
    muteButtonStateDef.stateTransform,
    shallowEqual,
  );

  const [methods, setMethods] = React.useState(
    muteButtonStateDef.requestMethods(mediaStore),
  );

  React.useEffect(() => {
    setMethods(muteButtonStateDef.requestMethods(mediaStore));
  }, [mediaStore]);

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
