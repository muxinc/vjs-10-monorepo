export interface MediaSource {
  src: string;
  type: string;
}

export interface PlaybackEngineOptions {
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export abstract class PlaybackEngine {
  protected element: HTMLMediaElement | null = null;
  protected options: PlaybackEngineOptions;

  constructor(options: PlaybackEngineOptions = {}) {
    this.options = options;
  }

  abstract attach(element: HTMLMediaElement): void;
  abstract detach(): void;
  abstract load(source: MediaSource): Promise<void>;
  abstract play(): Promise<void>;
  abstract pause(): void;
  abstract seekTo(time: number): void;

  getElement(): HTMLMediaElement | null {
    return this.element;
  }
}

export class NativePlaybackEngine extends PlaybackEngine {
  attach(element: HTMLMediaElement): void {
    this.element = element;
  }

  detach(): void {
    this.element = null;
  }

  async load(source: MediaSource): Promise<void> {
    if (!this.element) {
      throw new Error('No media element attached');
    }
    
    this.element.src = source.src;
    await new Promise((resolve, reject) => {
      const onLoad = () => {
        this.element!.removeEventListener('loadedmetadata', onLoad);
        this.element!.removeEventListener('error', onError);
        resolve(void 0);
      };
      const onError = () => {
        this.element!.removeEventListener('loadedmetadata', onLoad);
        this.element!.removeEventListener('error', onError);
        reject(new Error('Failed to load media'));
      };
      
      this.element.addEventListener('loadedmetadata', onLoad);
      this.element.addEventListener('error', onError);
    });
  }

  async play(): Promise<void> {
    if (!this.element) {
      throw new Error('No media element attached');
    }
    await this.element.play();
  }

  pause(): void {
    if (!this.element) {
      throw new Error('No media element attached');
    }
    this.element.pause();
  }

  seekTo(time: number): void {
    if (!this.element) {
      throw new Error('No media element attached');
    }
    this.element.currentTime = time;
  }
}