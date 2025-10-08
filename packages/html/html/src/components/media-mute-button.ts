import type { MuteButtonState } from '@vjs-10/media-store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { muteButtonStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';
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
    // Make generic
    this.toggleAttribute('data-muted', props['data-muted']);
    this.setAttribute('data-volume-level', props['data-volume-level']);
    this.setAttribute('role', props.role);
    this.setAttribute('aria-label', props['aria-label']);
    this.setAttribute('data-tooltip', props['data-tooltip']);
  }
}

export const useMuteButtonState: StateHook<{
  muted: boolean;
  volumeLevel: string;
}> = {
  keys: muteButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...muteButtonStateDefinition.stateTransform(rawState),
    ...muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const useMuteButtonProps: PropsHook<{
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
  useMuteButtonState,
  useMuteButtonProps,
  'MuteButton',
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-mute-button')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-mute-button', MuteButton);
}

export default MuteButton;
