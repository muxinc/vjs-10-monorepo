# @vjs-10/react

> Complete React library for building media players

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Freact-blue)](https://www.npmjs.com/package/@vjs-10/react)

**Status:** Early Development

## Overview

`@vjs-10/react` is a comprehensive library for building media players in React applications. It provides a complete set of components, hooks, and utilities for creating feature-rich, accessible video and audio players with React.

## Key Features

- **Complete Component Library** - Full suite of player components
- **React Hooks** - Easy state management and control
- **Default Skins** - Production-ready player themes
- **HLS/DASH Support** - Built-in streaming protocol support
- **Type Safe** - Full TypeScript support
- **SSR Ready** - Works with Next.js, Remix, Gatsby, etc.
- **Accessible** - WCAG compliant with keyboard navigation
- **Customizable** - Style with CSS, extend with custom components

## Installation

```bash
npm install @vjs-10/react
```

**Peer Dependencies:**

- `react` >=16.8.0

## Quick Start

### Minimal Player

```tsx
import { VideoPlayer } from '@vjs-10/react';

function App() {
  return (
    <VideoPlayer
      src="video.mp4"
      poster="poster.jpg"
      controls
    />
  );
}
```

### With HLS Streaming

```tsx
import { VideoPlayer } from '@vjs-10/react';

function StreamingPlayer() {
  return (
    <VideoPlayer
      src="https://example.com/stream.m3u8"
      controls
      autoPlay
      muted
    />
  );
}
```

### Custom Controls

```tsx
import {
  CurrentTimeDisplay,
  DurationDisplay,
  FullscreenButton,
  MediaContainer,
  PlayButton,
  TimeSlider,
  Video,
  VolumeSlider,
} from '@vjs-10/react';

function CustomPlayer() {
  return (
    <MediaContainer>
      <Video src="video.mp4" />

      <div className="controls">
        <PlayButton />
        <TimeSlider />
        <CurrentTimeDisplay />
        <DurationDisplay />
        <VolumeSlider />
        <FullscreenButton />
      </div>
    </MediaContainer>
  );
}
```

## Components

### VideoPlayer

Complete video player with built-in controls:

```tsx
import { VideoPlayer } from '@vjs-10/react';

<VideoPlayer
  // Source
  src="video.mp4"
  poster="poster.jpg"

  // Playback
  controls={true}
  autoPlay={false}
  loop={false}
  muted={false}
  playsInline

  // Loading
  preload="metadata"

  // Styling
  className="my-player"
  theme="default" // or "custom-theme"

  // Events
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onEnded={() => console.log('Ended')}

  // Configuration
  hlsConfig={{ debug: false }}
/>;
```

### MediaContainer

Container that provides shared state to child components:

```tsx
import { MediaContainer } from '@vjs-10/react';

<MediaContainer>
  <Video src="video.mp4" />
  {/* All children share the same media store */}
  <CustomControls />
  <CustomOverlay />
</MediaContainer>;
```

### Video

Enhanced video element:

```tsx
import { Video } from '@vjs-10/react';

<Video
  src="video.mp4"
  poster="poster.jpg"
  controls
  className="video-element"
/>;
```

### Control Components

Individual control components:

```tsx
import {
  PlayButton,
  MuteButton,
  FullscreenButton,
  TimeSlider,
  VolumeSlider,
  CurrentTimeDisplay,
  DurationDisplay,
  PreviewTimeDisplay,
} from '@vjs-10/react';

function ControlComponents() {
  return (
    <>
      {/* Playback controls */}
      <PlayButton />        {/* Play/pause toggle */}

      {/* Time controls */}
      <TimeSlider />        {/* Seek bar */}
      <CurrentTimeDisplay /> {/* Current time */}
      <DurationDisplay />   {/* Total duration */}
      <PreviewTimeDisplay /> {/* Time on hover */}

      {/* Volume controls */}
      <MuteButton />        {/* Mute toggle */}
      <VolumeSlider />      {/* Volume control */}

      {/* Screen controls */}
      <FullscreenButton />  {/* Fullscreen toggle */}
    </>
  );
}
```

### UI Components

Utility components for enhanced UX:

```tsx
import { Tooltip, Popover } from '@vjs-10/react';

function UIComponentsExample() {
  return (
    <>
      {/* Tooltip */}
      <Tooltip content="Play video">
        <PlayButton />
      </Tooltip>

      {/* Popover */}
      <Popover
        trigger={<button>Settings</button>}
        content={<SettingsMenu />}
      />
    </>
  );
}
```

## Hooks

### useMediaStore

Access the media store:

```tsx
import { useMediaStore } from '@vjs-10/react';

function CustomControl() {
  const store = useMediaStore();
  const paused = store.paused.get();

  return (
    <button onClick={() => store.paused.set(!paused)}>
      {paused ? 'Play' : 'Pause'}
    </button>
  );
}
```

### useMediaState

Subscribe to specific state values:

```tsx
import { useMediaState } from '@vjs-10/react';

function TimeInfo() {
  const currentTime = useMediaState(store => store.currentTime);
  const duration = useMediaState(store => store.duration);

  return (
    <div>
      {currentTime}
      {' '}
      /
      {' '}
      {duration}
    </div>
  );
}
```

### useMediaContainerRef

Access the media container reference:

```tsx
import { useMediaContainerRef } from '@vjs-10/react';

function CustomOverlay() {
  const containerRef = useMediaContainerRef();

  // Access container element for measurements, fullscreen, etc.
  return <div>{/* ... */}</div>;
}
```

## Skins

### Default Skin

```tsx
import { VideoPlayer } from '@vjs-10/react';
import '@vjs-10/react/themes/default.css';

function App() {
  return (
    <VideoPlayer
      src="video.mp4"
      theme="default"
      controls
    />
  );
}
```

### Custom Skin

Create your own player theme:

```tsx
import { MediaContainer, Video } from '@vjs-10/react';
import './custom-skin.css';

function CustomStyledPlayer() {
  return (
    <MediaContainer className="custom-player">
      <Video src="video.mp4" />
      <CustomControlBar />
    </MediaContainer>
  );
}
```

## Customization

### CSS Custom Properties

```css
:root {
  /* Colors */
  --vjs-primary-color: #007bff;
  --vjs-text-color: #ffffff;
  --vjs-bg-color: rgba(0, 0, 0, 0.7);

  /* Sizing */
  --vjs-control-size: 44px;
  --vjs-control-spacing: 8px;

  /* Typography */
  --vjs-font-family: system-ui, sans-serif;
  --vjs-font-size: 14px;
}
```

### Styled Components

```tsx
import { PlayButton as BasePlayButton } from '@vjs-10/react';
import styled from 'styled-components';

const PlayButton = styled(BasePlayButton)`
  background: #007bff;
  border-radius: 50%;
  padding: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;
```

### Tailwind CSS

```tsx
import { PlayButton, TimeSlider } from '@vjs-10/react';

function TailwindControls() {
  return (
    <div className="flex items-center gap-4 p-4 bg-black/70">
      <PlayButton className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600" />
      <TimeSlider className="flex-1 h-2 bg-gray-600 rounded" />
    </div>
  );
}
```

## Advanced Usage

### Programmatic Control

```tsx
import { VideoPlayer } from '@vjs-10/react';
import { useRef } from 'react';

function ControlledPlayer() {
  const playerRef = useRef<HTMLVideoElement>(null);

  const handleSeek = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = 30;
    }
  };

  return (
    <div>
      <VideoPlayer ref={playerRef} src="video.mp4" />
      <button onClick={handleSeek}>Skip to 30s</button>
    </div>
  );
}
```

### Custom Components

```tsx
import { useMediaStore, useMediaValue } from '@vjs-10/react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';

