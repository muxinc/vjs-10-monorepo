import type { IconType } from '../icons';

import { lazyPaths } from '../icons/lazy';
import { cloneTemplateContent, createTemplate } from '../utils/dom';

const svgTemplate = /* #__PURE__*/ createTemplate(
  `<svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"></svg>`
);

/**
 * The `<vjs-icon>` component dynamically loads and renders our icons.
 *
 * @example
 * ```html
 * <vjs-icon type="play"></vjs-icon>
 * <vjs-icon type="pause"></vjs-icon>
 * ```
 */
export class VjsIconElement extends HTMLElement {
  static tagName = 'vjs-icon';

  static get observedAttributes(): string[] {
    return ['type'];
  }

  private _svg = this._createSVG();
  private _type: IconType | null = null;

  /**
   * The type of icon.
   */
  get type(): IconType | null {
    return this._type;
  }

  set type(type) {
    if (this._type === type) return;

    // Make sure type is reflected as attribute in case the element is cloned.
    if (type) this.setAttribute('type', type);
    else this.removeAttribute('type');

    this._onTypeChange(type);
  }

  attributeChangedCallback(name: string, _: unknown, newValue: string | null): void {
    if (name === 'type') {
      const type = newValue ? (newValue as IconType) : null;
      if (this._type !== type) {
        this._onTypeChange(type);
      }
    }
  }

  connectedCallback(): void {
    // Convenience class for styling.
    this.classList.add('vjs-icon');

    if (this._svg.parentNode !== this) {
      this.prepend(this._svg);
    }
  }

  private _createSVG() {
    return cloneTemplateContent<SVGElement>(svgTemplate);
  }

  private _loadIcon() {
    const type = this._type;

    if (type && lazyPaths[type]) {
      lazyPaths[type]().then(({ default: paths }) => {
        // Check type because it may have changed by the time the icon loads.
        if (type === this._type) this._onPathsChange(paths);
      });
    } else {
      if (type) console.warn(`[vjs] "${type}" is not a valid icon type.`);
      this._onPathsChange('');
    }
  }

  private _onTypeChange(type: IconType | null) {
    this._type = type;
    this._loadIcon();
  }

  private _onPathsChange(paths: string) {
    this._svg.innerHTML = paths;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vjs-icon': VjsIconElement;
  }
}

if (!window.customElements.get(VjsIconElement.tagName)) {
  window.customElements.define(VjsIconElement.tagName, VjsIconElement);
}
