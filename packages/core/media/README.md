# @vjs-10/media

> HTMLMediaElement contracts, utilities, and playback engine integration

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fmedia-blue)](https://www.npmjs.com/package/@vjs-10/media)

**Status:** Early Development

## Overview

`@vjs-10/media` provides contracts, utilities, and integration helpers for working with HTMLMediaElement and playback engines. It bridges the gap between native media elements and advanced streaming capabilities, offering a consistent interface for media playback across different scenarios.

## Key Features

- **HTMLMediaElement Contracts** - TypeScript interfaces and types for media elements
- **Playback Engine Integration** - Seamless integration with `@vjs-10/playback-engine`
- **Media Utilities** - Helper functions for common media operations
- **Source Management** - Intelligent media source loading and switching
- **Runtime Agnostic** - Works in any JavaScript environment
- **Type Safe** - Full TypeScript support

## Installation

```bash
npm install @vjs-10/media
```

## Quick Start

### Basic Media Setup

```typescript
import { setupMedia } from '@vjs-10/media';

const videoElement = document.querySelector('video');

// Setup media element with automatic engine selection
const mediaController = setupMedia(videoElement, {
  src: 'https://example.com/video.mp4',
  autoplay: false,
  preload: 'metadata',
});

// Load source
mediaController.load();

// Clean up
mediaController.destroy();
```

### With HLS Streaming

```typescript
import { setupMedia } from '@vjs-10/media';

const videoElement = document.querySelector('video');

// HLS source automatically uses HlsJSPlaybackEngine
const mediaController = setupMedia(videoElement, {
  src: 'https://example.com/stream.m3u8',
});

mediaController.load();
```

### Source Switching

```typescript
import { setupMedia } from '@vjs-10/media';

const mediaController = setupMedia(videoElement, {
  src: 'https://example.com/video1.mp4',
});

// Switch to different source
mediaController.setSrc('https://example.com/video2.mp4');

// Switch to HLS stream
mediaController.setSrc('https://example.com/stream.m3u8');
```

## Core Concepts

### Media Contracts

TypeScript interfaces for media element properties and behavior:

```typescript
import type { MediaElement, MediaSource, MediaState } from '@vjs-10/media';

// MediaElement - Extended HTMLMediaElement interface
const element: MediaElement = videoElement;

// MediaSource - Source configuration
const source: MediaSource = {
  src: 'https://example.com/video.mp4',
  type: 'video/mp4',
};

// MediaState - Represents media playback state
const state: MediaState = {
  currentTime: 0,
  duration: 0,
  paused: true,
  volume: 1,
  muted: false,
};
```

### Engine Integration

Automatic playback engine selection based on source type:

```typescript
import { setupMedia } from '@vjs-10/media';

// Native playback for standard formats
setupMedia(videoElement, { src: 'video.mp4' });

// Automatic HLS engine for .m3u8
setupMedia(videoElement, { src: 'stream.m3u8' });

// Explicit engine selection
setupMedia(videoElement, {
  src: 'stream.m3u8',
  engine: 'hls', // or 'native', 'dash', etc.
});
```

### Media Controller

The media controller provides a unified API:

```typescript
const controller = setupMedia(videoElement, options);

// Lifecycle
controller.load(); // Load the source
controller.destroy(); // Clean up resources

// Source management
controller.setSrc(newSrc); // Switch source
controller.getSrc(); // Get current source

// Events
controller.on('ready', () => {});
controller.on('error', (error) => {});
controller.on('sourcechange', (src) => {});
```

## API Overview

### Functions

```typescript
// Setup media element with configuration
setupMedia(
  element: HTMLMediaElement,
  options: MediaOptions
): MediaController

// Detect media type from URL
detectMediaType(src: string): 'hls' | 'dash' | 'native'

// Check if source requires playback engine
requiresEngine(src: string): boolean
```

### Types

```typescript
interface MediaOptions {
  src: string;
  type?: string;
  engine?: 'auto' | 'native' | 'hls' | 'dash';
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

interface MediaController {
  load(): void;
  destroy(): void;
  setSrc(src: string): void;
  getSrc(): string;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}
```

## Use Cases

### Progressive vs. Adaptive Streaming

```typescript
import { setupMedia, detectMediaType } from '@vjs-10/media';

const src = getUserSelectedSource();
const type = detectMediaType(src);

if (type === 'hls') {
  console.log('Using adaptive streaming');
} else {
  console.log('Using progressive download');
}

const controller = setupMedia(videoElement, { src });
```

### Multi-Quality Source Selection

```typescript
import { setupMedia } from '@vjs-10/media';

const sources = [
  { src: 'video-4k.mp4', quality: '4K' },
  { src: 'video-1080p.mp4', quality: '1080p' },
  { src: 'video-720p.mp4', quality: '720p' },
];

const selectedSource = selectSourceByQuality(sources, userPreference);
const controller = setupMedia(videoElement, selectedSource);
```

### Error Recovery

```typescript
const controller = setupMedia(videoElement, { src: primarySource });

controller.on('error', (error) => {
  console.error('Playback error:', error);

  // Fallback to alternate source
  controller.setSrc(fallbackSource);
  controller.load();
});
```

## Architecture

This package serves as the bridge between:

- **Native media elements** (`<video>`, `<audio>`)
- **Playback engines** (HLS.js, DASH.js, etc. via `@vjs-10/playback-engine`)
- **Platform integrations** (React, Web Components, etc.)

It provides the core logic for:
- Source type detection
- Engine selection and lifecycle management
- Unified API across playback methods

## Package Dependencies

- **Dependencies:** `@vjs-10/playback-engine` (for streaming support)
- **Used by:** `@vjs-10/html-media-elements`, `@vjs-10/react-media-elements`, platform packages

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

- **[@vjs-10/playback-engine](../playback-engine)** - Streaming protocol engines
- **[@vjs-10/html-media-elements](../../../html/html-media-elements)** - HTML/DOM integration
- **[@vjs-10/react-media-elements](../../../react/react-media-elements)** - React integration

## License

Apache-2.0