function CustomPlayButton() {
  const store = useMediaStore();
  const paused = useMediaValue(store.paused);

  return (
    <button
      onClick={() => store.paused.set(!paused)}
      className="custom-play-button"
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
      <span>{paused ? 'Play' : 'Pause'}</span>
    </button>
  );
}
```

### Playlist

```tsx
import { VideoPlayer } from '@vjs-10/react';
import { useState } from 'react';

function PlaylistPlayer() {
  const playlist = [
    { src: 'video1.mp4', title: 'Video 1' },
    { src: 'video2.mp4', title: 'Video 2' },
    { src: 'video3.mp4', title: 'Video 3' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleEnded = () => {
    setCurrentIndex(i => (i + 1) % playlist.length);
  };

  return (
    <div>
      <VideoPlayer
        src={playlist[currentIndex].src}
        onEnded={handleEnded}
        controls
      />

      <ul className="playlist">
        {playlist.map((item, index) => (
          <li
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={index === currentIndex ? 'active' : ''}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Picture-in-Picture

```tsx
import { VideoPlayer } from '@vjs-10/react';
import { useRef, useState } from 'react';

function PiPPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPiP, setIsPiP] = useState(false);

  const togglePiP = async () => {
    if (!videoRef.current) return;

    if (isPiP) {
      await document.exitPictureInPicture();
    } else {
      await videoRef.current.requestPictureInPicture();
    }
    setIsPiP(!isPiP);
  };

  return (
    <div>
      <VideoPlayer ref={videoRef} src="video.mp4" controls />
      <button onClick={togglePiP}>
        {isPiP ? 'Exit' : 'Enter'}
        {' '}
        Picture-in-Picture
      </button>
    </div>
  );
}
```

### Analytics Integration

```tsx
import { VideoPlayer } from '@vjs-10/react';

function AnalyticsPlayer() {
  const handlePlay = () => {
    analytics.track('Video Play', { videoId: 'abc123' });
  };

  const handleProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const progress = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;

    if (progress >= 25 && !tracked25) {
      analytics.track('Video 25%', { videoId: 'abc123' });
    }
  };

  return (
    <VideoPlayer
      src="video.mp4"
      onPlay={handlePlay}
      onTimeUpdate={handleProgress}
      onEnded={() => analytics.track('Video Complete', { videoId: 'abc123' })}
      controls
    />
  );
}
```

## Server-Side Rendering

Works with Next.js, Remix, and other SSR frameworks:

### Next.js App Router

```tsx
// app/page.tsx
import { VideoPlayer } from '@vjs-10/react';

export default function Page() {
  return (
    <VideoPlayer src="video.mp4" controls />
  );
}
```

### Next.js Pages Router

```tsx
// pages/index.tsx
import { VideoPlayer } from '@vjs-10/react';

export default function Home() {
  return (
    <VideoPlayer src="video.mp4" controls />
  );
}
```

### Dynamic Import (if needed)

```tsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@vjs-10/react').then(mod => mod.VideoPlayer),
  { ssr: false }
);
```

## TypeScript Support

Full TypeScript definitions:

```tsx
import type {
  MediaContainerProps,
  PlayButtonProps,
  TimeSliderProps,
  VideoPlayerProps,
} from '@vjs-10/react';

const props: VideoPlayerProps = {
  src: 'video.mp4',
  controls: true,
  autoPlay: false,
};
```

## Accessibility

All components include:

- **ARIA attributes** - Screen reader support
- **Keyboard navigation** - Complete keyboard control
- **Focus management** - Visible focus indicators
- **Semantic markup** - Proper HTML structure

### Keyboard Shortcuts

- `Space` - Play/pause
- `←/→` - Seek backward/forward
- `↑/↓` - Volume up/down
- `M` - Mute
- `F` - Fullscreen

## Package Dependencies

- **Dependencies:**
  - `@vjs-10/core` - Core components
  - `@vjs-10/media` - Media utilities
  - `@vjs-10/media-store` - State management
  - `@vjs-10/react-icons` - Icon components
  - `@vjs-10/react-media-elements` - Media elements
  - `@vjs-10/react-media-store` - State hooks
  - `@floating-ui/react` - Tooltip/popover positioning
- **Peer Dependencies:**
  - `react` >=16.8.0

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

## Examples

See the React demo for complete examples:

```bash
# Run the demo
pnpm dev:react
```

## Related Packages

- **[@vjs-10/html](../../html/html)** - HTML/Web Components alternative
- **[@vjs-10/react-media-store](../react-media-store)** - State management hooks
- **[@vjs-10/react-media-elements](../react-media-elements)** - Media components

## License

Apache-2.0
