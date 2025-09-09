# CLAUDE.md - @vjs-10/media

This file provides guidance to Claude Code when working with the `@vjs-10/media` package.

## Package Overview

`@vjs-10/media` provides JavaScript contracts and convenience code for conforming to HTMLMediaElement and related interfaces. This core package defines the platform-agnostic contracts that enable VJS-10's cross-platform media state management while maintaining compatibility with web standards.

**Key Responsibilities**:
- HTMLMediaElement contract definitions and interfaces
- Platform-agnostic media state owner implementations
- Media event standardization across platforms
- Bridge between playback engines and media state management

## Architecture Position

### Dependency Hierarchy
- **Level**: Core (minimal VJS-10 dependencies)
- **Dependencies**: `@vjs-10/playback-engine`
- **Dependents**: `@vjs-10/media-store`, all platform packages
- **Platform Target**: Universal (JavaScript interfaces and utilities)

### Architectural Influences
This package directly implements key architectural evolution patterns:

#### Media Elements Evolution
- **Platform-Agnostic Contracts**: Extends media-elements' HTMLMediaElement approach without DOM requirements
- **Interface-Based Design**: Defines contracts that work with DOM elements, React refs, or React Native components
- **EventTarget Foundation**: Maintains event-driven architecture without HTMLElement constraints

#### Media Chrome Heritage
- **Extended HTMLMediaElement**: Preserves Media Chrome's extended media element patterns
- **Event Standardization**: Maintains consistent event handling across platforms
- **State Owner Pattern**: Provides the MediaStateOwner contract used by media-store

## Key Files & Structure

```
src/
├── index.ts                    # Main exports and interfaces
└── playable.ts                 # Media state owner implementations

Interfaces Defined:
├── IBaseMediaStateOwner        # Base media element contract
├── IPlayableMediaStateOwner    # Playback control interface  
├── IAudibleMediaStateOwner     # Volume/audio control interface
├── ITemporalMediaStateOwner    # Time-based control interface
└── PlayableMediaStateOwner     # Concrete implementation class
```

## Development Guidelines

### HTMLMediaElement Contract Compliance
Always maintain web standards compatibility while enabling cross-platform use:

```typescript
// ✅ Good: Standard HTMLMediaElement interface with platform flexibility
export interface IPlayableMediaStateOwner
  extends EventTarget,
    Pick<HTMLMediaElement, 'play' | 'pause' | 'paused'> {
  // Platform-agnostic - works with DOM, React, React Native
}

// ❌ Bad: Platform-specific assumptions
export interface MediaOwner extends HTMLVideoElement {
  // Breaks on React Native - requires DOM
}
```

### Interface Composition Pattern
Use composition to build media capabilities:

```typescript
// ✅ Good: Composable interface design
export interface IFullMediaStateOwner
  extends IPlayableMediaStateOwner,
          IAudibleMediaStateOwner,
          ITemporalMediaStateOwner {
  // Combine capabilities as needed
}

// ❌ Bad: Monolithic interface
export interface MediaOwner {
  play(): Promise<void>;
  pause(): void;
  volume: number;
  currentTime: number;
  // ... all properties in one interface
}
```

### Event Standardization
Define consistent event patterns across platforms:

```typescript
// ✅ Good: Standard event constants
export const Events = [
  'volumechange',
  'pause', 
  'play',
  'playing',
  'timeupdate',
  // ... standard HTMLMediaElement events
] as const;

// Use for consistent event handling
addEventListener(type: typeof Events[number], listener: EventListener): void;

// ❌ Bad: Platform-specific or custom events
const customEvents = ['playButtonClicked', 'volumeSliderMoved']; // Too specific
```

### MediaStateOwner Implementation
Provide concrete implementations that work across platforms:

```typescript
// ✅ Good: EventTarget-based implementation
export class PlayableMediaStateOwner extends EventTarget {
  #playbackEngine?: IBasePlaybackEngine;
  #mediaElement?: HTMLMediaElement | ReactNativeVideo | any;

  get paused(): boolean {
    return this.#mediaElement?.paused ?? true;
  }

  async play(): Promise<void> {
    await this.#playbackEngine?.play() ?? this.#mediaElement?.play?.();
    this.dispatchEvent(new CustomEvent('play'));
  }
  
  // Platform-agnostic implementation
}

// ❌ Bad: DOM-specific implementation  
export class MediaOwner extends HTMLVideoElement {
  // Only works in browser DOM
}
```

### Playback Engine Integration
Properly integrate with the playback engine layer:

```typescript
// ✅ Good: Playback engine abstraction
export class PlayableMediaStateOwner {
  #playbackEngine: IBasePlaybackEngine;

  constructor(engine?: IBasePlaybackEngine) {
    super();
    this.#playbackEngine = engine ?? createPlaybackEngine();
  }

  async play(): Promise<void> {
    // Delegate to playback engine when available
    await this.#playbackEngine.play();
  }
}
```

## Build & Development Commands

```bash
# Build the package (using tsup)
npm run build

# Clean build artifacts
npm run clean

# Test (placeholder - no tests yet)  
npm run test
```

