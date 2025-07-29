import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';
import { MediaElementRef } from '@vjs-10/react-media-elements';

const MediaStoreContext = createContext<MediaStore | null>(null);

export interface MediaStoreProviderProps {
  children: ReactNode;
  store?: MediaStore;
}

export const MediaStoreProvider: React.FC<MediaStoreProviderProps> = ({
  children,
  store = new MediaStore(),
}) => {
  return (
    <MediaStoreContext.Provider value={store}>
      {children}
    </MediaStoreContext.Provider>
  );
};

export function useMediaStore(): MediaStore {
  const store = useContext(MediaStoreContext);
  if (!store) {
    throw new Error('useMediaStore must be used within a MediaStoreProvider');
  }
  return store;
}

export function useMediaState(): [MediaState, (updates: Partial<MediaState>) => void] {
  const store = useMediaStore();
  const [state, setState] = useState<MediaState>(store.getState());

  useEffect(() => {
    const owner: MediaStateOwner = {
      getState: () => state,
      setState: (newState: Partial<MediaState>) => {
        setState(current => ({ ...current, ...newState }));
      },
    };

    store.addOwner(owner);

    return () => {
      store.removeOwner(owner);
    };
  }, [store, state]);

  const updateState = (updates: Partial<MediaState>) => {
    store.updateState(updates);
  };

  return [state, updateState];
}

export class ReactMediaStateOwner implements MediaStateOwner {
  private elementRef: React.RefObject<MediaElementRef>;
  private store: MediaStore;
  private intervalId?: NodeJS.Timeout;

  constructor(elementRef: React.RefObject<MediaElementRef>, store: MediaStore) {
    this.elementRef = elementRef;
    this.store = store;
    this.startPolling();
  }

  getState(): MediaState {
    const element = this.elementRef.current;
    if (!element) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        volume: 1,
        muted: false,
      };
    }

    return {
      currentTime: element.currentTime,
      duration: element.duration,
      paused: element.paused,
      volume: element.volume,
      muted: element.muted,
    };
  }

  setState(state: Partial<MediaState>): void {
    const element = this.elementRef.current;
    if (!element) return;

    if (state.currentTime !== undefined && state.currentTime !== element.currentTime) {
      element.currentTime = state.currentTime;
    }
    if (state.volume !== undefined && state.volume !== element.volume) {
      element.volume = state.volume;
    }
    if (state.muted !== undefined && state.muted !== element.muted) {
      element.muted = state.muted;
    }
  }

  private startPolling() {
    this.intervalId = setInterval(() => {
      const currentState = this.getState();
      this.store.updateState(currentState);
    }, 100);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export function useMediaElementStore(elementRef: React.RefObject<MediaElementRef>): MediaStore {
  const store = useMediaStore();
  const ownerRef = useRef<ReactMediaStateOwner | null>(null);

  useEffect(() => {
    if (elementRef.current && !ownerRef.current) {
      ownerRef.current = new ReactMediaStateOwner(elementRef, store);
      store.addOwner(ownerRef.current);
    }

    return () => {
      if (ownerRef.current) {
        store.removeOwner(ownerRef.current);
        ownerRef.current.destroy();
        ownerRef.current = null;
      }
    };
  }, [elementRef, store]);

  return store;
}

export function useCurrentTime(): [number, (time: number) => void] {
  const [state, updateState] = useMediaState();
  
  const setCurrentTime = (time: number) => {
    updateState({ currentTime: time });
  };

  return [state.currentTime, setCurrentTime];
}

export function useVolume(): [number, boolean, (volume: number) => void, (muted: boolean) => void] {
  const [state, updateState] = useMediaState();
  
  const setVolume = (volume: number) => {
    updateState({ volume });
  };

  const setMuted = (muted: boolean) => {
    updateState({ muted });
  };

  return [state.volume, state.muted, setVolume, setMuted];
}

export function usePlaybackState(): [boolean, () => void, () => void] {
  const [state, updateState] = useMediaState();
  
  const play = () => {
    updateState({ paused: false });
  };

  const pause = () => {
    updateState({ paused: true });
  };

  return [state.paused, play, pause];
}

export { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';