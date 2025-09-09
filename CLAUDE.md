# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Video.js 10 monorepo organized by platform/runtime with a clear dependency hierarchy:

### Package Structure

- **Core packages** (`packages/core/*`) - Runtime-agnostic packages that form the foundation
- **HTML packages** (`packages/html/*`) - DOM/Browser-specific implementations
- **React packages** (`packages/react/*`) - React-specific implementations
- **React Native packages** (`packages/react-native/*`) - React Native implementations

### Dependency Hierarchy

- Core packages have no dependencies on other vjs-10 packages
- HTML packages depend only on core packages
- React packages depend only on core packages (with React peer deps)
- React Native packages depend only on core packages (with React Native peer deps)

This prevents circular dependencies and ensures maximum reusability.

### Key Core Packages

- `@vjs-10/media-store` - State management for media players with specialized state mediators:
  - `audible` - Volume, mute, and audio-related state
  - `playable` - Play/pause and playback state
  - `temporal` - Time-based controls (currentTime, duration, seeking)
- `@vjs-10/playback-engine` - Abstraction layer for media engines (HLS.js, Dash.js, etc.)
- `@vjs-10/media` - HTMLMediaElement contracts and utilities
- `@vjs-10/icons` - SVG icon definitions and utilities

### Platform Packages

Each platform has specialized packages for different concerns:

**HTML Platform:**

- `@vjs-10/html` - Core HTML components (PlayButton, MuteButton, TimeRange, VolumeRange)
- `@vjs-10/html-icons` - HTML icon components
- `@vjs-10/html-media-elements` - HTML media element wrappers
- `@vjs-10/html-media-store` - HTML-specific MediaStore integration

**React Platform:**

- `@vjs-10/react` - Native React components with hooks
- `@vjs-10/react-icons` - Auto-generated React icon components
- `@vjs-10/react-media-elements` - React media element wrappers
- `@vjs-10/react-media-store` - React Context and hooks for MediaStore

**React Native Platform:**

- `@vjs-10/react-native` - React Native components
- `@vjs-10/react-native-icons` - React Native icon components
- `@vjs-10/react-native-media-elements` - React Native media wrappers
- `@vjs-10/react-native-media-store` - React Native MediaStore integration

## Common Development Commands

### Monorepo Commands (run from root)

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests across all packages
npm run test

# Type checking across all packages
npm run typecheck

# Lint all packages
npm run lint

# Clean all packages
npm run clean
```

### Working with Specific Packages

```bash
# Build specific package
npm run build --workspace=@vjs-10/media-store

# Work in specific package directory
cd packages/core/media-store
npm run build
```

### Development & Examples

```bash
# Run HTML example
npm run dev:html

# Run React example
npm run dev:react

# Build libraries only (exclude examples)
npm run build:libs
```

#### Example Applications

- `examples/html-demo` - HTML/TypeScript example using Vite
- `examples/react-demo` - React/TypeScript example using Vite
- `examples/react-native-demo` - React Native example (placeholder)

## TypeScript Configuration

The monorepo uses TypeScript project references for efficient compilation:

- `tsconfig.base.json` - Shared compiler options with strict settings
- `tsconfig.json` - Root config with path mappings and project references
- Each package has its own `tsconfig.json` extending the base

Key TypeScript features:

- Strict mode enabled with additional checks (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Path mappings for all `@vjs-10/*` packages point to source directories
- Composite builds for incremental compilation

## Package Development

### Individual Package Scripts

Most packages follow this pattern:

```bash
npm run build    # Compile TypeScript (tsc)
npm run test     # Currently placeholder "No tests yet"
npm run clean    # Remove dist directory
```

### Package Types

- **Core packages** - Pure TypeScript, no external dependencies
- **HTML packages** - May include DOM-specific code, depend on core packages
- **React packages** - Include React peer dependencies, depend on core packages
- **React Native packages** - Include React Native peer dependencies (react-native-video, react-native-svg)

## Workspace Management

This uses npm workspaces with the following workspace patterns:

- `packages/core/*`
- `packages/html/*`
- `packages/react/*`
- `packages/react-native/*`

Internal dependencies use `workspace:*` protocol for linking between packages.

## Build System

### Turbo Build Pipeline

The monorepo uses [Turbo](https://turbo.build/) for efficient task orchestration:

- **Parallel builds** with dependency resolution
- **Incremental builds** with intelligent caching
- **Task dependencies** ensure proper build order
- **Development mode** with hot reloading for examples

### Build Tooling by Package Type

- **Core packages**: Rollup with TypeScript for dual ESM/CJS output
- **Platform packages**: TypeScript compilation with tsup
- **Examples**: Vite for fast development and building

## State Management Architecture

### Layered State Mediators

The `@vjs-10/media-store` uses specialized state mediators:

- **`audible`** - Volume, mute, and volume level state
- **`playable`** - Play/pause, loading, and playback state
- **`temporal`** - Time-based state (currentTime, duration, seeking)

### Component State Definitions

Shared component logic is defined in core and consumed by platforms:

```typescript
// Core definition (platform-agnostic)
export const muteButtonStateDefinition = {
  keys: ['muted', 'volumeLevel'],
  stateTransform: (rawState) => ({
    /* transform logic */
  }),
  createRequestMethods: (dispatch) => ({
    /* request methods */
  }),
};

