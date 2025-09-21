# VJS-10 Monorepo

A monorepo for Video.js 10 related library packages, organized by platform and runtime environment.

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
└── apps/                   # Example applications (coming soon)
```

## Packages

### Core Packages (Runtime Agnostic)

- **@vjs-10/media-store** - State management for media players
- **@vjs-10/playback-engine** - Abstraction layer for media engines (HLS.js, Dash.js, etc.)
- **@vjs-10/media** - HTMLMediaElement contracts and utilities
- **@vjs-10/icons** - SVG icon definitions and utilities

### HTML/DOM Packages

- **@vjs-10/html-icons** - Web component icon elements
- **@vjs-10/html-media-elements** - Web component media elements
- **@vjs-10/html-media-store** - DOM integration for media store
- **@vjs-10/html** - Complete HTML media player UI library

### React Packages

- **@vjs-10/react-icons** - React icon components
- **@vjs-10/react-media-elements** - React media element components
- **@vjs-10/react-media-store** - React hooks and context for media state
- **@vjs-10/react** - Complete React media player UI library

### React Native Packages

- **@vjs-10/react-native-icons** - React Native icon components (requires react-native-svg)
- **@vjs-10/react-native-media-elements** - React Native media components (requires react-native-video)
- **@vjs-10/react-native** - Complete React Native media player UI library

## Getting Started

### Installation

```bash
npm install
```

### Building

Build all packages:

```bash
npm run build
```

Build specific package:

```bash
npm run build --workspace=@vjs-10/core
```

### Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run dev build
npm run dev
```

## Package Dependencies

The packages are designed with clear dependency relationships:

- **Core packages** have no dependencies on other vjs-10 packages
- **HTML packages** depend only on core packages
- **React packages** depend only on core packages (peer dependency on React)
- **React Native packages** depend only on core packages (peer dependencies on React Native, react-native-video, react-native-svg)

This ensures maximum reusability and prevents circular dependencies.

## TypeScript

All packages are written in TypeScript and use project references for efficient compilation. The monorepo uses a shared `tsconfig.base.json` for consistent compiler options across all packages.

## License

Apache-2.0
