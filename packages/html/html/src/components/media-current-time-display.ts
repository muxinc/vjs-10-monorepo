import {
  toConnectedHTMLComponent,
  StateHook,
  PropsHook,
} from '../utils/component-factory';
import {
  currentTimeDisplayStateDefinition,
  formatDisplayTime,
} from '@vjs-10/media-store';
import { namedNodeMapToObject } from '../utils/element-utils.js';

export function getTemplateHTML(
  this: typeof CurrentTimeDisplayBase,
  _attrs: Record<string, string>,
  _props: Record<string, any> = {},
) {
  return /* html */ `
    <span></span>
  `;
}

export class CurrentTimeDisplayBase extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };
  static getTemplateHTML = getTemplateHTML;
  static observedAttributes = ['show-remaining'];

  _state:
    | {
        currentTime: number | undefined;
        duration: number | undefined;
      }
    | undefined;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow(
        (this.constructor as typeof CurrentTimeDisplayBase).shadowRootOptions,
      );

      const attrs = namedNodeMapToObject(this.attributes);
      const html = (
        this.constructor as typeof CurrentTimeDisplayBase
      ).getTemplateHTML(attrs);
      const shadowRoot = this.shadowRoot as unknown as ShadowRoot;
      shadowRoot.setHTMLUnsafe
        ? shadowRoot.setHTMLUnsafe(html)
        : (shadowRoot.innerHTML = html);
    }
  }

  get currentTime() {
    return this._state?.currentTime;
  }

  get duration() {
    return this._state?.duration;
  }

  get showRemaining() {
    return this.hasAttribute('show-remaining');
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ) {
    if (name === 'show-remaining' && this._state) {
      // Re-render with current state when show-remaining attribute changes
      this._update({}, this._state);
    }
  }

  _update(_props: any, state: any) {
    this._state = state;

    // Update the span content with formatted time
    const spanElement = this.shadowRoot?.querySelector('span') as HTMLElement;
    if (spanElement) {
      if (
        this.showRemaining &&
        state.duration != null &&
        state.currentTime != null
      ) {
        // Show remaining time: duration - currentTime
        const remainingTime = state.duration - state.currentTime;
        spanElement.textContent = `-${formatDisplayTime(remainingTime)}`;
      } else {
        // Show current time (default behavior)
        spanElement.textContent = formatDisplayTime(state.currentTime);
      }
    }
  }
}

/**
 * CurrentTimeDisplay state hook - equivalent to React's useCurrentTimeDisplayState
 * Handles media store state subscription and transformation
 */
export const useCurrentTimeDisplayState: StateHook<{
  currentTime: number | undefined;
  duration: number | undefined;
}> = {
  keys: [...currentTimeDisplayStateDefinition.keys],
  transform: (rawState, _mediaStore) => ({
    ...currentTimeDisplayStateDefinition.stateTransform(rawState),
    // Current time display is read-only, so no request methods needed
  }),
};

/**
 * CurrentTimeDisplay props hook - equivalent to React's useCurrentTimeDisplayProps
 * Handles element attributes and properties based on state
 */
export const useCurrentTimeDisplayProps: PropsHook<{
  currentTime: number | undefined;
  duration: number | undefined;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

/**
 * Connected CurrentTimeDisplay component using hook-style architecture
 * Equivalent to React's CurrentTimeDisplay = toConnectedComponent(...)
 */
export const CurrentTimeDisplay = toConnectedHTMLComponent(
  CurrentTimeDisplayBase,
  useCurrentTimeDisplayState,
  useCurrentTimeDisplayProps,
  'CurrentTimeDisplay',
);

// Register the custom element
if (!globalThis.customElements.get('media-current-time-display')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define(
    'media-current-time-display',
    CurrentTimeDisplay,
  );
}

export default CurrentTimeDisplay;
