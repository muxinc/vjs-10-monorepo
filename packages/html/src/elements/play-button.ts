import type { PlayButtonState } from '@videojs/core/store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { playButtonStateDefinition } from '@videojs/core/store';

import { setAttributes } from '@videojs/utils/dom';
import { toConnectedHTMLComponent } from '../utils/component-factory';
import { ButtonElement } from './button';

export class PlayButton extends ButtonElement {
  _state: { paused: boolean; requestPlay: () => void; requestPause: () => void } | undefined;

  handleEvent(event: Event): void {
    super.handleEvent(event);

    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      if (state.paused) {
        state.requestPlay();
      } else {
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
    setAttributes(this, props);
  }
}

export const getPlayButtonState: StateHook<{ paused: boolean }> = {
  keys: playButtonStateDefinition.keys,
  transform: (rawState, mediaStore) => ({
    ...playButtonStateDefinition.stateTransform(rawState),
    ...playButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

export const getPlayButtonProps: PropsHook<{ paused: boolean }> = (state, _element) => {
  const baseProps: Record<string, any> = {
    /** data attributes/props */
    'data-paused': state.paused,
    /** @TODO Need another state provider in core for i18n (CJP) */
    /** aria attributes/props */
    role: 'button',
    tabindex: '0',
    'aria-label': state.paused ? 'play' : 'pause',
    /** tooltip */
    'data-tooltip': state.paused ? 'Play' : 'Pause',
    /** @TODO Figure out how we want to handle attr overrides (e.g. aria-label) (CJP) */
    /** external props spread last to allow for overriding */
    // ...props,
  };

  return baseProps;
};

export const PlayButtonElement: ConnectedComponentConstructor<PlayButtonState> = toConnectedHTMLComponent(
  PlayButton,
  getPlayButtonState,
  getPlayButtonProps,
  'PlayButton',
);
