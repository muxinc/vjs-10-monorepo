# CLAUDE.md - @vjs-10/media-store

This file provides guidance to Claude Code when working with the `@vjs-10/media-store` package.

## Package Overview

`@vjs-10/media-store` is the foundational state management package for VJS-10, providing framework-agnostic media state abstraction. This core package enables unified state management across HTML, React, and React Native platforms while maintaining the Media Chrome-inspired HTMLMediaElement contract.

**Key Responsibilities**:

- Framework-agnostic media state management using nanostores
- State mediator patterns for media properties (volume, time, playback state)
- MediaStateOwner contract definition for cross-platform compatibility
- Component state definitions for UI framework integration

## Architecture Position

### Dependency Hierarchy

- **Level**: Core (no VJS-10 dependencies)
- **Dependencies**: `nanostores` only
- **Dependents**: All HTML, React, and React Native packages
- **Platform Target**: Runtime-agnostic (Node.js, Browser, React Native)

### Architectural Influences

This package directly implements several key architectural patterns:

#### Media Chrome Heritage

- **Framework-Agnostic Core**: Heavily influenced by Media Chrome's Media Store architecture
- **Extended HTMLMediaElement Contract**: Maintains Media Chrome's state mediator approach through `MediaStateOwner`
- **Event-Driven State Updates**: Media element events trigger state changes via `mediaEvents` arrays
- **Side Effect Management**: Coordinated state changes (e.g., volume change affects mute state)

#### Media Elements Evolution

- **Platform-Agnostic Contract**: Relaxes HTMLElement requirement to EventTarget + JavaScript interface
- **Cross-Platform State Owners**: Same state logic works with DOM elements, React refs, or React Native components

#### VidStack Influence

- **Framework-Agnostic Core**: Similar to VidStack's Maverick Signals, but using a single unidirectional dataflow reactive store architecture
- **State Transform Patterns**: Reactive state transformations that work across platforms

## Key Files & Structure

```
src/
├── index.ts                           # Main exports
├── media-store.ts                     # Core MediaStore implementation
├── factory.ts                         # State mediator factory functions
├── state-mediators/                   # Media Chrome-inspired state mediators
│   ├── audible.ts                    # Volume, muted state management
│   ├── playable.ts                   # Play, pause state management
│   ├── temporal.ts                   # Time-based state (currentTime, duration)
│   └── index.ts                      # State mediator exports
└── component-state-definitions/       # UI framework integration helpers
    ├── mute-button-state-definition.ts
    ├── play-button-state-definition.ts
    ├── time-range-state-definition.ts
    ├── volume-range-state-definition.ts
    └── index.ts
```

## Development Guidelines

### MediaStateOwner Contract

Always maintain the platform-agnostic HTMLMediaElement contract:

```typescript
// ✅ Good: Interface-based, platform agnostic
export type MediaStateOwner = Partial<HTMLVideoElement> &
  Pick<HTMLMediaElement, 'play' | 'paused'> &
  EventTarget & {
    currentTime?: number;
    volume?: number;
    muted?: boolean;
  };

// ❌ Bad: Assumes DOM element
export type MediaStateOwner = HTMLVideoElement & CustomProperties;
```

### State Mediator Patterns

Follow the Media Chrome-inspired state mediator pattern:

```typescript
// ✅ Good: Complete state mediator with get/set/events/actions
export const volume = {
  get(stateOwners: any) {
    return stateOwners.media?.volume ?? 1;
  },
  set(value: number, stateOwners: any) {
    if (stateOwners.media && Number.isFinite(+value)) {
      stateOwners.media.volume = +value;
      // Side effect: auto-unmute when volume increased
      if (+value > 0) {
        stateOwners.media.muted = false;
      }
    }
  },
  mediaEvents: ['volumechange'],
  actions: {
    volumerequest: ({ detail = 1 }) => +detail,
  },
};

// ❌ Bad: Missing event handling or side effects
export const volume = {
  get: (state: any) => state.volume,
  set: (value: number, state: any) => {
    state.volume = value;
  },
};
```

### Component State Definitions

Create reusable state definitions for UI components:

```typescript
// ✅ Good: Framework-agnostic state definition
export const muteButtonStateDefinition = {
  stateTransform: (state) => ({
    muted: state.muted,
    volumeLevel: state.volumeLevel,
  }),
  createRequestMethods: (dispatch) => ({
    requestMute: () => dispatch({ type: 'muterequest' }),
    requestUnmute: () => dispatch({ type: 'unmuterequest' }),
  }),
};

// ❌ Bad: React-specific implementation
export const useMuteButton = () => {
  const [muted, setMuted] = useState(false);
  return { muted, setMuted };
};
```

### Event-Driven Architecture

Maintain the Media Chrome event-driven pattern:

```typescript
// ✅ Good: Uses mediaEvents for reactive updates
export const currentTime = {
  get(stateOwners: any) {
    return stateOwners.media?.currentTime ?? 0;
  },
  set(value: number, stateOwners: any) {
    if (stateOwners.media && isValidNumber(value)) {
      stateOwners.media.currentTime = value;
    }
  },
  mediaEvents: ['timeupdate', 'loadedmetadata'], // Event-driven updates
  actions: {
    seekrequest: ({ detail = 0 }) => +detail,
  },
};
```

## Build & Development Commands

```bash
# Build the package
npm run build

# Clean build artifacts
npm run clean

# Test (placeholder - no tests yet)
npm run test
```

## TypeScript Configuration

This package uses:

- **Rollup + TypeScript**: For dual ESM/CJS builds
- **tsconfig.build.json**: Build-specific TypeScript configuration
- **Strict Mode**: Enabled with additional checks for robust state management

## Code Patterns

### State Validation

Always validate state values before applying them:

```typescript
// ✅ Good: Validates before setting
set(value: number, stateOwners: any) {
  const { media } = stateOwners;
  if (!media || !Number.isFinite(+value)) return;
  media.volume = +value;
}

// ❌ Bad: No validation
set(value: number, stateOwners: any) {
  stateOwners.media.volume = value;
}
```

### Error Handling

Follow Media Chrome's graceful degradation pattern:

```typescript
// ✅ Good: Graceful handling of missing media element
get(stateOwners: any) {
  const { media } = stateOwners;
  return media?.currentTime ?? 0; // Sensible default
}

// ❌ Bad: Could throw if media is undefined
get(stateOwners: any) {
  return stateOwners.media.currentTime;
}
```

### Side Effects

Implement smart defaults and coordinated state changes:

```typescript
// ✅ Good: Smart side effects from Media Chrome
set(value: boolean, stateOwners: any) {
  const { media } = stateOwners;
  if (!media) return;
  media.muted = value;

  // Auto-restore volume when unmuting (Media Chrome pattern)
  if (!value && !media.volume) {
    media.volume = 0.25;
  }
}
```

## Testing Guidelines

When tests are implemented:

- Test state mediators independently of UI frameworks
- Mock MediaStateOwner implementations for different platforms
- Verify event-driven state updates
- Test side effect coordination
- Ensure graceful handling of missing media elements

## Common Pitfalls

### ❌ Platform-Specific Assumptions

```typescript
// Don't assume DOM methods exist
media.getAttribute('volume'); // Breaks on React Native

// Don't assume specific element types
media as HTMLVideoElement; // Breaks cross-platform compatibility
```

### ❌ Framework-Specific Logic

```typescript
// Don't use React hooks in core package
const [state, setState] = useState(); // Wrong package!

// Don't use DOM-specific APIs
document.querySelector(); // Not available everywhere
```

### ❌ Breaking Media Chrome Patterns

```typescript
// Don't skip event handling
export const badVolume = {
  get: (state) => state.volume,
  set: (value, state) => {
    state.volume = value;
  },
  // Missing: mediaEvents, actions, side effects
};
```

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - Full architectural context
- [MEDIA_CHROME_MIGRATION.md](../../../MEDIA_CHROME_MIGRATION.md) - Migration patterns this package enables
- [Media Chrome State Management](https://github.com/muxinc/media-chrome) - Original inspiration
- [nanostores Documentation](https://github.com/nanostores/nanostores) - State management library
