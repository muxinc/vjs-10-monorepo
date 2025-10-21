# @vjs-10/playback-engine

> Media playback engine abstraction for streaming protocols

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fplayback--engine-blue)](https://www.npmjs.com/package/@vjs-10/playback-engine)

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

`@vjs-10/playback-engine` provides an abstraction layer for media playback engines, enabling support for various streaming protocols (HLS, DASH, etc.) through a unified interface. This package handles the complexity of adaptive streaming while presenting a consistent API.

## Key Features

- **Streaming Protocol Support** - Built-in HLS.js integration with extensible architecture
- **Unified API** - Consistent interface across different playback engines
- **Engine Abstraction** - Switch between native playback and advanced engines seamlessly
- **Runtime Agnostic** - Works in any JavaScript environment
- **Type Safe** - Full TypeScript support

## Installation

```bash
npm install @vjs-10/playback-engine
```

The package includes HLS.js as a dependency for HLS streaming support.

## Quick Start

### HLS Playback

```typescript
import { HlsJSPlaybackEngine } from '@vjs-10/playback-engine';

// Create HLS engine instance
const engine = new HlsJSPlaybackEngine();

// Attach to media element
const videoElement = document.querySelector('video');
engine.attach(videoElement);

// Load HLS stream
engine.load('https://example.com/stream.m3u8');

// Listen to events
engine.on('ready', () => {
  console.log('Engine ready for playback');
});

// Cleanup when done
engine.destroy();
```

### Basic Configuration

```typescript
import { HlsJSPlaybackEngine } from '@vjs-10/playback-engine';

// Configure HLS.js options
const engine = new HlsJSPlaybackEngine({
  debug: false,
  enableWorker: true,
  lowLatencyMode: false,
  // ... other HLS.js config options
});
```

## Architecture

### Playback Engine Pattern

The package implements a playback engine abstraction that:

1. **Wraps streaming libraries** (like HLS.js) with a consistent interface
2. **Manages lifecycle** - Handles initialization, loading, and cleanup
3. **Provides events** - Unified event system across engines
4. **Handles errors** - Standardized error handling and recovery

### Current Implementation

- **HlsJSPlaybackEngine** - Production-ready HLS streaming via HLS.js
- **Extensible design** - Easy to add DASH.js, Shaka Player, or custom engines

## HlsJSPlaybackEngine API

### Constructor

```typescript
class HlsJSPlaybackEngine {
  constructor(config?: HlsConfig)
}
```

### Methods

```typescript
interface HlsJSPlaybackEngineMethods {
  // Attach engine to media element
  attach(mediaElement: HTMLMediaElement): void

  // Detach engine from media element
  detach(): void

  // Load media source
  load(src: string): void

  // Destroy engine instance
  destroy(): void
}

// Static method
function isSupported(): boolean
```

### Events

```typescript
// Engine lifecycle events
engine.on('ready', () => {});
engine.on('error', (error) => {});
engine.on('destroyed', () => {});

// Media events (proxied from HLS.js)
engine.on('manifest-parsed', (data) => {});
engine.on('level-switched', (data) => {});
engine.on('frag-loaded', (data) => {});
```

## Use Cases

### Adaptive Streaming

```typescript
import { HlsJSPlaybackEngine } from '@vjs-10/playback-engine';

const engine = new HlsJSPlaybackEngine({
  // Enable adaptive bitrate streaming
  startLevel: -1, // Auto-select initial quality
  capLevelToPlayerSize: true, // Cap quality to player dimensions
});

engine.attach(videoElement);
engine.load('https://example.com/adaptive-stream.m3u8');
```

### Live Streaming

```typescript
const engine = new HlsJSPlaybackEngine({
  lowLatencyMode: true,
  backBufferLength: 90,
  maxBufferLength: 30,
});

engine.load('https://example.com/live-stream.m3u8');
```

### Quality Level Control

```typescript
// Access underlying HLS.js instance for advanced control
const engine = new HlsJSPlaybackEngine();
const hls = engine.hls; // Access HLS.js instance

// Manually set quality level
hls.currentLevel = 2; // Set to specific quality

// Get available levels
const levels = hls.levels;
console.log(levels.map(l => `${l.height}p @ ${l.bitrate}`));
```

## Extending with Custom Engines

The architecture supports creating custom playback engines:

```typescript
interface PlaybackEngine {
  attach: (element: HTMLMediaElement) => void;
  detach: () => void;
  load: (src: string) => void;
  destroy: () => void;
  on: (event: string, handler: Function) => void;
}

// Implement for DASH, Shaka, or custom protocols
class CustomPlaybackEngine implements PlaybackEngine {
  // Implementation...
}
```

## Package Dependencies

- **Dependencies:** `hls.js` (for HLS streaming)
- **Used by:** `@vjs-10/media`, `@vjs-10/react-media-elements`, media integration packages

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

- **[@vjs-10/media](../media)** - HTMLMediaElement contracts and utilities
- **[@vjs-10/react-media-elements](../../../react/react-media-elements)** - React integration for media elements

## Future Enhancements

- DASH.js playback engine
- Shaka Player integration
- Native playback fallback engine
- Advanced quality switching strategies
- DRM support abstraction

## License

Apache-2.0
