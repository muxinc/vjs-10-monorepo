# @vjs-10/react-media-store

> React hooks and context for Video.js media store

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Freact--media--store-blue)](https://www.npmjs.com/package/@vjs-10/react-media-store)

**Status:** Early Development

## Overview

`@vjs-10/react-media-store` provides React-specific integration for `@vjs-10/media-store`. It offers hooks and context providers for accessing and manipulating media state in React applications, enabling reactive UI updates across your player components.

## Key Features

- **React Hooks** - Easy access to media state in functional components
- **Context Provider** - Share media store across component tree
- **Reactive Updates** - Automatic re-renders on state changes
- **Type Safe** - Full TypeScript support with React types
- **SSR Safe** - Works with server-side rendering
- **Optimized** - Minimal re-renders with fine-grained subscriptions

## Installation

```bash
npm install @vjs-10/react-media-store
```

**Peer Dependencies:**

- `react` >=16.8.0

## Quick Start

### Basic Usage with Context

```tsx
import { MediaStoreProvider, useMediaStore } from '@vjs-10/react-media-store';

function App() {
  return (
    <MediaStoreProvider>
      <VideoPlayer />
      <CustomControls />
    </MediaStoreProvider>
  );
}

function CustomControls() {
  const store = useMediaStore();
  const paused = store.paused.get();

  return (
    <button onClick={() => store.paused.set(!paused)}>
      {paused ? 'Play' : 'Pause'}
    </button>
  );
}
```

### Without Context (Local Store)

```tsx
import { createMediaStore } from '@vjs-10/react-media-store';
import { useMemo } from 'react';

function VideoPlayer() {
  const store = useMemo(() => createMediaStore(), []);

  return (
    <div>
      <Video store={store} src="video.mp4" />
      <PlayButton store={store} />
    </div>
  );
}
```

## Hooks

### useMediaStore

Access the media store from context:

```tsx
import { useMediaStore } from '@vjs-10/react-media-store';

function Component() {
  const store = useMediaStore();

  // Access state
  const paused = store.paused.get();
  const currentTime = store.currentTime.get();
  const volume = store.volume.get();

  // Update state
  const handlePlay = () => store.paused.set(false);
  const handleSeek = (time: number) => store.currentTime.set(time);

  return <div>{/* JSX */}</div>;
}
```

### useMediaState

Subscribe to specific state values:

```tsx
import { useMediaState } from '@vjs-10/react-media-store';

function CurrentTimeDisplay() {
  const currentTime = useMediaState(store => store.currentTime);
  const duration = useMediaState(store => store.duration);

  return (
    <div>
      {formatTime(currentTime)}
      {' '}
      /
      {formatTime(duration)}
    </div>
  );
}
```

### useMediaValue

Get reactive value from store atom:

```tsx
import { useMediaStore, useMediaValue } from '@vjs-10/react-media-store';

function VolumeControl() {
  const store = useMediaStore();
  const volume = useMediaValue(store.volume);

  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={volume}
      onChange={e => store.volume.set(Number.parseFloat(e.target.value))}
    />
  );
}
```

### usePlaybackState

Access playback-specific state:

```tsx
import { usePlaybackState } from '@vjs-10/react-media-store';

function PlaybackControls() {
  const { paused, ended, seeking } = usePlaybackState();

  if (ended) return <ReplayButton />;
  if (seeking) return <SeekingIndicator />;

  return paused ? <PlayButton /> : <PauseButton />;
}
```

### useTimeState

Access time-related state:

```tsx
import { useTimeState } from '@vjs-10/react-media-store';

function TimeInfo() {
  const { currentTime, duration, buffered } = useTimeState();
  const progress = (currentTime / duration) * 100;

  return (
    <div>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <span>
        {formatTime(currentTime)}
        {' '}
        /
        {' '}
        {formatTime(duration)}
      </span>
    </div>
  );
}
```

### useVolumeState

Access volume-related state:

```tsx
import { useVolumeState } from '@vjs-10/react-media-store';

function VolumeControls() {
  const { volume, muted, setVolume, toggleMute } = useVolumeState();

  return (
    <div>
      <button onClick={toggleMute}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <input
        type="range"
        value={muted ? 0 : volume}
        onChange={e => setVolume(Number.parseFloat(e.target.value))}
      />
    </div>
  );
}
```

## Context Provider

### MediaStoreProvider

Provides media store to component tree:

```tsx
import { MediaStoreProvider } from '@vjs-10/react-media-store';

function App() {
  return (
    <MediaStoreProvider>
      {/* All children can access the store */}
      <VideoPlayer />
      <Controls />
      <ProgressBar />
    </MediaStoreProvider>
  );
}
```

### With Custom Store

```tsx
import { createMediaStore, MediaStoreProvider } from '@vjs-10/react-media-store';
import { useMemo } from 'react';

function App() {
  const store = useMemo(() => {
    const store = createMediaStore();
    // Initialize with custom values
    store.volume.set(0.8);
    store.muted.set(false);
    return store;
  }, []);

  return (
    <MediaStoreProvider store={store}>
      <VideoPlayer />
    </MediaStoreProvider>
  );
}
```

### Multiple Stores

```tsx
import { MediaStoreProvider } from '@vjs-10/react-media-store';

function MultiPlayerApp() {
  return (
    <div>
      <MediaStoreProvider>
        <VideoPlayer id="player1" />
        <Controls id="controls1" />
      </MediaStoreProvider>

      <MediaStoreProvider>
        <VideoPlayer id="player2" />
        <Controls id="controls2" />
      </MediaStoreProvider>
    </div>
  );
}
```

## Advanced Usage

### Custom Play Button

```tsx
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import { useMediaStore, useMediaValue } from '@vjs-10/react-media-store';

function PlayButton() {
  const store = useMediaStore();
  const paused = useMediaValue(store.paused);

  const handleClick = () => {
    store.paused.set(!paused);
  };

  return (
    <button onClick={handleClick} aria-label={paused ? 'Play' : 'Pause'}>
      {paused ? <PlayIcon /> : <PauseIcon />}
    </button>
  );
}
```

### Progress Bar with Seeking

```tsx
import { useMediaStore, useMediaValue } from '@vjs-10/react-media-store';
import { MouseEvent, useRef } from 'react';

function ProgressBar() {
  const store = useMediaStore();
  const currentTime = useMediaValue(store.currentTime);
  const duration = useMediaValue(store.duration);
  const barRef = useRef<HTMLDivElement>(null);

  const percentage = (currentTime / duration) * 100;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedPercentage = x / rect.width;
    const newTime = clickedPercentage * duration;

    store.currentTime.set(newTime);
  };

  return (
    <div
      ref={barRef}
      className="progress-bar"
      onClick={handleClick}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
    >
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
```

### Time Display

```tsx
import { useTimeState } from '@vjs-10/react-media-store';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function TimeDisplay() {
  const { currentTime, duration } = useTimeState();

  return (
    <div className="time-display">
      <span>{formatTime(currentTime)}</span>
      <span> / </span>
      <span>{formatTime(duration)}</span>
    </div>
  );
}
```

### Volume Slider

```tsx
import { VolumeHighIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import { useVolumeState } from '@vjs-10/react-media-store';

function VolumeSlider() {
  const { volume, muted, setVolume, toggleMute } = useVolumeState();

  return (
    <div className="volume-control">
      <button onClick={toggleMute}>
        {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeHighIcon />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={(e) => {
          const newVolume = Number.parseFloat(e.target.value);
          setVolume(newVolume);
          if (muted && newVolume > 0) {
            toggleMute(); // Unmute when adjusting volume
          }
        }}
      />
    </div>
  );
}
```

### Fullscreen Button

```tsx
import { FullscreenEnterIcon, FullscreenExitIcon } from '@vjs-10/react-icons';
import { useMediaState, useMediaStore } from '@vjs-10/react-media-store';

function FullscreenButton() {
  const store = useMediaStore();
  const fullscreen = useMediaState(store => store.fullscreen);

  const handleClick = () => {
    store.fullscreen.set(!fullscreen);
  };

  return (
    <button onClick={handleClick}>
      {fullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
    </button>
  );
}
```

### State Persistence

```tsx
import { createMediaStore, MediaStoreProvider } from '@vjs-10/react-media-store';
import { useEffect, useMemo } from 'react';

function App() {
  const store = useMemo(() => {
    const store = createMediaStore();

    // Restore from localStorage
    const savedVolume = localStorage.getItem('player-volume');
    if (savedVolume) {
      store.volume.set(Number.parseFloat(savedVolume));
    }

    return store;
  }, []);

  useEffect(() => {
    // Persist to localStorage
    const unsubscribe = store.volume.subscribe((volume) => {
      localStorage.setItem('player-volume', volume.toString());
    });

    return unsubscribe;
  }, [store]);

  return (
    <MediaStoreProvider store={store}>
      <VideoPlayer />
    </MediaStoreProvider>
  );
}
```

## TypeScript Support

Full TypeScript definitions included:

```tsx
import type {
  MediaStore,
  MediaStoreState,
  PlaybackState,
  TimeState,
  VolumeState,
} from '@vjs-10/react-media-store';

// Store type
const store: MediaStore = createMediaStore();

// State types
const playbackState: PlaybackState = { paused, ended, seeking };
const timeState: TimeState = { currentTime, duration, buffered };
const volumeState: VolumeState = { volume, muted };
```

## Package Dependencies

- **Dependencies:** `@vjs-10/media-store` - Core state management
- **Peer Dependencies:** `react` >=16.8.0
- **Used by:** `@vjs-10/react` - Complete React player

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## Related Packages

- **[@vjs-10/media-store](../../core/media-store)** - Core state management
- **[@vjs-10/react](../react)** - Complete React player
- **[@vjs-10/react-media-elements](../react-media-elements)** - React media components
- **[@vjs-10/html-media-store](../../html/html-media-store)** - HTML equivalent

## License

Apache-2.0
