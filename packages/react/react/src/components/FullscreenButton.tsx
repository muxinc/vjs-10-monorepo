import * as React from 'react';

import { fullscreenButtonStateDefinition } from '@vjs-10/media-store';
import { shallowEqual, useMediaSelector, useMediaStore } from '@vjs-10/react-media-store';

import { toConnectedComponent } from '../utils/component-factory';

export const useFullscreenButtonState = (_props: any) => {
  const mediaStore = useMediaStore();
  /** @TODO Fix type issues with hooks (CJP) */
  const mediaState = useMediaSelector(fullscreenButtonStateDefinition.stateTransform, shallowEqual);

  const methods = React.useMemo(
    () => fullscreenButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore]
  );

  return {
    fullscreen: mediaState.fullscreen,
    requestEnterFullscreen: methods.requestEnterFullscreen,
    requestExitFullscreen: methods.requestExitFullscreen,
  } as const;
};

export type useFullscreenButtonState = typeof useFullscreenButtonState;
export type FullscreenButtonState = ReturnType<useFullscreenButtonState>;

export const useFullscreenButtonProps = (
  props: React.PropsWithChildren<{ [k: string]: any }>,
  state: ReturnType<typeof useFullscreenButtonState>
) => {
  const baseProps: Record<string, any> = {
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    ['aria-label']: state.fullscreen ? 'exit fullscreen' : 'enter fullscreen',
    /** tooltip */
    ['data-tooltip']: state.fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
    /** external props spread last to allow for overriding */
    ...props,
  };

  // Handle boolean data attribute: present with empty string when true, absent when false
  if (state.fullscreen) {
    baseProps['data-fullscreen'] = '';
  }

  return baseProps;
};

export type useFullscreenButtonProps = typeof useFullscreenButtonProps;
type FullscreenButtonProps = ReturnType<useFullscreenButtonProps>;

export const renderFullscreenButton = (props: FullscreenButtonProps, state: FullscreenButtonState) => {
  return (
    <button
      {...props}
      onClick={() => {
        /** @ts-ignore */
        if (props.disabled) return;
        if (state.fullscreen) {
          state.requestExitFullscreen();
        } else {
          state.requestEnterFullscreen();
        }
      }}
    >
      {props.children}
    </button>
  );
};

export type renderFullscreenButton = typeof renderFullscreenButton;

export const FullscreenButton = toConnectedComponent(
  useFullscreenButtonState,
  useFullscreenButtonProps,
  renderFullscreenButton,
  'FullscreenButton'
);
export default FullscreenButton;
