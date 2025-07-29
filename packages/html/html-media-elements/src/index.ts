import { MediaElementLike, createMediaElementAdapter } from '@vjs-10/media';
import { PlaybackEngine, NativePlaybackEngine } from '@vjs-10/playback-engine';

export interface MediaElementOptions {
  playbackEngine?: PlaybackEngine;
  controls?: boolean;
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export class VjsMediaElement extends HTMLElement {
  private mediaElement: HTMLVideoElement | HTMLAudioElement;
  private playbackEngine: PlaybackEngine;
  private adapter: MediaElementLike;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const mediaType = this.getAttribute('media-type') || 'video';
    this.mediaElement = mediaType === 'audio' 
      ? document.createElement('audio')
      : document.createElement('video');
      
    this.playbackEngine = new NativePlaybackEngine();
    this.adapter = createMediaElementAdapter(this.mediaElement);
  }

  static get observedAttributes() {
    return ['src', 'controls', 'autoplay', 'preload', 'media-type'];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.playbackEngine.attach(this.mediaElement);
  }

  disconnectedCallback() {
    this.playbackEngine.detach();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'src':
        if (newValue) {
          this.playbackEngine.load({ src: newValue, type: 'video/mp4' });
        }
        break;
      case 'controls':
        this.mediaElement.controls = newValue !== null;
        break;
      case 'autoplay':
        this.mediaElement.autoplay = newValue !== null;
        break;
      case 'preload':
        this.mediaElement.preload = newValue as any;
        break;
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const styles = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        video, audio {
          width: 100%;
          height: 100%;
        }
      </style>
    `;

    this.shadowRoot.innerHTML = styles;
    this.shadowRoot.appendChild(this.mediaElement);
  }

  private setupEventListeners() {
    this.mediaElement.addEventListener('play', () => {
      this.dispatchEvent(new CustomEvent('vjs-play'));
    });

    this.mediaElement.addEventListener('pause', () => {
      this.dispatchEvent(new CustomEvent('vjs-pause'));
    });

    this.mediaElement.addEventListener('timeupdate', () => {
      this.dispatchEvent(new CustomEvent('vjs-timeupdate', {
        detail: { currentTime: this.mediaElement.currentTime }
      }));
    });

    this.mediaElement.addEventListener('loadedmetadata', () => {
      this.dispatchEvent(new CustomEvent('vjs-loadedmetadata', {
        detail: { duration: this.mediaElement.duration }
      }));
    });
  }

  async play() {
    return this.playbackEngine.play();
  }

  pause() {
    this.playbackEngine.pause();
  }

  seekTo(time: number) {
    this.playbackEngine.seekTo(time);
  }

  get currentTime() {
    return this.adapter.currentTime;
  }

  set currentTime(value: number) {
    this.adapter.currentTime = value;
  }

  get duration() {
    return this.adapter.duration;
  }

  get paused() {
    return this.adapter.paused;
  }

  get volume() {
    return this.adapter.volume;
  }

  set volume(value: number) {
    this.adapter.volume = value;
  }

  get muted() {
    return this.adapter.muted;
  }

  set muted(value: boolean) {
    this.adapter.muted = value;
  }
}

if (!customElements.get('vjs-media')) {
  customElements.define('vjs-media', VjsMediaElement);
}

export { MediaElementLike, createMediaElementAdapter } from '@vjs-10/media';