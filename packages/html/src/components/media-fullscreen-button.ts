import type { FullscreenButtonState } from '@vjs-10/core/store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { fullscreenButtonStateDefinition } from '@vjs-10/core/store';

import { setAttributes } from '@vjs-10/utils/dom';
import { toConnectedHTMLComponent } from '../utils/component-factory';
import { MediaChromeButton } from './media-chrome-button';

export class FullscreenButtonBase extends MediaChromeButton {
  _state:
    | {
      fullscreen: boolean;
      requestEnterFullscreen: () => void;
      requestExitFullscreen: () => void;
    }
    | undefined;

  handleEvent(event: Event): void {
    super.handleEvent(event);

    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      if (state.fullscreen) {
        state.requestExitFullscreen();
      } else {
        state.requestEnterFullscreen();
      }
    }
  }

  get fullscreen(): boolean {
    return this._state?.fullscreen ?? false;
  }

  _update(props: any, state: any, _mediaStore?: any): void {
    this._state = state;
    /** @TODO Follow up with React vs. W.C. data-* attributes discrepancies (CJP)  */
    setAttributes(this, props);
  }
}

/**
 * FullscreenButton state hook - equivalent to React's useFullscreenButtonState
 * Handles media store state subscription and transformation
 */
export const getFullscreenButtonState: StateHook<{ fullscreen: boolean }> = {
  keys: fullscreenButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...fullscreenButtonStateDefinition.stateTransform(rawState),
    ...fullscreenButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const getFullscreenButtonProps: PropsHook<{ fullscreen: boolean }> = (state, _element) => {
  const baseProps: Record<string, any> = {
    /** data attributes/props */
    'data-fullscreen': state.fullscreen,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    tabindex: '0',
    'aria-label': state.fullscreen ? 'exit fullscreen' : 'enter fullscreen',
    /** tooltip */
    'data-tooltip': state.fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
    /** @TODO Figure out how we want to handle attr overrides (e.g. aria-label) (CJP) */
    /** external props spread last to allow for overriding */
    // ...props,
  };

  return baseProps;
};

export const FullscreenButton: ConnectedComponentConstructor<FullscreenButtonState> = toConnectedHTMLComponent(
  FullscreenButtonBase,
  getFullscreenButtonState,
  getFullscreenButtonProps,
  'FullscreenButton',
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-fullscreen-button')) {
  globalThis.customElements.define('media-fullscreen-button', FullscreenButton);
}

export default FullscreenButton;
