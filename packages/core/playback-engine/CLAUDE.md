# CLAUDE.md - @vjs-10/playback-engine

This file provides guidance to Claude Code when working with the `@vjs-10/playback-engine` package.

## Package Overview

`@vjs-10/playback-engine` provides an abstraction layer for media source management, offering a common contract for different streaming technologies like HLS.js, Dash.js, and other media engines. This core package enables VJS-10 to work with various media sources while maintaining a consistent interface.

**Key Responsibilities**:
- Common interface for media playback engines (HLS, DASH, etc.)
- Media source loading and management abstraction
- Engine lifecycle management (creation, attachment, destruction)
- Event forwarding from media engines to VJS-10 state management

## Architecture Position

### Dependency Hierarchy
- **Level**: Core (minimal external dependencies)
- **Dependencies**: `hls.js` (specific engine implementation)
- **Dependents**: `@vjs-10/media`, `@vjs-10/media-store`
- **Platform Target**: Universal (with platform-specific engine implementations)

### Architectural Influences
This package implements key architectural patterns from multiple influences:

#### Media Elements Heritage
- **Engine Abstraction**: Similar to media-elements' custom element pattern, but for media engines
- **HTMLMediaElement Integration**: Maintains compatibility with standard media elements
- **Provider Pattern**: Abstract interface with concrete implementations (like HlsVideoElement)

#### VidStack Influence
- **Pluggable Architecture**: Similar to VidStack's provider system for different media sources
- **Engine Lifecycle**: Consistent creation, attachment, and destruction patterns

## Key Files & Structure

```
src/
├── index.ts                    # Main exports and interfaces
└── HlsJSPlaybackEngine.ts      # HLS.js implementation and base interface

Interfaces & Classes:
├── IBasePlaybackEngine         # Core playback engine contract
├── HlsJSPlaybackEngine        # HLS.js specific implementation
└── createPlaybackEngine        # Factory function for engines
```

## Development Guidelines

### Base Playback Engine Interface
Always implement the complete `IBasePlaybackEngine` contract:

```typescript
// ✅ Good: Complete interface implementation
export interface IBasePlaybackEngine extends EventTarget {
  src: HTMLMediaElement['src'] | undefined;
  mediaElement: HTMLMediaElement | undefined;
  element: HTMLElement | undefined;
  destroy: () => void;
}

// Concrete implementation
export class CustomPlaybackEngine extends EventTarget implements IBasePlaybackEngine {
  src: string | undefined;
  mediaElement: HTMLMediaElement | undefined;
  element: HTMLElement | undefined;
  
  destroy(): void {
    // Clean up resources
  }
}

// ❌ Bad: Incomplete interface
export class BadEngine {
  src: string; // Missing required methods and EventTarget
}
```

### Engine Lifecycle Management
Properly handle engine creation, attachment, and cleanup:

```typescript
// ✅ Good: Complete lifecycle management
export class PlaybackEngine extends EventTarget {
  private engine?: SomeMediaEngine;
  
  constructor() {
    super();
    this._createEngineInstance();
  }
  
  set mediaElement(val: HTMLMediaElement | undefined) {
    if (this.mediaElement === val) return;
    
    // Clean up previous attachment
    if (this.engine && this.mediaElement) {
      this.engine.detachMedia();
    }
    
    // Attach to new element
    if (this.engine && val) {
      this.engine.attachMedia(val);
    }
  }
  
  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = undefined;
    }
  }
}

// ❌ Bad: No lifecycle management
export class BadEngine {
  mediaElement?: HTMLMediaElement;
  
  setMedia(el: HTMLMediaElement) {
    this.mediaElement = el; // No cleanup or proper attachment
  }
}
```

### Source Management
Handle media source loading with validation:

```typescript
// ✅ Good: Robust source management
export class PlaybackEngine extends EventTarget {
  private _src?: string;
  
  get src(): string | undefined {
    return this._src;
  }
  
  set src(val: string | undefined) {
    if (this._src === val) return;
    
    this._src = val;
    
    if (!this.engine && val) {
      this._createEngineInstance();
    }
    
    if (this.engine && val) {
      this.engine.loadSource(val);
    }
  }
  
  private _createEngineInstance(): void {
    if (this.engine) return;
    
    this.engine = new MediaEngine({
      // Engine-specific configuration
    });
    
    // Forward events
    this.engine.on('error', (event) => {
      this.dispatchEvent(new CustomEvent('error', { detail: event }));
    });
  }
}

// ❌ Bad: No validation or error handling
export class BadEngine {
  set src(val: string) {
    this.engine.loadSource(val); // Could fail if engine not ready
  }
}
```

### Event Forwarding Pattern
Forward engine events to VJS-10 state management:

