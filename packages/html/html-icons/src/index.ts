import { getIcon, createSVGString, IconDefinition } from '@vjs-10/icons';

export interface IconElementOptions {
  className?: string;
  size?: number;
  color?: string;
}

export function createIconElement(iconName: string, options: IconElementOptions = {}): HTMLElement {
  const icon = getIcon(iconName);
  if (!icon) {
    throw new Error(`Icon "${iconName}" not found`);
  }

  const container = document.createElement('span');
  container.className = `vjs-icon vjs-icon-${iconName} ${options.className || ''}`.trim();
  
  const svgString = createSVGString(icon);
  container.innerHTML = svgString;
  
  const svg = container.querySelector('svg');
  if (svg && options.size) {
    svg.style.width = `${options.size}px`;
    svg.style.height = `${options.size}px`;
  }
  
  if (svg && options.color) {
    svg.style.fill = options.color;
  }
  
  return container;
}

export class VjsIcon extends HTMLElement {
  private _name: string = '';
  private _size?: number;
  private _color?: string;

  static get observedAttributes() {
    return ['name', 'size', 'color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'name':
          this._name = newValue;
          break;
        case 'size':
          this._size = newValue ? parseInt(newValue, 10) : undefined;
          break;
        case 'color':
          this._color = newValue;
          break;
      }
      this.render();
    }
  }

  private render() {
    if (!this.shadowRoot || !this._name) return;

    const icon = getIcon(this._name);
    if (!icon) {
      this.shadowRoot.innerHTML = `<span>Icon "${this._name}" not found</span>`;
      return;
    }

    const svgString = createSVGString(icon);
    const styles = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        svg {
          width: ${this._size ? `${this._size}px` : '1em'};
          height: ${this._size ? `${this._size}px` : '1em'};
          fill: ${this._color || 'currentColor'};
        }
      </style>
    `;
    
    this.shadowRoot.innerHTML = styles + svgString;
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    this.setAttribute('name', value);
  }

  get size() {
    return this._size;
  }

  set size(value: number | undefined) {
    if (value !== undefined) {
      this.setAttribute('size', value.toString());
    } else {
      this.removeAttribute('size');
    }
  }

  get color() {
    return this._color;
  }

  set color(value: string | undefined) {
    if (value !== undefined) {
      this.setAttribute('color', value);
    } else {
      this.removeAttribute('color');
    }
  }
}

if (!customElements.get('vjs-icon')) {
  customElements.define('vjs-icon', VjsIcon);
}

export { getIcon, createSVGString } from '@vjs-10/icons';