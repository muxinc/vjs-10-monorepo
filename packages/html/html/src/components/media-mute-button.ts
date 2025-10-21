import type { MuteButtonState } from '@vjs-10/media-store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { muteButtonStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';
import { setAttributes } from '../utils/element-utils';
import { MediaChromeButton } from './media-chrome-button';

export class MuteButtonBase extends MediaChromeButton {
  _state:
    | {
      muted: boolean;
      volumeLevel: string;
      requestMute: () => void;
      requestUnmute: () => void;
    }
    | undefined;

  handleEvent(event: Event): void {
    super.handleEvent(event);

    const { type } = event;
    const state = this._state;

    if (state) {
      if (type === 'click') {
        if (state.volumeLevel === 'off') {
          state.requestUnmute();
        } else {
          state.requestMute();
        }
      }
    }
  }

  get muted(): boolean {
    return this._state?.muted ?? false;
  }

  get volumeLevel(): string {
    return this._state?.volumeLevel ?? 'high';
  }

  _update(props: any, state: any): void {
    this._state = state;
    /** @TODO Follow up with React vs. W.C. data-* attributes discrepancies (CJP)  */
    setAttributes(this, props);
  }
}

export const getMuteButtonState: StateHook<{
  muted: boolean;
  volumeLevel: string;
}> = {
  keys: muteButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...muteButtonStateDefinition.stateTransform(rawState),
    ...muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const getMuteButtonProps: PropsHook<{
  muted: boolean;
  volumeLevel: string;
}> = (state, _element) => {
  const baseProps: Record<string, any> = {
    /** data attributes/props */
    'data-muted': state.muted,
    'data-volume-level': state.volumeLevel,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    tabindex: '0',
    'aria-label': state.muted ? 'unmute' : 'mute',
    /** tooltip */
    'data-tooltip': state.muted ? 'Unmute' : 'Mute',
    /** @TODO Figure out how we want to handle attr overrides (e.g. aria-label) (CJP) */
    /** external props spread last to allow for overriding */
    // ...props,
  };

  return baseProps;
};

export const MuteButton: ConnectedComponentConstructor<MuteButtonState> = toConnectedHTMLComponent(
  MuteButtonBase,
  getMuteButtonState,
  getMuteButtonProps,
  'MuteButton',
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-mute-button')) {
  globalThis.customElements.define('media-mute-button', MuteButton);
}

export default MuteButton;
