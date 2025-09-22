import type { IBasePlaybackEngine } from '@vjs-10/playback-engine';

import { createPlaybackEngine } from '@vjs-10/playback-engine';

/** @TODO Split out "playable" vs. "audible" vs. "temporal" and compose via factory (current mixin pattern or spreadable mixin pattern) (CJP) */
export const Events = [
  'volumechange',
  'pause',
  'play',
  'playing',
  'emptied',
  'loadedmetadata',
  'timeupdate',
  'durationchange',
] as const;

export interface IBaseMediaStateOwner<T extends Pick<HTMLMediaElement, 'src'> = Pick<HTMLMediaElement, 'src'>>
  extends EventTarget,
    Pick<HTMLMediaElement, 'src'> {
  mediaElement?: T | undefined;
}

export interface IPlayableMediaStateOwner
  extends EventTarget,
    IBaseMediaStateOwner,
    Pick<HTMLMediaElement, 'play' | 'pause' | 'paused'> {}

export interface IAudibleMediaStateOwner
  extends EventTarget,
    IBaseMediaStateOwner,
    Pick<HTMLMediaElement, 'muted' | 'volume'> {}

export interface ITemporalMediaStateOwner
  extends EventTarget,
    IBaseMediaStateOwner,
    Pick<HTMLMediaElement, 'duration' | 'currentTime'> {}

export class PlayableMediaStateOwner extends EventTarget implements IPlayableMediaStateOwner, IAudibleMediaStateOwner {
  protected _playbackEngine: IBasePlaybackEngine;
  constructor() {
    super();
    this._playbackEngine = createPlaybackEngine();
  }

  get mediaElement() {
    return this._playbackEngine.mediaElement;
  }

  set mediaElement(value) {
    if (this.mediaElement === value) return;
    if (this.mediaElement != null) {
      Events.forEach((eventType) => {
        this.mediaElement?.removeEventListener(eventType, this);
      });
    }
    this._playbackEngine.mediaElement = value;
    if (this.mediaElement) {
      Events.forEach((eventType) => {
        this.mediaElement?.addEventListener(eventType, this);
      });
    }
  }

  get paused() {
    return this.mediaElement?.paused ?? false;
  }

  pause() {
    /** @TODO implement deferred state etc. for cases where media has yet to be set */
    if (!this.mediaElement) return;
    return this.mediaElement.pause();
  }

  play() {
    /** @TODO implement deferred state etc. for cases where media has yet to be set */
    if (!this.mediaElement) return Promise.reject();
    return this.mediaElement.play();
  }

  get muted() {
    return this.mediaElement?.muted ?? false;
  }

  set muted(value) {
    if (value === this.muted) return;
    /** @TODO implement deferred state etc. for cases where media has yet to be set */
    if (!this.mediaElement) return;
    this.mediaElement.muted = value;
  }

  get volume() {
    return this.mediaElement?.volume ?? 0;
  }

  set volume(value) {
    if (value === this.volume) return;
    /** @TODO implement deferred state etc. for cases where media has yet to be set */
    if (!this.mediaElement) return;
    this.mediaElement.volume = value;
  }

  get duration() {
    return this.mediaElement?.duration ?? 0;
  }

  get currentTime() {
    return this.mediaElement?.currentTime ?? 0;
  }

  set currentTime(value) {
    if (value === this.currentTime) return;
    /** @TODO implement deferred state etc. for cases where media has yet to be set */
    if (!this.mediaElement) return;
    this.mediaElement.currentTime = value;
  }

  get src() {
    return this._playbackEngine.src ?? '';
  }

  set src(value) {
    this._playbackEngine.src = value;
  }

  handleEvent(event: Event): void {
    if (event.target === this.mediaElement) {
      const clonedEvent = new (event.constructor as (typeof globalThis)['Event'])(event.type, event);
      this.dispatchEvent(clonedEvent);
    }
  }

  destroy() {
    this.mediaElement = undefined;
    this._playbackEngine.destroy();
  }
}

export const createMediaStateOwner = () => new PlayableMediaStateOwner();