```typescript
// ✅ Good: Comprehensive event forwarding
export class PlaybackEngine extends EventTarget {
  private setupEventForwarding(): void {
    if (!this.engine) return;
    
    // Forward standard media events
    const forwardedEvents = [
      'loadstart', 'progress', 'canplay', 'canplaythrough',
      'durationchange', 'timeupdate', 'play', 'pause', 'ended'
    ];
    
    forwardedEvents.forEach(eventType => {
      this.engine.on(eventType, (event) => {
        this.dispatchEvent(new CustomEvent(eventType, { 
          detail: event 
        }));
      });
    });
    
    // Handle engine-specific events
    this.engine.on('hlsError', (event) => {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: { type: 'hls', ...event } 
      }));
    });
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

## Engine Implementation Patterns

### Factory Pattern
Use factory functions for engine creation:

```typescript
// ✅ Good: Factory pattern for engine creation
export function createPlaybackEngine(
  type: 'hls' | 'dash' | 'native' = 'hls',
  config?: any
): IBasePlaybackEngine {
  switch (type) {
    case 'hls':
      return new HlsJSPlaybackEngine(config);
    case 'dash':
      return new DashPlaybackEngine(config);
    case 'native':
      return new NativePlaybackEngine(config);
    default:
      return new HlsJSPlaybackEngine(config);
  }
}

// Usage
const engine = createPlaybackEngine('hls', { 
  lowLatencyMode: true 
});
```

### Configuration Management
Handle engine-specific configurations:

```typescript
// ✅ Good: Typed configuration management
export interface HlsConfig {
  lowLatencyMode?: boolean;
  autoStartLoad?: boolean;
  debug?: boolean;
  // ... other HLS.js options
}

export class HlsJSPlaybackEngine extends EventTarget {
  constructor(private config: HlsConfig = {}) {
    super();
  }
  
  private _createHlsInstance(): void {
    this._hlsInstance = new Hls({
      // Default configurations
      autoStartLoad: false,
      
      // Merge user configurations
      ...this.config,
    });
  }
}
```

### Error Handling
Implement comprehensive error handling:

```typescript
// ✅ Good: Robust error handling
export class PlaybackEngine extends EventTarget {
  private handleEngineError(error: any): void {
    // Categorize errors
    const errorType = this.categorizeError(error);
    
    // Dispatch standardized error event
    this.dispatchEvent(new CustomEvent('error', {
      detail: {
        type: errorType,
        fatal: error.fatal || false,
        code: error.code,
        message: error.message || 'Unknown playback error',
        originalError: error,
      }
    }));
    
    // Attempt recovery for non-fatal errors
    if (!error.fatal && this.canRecover(error)) {
      this.attemptRecovery(error);
    }
  }
  
  private categorizeError(error: any): string {
    // Engine-specific error categorization
    if (error.type === Hls.ErrorTypes.NETWORK_ERROR) {
      return 'network';
    } else if (error.type === Hls.ErrorTypes.MEDIA_ERROR) {
      return 'media';
    }
    return 'unknown';
  }
}
```

## Testing Guidelines

When tests are implemented:
- Test engine lifecycle (create, attach, destroy)
- Mock different media engines for interface compliance
- Test error handling and recovery mechanisms  
- Verify event forwarding between engines and VJS-10
- Test configuration passing and validation
- Test source loading with various media formats

## Common Pitfalls

### ❌ Incomplete Interface Implementation
```typescript
// Don't skip required interface methods
export class BadEngine extends EventTarget {
  src?: string;
  // Missing: mediaElement, element, destroy
}

// Should implement all IBasePlaybackEngine methods
export class GoodEngine extends EventTarget implements IBasePlaybackEngine {
  src?: string;
  mediaElement?: HTMLMediaElement;
  element?: HTMLElement;
  destroy(): void { /* cleanup */ }
}
```

### ❌ Missing Resource Cleanup
```typescript
// Don't forget to clean up engine resources
export class BadEngine {
  destroy(): void {
    // Missing cleanup - causes memory leaks
  }
}

// Should properly clean up
export class GoodEngine {
  destroy(): void {
    if (this.engine) {
      this.engine.destroy();
      this.engine = undefined;
    }
  }
}
```

### ❌ Breaking EventTarget Pattern
```typescript
// Don't use callback patterns instead of events
export class BadEngine {
  onError?: (error: any) => void;
  
  handleError(error: any) {
    this.onError?.(error); // Should dispatch events
  }
}

// Should use EventTarget
export class GoodEngine extends EventTarget {
  handleError(error: any) {
    this.dispatchEvent(new CustomEvent('error', { detail: error }));
  }
}
```

### ❌ Platform-Specific Assumptions
```typescript
// Don't assume browser-only APIs
export class BadEngine {
  constructor() {
    this.element = document.createElement('video'); // Breaks in Node.js
  }
}

// Should be platform-agnostic in interface design
export class GoodEngine {
  mediaElement?: HTMLMediaElement; // Provided externally
}
```

## Engine-Specific Considerations

### HLS.js Integration
When working with HLS.js:
- Use `autoStartLoad: false` to control loading behavior
- Handle HLS-specific error types and recovery
- Forward HLS events to standard media events
- Support HLS configuration options

### Future Engine Support
Design for extensibility:
- Keep the base interface generic
- Use factory patterns for engine creation
- Abstract engine-specific details behind the interface
- Plan for Dash.js, native playback, and custom engines

## Performance Considerations

- Lazy load engines (create only when needed)
- Properly detach from media elements to prevent memory leaks
- Use engine-specific optimizations (HLS.js low-latency mode)
- Handle engine destruction in component cleanup

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- `@vjs-10/media` - Uses playback engines for media state management
- [HLS.js Documentation](https://github.com/video-dev/hls.js/) - Current engine implementation
- [Media Elements](https://github.com/muxinc/media-elements) - Provider pattern inspiration
- [VidStack Architecture](https://vidstack.io/docs/player/getting-started/architecture/) - Engine abstraction patterns