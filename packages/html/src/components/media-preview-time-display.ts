import type { PreviewTimeDisplayState } from '@vjs-10/core/store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { previewTimeDisplayStateDefinition } from '@vjs-10/core/store';

import { formatDisplayTime } from '@vjs-10/utils';
import { toConnectedHTMLComponent } from '../utils/component-factory';

export class PreviewTimeDisplayBase extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };

  static observedAttributes: string[] = ['show-remaining'];

  _state:
    | {
      previewTime: number | undefined;
    }
    | undefined;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof PreviewTimeDisplayBase).shadowRootOptions);
    }
  }

  get previewTime(): number {
    return this._state?.previewTime ?? 0;
  }

  get showRemaining(): boolean {
    return this.hasAttribute('show-remaining');
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === 'show-remaining' && this._state) {
      // Re-render with current state when show-remaining attribute changes
      this._update({}, this._state);
    }
  }

  _update(_props: any, state: any): void {
    this._state = state;

    /** @TODO Should this live here or elsewhere? (CJP) */
    const timeLabel = formatDisplayTime(state.previewTime);

    if (this.shadowRoot) {
      this.shadowRoot.textContent = timeLabel;
    }
  }
}

export const usePreviewTimeDisplayState: StateHook<{
  previewTime: number | undefined;
}> = {
  keys: [...previewTimeDisplayStateDefinition.keys],
  transform: (rawState, _mediaStore) => ({
    ...previewTimeDisplayStateDefinition.stateTransform(rawState),
    // Preview time display is read-only, so no request methods needed
  }),
};

export const getPreviewTimeDisplayProps: PropsHook<{
  previewTime: number | undefined;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

export const PreviewTimeDisplay: ConnectedComponentConstructor<PreviewTimeDisplayState> = toConnectedHTMLComponent(
  PreviewTimeDisplayBase,
  usePreviewTimeDisplayState,
  getPreviewTimeDisplayProps,
  'PreviewTimeDisplay',
);

// Register the custom element
if (!globalThis.customElements.get('preview-time-display')) {
  globalThis.customElements.define('preview-time-display', PreviewTimeDisplay);
}

export default PreviewTimeDisplay;
