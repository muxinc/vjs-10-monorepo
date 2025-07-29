export type MediaReadyState = 0 | 1 | 2 | 3 | 4;

export const READY_STATE = {
  HAVE_NOTHING: 0 as MediaReadyState,
  HAVE_METADATA: 1 as MediaReadyState,
  HAVE_CURRENT_DATA: 2 as MediaReadyState,
  HAVE_FUTURE_DATA: 3 as MediaReadyState,
  HAVE_ENOUGH_DATA: 4 as MediaReadyState,
} as const;

export type MediaNetworkState = 0 | 1 | 2 | 3;

export const NETWORK_STATE = {
  EMPTY: 0 as MediaNetworkState,
  IDLE: 1 as MediaNetworkState,
  LOADING: 2 as MediaNetworkState,
  NO_SOURCE: 3 as MediaNetworkState,
} as const;

export interface MediaElementLike {
  currentTime: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readyState: MediaReadyState;
  networkState: MediaNetworkState;
  
  play(): Promise<void>;
  pause(): void;
  load(): void;
}

export function isMediaElement(element: any): element is HTMLMediaElement {
  return element && 
         typeof element.play === 'function' &&
         typeof element.pause === 'function' &&
         typeof element.load === 'function' &&
         typeof element.currentTime === 'number';
}

export function createMediaElementAdapter(element: HTMLMediaElement): MediaElementLike {
  return {
    get currentTime() { return element.currentTime; },
    set currentTime(value: number) { element.currentTime = value; },
    
    get duration() { return element.duration; },
    get paused() { return element.paused; },
    get ended() { return element.ended; },
    
    get volume() { return element.volume; },
    set volume(value: number) { element.volume = value; },
    
    get muted() { return element.muted; },
    set muted(value: boolean) { element.muted = value; },
    
    get playbackRate() { return element.playbackRate; },
    set playbackRate(value: number) { element.playbackRate = value; },
    
    get readyState() { return element.readyState as MediaReadyState; },
    get networkState() { return element.networkState as MediaNetworkState; },
    
    play: () => element.play(),
    pause: () => element.pause(),
    load: () => element.load(),
  };
}