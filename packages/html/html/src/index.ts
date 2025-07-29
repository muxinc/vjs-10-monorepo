export * from '@vjs-10/html-icons';
export * from '@vjs-10/html-media-elements';
export * from '@vjs-10/html-media-store';

export interface PlayerOptions {
  controls?: boolean;
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  width?: number;
  height?: number;
}

export class VjsPlayer extends HTMLElement {
  private mediaElement: HTMLElement;
  private controlBar: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.mediaElement = document.createElement('vjs-media');
    this.controlBar = this.createControlBar();
  }

  static get observedAttributes() {
    return ['src', 'controls', 'autoplay', 'preload', 'width', 'height'];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'src':
      case 'controls':
      case 'autoplay':
      case 'preload':
        this.mediaElement.setAttribute(name, newValue);
        break;
      case 'width':
      case 'height':
        this.updateDimensions();
        break;
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const styles = `
      <style>
        :host {
          display: block;
          position: relative;
          background: #000;
          font-family: Arial, sans-serif;
        }
        
        .vjs-player-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .vjs-control-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        :host(:hover) .vjs-control-bar {
          opacity: 1;
        }
        
        .vjs-play-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px;
        }
        
        .vjs-progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          position: relative;
          cursor: pointer;
        }
        
        .vjs-progress-fill {
          height: 100%;
          background: #ff0000;
          border-radius: 2px;
          width: 0%;
          transition: width 0.1s ease;
        }
        
        .vjs-volume-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px;
        }
      </style>
    `;

    const template = `
      <div class="vjs-player-container">
        ${this.mediaElement.outerHTML}
        ${this.getAttribute('controls') !== null ? this.controlBar.outerHTML : ''}
      </div>
    `;

    this.shadowRoot.innerHTML = styles + template;
    
    const mediaEl = this.shadowRoot.querySelector('vjs-media');
    const controlBarEl = this.shadowRoot.querySelector('.vjs-control-bar');
    
    if (mediaEl) {
      this.mediaElement = mediaEl as HTMLElement;
    }
    if (controlBarEl) {
      this.controlBar = controlBarEl as HTMLElement;
    }
  }

  private createControlBar(): HTMLElement {
    const controlBar = document.createElement('div');
    controlBar.className = 'vjs-control-bar';
    
    controlBar.innerHTML = `
      <button class="vjs-play-button">
        <vjs-icon name="play" size="20"></vjs-icon>
      </button>
      <div class="vjs-progress-bar">
        <div class="vjs-progress-fill"></div>
      </div>
      <button class="vjs-volume-button">
        <vjs-icon name="volumeUp" size="20"></vjs-icon>
      </button>
    `;
    
    return controlBar;
  }

  private setupEventListeners() {
    const playButton = this.shadowRoot?.querySelector('.vjs-play-button');
    const progressBar = this.shadowRoot?.querySelector('.vjs-progress-bar');
    const volumeButton = this.shadowRoot?.querySelector('.vjs-volume-button');

    playButton?.addEventListener('click', () => {
      if (this.mediaElement && 'paused' in this.mediaElement) {
        if ((this.mediaElement as any).paused) {
          (this.mediaElement as any).play();
        } else {
          (this.mediaElement as any).pause();
        }
      }
    });

    this.mediaElement?.addEventListener('vjs-play', () => {
      const icon = playButton?.querySelector('vjs-icon');
      if (icon) {
        (icon as any).name = 'pause';
      }
    });

    this.mediaElement?.addEventListener('vjs-pause', () => {
      const icon = playButton?.querySelector('vjs-icon');
      if (icon) {
        (icon as any).name = 'play';
      }
    });

    this.mediaElement?.addEventListener('vjs-timeupdate', (event: CustomEvent) => {
      const progressFill = this.shadowRoot?.querySelector('.vjs-progress-fill') as HTMLElement;
      if (progressFill && this.mediaElement && 'duration' in this.mediaElement) {
        const duration = (this.mediaElement as any).duration;
        const currentTime = event.detail.currentTime;
        const percentage = duration ? (currentTime / duration) * 100 : 0;
        progressFill.style.width = `${percentage}%`;
      }
    });
  }

  private updateDimensions() {
    const width = this.getAttribute('width');
    const height = this.getAttribute('height');
    
    if (width) {
      this.style.width = width.includes('px') ? width : `${width}px`;
    }
    if (height) {
      this.style.height = height.includes('px') ? height : `${height}px`;
    }
  }
}

if (!customElements.get('vjs-player')) {
  customElements.define('vjs-player', VjsPlayer);
}