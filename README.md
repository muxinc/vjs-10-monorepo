# VJS-10 Monorepo

> Modern, modular media player framework for web, React, and React Native

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

A monorepo for Video.js 10 related library packages, organized by platform and runtime environment with a clean dependency hierarchy.

---

### 🚧 Note to new viewers 🚧

\[90s under-construction gif\]

Thanks for checking out the project! It's in its early stages and currently a mix of protoyping and early structure pointing in the direction we want to go with Video.js v10 (so be kind 🙏).

#### Get up to speed

- Read the [v10 discussion topic](https://github.com/videojs/video.js/discussions/9035)
- Watch [Heff's recent presentation](https://players.brightcove.net/3737230800001/eyILA5XG7K_default/index.html?videoId=6379311036112)
- More roadmap and architecture docs to come...

#### How you can help currently

- Run the React and HTML demos
- Give us feedback in a github issue on:
  - The aesthetics of the player(s)
  - The initial embed code and component structure
  - The general direction

Thank you!

---

## Quick Start

### HTML / Vanilla JavaScript

```bash
npm install @vjs-10/html
```

```html
<vjs-player src="video.mp4" controls poster="poster.jpg"></vjs-player>
```

### React

```bash
npm install @vjs-10/react
```

```jsx
import { VideoPlayer } from '@vjs-10/react';

<VideoPlayer src="video.mp4" controls poster="poster.jpg" />
```

### React Native

```bash
npm install @vjs-10/react-native
```

```jsx
import { VideoPlayer } from '@vjs-10/react-native';

<VideoPlayer source={{ uri: 'video.mp4' }} controls />
```

---

## Structure

```bash
vjs-10-monorepo/
├── packages/
│   ├── core/               # Runtime-agnostic packages
│   │   ├── media-store/    # State abstraction for media
│   │   ├── playback-engine/# Abstraction for media source management
│   │   ├── media/          # HTMLMediaElement contracts and utilities
│   │   └── icons/          # Environment-agnostic SVG icons
│   ├── html/               # DOM/Browser packages
│   │   ├── html-icons/     # HTML/DOM icon components
│   │   ├── html-media-elements/ # HTML media element components
│   │   ├── html-media-store/    # HTML media store integration
│   │   └── html/           # Complete HTML UI library
│   ├── react/              # React packages
│   │   ├── react-icons/    # React icon components
│   │   ├── react-media-elements/ # React media element components
│   │   ├── react-media-store/   # React media store hooks and context
│   │   └── react/          # Complete React UI library
│   └── react-native/       # React Native packages
│       ├── react-native-icons/  # React Native icon components
│       ├── react-native-media-elements/ # React Native media components
│       └── react-native/   # Complete React Native UI library
├── examples/               # Demo applications
└── website/                # Astro-based website (docs & blog)
```

## Packages

### Core Packages (Runtime Agnostic)

Foundation packages that work in any JavaScript environment.

| Package | Description | Links |
|---------|-------------|-------|
| **@vjs-10/media-store** | Reactive state management for media players | [README](packages/core/media-store/README.md) |
| **@vjs-10/playback-engine** | Abstraction layer for streaming engines (HLS.js, Dash.js) | [README](packages/core/playback-engine/README.md) |
| **@vjs-10/media** | HTMLMediaElement contracts and utilities | [README](packages/core/media/README.md) |
| **@vjs-10/icons** | SVG icon source library | [README](packages/core/icons/README.md) |
| **@vjs-10/core** | Core UI components (sliders, utilities) | [README](packages/core/core/README.md) |

### HTML/DOM Packages

Web Components and DOM-specific implementations.

| Package | Description | Links |
|---------|-------------|-------|
| **@vjs-10/html-icons** | Web Component icon elements | [README](packages/html/html-icons/README.md) |
| **@vjs-10/html-media-elements** | Enhanced media element Web Components | [README](packages/html/html-media-elements/README.md) |
| **@vjs-10/html-media-store** | DOM integration for media store | [README](packages/html/html-media-store/README.md) |
| **@vjs-10/html** | **Complete HTML media player library** | [README](packages/html/html/README.md) |

### React Packages

React components, hooks, and integrations.

| Package | Description | Links |
|---------|-------------|-------|
| **@vjs-10/react-icons** | React icon components | [README](packages/react/react-icons/README.md) |
| **@vjs-10/react-media-elements** | React media element components and hooks | [README](packages/react/react-media-elements/README.md) |
| **@vjs-10/react-media-store** | React hooks and context for media state | [README](packages/react/react-media-store/README.md) |
| **@vjs-10/react** | **Complete React media player library** | [README](packages/react/react/README.md) |

### React Native Packages

React Native components and integrations (coming soon).

| Package | Description |
|---------|-------------|
| **@vjs-10/react-native-icons** | React Native icon components (requires react-native-svg) |
| **@vjs-10/react-native-media-elements** | React Native media components (requires react-native-video) |
| **@vjs-10/react-native** | **Complete React Native media player library** |

## Getting Started

### Installation

```bash
nvm use
```

```bash
pnpm install
```

### Building

Build all packages:

```bash
pnpm build
```

Build specific packages:

```bash
pnpm -F media build

pnpm -F html build
pnpm -F html-icons build

pnpm -F react build
pnpm -F react-icons build
```

### Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build only library packages (excludes examples)
pnpm build:libs

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run all dev servers in parallel
pnpm dev

# Run specific dev servers
pnpm dev:html    # HTML demo
pnpm dev:react   # React demo
pnpm dev:website # Website (docs & blog)
```

## Architecture & Design Philosophy

### Dependency Hierarchy

The monorepo follows a strict dependency hierarchy to ensure modularity and prevent circular dependencies:

```
Core Packages (runtime-agnostic)
    ↓
Platform Packages (HTML, React, React Native)
    ↓
Complete UI Libraries
```

**Rules:**
- **Core packages** have no dependencies on other vjs-10 packages
- **HTML packages** depend only on core packages
- **React packages** depend only on core packages (peer dependency on React)
- **React Native packages** depend only on core packages (peer dependencies on React Native ecosystem)

This ensures:
- Maximum code reusability across platforms
- Clear separation of concerns
- No circular dependencies
- Tree-shakeable, modular architecture

### Key Design Decisions

**State Management** - Built on [nanostores](https://github.com/nanostores/nanostores) for minimal, reactive state that works across all platforms.

**Streaming Support** - HLS.js integration for adaptive bitrate streaming, with extensible design for DASH.js and other engines.

**Web Components** - Standards-based custom elements for HTML/DOM implementation, ensuring framework-agnostic usage.

**TypeScript First** - Full TypeScript support with strict type checking across all packages.

**Accessibility** - WCAG 2.1 AA compliance with keyboard navigation, ARIA attributes, and screen reader support.

## TypeScript

All packages are written in TypeScript and use project references for efficient compilation. The monorepo uses a shared `tsconfig.base.json` for consistent compiler options across all packages.

Key TypeScript features:
- Strict mode enabled with additional checks
- Path mappings for all `@vjs-10/*` packages
- Composite builds for incremental compilation
- Full type definitions included

## Features

- ✅ **HLS Streaming** - Built-in support via HLS.js
- ✅ **Web Components** - Standards-based custom elements
- ✅ **React Integration** - Full React component library
- ✅ **State Management** - Reactive state with nanostores
- ✅ **TypeScript** - Complete type definitions
- ✅ **Accessible** - WCAG 2.1 AA compliant
- ✅ **SSR Ready** - Works with Next.js, Remix, etc.
- ✅ **Tree-shakeable** - Modular architecture
- 🚧 **DASH Streaming** - Coming soon
- 🚧 **React Native** - Coming soon
- 🚧 **Vue Components** - Coming soon
- 🚧 **Svelte Components** - Coming soon

## Contributing

Contributions are welcome! Please read our [CLAUDE.md](CLAUDE.md) for development guidelines and architecture details.

### Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/videojs/vjs-10-monorepo.git
   cd vjs-10-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build packages**
   ```bash
   pnpm build
   ```

4. **Run development servers**
   ```bash
   pnpm dev          # All demos in parallel
   pnpm dev:html     # HTML demo only
   pnpm dev:react    # React demo only
   pnpm dev:website  # Website only
   ```

5. **Make your changes**
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
   - Add tests if applicable
   - Update documentation as needed

6. **Submit a pull request**

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
- `feat(react): add picture-in-picture component`
- `fix(media-store): correct time sync issue`
- `docs(html): update component API documentation`

## Getting Help

- **Documentation** - [Website](https://videojs.github.io/vjs-10-monorepo/) (coming soon)
- **GitHub Discussions** - [v10 Discussion](https://github.com/videojs/video.js/discussions/9035)
- **Issues** - [Report bugs or request features](https://github.com/videojs/vjs-10-monorepo/issues)

## Related Projects

- [Video.js](https://github.com/videojs/video.js) - Video.js 8.x (current stable)
- [HLS.js](https://github.com/video-dev/hls.js) - HLS streaming library
- [nanostores](https://github.com/nanostores/nanostores) - State management

## License

Apache-2.0

Copyright (c) Video.js Contributors