## TypeScript Configuration

This package uses:
- **tsup**: For simple TypeScript builds
- **Strict Mode**: Enabled for reliable interface definitions
- **Interface-First Design**: Heavy use of TypeScript interfaces for contracts

## Code Patterns

### Interface Segregation
Separate capabilities into focused interfaces:

```typescript
// ✅ Good: Focused, composable interfaces
export interface IPlayableMediaStateOwner extends EventTarget {
  play(): Promise<void>;
  pause(): void;
  readonly paused: boolean;
}

export interface IAudibleMediaStateOwner extends EventTarget {
  volume: number;
  muted: boolean;
}

// Compose when needed
type MediaController = IPlayableMediaStateOwner & IAudibleMediaStateOwner;

// ❌ Bad: Monolithic interface
export interface MediaOwner extends EventTarget {
  play(): Promise<void>;
  pause(): void;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  // ... everything in one interface
}
```

### EventTarget Usage
Use EventTarget as the foundation for all media state owners:

```typescript
// ✅ Good: EventTarget-based for cross-platform events
export class MediaStateOwner extends EventTarget {
  dispatchPlayEvent() {
    this.dispatchEvent(new CustomEvent('play', { 
      detail: { timestamp: Date.now() } 
    }));
  }
}

// Works in DOM, Node.js, React Native with polyfill

// ❌ Bad: DOM-specific event handling
export class MediaOwner extends HTMLElement {
  // Only works in DOM environments
}
```

### Optional Media Element Pattern
Support both direct media elements and playback engine abstractions:

```typescript
// ✅ Good: Flexible media element handling
export class MediaStateOwner {
  constructor(
    private mediaElement?: HTMLMediaElement | ReactNativeVideo,
    private playbackEngine?: IBasePlaybackEngine
  ) {}

  async play(): Promise<void> {
    // Try playback engine first, fallback to media element
    if (this.playbackEngine) {
      await this.playbackEngine.play();
    } else if (this.mediaElement?.play) {
      await this.mediaElement.play();
    }
    
    this.dispatchEvent(new CustomEvent('play'));
  }
}
```

## Testing Guidelines

When tests are implemented:
- Test interface compliance with HTMLMediaElement standards
- Verify EventTarget functionality across different environments  
- Test playback engine integration patterns
- Mock different types of media elements (DOM, React Native)
- Validate event dispatch consistency

## Common Pitfalls

### ❌ Platform-Specific Assumptions
```typescript
// Don't assume DOM APIs exist
element.getAttribute('src'); // Breaks on React Native

// Don't assume specific element types  
media as HTMLVideoElement; // Breaks cross-platform compatibility

// Don't use browser-only APIs
document.createElement('video'); // Not available everywhere
```

### ❌ Breaking HTMLMediaElement Standards
```typescript
// Don't create non-standard interfaces
interface CustomMedia {
  playVideo(): void; // Should be play(): Promise<void>
  stopAudio(): void; // Should be pause(): void
}

// Don't change standard property names
interface Media {
  isPlaying: boolean; // Should be paused: boolean (inverted)
  loudness: number;   // Should be volume: number
}
```

### ❌ Ignoring EventTarget Pattern
```typescript
// Don't skip EventTarget inheritance
export class MediaOwner {
  onPlay?: () => void; // Should use EventTarget pattern
  
  play() {
    this.onPlay?.(); // Should dispatch events
  }
}

// Should be:
export class MediaOwner extends EventTarget {
  play() {
    this.dispatchEvent(new CustomEvent('play'));
  }
}
```

### ❌ Tight Coupling to Playback Engine
```typescript
// Don't require specific playback engine implementations
export class MediaOwner {
  constructor(private hlsEngine: HlsEngine) {} // Too specific
}

// Should be:
export class MediaOwner {
  constructor(private engine?: IBasePlaybackEngine) {} // Interface-based
}
```

## Interface Design Principles

### Web Standards First
Always align with existing web standards:
- Use HTMLMediaElement property names and signatures
- Follow DOM event naming conventions
- Maintain Promise-based async patterns for `play()`
- Respect readonly vs. writable properties

### Progressive Enhancement
Design interfaces that work from simple to complex:
```typescript
// Basic media element
interface IBasicMedia {
  src: string;
}

// Add playback capability  
interface IPlayableMedia extends IBasicMedia {
  play(): Promise<void>;
  pause(): void;
}

// Add audio capability
interface IFullMedia extends IPlayableMedia, IAudibleMedia {
  // Composed capabilities
}
```

### Cross-Platform Compatibility
Ensure interfaces work across all target platforms:
- Use only JavaScript-standard types and methods
- Avoid DOM-specific APIs in interface definitions
- Design for EventTarget rather than HTMLElement
- Support optional properties for platform differences

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - Media Elements architectural evolution
- `@vjs-10/media-store` - Uses these contracts for state management
- `@vjs-10/playback-engine` - Dependency for media engine abstractions
- [HTMLMediaElement MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement) - Web standards reference
- [EventTarget MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) - Event handling foundation