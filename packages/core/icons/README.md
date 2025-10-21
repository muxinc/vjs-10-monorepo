# @vjs-10/icons

> SVG icon library for Video.js media players

[![npm](https://img.shields.io/badge/npm-%40vjs--10%2Fmedia--store-blue)](https://www.npmjs.com/package/@vjs-10/icons)

**Status:** Early Development

## Overview

`@vjs-10/icons` is a curated collection of SVG icons designed specifically for media player interfaces. This package serves as the single source of truth for all Video.js icons, providing raw SVG assets that platform-specific packages transform into their respective component formats.

## Key Features

- **Curated Media Icons** - Comprehensive set of media player interface icons
- **SVG Source Files** - Raw SVG assets optimized for transformation
- **Platform Agnostic** - Icons serve as source for HTML, React, React Native implementations
- **Optimized Assets** - Clean, minimal SVG markup
- **Consistent Design** - Cohesive visual language across all icons

## Installation

```bash
npm install @vjs-10/icons
```

## Icon Catalog

### Playback Controls

- `play.svg` - Play button
- `pause.svg` - Pause button
- `replay.svg` - Replay/restart button
- `forward.svg` - Skip forward
- `backward.svg` - Skip backward

### Volume Controls

- `volume-high.svg` - High volume indicator
- `volume-medium.svg` - Medium volume indicator
- `volume-low.svg` - Low volume indicator
- `volume-off.svg` / `mute.svg` - Muted state

### Playback Features

- `fullscreen.svg` - Enter fullscreen
- `fullscreen-exit.svg` - Exit fullscreen
- `settings.svg` - Settings menu
- `captions.svg` - Closed captions
- `picture-in-picture.svg` - PiP mode

### Additional Controls

- `airplay.svg` - AirPlay casting
- `chromecast.svg` - Chromecast
- `download.svg` - Download media
- `share.svg` - Share functionality

## Usage

This package is typically used as a dependency by platform-specific icon packages rather than directly by applications.

### Direct SVG Access

```typescript
import { getIconPath } from '@vjs-10/icons';

// Get path to SVG file
const playIconPath = getIconPath('play');

// In Node.js or build tools
import { readFileSync } from 'fs';
const playSvg = readFileSync(playIconPath, 'utf-8');
```

### With Platform Packages

**For Web Components:**

```bash
npm install @vjs-10/html-icons
```

**For React:**

```bash
npm install @vjs-10/react-icons
```

**For React Native:**

```bash
npm install @vjs-10/react-native-icons
```

## Icon Format Standards

All icons in this package follow these guidelines:

- **Format:** SVG 1.1
- **Viewbox:** `0 0 24 24` (standardized 24×24 grid)
- **Stroke:** None (filled icons)
- **Color:** `currentColor` (inherits from context)
- **Optimization:** Minified, cleaned paths
- **Accessibility:** Semantic, descriptive file names

## Architecture

```
@vjs-10/icons (source SVGs)
    ↓
    ├─→ @vjs-10/html-icons (Web Components)
    ├─→ @vjs-10/react-icons (React Components)
    └─→ @vjs-10/react-native-icons (React Native Components)
```

This package serves as:

- **Single source of truth** for all icon designs
- **Asset library** consumed by platform-specific generators
- **Design system foundation** ensuring visual consistency

## Adding New Icons

1. **Design Requirements:**
   - 24×24 viewBox
   - Single color (will be replaced with `currentColor`)
   - Minimal, clean paths
   - Optimized file size

2. **File Naming:**
   - Use kebab-case: `volume-high.svg`
   - Descriptive, clear names
   - Avoid abbreviations

3. **Process:**

   ```bash
   # Add SVG to assets directory
   cp new-icon.svg packages/core/icons/assets/

   # Regenerate platform packages
   cd packages/react/react-icons
   pnpm generate

   cd packages/html/html-icons
   pnpm generate
   ```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Clean build artifacts
pnpm clean
```

## Package Dependencies

- **Dependencies:** None (pure SVG assets)
- **Used by:** `@vjs-10/html-icons`, `@vjs-10/react-icons`, `@vjs-10/react-native-icons`

## Platform Integration

### HTML Icons

Generates Web Component icon elements from SVG sources.

```bash
npm install @vjs-10/html-icons
```

### React Icons

Generates React components with SVGR from SVG sources.

```bash
npm install @vjs-10/react-icons
```

See **[@vjs-10/react-icons](../../../react/react-icons)** for detailed usage.

### React Native Icons

Generates React Native SVG components from SVG sources.

```bash
npm install @vjs-10/react-native-icons
```

## Design Philosophy

Icons follow Video.js design principles:

- **Clarity** - Instantly recognizable at small sizes
- **Consistency** - Uniform stroke weight and visual density
- **Accessibility** - Clear, distinguishable shapes
- **Simplicity** - Minimal visual noise

## Related Packages

- **[@vjs-10/html-icons](../../../html/html-icons)** - Web Component implementation
- **[@vjs-10/react-icons](../../../react/react-icons)** - React component implementation
- **[@vjs-10/core](../core)** - Core Video.js components

## Contributing

When contributing new icons:

1. Follow the design guidelines above
2. Optimize SVGs (remove unnecessary metadata)
3. Test icon clarity at 16×16, 24×24, and 32×32 sizes
4. Ensure `currentColor` is used for fill/stroke
5. Provide context in PR description

## License

Apache-2.0
