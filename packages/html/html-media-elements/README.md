# @vjs-10/html-media-elements

> Web Component media elements and utilities

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fhtml--media--elements-blue)](https://www.npmjs.com/package/@vjs-10/html-media-elements)

**Status:** Early Development

## Overview

`@vjs-10/html-media-elements` provides Web Component implementations of media elements, offering enhanced functionality beyond native `<video>` and `<audio>` elements. These components integrate with the Video.js state management system and support advanced streaming protocols.

## Key Features

- **Web Components** - Standard custom elements for media
- **Enhanced Media Elements** - Extended functionality beyond native elements
- **State Integration** - Built-in media store connectivity via Context Protocol
- **Streaming Support** - HLS, DASH support via playback engines
- **Framework Agnostic** - Works with vanilla JS or any framework

## Installation

```bash
npm install @vjs-10/html-media-elements
```

## Quick Start

### Basic Video Element

```typescript
import '@vjs-10/html-media-elements';

// Use in HTML
const html = `
  <vjs-video src="video.mp4" controls>
    Your browser doesn't support video.
  </vjs-video>
`;
```

### With JavaScript

```typescript
import { VideoElement } from '@vjs-10/html-media-elements';

// Create video element
const video = new VideoElement();
video.src = 'https://example.com/video.mp4';
video.controls = true;
document.body.appendChild(video);

// Listen to events
video.addEventListener('play', () => {
  console.log('Video started playing');
});
```

### HLS Streaming

```html
<!-- HLS source automatically uses playback engine -->
<vjs-video src="https://example.com/stream.m3u8" controls> </vjs-video>
```

## Components

### VideoElement (`<vjs-video>`)

Enhanced video element with streaming support:

```html
<vjs-video src="video.mp4" poster="poster.jpg" controls autoplay muted loop preload="metadata"> </vjs-video>
```

**Attributes:**

- All standard `<video>` attributes
- `src` - Media source (supports HLS .m3u8 files)
- `poster` - Poster image URL
- `controls` - Show native controls
- `autoplay` - Auto-play on load
- `muted` - Start muted
- `loop` - Loop playback
- `preload` - Preload strategy

### AudioElement (`<vjs-audio>`)

Enhanced audio element:

```html
<vjs-audio src="audio.mp3" controls preload="auto"> </vjs-audio>
```

## State Integration

Components automatically integrate with `@vjs-10/media-store`:

```typescript
import { VideoElement } from '@vjs-10/html-media-elements';
import { createMediaStore } from '@vjs-10/media-store';

// Create media store
const store = createMediaStore();

// Create video element
const video = new VideoElement();
video.store = store; // Connect to store

// Store automatically updates with media state
store.currentTime.subscribe((time) => {
  console.log('Current time:', time);
});

store.paused.subscribe((paused) => {
  console.log('Is paused:', paused);
});
```

## Context Protocol Integration

Uses [@open-wc/context-protocol](https://www.npmjs.com/package/@open-wc/context-protocol) for state sharing:

```html
<!-- Provider shares store with descendants -->
<vjs-media-provider>
  <vjs-video src="video.mp4"></vjs-video>
  <!-- Other components can access the same store -->
  <vjs-play-button></vjs-play-button>
  <vjs-time-slider></vjs-time-slider>
</vjs-media-provider>
```

## Advanced Usage

### Playback Engine Configuration

```typescript
import { VideoElement } from '@vjs-10/html-media-elements';
import { HlsJSPlaybackEngine } from '@vjs-10/playback-engine';

const video = new VideoElement();

// Configure HLS engine
video.engineConfig = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: true,
};

video.src = 'stream.m3u8';
```

### Source Switching

```typescript
const video = new VideoElement();
video.src = 'video1.mp4';

// Switch to different source
setTimeout(() => {
  video.src = 'video2.mp4';
  video.load(); // Reload with new source
}, 5000);

// Switch to HLS stream
setTimeout(() => {
  video.src = 'stream.m3u8'; // Automatically uses HLS engine
}, 10000);
```

### Event Handling

```typescript
const video = new VideoElement();

// Standard media events
video.addEventListener('loadedmetadata', () => {
  console.log('Duration:', video.duration);
});

video.addEventListener('timeupdate', () => {
  console.log('Current time:', video.currentTime);
});

video.addEventListener('ended', () => {
  console.log('Playback ended');
});

// Error handling
video.addEventListener('error', (e) => {
  console.error('Media error:', e);
});
```

### Programmatic Control

```typescript
const video = new VideoElement();
video.src = 'video.mp4';

// Playback control
await video.play();
video.pause();

// Seeking
video.currentTime = 30; // Seek to 30 seconds

// Volume
video.volume = 0.5; // 50%
video.muted = true;

// Playback rate
video.playbackRate = 1.5; // 1.5x speed
```

## API Reference

### Properties

```typescript
interface VideoElement extends HTMLElement {
  // Source
  src: string;
  currentSrc: string;

  // Playback state
  paused: boolean;
  ended: boolean;
  seeking: boolean;

  // Time
  currentTime: number;
  duration: number;

  // Volume
  volume: number;
  muted: boolean;

  // Playback
  playbackRate: number;
  autoplay: boolean;
  loop: boolean;
  controls: boolean;

  // Loading
  preload: 'none' | 'metadata' | 'auto';
  readyState: number;

  // Media store integration
  store?: MediaStore;
  engineConfig?: EngineConfig;
}
```

### Methods

```typescript
interface VideoElementMethods {
  // Playback
  play(): Promise<void>
  pause(): void
  load(): void

  // Seeking
  fastSeek(time: number): void

  // Fullscreen
  requestFullscreen(): Promise<void>
  exitFullscreen(): Promise<void>
}
```

## Browser Compatibility

Web Components support:

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

HLS streaming support:

- All modern browsers via HLS.js

## Package Dependencies

- **Dependencies:**
  - `@vjs-10/media-store` - State management
  - `@open-wc/context-protocol` - State sharing
- **Used by:** `@vjs-10/html` - Complete HTML player

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

- **[@vjs-10/media-store](../../core/media-store)** - State management
- **[@vjs-10/html-media-store](../html-media-store)** - HTML store integration
- **[@vjs-10/html](../html)** - Complete HTML player
- **[@vjs-10/react-media-elements](../../react/react-media-elements)** - React alternative

## License

Apache-2.0
