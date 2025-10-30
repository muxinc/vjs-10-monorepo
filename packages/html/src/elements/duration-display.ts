import type { DurationDisplayState } from '@videojs/core/store';
import type { ConnectedComponentConstructor, PropsHook, StateHook } from '../utils/component-factory';

import { durationDisplayStateDefinition } from '@videojs/core/store';

import { formatDisplayTime } from '@videojs/utils';
import { namedNodeMapToObject } from '@videojs/utils/dom';
import { toConnectedHTMLComponent } from '../utils/component-factory';

export function getTemplateHTML(
  this: typeof DurationDisplay,
  _attrs: Record<string, string>,
  _props: Record<string, any> = {},
) {
  return /* html */ `
    <span></span>
  `;
}

export class DurationDisplay extends HTMLElement {
  static shadowRootOptions = {
    mode: 'open' as ShadowRootMode,
  };

  static getTemplateHTML: typeof getTemplateHTML = getTemplateHTML;

  _state:
    | {
      duration: number | undefined;
    }
    | undefined;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof DurationDisplay).shadowRootOptions);

      const attrs = namedNodeMapToObject(this.attributes);
      const html = (this.constructor as typeof DurationDisplay).getTemplateHTML(attrs);
      const shadowRoot = this.shadowRoot as unknown as ShadowRoot;
      shadowRoot.setHTMLUnsafe ? shadowRoot.setHTMLUnsafe(html) : (shadowRoot.innerHTML = html);
    }
  }

  get duration(): number {
    return this._state?.duration ?? 0;
  }

  _update(_props: any, state: any): void {
    this._state = state;

    // Update the span content with formatted duration
    const spanElement = this.shadowRoot?.querySelector('span') as HTMLElement;
    if (spanElement) {
      spanElement.textContent = formatDisplayTime(state.duration);
    }
  }
}

export const useDurationDisplayState: StateHook<{
  duration: number | undefined;
}> = {
  keys: [...durationDisplayStateDefinition.keys],
  transform: (rawState, _mediaStore) => ({
    ...durationDisplayStateDefinition.stateTransform(rawState),
    // Duration display is read-only, so no request methods needed
  }),
};

export const getDurationDisplayProps: PropsHook<{
  duration: number | undefined;
}> = (_state, _element) => {
  const baseProps: Record<string, any> = {};
  return baseProps;
};

export const DurationDisplayElement: ConnectedComponentConstructor<DurationDisplayState> = toConnectedHTMLComponent(
  DurationDisplay,
  useDurationDisplayState,
  getDurationDisplayProps,
  'DurationDisplay',
);
