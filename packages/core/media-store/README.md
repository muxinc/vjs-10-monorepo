# @vjs-10/media-store

> Runtime-agnostic state management for media players

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fmedia--store-blue)](https://www.npmjs.com/package/@vjs-10/media-store)

**Status:** Early Development

## Overview

`@vjs-10/media-store` provides a lightweight, reactive state management system for media players built on [nanostores](https://github.com/nanostores/nanostores). It's designed to be runtime-agnostic, making it suitable for use across web, React, React Native, and other JavaScript environments.

## Key Features

- **Runtime Agnostic** - Works in any JavaScript environment
- **Reactive State** - Built on nanostores for efficient reactivity
- **Component State Definitions** - Pre-built state models for common UI components
- **State Mediators** - Coordinated state management for playable, audible, and temporal concerns
- **Time Utilities** - Format and parse media time values
- **Type Safe** - Full TypeScript support

## Installation

```bash
npm install @vjs-10/media-store
```

## Quick Start

```typescript
import { createMediaStore } from '@vjs-10/media-store';

// Create a media store instance
const store = createMediaStore();

// Subscribe to state changes
store.paused.subscribe((paused) => {
  console.log('Player paused:', paused);
});

// Update state
store.paused.set(false); // Start playing
```

## Core Concepts

### Media Store

The central store manages all media-related state:

```typescript
import { createMediaStore } from '@vjs-10/media-store';

const store = createMediaStore();

// Access individual state atoms
store.currentTime.set(30); // Seek to 30 seconds
store.volume.set(0.5); // Set volume to 50%
store.muted.set(true); // Mute audio
```

### Component State Definitions

Pre-configured state models for common media UI components:

```typescript
import {
  createPlayButtonState,
  createMuteButtonState,
  createTimeSliderState,
  createVolumeSliderState,
} from '@vjs-10/media-store';

// Create component-specific state
const playButtonState = createPlayButtonState(store);
const muteButtonState = createMuteButtonState(store);
const timeSliderState = createTimeSliderState(store);
const volumeSliderState = createVolumeSliderState(store);
```

Available component state definitions:

- `createPlayButtonState` - Play/pause button state
- `createMuteButtonState` - Mute/unmute button state
- `createFullscreenButtonState` - Fullscreen toggle state
- `createTimeSliderState` - Progress/seek bar state
- `createVolumeSliderState` - Volume control state
- `createCurrentTimeDisplayState` - Current time display state
- `createDurationDisplayState` - Duration display state
- `createPreviewTimeDisplayState` - Preview time on hover state

### State Mediators

Coordinate related state changes:

```typescript
import {
  createPlayableMediator,
  createAudibleMediator,
  createTemporalMediator,
} from '@vjs-10/media-store';

// Playable mediator - manages play/pause/ended states
const playableMediator = createPlayableMediator(store, mediaElement);

// Audible mediator - manages volume/muted states
const audibleMediator = createAudibleMediator(store, mediaElement);

// Temporal mediator - manages time-related states
const temporalMediator = createTemporalMediator(store, mediaElement);
```

### Time Utilities

Format and parse time values:

```typescript
import { formatTime, parseTime } from '@vjs-10/media-store';

// Format seconds to HH:MM:SS or MM:SS
formatTime(90); // "1:30"
formatTime(3661); // "1:01:01"

// Parse time string to seconds
parseTime("1:30"); // 90
parseTime("1:01:01"); // 3661
```

## Architecture

This package is part of the Video.js 10 monorepo and follows the core package philosophy:

- **No platform dependencies** - Pure JavaScript/TypeScript
- **Foundation for other packages** - Used by `@vjs-10/html-media-store`, `@vjs-10/react-media-store`, etc.
- **Nanostores-based** - Leverages the excellent nanostores library for minimal, fast reactivity

## Package Dependencies

- **Dependencies:** `nanostores` (for reactive state)
- **Used by:** `@vjs-10/html-media-store`, `@vjs-10/react-media-store`, platform-specific integrations

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

## API Overview

### Store Creation

- `createMediaStore()` - Creates a new media store instance

### Component State Definitions

- `createPlayButtonState(store)` - Play/pause button state
- `createMuteButtonState(store)` - Mute button state
- `createFullscreenButtonState(store)` - Fullscreen button state
- `createTimeSliderState(store)` - Time slider state
- `createVolumeSliderState(store)` - Volume slider state
- `createCurrentTimeDisplayState(store)` - Current time display state
- `createDurationDisplayState(store)` - Duration display state
- `createPreviewTimeDisplayState(store)` - Preview time display state

### State Mediators

- `createPlayableMediator(store, element)` - Manages playback state
- `createAudibleMediator(store, element)` - Manages audio state
- `createTemporalMediator(store, element)` - Manages time-based state

### Utilities

- `formatTime(seconds)` - Format seconds to time string
- `parseTime(timeString)` - Parse time string to seconds

## Related Packages

- **[@vjs-10/html-media-store](../../../html/html-media-store)** - HTML/DOM integration
- **[@vjs-10/react-media-store](../../../react/react-media-store)** - React hooks and context
- **[@vjs-10/core](../core)** - Shared core components

## License

Apache-2.0