// Platform implementations use the shared definition
const state = muteButtonStateDefinition.stateTransform(rawState);
const methods = muteButtonStateDefinition.createRequestMethods(dispatch);
```

## Component Development Patterns

### Hook-Style Architecture

All components follow a consistent hook-style pattern with three key parts:

1. **State Hook** (`useXState`) - Manages MediaStore subscription and state transformation
2. **Props Hook** (`useXProps`) - Handles element attributes/properties based on state
3. **Render Function** (`renderX`) - Platform-specific rendering logic

#### Example: MuteButton Implementation

```typescript
// 1. State Hook - shared logic
export const useMuteButtonState = {
  keys: ['muted', 'volumeLevel'],
  transform: (rawState, mediaStore) => ({
    ...muteButtonStateDefinition.stateTransform(rawState),
    ...muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
  }),
};

// 2. Props Hook - platform-specific attributes
export const useMuteButtonProps = (state, element) => ({
  'data-muted': state.muted,
  'data-volume-level': state.volumeLevel,
  'aria-label': state.muted ? 'unmute' : 'mute',
});

// 3. Connected Component - factory combination
export const MuteButton = toConnectedComponent(MuteButtonBase, useMuteButtonState, useMuteButtonProps, 'MuteButton');
```

### Current Component Library

- **Buttons**: PlayButton, MuteButton
- **Ranges**: TimeRange, VolumeRange
- **Display**: DurationDisplay, TimeDisplay
- **Icons**: Platform-specific icon components for all UI elements

## Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) for commit messages.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates

### Scope Examples

Use package names or areas of the codebase:

- `feat(media-store): add pause state management`
- `fix(react-icons): resolve SVG rendering issue`
- `docs(readme): update installation instructions`
- `chore(deps): update typescript to 5.4.0`

### Breaking Changes

For breaking changes, add `!` after the type/scope:

```
feat!: remove deprecated playback API
feat(media-store)!: change state interface structure
```

## Migration from Media Chrome

This project represents a significant architectural evolution from Media Chrome, drawing heavy inspiration from varioius other projects as well. For detailed information about migrating components, state management, styling, and React patterns from Media Chrome to VJS-10, see:

**[MEDIA_CHROME_MIGRATION.md](./MEDIA_CHROME_MIGRATION.md)**

Key migration topics covered:

- **State Management**: From monolithic MediaStore to layered nanostores with mediators
- **Component Architecture**: From web components to hook-style with platform adapters
- **React Integration**: From auto-generated thin wrappers to native React components
- **Styling & Theming**: From Shadow DOM + CSS custom properties to platform-specific approaches
- **Icon Management**: From inline SVG with slots to centralized icon packages
- **Subcomponent Patterns**: From slots to React children/render props

The migration guide includes detailed code examples, commit history analysis, and step-by-step transformation patterns using the mute button as a comprehensive case study.
