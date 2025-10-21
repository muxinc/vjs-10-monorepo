# @vjs-10/html-media-store

> HTML/DOM integration for Video.js media store

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fhtml--media--store-blue)](https://www.npmjs.com/package/@vjs-10/html-media-store)

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

`@vjs-10/html-media-store` provides DOM-specific integration between `@vjs-10/media-store` and HTML media elements. It handles bi-directional synchronization between media element state and the reactive store, enabling automatic UI updates across all connected components.

## Key Features

- **Automatic State Sync** - Bi-directional sync between media element and store
- **DOM Integration** - Native HTMLMediaElement support
- **Event Management** - Automatic event listener setup and cleanup
- **State Mediators** - Pre-configured mediators for common patterns
- **Memory Safe** - Proper cleanup and resource management

## Installation

```bash
npm install @vjs-10/html-media-store
```

## Quick Start

### Basic Integration

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

// Create store
const store = createMediaStore();

// Connect to media element
const videoElement = document.querySelector('video');
const connection = connectMediaStore(store, videoElement);

// Store automatically syncs with video state
store.currentTime.subscribe((time) => {
  console.log('Current time:', time);
});

// Clean up when done
connection.disconnect();
```

## Core API

### connectMediaStore

Connect a media store to an HTMLMediaElement:

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');

const connection = connectMediaStore(store, video, {
  // Optional configuration
  autoPlay: false,
  syncInterval: 250, // ms between time updates
});

// Returns connection object
interface Connection {
  disconnect: () => void; // Clean up listeners
  reconnect: () => void; // Re-establish connection
  pause: () => void; // Pause sync temporarily
  resume: () => void; // Resume sync
}
```

### State Mediators

Pre-configured mediators handle complex state coordination:

```typescript
import {
  setupAudibleMediator,
  setupPlayableMediator,
  setupTemporalMediator,
} from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');

// Playable mediator - play/pause/ended states
const playableMediator = setupPlayableMediator(store, video);

// Audible mediator - volume/muted states
const audibleMediator = setupAudibleMediator(store, video);

// Temporal mediator - time/duration/seeking states
const temporalMediator = setupTemporalMediator(store, video);

// Clean up all mediators
playableMediator.disconnect();
audibleMediator.disconnect();
temporalMediator.disconnect();
```

## State Synchronization

### Automatic Sync

The connection automatically syncs these properties:

**Playback State:**

- `paused` ↔ `video.paused`
- `ended` ↔ `video.ended`
- `seeking` ↔ `video.seeking`

**Time:**

- `currentTime` ↔ `video.currentTime`
- `duration` ↔ `video.duration`

**Volume:**

- `volume` ↔ `video.volume`
- `muted` ↔ `video.muted`

**Loading:**

- `buffered` ↔ `video.buffered`
- `readyState` ↔ `video.readyState`

### Bi-directional Updates

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');
connectMediaStore(store, video);

// Update store → updates video
store.paused.set(false); // Video starts playing

// Update video → updates store
video.currentTime = 30; // Store reflects new time
```

## Advanced Usage

### Custom Sync Configuration

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';

const connection = connectMediaStore(store, video, {
  // Sync configuration
  syncInterval: 100, // Update frequency (ms)
  syncOnSeek: true, // Sync immediately on seek
  syncOnPlay: true, // Sync immediately on play

  // Event configuration
  useCapture: false, // Event capture phase
  passive: true, // Passive event listeners

  // State configuration
  persistVolume: true, // Remember volume in localStorage
  persistMuted: true, // Remember muted state
});
```

### Selective State Sync

```typescript
import { createSyncGroup } from '@vjs-10/html-media-store';

// Only sync specific properties
const syncGroup = createSyncGroup(store, video, {
  properties: ['currentTime', 'paused', 'volume'],
  events: ['timeupdate', 'play', 'pause', 'volumechange'],
});

syncGroup.start();
syncGroup.stop();
```

### Multiple Elements

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();

// Connect multiple elements to same store
const video1 = document.querySelector('#video1');
const video2 = document.querySelector('#video2');

const connection1 = connectMediaStore(store, video1);
const connection2 = connectMediaStore(store, video2);

// Both videos sync to same state
store.paused.set(false); // Both videos play
```

## Use Cases

### Player with Custom Controls

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');
connectMediaStore(store, video);

// Create custom play button
const playButton = document.querySelector('.play-button');
playButton.addEventListener('click', () => {
  store.paused.set(!store.paused.get());
});

// Update button based on state
store.paused.subscribe((paused) => {
  playButton.textContent = paused ? 'Play' : 'Pause';
});
```

### Progress Bar Sync

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');
connectMediaStore(store, video);

const progressBar = document.querySelector('.progress-bar');

// Update progress bar from store
store.currentTime.subscribe((time) => {
  const duration = store.duration.get();
  const percentage = (time / duration) * 100;
  progressBar.style.width = `${percentage}%`;
});

// Seek from progress bar
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = x / rect.width;
  const duration = store.duration.get();
  store.currentTime.set(duration * percentage);
});
```

### State Persistence

```typescript
import { connectMediaStore } from '@vjs-10/html-media-store';
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();
const video = document.querySelector('video');
connectMediaStore(store, video);

// Save state to localStorage
store.volume.subscribe((volume) => {
  localStorage.setItem('player-volume', volume.toString());
});

store.currentTime.subscribe((time) => {
  if (time > 0) {
    localStorage.setItem('player-position', time.toString());
  }
});

// Restore state
const savedVolume = localStorage.getItem('player-volume');
if (savedVolume) {
  store.volume.set(Number.parseFloat(savedVolume));
}

const savedPosition = localStorage.getItem('player-position');
if (savedPosition) {
  store.currentTime.set(Number.parseFloat(savedPosition));
}
```

## API Reference

### Functions

```typescript
// Main connection function
function connectMediaStore(
  store: MediaStore,
  element: HTMLMediaElement,
  options?: ConnectionOptions
): Connection

// Mediator setup functions
function setupPlayableMediator(store: MediaStore, element: HTMLMediaElement): Mediator
function setupAudibleMediator(store: MediaStore, element: HTMLMediaElement): Mediator
function setupTemporalMediator(store: MediaStore, element: HTMLMediaElement): Mediator
```

### Types

```typescript
interface ConnectionOptions {
  syncInterval?: number;
  syncOnSeek?: boolean;
  syncOnPlay?: boolean;
  useCapture?: boolean;
  passive?: boolean;
  persistVolume?: boolean;
  persistMuted?: boolean;
}

interface Connection {
  disconnect: () => void;
  reconnect: () => void;
  pause: () => void;
  resume: () => void;
}

interface Mediator {
  disconnect: () => void;
  pause: () => void;
  resume: () => void;
}
```

## Package Dependencies

- **Dependencies:**
  - `@vjs-10/media-store` - State management
  - `@vjs-10/html-media-elements` - Media element components
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

- **[@vjs-10/media-store](../../core/media-store)** - Core state management
- **[@vjs-10/html-media-elements](../html-media-elements)** - Media elements
- **[@vjs-10/html](../html)** - Complete HTML player
- **[@vjs-10/react-media-store](../../react/react-media-store)** - React equivalent

## License

Apache-2.0
