import { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';
import { VjsMediaElement } from '@vjs-10/html-media-elements';

export class HTMLMediaStateOwner implements MediaStateOwner {
  private element: VjsMediaElement;
  private listeners: Map<string, EventListener> = new Map();

  constructor(element: VjsMediaElement) {
    this.element = element;
    this.setupEventListeners();
  }

  getState(): MediaState {
    return {
      currentTime: this.element.currentTime,
      duration: this.element.duration,
      paused: this.element.paused,
      volume: this.element.volume,
      muted: this.element.muted,
    };
  }

  setState(state: Partial<MediaState>): void {
    if (state.currentTime !== undefined && state.currentTime !== this.element.currentTime) {
      this.element.currentTime = state.currentTime;
    }
    if (state.volume !== undefined && state.volume !== this.element.volume) {
      this.element.volume = state.volume;
    }
    if (state.muted !== undefined && state.muted !== this.element.muted) {
      this.element.muted = state.muted;
    }
  }

  private setupEventListeners() {
    const timeUpdateListener = () => {
      this.dispatchStateChange();
    };
    
    const playPauseListener = () => {
      this.dispatchStateChange();
    };

    const volumeChangeListener = () => {
      this.dispatchStateChange();
    };

    this.element.addEventListener('vjs-timeupdate', timeUpdateListener);
    this.element.addEventListener('vjs-play', playPauseListener);
    this.element.addEventListener('vjs-pause', playPauseListener);
    this.element.addEventListener('volumechange', volumeChangeListener);

    this.listeners.set('timeupdate', timeUpdateListener);
    this.listeners.set('play', playPauseListener);
    this.listeners.set('pause', playPauseListener);
    this.listeners.set('volumechange', volumeChangeListener);
  }

  private dispatchStateChange() {
    this.element.dispatchEvent(new CustomEvent('vjs-state-change', {
      detail: this.getState()
    }));
  }

  destroy() {
    this.listeners.forEach((listener, event) => {
      this.element.removeEventListener(event as any, listener);
    });
    this.listeners.clear();
  }
}

export function connectMediaElementToStore(element: VjsMediaElement, store: MediaStore): HTMLMediaStateOwner {
  const owner = new HTMLMediaStateOwner(element);
  store.addOwner(owner);
  
  element.addEventListener('vjs-state-change', (event: CustomEvent) => {
    store.updateState(event.detail);
  });

  return owner;
}

export { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';