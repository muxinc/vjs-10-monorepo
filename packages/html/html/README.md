# @vjs-10/html

> Complete HTML/Web Components library for building media players

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fhtml-blue)](https://www.npmjs.com/package/@vjs-10/html)

**Status:** Early Development

## Overview

`@vjs-10/html` is a comprehensive library for building media players with vanilla JavaScript and Web Components. It provides a complete set of UI components, state management, and utilities for creating feature-rich, accessible video and audio players.

## Key Features

- **Complete UI Library** - Full suite of player components
- **Web Components** - Standards-based custom elements
- **Default Skin** - Production-ready player theme
- **Framework Agnostic** - Works with vanilla JS or any framework
- **HLS/DASH Support** - Built-in streaming protocol support
- **Accessible** - WCAG compliant with keyboard navigation
- **Customizable** - Style with CSS, extend with components
- **Type Safe** - Full TypeScript support

## Installation

```bash
npm install @vjs-10/html
```

## Quick Start

### Minimal Player

```typescript
import '@vjs-10/html';

// Use the complete player in HTML
const html = `
  <vjs-player src="video.mp4" controls poster="poster.jpg">
  </vjs-player>
`;
```

### With JavaScript

```typescript
import { VideoPlayer } from '@vjs-10/html';

// Create player programmatically
const player = new VideoPlayer({
  src: 'https://example.com/video.mp4',
  poster: 'poster.jpg',
  controls: true,
  autoplay: false,
});

document.body.appendChild(player);

// Player API
player.play();
player.pause();
player.currentTime = 30;
player.volume = 0.5;
```

### HLS Streaming

```html
<!-- HLS support automatically enabled -->
<vjs-player
  src="https://example.com/stream.m3u8"
  controls
  autoplay
  muted>
</vjs-player>
```

## Components

### Player Container

The main player component that includes all UI elements:

```html
<vjs-player
  src="video.mp4"
  poster="poster.jpg"
  controls
  autoplay
  muted
  loop>
</vjs-player>
```

### Media Provider

Provides shared state to child components:

```html
<vjs-media-provider>
  <vjs-video src="video.mp4"></vjs-video>
  <vjs-controls>
    <vjs-play-button></vjs-play-button>
    <vjs-time-slider></vjs-time-slider>
    <vjs-volume-slider></vjs-volume-slider>
  </vjs-controls>
</vjs-media-provider>
```

### Control Components

Individual control elements:

```html
<!-- Playback controls -->
<vjs-play-button></vjs-play-button>
<vjs-pause-button></vjs-pause-button>

<!-- Time controls -->
<vjs-time-slider></vjs-time-slider>
<vjs-current-time-display></vjs-current-time-display>
<vjs-duration-display></vjs-duration-display>

<!-- Volume controls -->
<vjs-mute-button></vjs-mute-button>
<vjs-volume-slider></vjs-volume-slider>

<!-- Screen controls -->
<vjs-fullscreen-button></vjs-fullscreen-button>

<!-- UI utilities -->
<vjs-tooltip></vjs-tooltip>
<vjs-popover></vjs-popover>
```

## Default Skin

The package includes a production-ready default skin:

```typescript
import '@vjs-10/html';
import '@vjs-10/html/themes/default.css';

// Player with default theme
const html = `
  <vjs-player class="vjs-theme-default" src="video.mp4" controls>
  </vjs-player>
`;
```

### Skin Features

- **Responsive Layout** - Adapts to container size
- **Touch Support** - Mobile-friendly controls
- **Keyboard Navigation** - Full accessibility support
- **Hover States** - Interactive feedback
- **Loading States** - Buffering indicators
- **Error States** - User-friendly error messages

## Customization

### Custom CSS

```css
/* Override default styles */
vjs-player {
  --vjs-primary-color: #007bff;
  --vjs-control-size: 48px;
  --vjs-control-spacing: 8px;
  --vjs-font-family: 'Inter', sans-serif;
}

/* Style individual components */
vjs-play-button {
  background: var(--vjs-primary-color);
  border-radius: 50%;
  padding: 12px;
}

vjs-time-slider {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
}
```

### CSS Custom Properties

```css
:root {
  /* Colors */
  --vjs-primary-color: #007bff;
  --vjs-text-color: #ffffff;
  --vjs-background-color: rgba(0, 0, 0, 0.7);

  /* Sizing */
  --vjs-control-size: 44px;
  --vjs-control-spacing: 8px;
  --vjs-control-bar-height: 48px;

  /* Typography */
  --vjs-font-family: system-ui, sans-serif;
  --vjs-font-size: 14px;

  /* Timing */
  --vjs-transition-duration: 0.2s;
}
```

### Custom Controls Layout

```html
<vjs-media-provider>
  <vjs-video src="video.mp4"></vjs-video>

  <!-- Custom control bar layout -->
  <div class="custom-controls">
    <div class="left-controls">
      <vjs-play-button></vjs-play-button>
      <vjs-current-time-display></vjs-current-time-display>
      <vjs-duration-display></vjs-duration-display>
    </div>

    <div class="center-controls">
      <vjs-time-slider></vjs-time-slider>
    </div>

    <div class="right-controls">
      <vjs-mute-button></vjs-mute-button>
      <vjs-volume-slider></vjs-volume-slider>
      <vjs-fullscreen-button></vjs-fullscreen-button>
    </div>
  </div>
</vjs-media-provider>
```

## Advanced Usage

### Programmatic Control

```typescript
import { VideoPlayer } from '@vjs-10/html';

const player = new VideoPlayer({ src: 'video.mp4' });
document.body.appendChild(player);

// Playback control
await player.play();
player.pause();

// Seeking
player.currentTime = 30;
player.fastSeek(60);

// Volume
player.volume = 0.8;
player.muted = true;

// Fullscreen
await player.requestFullscreen();
await player.exitFullscreen();

// Playback rate
player.playbackRate = 1.5;

// Event listeners
player.addEventListener('play', () => console.log('Playing'));
player.addEventListener('pause', () => console.log('Paused'));
player.addEventListener('ended', () => console.log('Ended'));
```

### State Management

```typescript
import { VideoPlayer } from '@vjs-10/html';
import { createMediaStore } from '@vjs-10/media-store';

// Access player's media store
const player = new VideoPlayer({ src: 'video.mp4' });
const store = player.store;

// Subscribe to state changes
store.currentTime.subscribe((time) => {
  console.log('Time:', time);
});

store.paused.subscribe((paused) => {
  console.log('Paused:', paused);
});

// Update state programmatically
store.volume.set(0.5);
store.currentTime.set(30);
```

### Custom Components

```typescript
import { MediaProvider } from '@vjs-10/html';

// Define custom control component
class CustomButton extends HTMLElement {
  connectedCallback() {
    // Access shared media store via context
    const provider = this.closest('vjs-media-provider') as MediaProvider;
    const store = provider.store;

    this.addEventListener('click', () => {
      // Toggle play/pause
      store.paused.set(!store.paused.get());
    });

    // Update UI based on state
    store.paused.subscribe((paused) => {
      this.textContent = paused ? '▶' : '⏸';
    });
  }
}

customElements.define('custom-play-button', CustomButton);
```

### Playlist Support

```typescript
import { VideoPlayer } from '@vjs-10/html';

const playlist = [
  { src: 'video1.mp4', title: 'Video 1' },
  { src: 'video2.mp4', title: 'Video 2' },
  { src: 'video3.mp4', title: 'Video 3' },
];

const player = new VideoPlayer({ src: playlist[0].src });
let currentIndex = 0;

// Play next video when current ends
player.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  player.src = playlist[currentIndex].src;
  player.load();
  player.play();
});
```

## Accessibility

All components include:

- **ARIA attributes** - Screen reader support
- **Keyboard navigation** - Complete keyboard control
- **Focus management** - Visible focus indicators
- **Semantic HTML** - Proper element roles

### Keyboard Shortcuts

- `Space` - Play/pause
- `←/→` - Seek backward/forward 5 seconds
- `↑/↓` - Volume up/down
- `M` - Toggle mute
- `F` - Toggle fullscreen
- `0-9` - Seek to 0-90% of video

## Browser Support

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Package Dependencies

- **Dependencies:**
  - `@vjs-10/core` - Core components
  - `@vjs-10/media-store` - State management
  - `@vjs-10/html-icons` - Icon components
  - `@vjs-10/html-media-elements` - Media elements
  - `@vjs-10/html-media-store` - Store integration
  - `@floating-ui/dom` - Tooltip/popover positioning
  - `@open-wc/context-protocol` - State sharing

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

See the HTML demo for complete examples:

```bash
# Run the demo
pnpm dev:html
```

## Related Packages

- **[@vjs-10/react](../../react/react)** - React alternative
- **[@vjs-10/media-store](../../core/media-store)** - Core state management
- **[@vjs-10/html-media-elements](../html-media-elements)** - Media elements

## Migrating from Video.js 8.x

Coming soon - migration guide for Video.js 8.x users.

## License

Apache-2.0
