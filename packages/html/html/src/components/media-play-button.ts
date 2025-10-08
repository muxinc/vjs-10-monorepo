import type { PlayButtonState } from '@vjs-10/media-store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { playButtonStateDefinition } from '@vjs-10/media-store';

import { toConnectedHTMLComponent } from '../utils/component-factory';
import { MediaChromeButton } from './media-chrome-button';

export class PlayButtonBase extends MediaChromeButton {
  _state: { paused: boolean; requestPlay: () => void; requestPause: () => void } | undefined;

  constructor() {
    super();
  }

  handleEvent(event: Event): void {
    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      if (state.paused) {
        state.requestPlay();
      }
      else {
        state.requestPause();
      }
    }
  }

  get paused(): boolean {
    return this._state?.paused ?? true;
  }

  _update(props: any, state: any, _mediaStore?: any): void {
    this._state = state;
    /** @TODO Follow up with React vs. W.C. data-* attributes discrepancies (CJP)  */
    // Make generic
    this.toggleAttribute('data-paused', props['data-paused']);
    this.setAttribute('role', props.role);
    this.setAttribute('aria-label', props['aria-label']);
    this.setAttribute('data-tooltip', props['data-tooltip']);
  }
}

export const usePlayButtonState: StateHook<{ paused: boolean }> = {
  keys: playButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...playButtonStateDefinition.stateTransform(rawState),
    ...playButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const usePlayButtonProps: PropsHook<{ paused: boolean }> = (state, _element) => {
  const baseProps: Record<string, any> = {
    /** data attributes/props */
    'data-paused': state.paused,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    'role': 'button',
    'aria-label': state.paused ? 'play' : 'pause',
    /** tooltip */
    'data-tooltip': state.paused ? 'Play' : 'Pause',
    /** @TODO Figure out how we want to handle attr overrides (e.g. aria-label) (CJP) */
    /** external props spread last to allow for overriding */
    // ...props,
  };

  return baseProps;
};

export const PlayButton: ConnectedComponentConstructor<PlayButtonState> = toConnectedHTMLComponent(
  PlayButtonBase,
  usePlayButtonState,
  usePlayButtonProps,
  'PlayButton',
);

// NOTE: In this architecture it will be important to decouple component class definitions from their registration in the CustomElementsRegistry. (CJP)
if (!globalThis.customElements.get('media-play-button')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-play-button', PlayButton);
}

export default PlayButton;
