# @vjs-10/react-media-elements

> React components, hooks, and utilities for media elements

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Freact--media--elements-blue)](https://www.npmjs.com/package/@vjs-10/react-media-elements)

**Status:** Early Development

> **⚠️ PROTOTYPE - SUBJECT TO CHANGE**
>
> This package is in early prototype phase. Expect significant changes including:
>
> - Package restructuring and naming
> - Breaking API changes
> - Major architectural updates
> - Incomplete or experimental features
>
> Not recommended for production use.

## Overview

`@vjs-10/react-media-elements` provides React-specific components and hooks for working with media elements. It offers enhanced video and audio components with built-in support for HLS/DASH streaming, along with hooks for programmatic media control.

## Key Features

- **React Components** - Enhanced `<Video>` and `<Audio>` components
- **React Hooks** - Hooks for media state and control
- **HLS/DASH Support** - Built-in streaming protocol support
- **Type Safe** - Full TypeScript support with React types
- **Server-Side Safe** - Works with SSR (Next.js, Remix, etc.)
- **Ref Support** - Access underlying media elements via refs

## Installation

```bash
npm install @vjs-10/react-media-elements
```

**Peer Dependencies:**

- `react` >=16.8.0

## Quick Start

### Basic Video Component

```tsx
import { Video } from '@vjs-10/react-media-elements';

function MyPlayer() {
  return (
    <Video
      src="video.mp4"
      poster="poster.jpg"
      controls
      autoPlay={false}
      muted={false}
    />
  );
}
```

### HLS Streaming

```tsx
import { Video } from '@vjs-10/react-media-elements';

function StreamingPlayer() {
  return (
    <Video
      src="https://example.com/stream.m3u8"
      controls
      autoPlay
      muted
    />
  );
}
```

### With Ref

```tsx
import { MediaElementVideo, Video } from '@vjs-10/react-media-elements';
import { useRef } from 'react';

function ControlledPlayer() {
  const videoRef = useRef<MediaElementVideo>(null);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  return (
    <div>
      <Video ref={videoRef} src="video.mp4" />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
    </div>
  );
}
```

## Components

### Video

Enhanced video component with streaming support:

```tsx
import { Video } from '@vjs-10/react-media-elements';

<Video
  // Source
  src="video.mp4"
  poster="poster.jpg"

  // Playback
  controls
  autoPlay={false}
  loop={false}
  muted={false}
  playsInline

  // Loading
  preload="metadata" // 'none' | 'metadata' | 'auto'

  // Styling
  className="my-video"
  style={{ width: '100%' }}

  // Events
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onTimeUpdate={e => console.log('Time:', e.currentTarget.currentTime)}
  onEnded={() => console.log('Ended')}

  // Ref
  ref={videoRef}
/>;
```

### Audio

Enhanced audio component:

```tsx
import { Audio } from '@vjs-10/react-media-elements';

<Audio
  src="audio.mp3"
  controls
  autoPlay={false}
  onPlay={() => console.log('Playing')}
/>;
```

## Hooks

### useMediaElement

Hook for controlling media elements:

```tsx
import { useMediaElement, Video } from '@vjs-10/react-media-elements';
import { useRef } from 'react';

function Player() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = useMediaElement(videoRef);

  return (
    <div>
      <Video ref={videoRef} src="video.mp4" />

      <button onClick={media.play}>Play</button>
      <button onClick={media.pause}>Pause</button>
      <button onClick={() => media.seek(30)}>Seek to 30s</button>
      <button onClick={() => media.setVolume(0.5)}>50% Volume</button>

      <div>
        Current Time:
        {' '}
        {media.currentTime}
        Duration:
        {' '}
        {media.duration}
        Paused:
        {' '}
        {media.paused ? 'Yes' : 'No'}
      </div>
    </div>
  );
}
```

### useVideoState

Hook for reactive video state:

```tsx
import { useVideoState, Video } from '@vjs-10/react-media-elements';
import { useRef } from 'react';

function Player() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const state = useVideoState(videoRef);

  return (
    <div>
      <Video ref={videoRef} src="video.mp4" />

      <div>
        <p>
          Current Time:
          {state.currentTime.toFixed(2)}
          s
        </p>
        <p>
          Duration:
          {state.duration.toFixed(2)}
          s
        </p>
        <p>
          Volume:
          {(state.volume * 100).toFixed(0)}
          %
        </p>
        <p>
          Status:
          {state.paused ? 'Paused' : 'Playing'}
        </p>
        <p>
          Muted:
          {state.muted ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}
```

### usePlaybackEngine

Hook for controlling HLS/DASH engines:

```tsx
import { usePlaybackEngine, Video } from '@vjs-10/react-media-elements';
import { useEffect, useRef } from 'react';

function StreamingPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engine = usePlaybackEngine(videoRef, 'hls');

  useEffect(() => {
    if (engine) {
      // Configure HLS.js instance
      engine.config.debug = false;
      engine.config.lowLatencyMode = true;
    }
  }, [engine]);

  return <Video ref={videoRef} src="stream.m3u8" />;
}
```

## Advanced Usage

### Programmatic Control

```tsx
import { MediaElementVideo, Video } from '@vjs-10/react-media-elements';
import { useRef } from 'react';

function AdvancedPlayer() {
  const videoRef = useRef<MediaElementVideo>(null);

  const controls = {
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      if (videoRef.current) {
        videoRef.current.volume = volume;
      }
    },
    toggleMute: () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
      }
    },
    setSpeed: (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
    },
  };

  return (
    <div>
      <Video ref={videoRef} src="video.mp4" />
      <div className="controls">
        <button onClick={controls.play}>Play</button>
        <button onClick={controls.pause}>Pause</button>
        <button onClick={() => controls.seek(30)}>Skip to 30s</button>
        <button onClick={() => controls.setVolume(0.5)}>50% Volume</button>
        <button onClick={controls.toggleMute}>Toggle Mute</button>
        <button onClick={() => controls.setSpeed(1.5)}>1.5x Speed</button>
      </div>
    </div>
  );
}
```

### Event Handling

```tsx
import { Video } from '@vjs-10/react-media-elements';
import { useState } from 'react';

function EventPlayer() {
  const [status, setStatus] = useState('Ready');

  return (
    <div>
      <Video
        src="video.mp4"
        onLoadStart={() => setStatus('Loading...')}
        onLoadedMetadata={() => setStatus('Metadata loaded')}
        onCanPlay={() => setStatus('Can play')}
        onPlay={() => setStatus('Playing')}
        onPause={() => setStatus('Paused')}
        onEnded={() => setStatus('Ended')}
        onError={e => setStatus(`Error: ${e.message}`)}
        onWaiting={() => setStatus('Buffering...')}
        onStalled={() => setStatus('Stalled')}
      />
      <div>
        Status:
        {status}
      </div>
    </div>
  );
}
```

### Source Switching

```tsx
import { Video } from '@vjs-10/react-media-elements';
import { useState } from 'react';

function MultiSourcePlayer() {
  const sources = [
    { url: 'video1.mp4', title: 'Video 1' },
    { url: 'video2.mp4', title: 'Video 2' },
    { url: 'stream.m3u8', title: 'HLS Stream' },
  ];

  const [currentSource, setCurrentSource] = useState(0);

  return (
    <div>
      <Video src={sources[currentSource].url} controls />

      <div className="playlist">
        {sources.map((source, index) => (
          <button
            key={index}
            onClick={() => setCurrentSource(index)}
            disabled={index === currentSource}
          >
            {source.title}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### With Media Store

```tsx
import { Video } from '@vjs-10/react-media-elements';
import { useMediaStore } from '@vjs-10/react-media-store';

function StoreIntegratedPlayer() {
  const store = useMediaStore();

  return (
    <div>
      <Video src="video.mp4" store={store} />

      {/* Other components can access the same store */}
      <CustomControls store={store} />
      <ProgressBar store={store} />
    </div>
  );
}
```

## TypeScript Support

Full TypeScript definitions included:

```tsx
import type {
  AudioProps,
  MediaElementAudio,
  MediaElementState,
  MediaElementVideo,
  VideoProps,
} from '@vjs-10/react-media-elements';

// Component props
const videoProps: VideoProps = {
  src: 'video.mp4',
  controls: true,
  autoPlay: false,
};

// Element ref types
const videoRef = useRef<MediaElementVideo>(null);
const audioRef = useRef<MediaElementAudio>(null);
```

## Server-Side Rendering

Components are SSR-safe and work with Next.js, Remix, etc:

```tsx
// Works in Next.js App Router
import { Video } from '@vjs-10/react-media-elements';

export default function Page() {
  return <Video src="video.mp4" controls />;
}
```

## Package Dependencies

- **Dependencies:**
  - `@vjs-10/media` - Media utilities
  - `@vjs-10/playback-engine` - Streaming engines
- **Peer Dependencies:**
  - `react` >=16.8.0
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

- **[@vjs-10/react](../react)** - Complete React player
- **[@vjs-10/react-media-store](../react-media-store)** - React state hooks
- **[@vjs-10/media](../../core/media)** - Core media utilities
- **[@vjs-10/html-media-elements](../../html/html-media-elements)** - HTML equivalent

## License

Apache-2.0
