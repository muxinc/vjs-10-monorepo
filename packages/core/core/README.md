# @vjs-10/core

> Core components and utilities for Video.js

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fcore-blue)](https://www.npmjs.com/package/@vjs-10/core)

**Status:** Early Development

## Overview

`@vjs-10/core` provides runtime-agnostic core components and utilities shared across Video.js packages. These are foundational building blocks used by platform-specific implementations (HTML, React, React Native) to create consistent media player experiences.

## Key Features

- **Core UI Components** - Platform-agnostic slider components
- **Shared Utilities** - Common helpers for time ranges, formatting, etc.
- **State Management** - Built on nanostores for reactive state
- **Runtime Agnostic** - Works in any JavaScript environment
- **Type Safe** - Full TypeScript support

## Installation

```bash
npm install @vjs-10/core
```

## Components

### TimeSlider

A time range slider component for seeking through media.

```typescript
import { TimeSlider } from '@vjs-10/core';

// Create time slider state
const slider = new TimeSlider({
  min: 0,
  max: 100,
  value: 50,
  step: 0.1,
});

// Subscribe to value changes
slider.value.subscribe((currentValue) => {
  console.log('Slider value:', currentValue);
});

// Update value
slider.setValue(75);

// Get current state
const state = slider.getState();
console.log(state); // { min, max, value, step, percentage }
```

### VolumeSlider

A volume slider component for audio level control.

```typescript
import { VolumeSlider } from '@vjs-10/core';

// Create volume slider state
const volumeSlider = new VolumeSlider({
  min: 0,
  max: 1,
  value: 0.8,
  step: 0.01,
});

// Subscribe to volume changes
volumeSlider.value.subscribe((volume) => {
  console.log('Volume level:', volume);
});

// Mute/unmute handling
volumeSlider.setValue(0); // Mute
volumeSlider.setValue(0.8); // Restore volume
```

## Slider API

Both `TimeSlider` and `VolumeSlider` share a common API:

### Constructor Options

```typescript
interface SliderOptions {
  min?: number; // Minimum value (default: 0)
  max?: number; // Maximum value (default: 100)
  value?: number; // Initial value (default: 0)
  step?: number; // Step increment (default: 1)
}
```

### Methods

```typescript
interface SliderMethods {
  // Set slider value
  setValue(newValue: number): void

  // Get current value
  getValue(): number

  // Get complete slider state
  getState(): SliderState

  // Reset to initial value
  reset(): void

  // Destroy slider instance
  destroy(): void
}
```

### State Properties

```typescript
interface SliderState {
  min: number; // Minimum value
  max: number; // Maximum value
  value: number; // Current value
  step: number; // Step increment
  percentage: number; // Value as percentage (0-100)
}

// Access state atoms directly
slider.value.get(); // Current value
slider.percentage.get(); // Percentage representation
```

### Reactive Subscriptions

```typescript
// Subscribe to value changes
const unsubscribe = slider.value.subscribe((value) => {
  console.log('Value changed:', value);
});

// Subscribe to percentage changes
slider.percentage.subscribe((pct) => {
  console.log('Percentage:', pct);
});

// Clean up subscription
unsubscribe();
```

## Use Cases

### Media Progress Bar

```typescript
import { TimeSlider } from '@vjs-10/core';

const progressBar = new TimeSlider({
  min: 0,
  max: videoDuration,
  value: 0,
  step: 0.1,
});

// Update as video plays
videoElement.ontimeupdate = () => {
  progressBar.setValue(videoElement.currentTime);
};

// Seek when user drags slider
progressBar.value.subscribe((time) => {
  if (userIsDragging) {
    videoElement.currentTime = time;
  }
});
```

### Volume Control

```typescript
import { VolumeSlider } from '@vjs-10/core';

const volumeControl = new VolumeSlider({
  min: 0,
  max: 1,
  value: 0.8,
  step: 0.01,
});

// Sync with media element
volumeControl.value.subscribe((volume) => {
  videoElement.volume = volume;
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    const current = volumeControl.getValue();
    volumeControl.setValue(Math.min(1, current + 0.1));
  }
});
```

## Architecture

This package provides the **logical core** that platform implementations build upon:

```
@vjs-10/core (logic/state)
    ↓
    ├─→ @vjs-10/html (DOM implementation)
    ├─→ @vjs-10/react (React implementation)
    └─→ @vjs-10/react-native (React Native implementation)
```

Platform packages add:

- UI rendering (DOM elements, React components, etc.)
- Event handling (mouse, touch, keyboard)
- Styling and theming
- Accessibility features

## Utilities

### Time Range Utilities

```typescript
import { formatTimeRange, parseTimeRange } from '@vjs-10/core';

// Format time ranges for display
formatTimeRange(0, 100); // "0:00 - 1:40"

// Parse time range strings
parseTimeRange('0:00 - 1:40'); // { start: 0, end: 100 }
```

## Package Dependencies

- **Dependencies:** `nanostores` (for reactive state)
- **Used by:** `@vjs-10/html`, `@vjs-10/react`, platform UI packages

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

- **[@vjs-10/media-store](../media-store)** - Media state management
- **[@vjs-10/html](../../../html/html)** - HTML/DOM implementation
- **[@vjs-10/react](../../../react/react)** - React implementation

## Design Philosophy

Core components follow these principles:

- **Logic over presentation** - Focus on behavior, not rendering
- **Reactive state** - Leverage nanostores for efficiency
- **Platform agnostic** - No DOM or React dependencies
- **Composable** - Build complex UIs from simple primitives

## License

Apache-2.0
