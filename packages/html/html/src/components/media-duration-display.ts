import {
  toConnectedHTMLComponent,
  StateHook,
  PropsHook,
} from '../utils/component-factory';
import { durationDisplayStateDefinition } from '@vjs-10/media-store';
import { namedNodeMapToObject } from '../utils/element-utils.js';

export function getTemplateHTML(
  this: typeof DurationDisplayBase,
  _attrs: Record<string, string>,
  _props: Record<string, any> = {},
) {
  return /* html */ `
    <span></span>
  `;
}

export class DurationDisplayBase extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };
  static getTemplateHTML = getTemplateHTML;

  _state:
    | {
        duration: number | undefined;
        isValidDuration: boolean;
        formattedDuration: string;
        durationPhrase: string;
      }
    | undefined;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow(
        (this.constructor as typeof DurationDisplayBase).shadowRootOptions,
      );

      const attrs = namedNodeMapToObject(this.attributes);
      const html = (
        this.constructor as typeof DurationDisplayBase
      ).getTemplateHTML(attrs);
      const shadowRoot = this.shadowRoot as unknown as ShadowRoot;
      shadowRoot.setHTMLUnsafe
        ? shadowRoot.setHTMLUnsafe(html)
        : (shadowRoot.innerHTML = html);
    }
  }

  get duration() {
    return this._state?.duration;
  }

  get formattedDuration() {
    return this._state?.formattedDuration || '--:--';
  }

  get durationPhrase() {
    return this._state?.durationPhrase || 'Duration unknown';
  }

  _update(_props: any, state: any) {
    this._state = state;
    
    // Update the span content
    const spanElement = this.shadowRoot?.querySelector('span') as HTMLElement;
    if (spanElement) {
      spanElement.textContent = state.formattedDuration;
    }
  }
}

/**
 * DurationDisplay state hook - equivalent to React's useDurationDisplayState
 * Handles media store state subscription and transformation
 */
export const useDurationDisplayState: StateHook<{
  duration: number | undefined;
  isValidDuration: boolean;
  formattedDuration: string;
  durationPhrase: string;
}> = {
  keys: [...durationDisplayStateDefinition.keys],
  transform: (rawState, _mediaStore) => ({
    ...durationDisplayStateDefinition.stateTransform(rawState),
    // Duration display is read-only, so no request methods needed
  }),
};

/**
 * DurationDisplay props hook - equivalent to React's useDurationDisplayProps
 * Handles element attributes and properties based on state
 */
export const useDurationDisplayProps: PropsHook<{
  duration: number | undefined;
  isValidDuration: boolean;
  formattedDuration: string;
  durationPhrase: string;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

/**
 * Connected DurationDisplay component using hook-style architecture
 * Equivalent to React's DurationDisplay = toConnectedComponent(...)
 */
export const DurationDisplay = toConnectedHTMLComponent(
  DurationDisplayBase,
  useDurationDisplayState,
  useDurationDisplayProps,
  'DurationDisplay',
);

// Register the custom element
if (!globalThis.customElements.get('media-duration-display')) {
  // @ts-ignore - Custom element constructor compatibility
  globalThis.customElements.define('media-duration-display', DurationDisplay);
}

export default DurationDisplay;