
// MinimalTestSkin - Compiled for E2E Testing (Phase 2: Package Imports)
// Base class stub for browser testing
class MediaSkin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const constructor = this.constructor;
    if (this.shadowRoot && typeof constructor.getTemplateHTML === 'function') {
      this.shadowRoot.innerHTML = constructor.getTemplateHTML();
    }
  }

  static getTemplateHTML() {
    return '';
  }
}

// Stub web components for dependencies
class MediaContainer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<slot></slot>';
  }
}
class MediaPlayButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<slot></slot>';
  }
}
class MediaPlayIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '▶';
  }
}
class MediaPauseIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '⏸';
  }
}

// Register stubs
if (!customElements.get('media-container')) {
  customElements.define('media-container', MediaContainer);
}
if (!customElements.get('media-play-button')) {
  customElements.define('media-play-button', MediaPlayButton);
}
if (!customElements.get('media-play-icon')) {
  customElements.define('media-play-icon', MediaPlayIcon);
}
if (!customElements.get('media-pause-icon')) {
  customElements.define('media-pause-icon', MediaPauseIcon);
}

// Compiled web component (imports removed for browser use)

export class MinimalTestSkin extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>
      :host {
        --spacing-0: 0px;
        --spacing-1: 0.25rem;
        --spacing-2: 0.5rem;
        --spacing-3: 0.75rem;
        --spacing-4: 1rem;
        --spacing-5: 1.25rem;
        --spacing-6: 1.5rem;
        --spacing-8: 2rem;
        --spacing-10: 2.5rem;
        --spacing-12: 3rem;
        --spacing-16: 4rem;
        --radius: 0.25rem;
        --radius-sm: 0.125rem;
        --radius-md: 0.375rem;
        --radius-lg: 0.5rem;
        --radius-xl: 0.75rem;
        --radius-2xl: 1rem;
        --radius-full: 9999px;
      }
      
      media-container {
        position: relative;
        width: 100%;
        height: 100%
      }
      
      .controls {
        position: absolute;
        bottom: var(--spacing-0);
        left: var(--spacing-0);
        right: var(--spacing-0);
        display: flex;
        gap: var(--spacing-2);
        padding: var(--spacing-4)
      }
      
      media-play-button {
        padding: var(--spacing-2);
        border-radius: var(--radius-full)
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          media-play-button {
          background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          media-play-button:hover {
            background-color: color-mix(in oklab, var(--color-white) 20%, transparent)
          }
      }
      
      media-play-icon {
        opacity: 0%
      }
      
      media-pause-icon {
        opacity: 100%
      }
    </style>

    <media-container>
          <slot name="media" slot="media"></slot>

          <div class="controls">
            <media-play-button>
              <media-play-icon></media-play-icon>
              <media-pause-icon></media-pause-icon>
            </media-play-button>
          </div>
        </media-container>
  `;
}

// Self-register the component
if (!customElements.get('minimal-test-skin')) {
  customElements.define('minimal-test-skin', MinimalTestSkin);
}

