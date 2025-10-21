# @vjs-10/html-icons

> Web Component icon elements for Video.js

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fhtml--icons-blue)](https://www.npmjs.com/package/@vjs-10/html-icons)

**Status:** Early Development

## Overview

`@vjs-10/html-icons` provides Web Component implementations of Video.js icons. These are DOM-ready icon elements that can be used directly in HTML or with any framework that supports custom elements.

## Key Features

- **Web Components** - Custom element icon implementations
- **Framework Agnostic** - Works with vanilla JS, React, Vue, Angular, etc.
- **Accessible** - Built-in ARIA attributes and semantic markup
- **Customizable** - Style with CSS custom properties
- **Lightweight** - Minimal runtime overhead

## Installation

```bash
npm install @vjs-10/html-icons
```

## Quick Start

### Import and Use

```typescript
import '@vjs-10/html-icons';

// Or import specific icons
import '@vjs-10/html-icons/play';
import '@vjs-10/html-icons/pause';
```

### In HTML

```html
<!-- After importing, use custom elements -->
<vjs-icon-play></vjs-icon-play>
<vjs-icon-pause></vjs-icon-pause>
<vjs-icon-volume-high></vjs-icon-volume-high>
<vjs-icon-volume-low></vjs-icon-volume-low>
<vjs-icon-volume-off></vjs-icon-volume-off>
<vjs-icon-fullscreen-enter></vjs-icon-fullscreen-enter>
<vjs-icon-fullscreen-exit></vjs-icon-fullscreen-exit>
```

### With JavaScript

```typescript
import { PauseIcon, PlayIcon, VolumeHighIcon } from '@vjs-10/html-icons';

// Create icon element
const playIcon = new PlayIcon();
document.body.appendChild(playIcon);

// Or use createElement
const pauseIcon = document.createElement('vjs-icon-pause');
document.body.appendChild(pauseIcon);
```

## Styling

### CSS Custom Properties

```css
vjs-icon-play {
  /* Size */
  --icon-size: 24px;

  /* Color */
  --icon-color: #fff;

  /* Opacity */
  --icon-opacity: 1;

  /* Additional styles */
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--icon-color);
}
```

### Standard CSS

```css
vjs-icon-play {
  width: 32px;
  height: 32px;
  color: blue;
  cursor: pointer;
  transition: color 0.2s;
}

vjs-icon-play:hover {
  color: lightblue;
}
```

## Available Icons

### Playback Controls

- `<vjs-icon-play>` - Play button
- `<vjs-icon-pause>` - Pause button
- `<vjs-icon-spinner>` - Loading spinner

### Volume Controls

- `<vjs-icon-volume-high>` - High volume
- `<vjs-icon-volume-low>` - Low volume
- `<vjs-icon-volume-off>` - Muted

### Screen Controls

- `<vjs-icon-fullscreen-enter>` - Enter fullscreen
- `<vjs-icon-fullscreen-exit>` - Exit fullscreen
- `<vjs-icon-fullscreen-enter-alt>` - Alternative fullscreen enter
- `<vjs-icon-fullscreen-exit-alt>` - Alternative fullscreen exit

## Usage Examples

### Button with Icon

```html
<button class="play-button">
  <vjs-icon-play></vjs-icon-play>
  <span>Play Video</span>
</button>

<style>
  .play-button {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  vjs-icon-play {
    width: 20px;
    height: 20px;
  }
</style>
```

### Toggle Icon State

```typescript
import { PauseIcon, PlayIcon } from '@vjs-10/html-icons';

const button = document.querySelector('.play-pause-button');
let isPlaying = false;

button.addEventListener('click', () => {
  isPlaying = !isPlaying;

  // Replace icon
  const oldIcon = button.querySelector('vjs-icon-play, vjs-icon-pause');
  const newIcon = isPlaying
    ? new PauseIcon()
    : new PlayIcon();

  oldIcon?.replaceWith(newIcon);
});
```

### With Framework (React Example)

```jsx
// React automatically supports Web Components
function PlayButton() {
  return (
    <button>
      <vjs-icon-play></vjs-icon-play>
      Play
    </button>
  );
}
```

### Dynamic Icon Selection

```typescript
const iconMap = {
  play: 'vjs-icon-play',
  pause: 'vjs-icon-pause',
  'volume-high': 'vjs-icon-volume-high',
  'volume-off': 'vjs-icon-volume-off',
};

function createIcon(name: keyof typeof iconMap) {
  return document.createElement(iconMap[name]);
}

const playIcon = createIcon('play');
const volumeIcon = createIcon('volume-high');
```

## Accessibility

All icon components include:

- **ARIA labels** - Screen reader friendly descriptions
- **Role attributes** - Semantic roles for assistive tech
- **Focusable** - Keyboard navigation support

```html
<!-- Automatically includes accessibility attributes -->
<vjs-icon-play role="img" aria-label="Play"> </vjs-icon-play>
```

## Architecture

```
@vjs-10/icons (SVG source)
    ↓
@vjs-10/html-icons (Web Components)
    ↓
@vjs-10/html (Complete player UI)
```

This package:

- Transforms SVG sources into Web Components
- Registers custom elements in the browser
- Provides a DOM-native icon system

## API Reference

### Icon Element Interface

```typescript
interface IconElement extends HTMLElement {
  // Standard HTML element properties
  className: string;
  style: CSSStyleDeclaration;

  // Custom properties
  size?: number;
  color?: string;
}
```

### Methods

```typescript
// All standard HTMLElement methods available
icon.setAttribute('aria-label', 'Custom label');
icon.classList.add('custom-class');
icon.style.width = '32px';
```

## Package Dependencies

- **Dependencies:** `@vjs-10/icons` (SVG source assets)
- **Used by:** `@vjs-10/html` (HTML player UI)

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

## Browser Support

Web Components require:

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

For older browsers, use a Web Components polyfill.

## Related Packages

- **[@vjs-10/icons](../../core/icons)** - Source SVG assets
- **[@vjs-10/react-icons](../../react/react-icons)** - React icon components
- **[@vjs-10/html](../html)** - Complete HTML player

## License

Apache-2.0
