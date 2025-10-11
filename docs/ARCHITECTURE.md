# VJS-10 Architecture & Design Philosophy

## Overview

VJS-10 represents a significant architectural evolution in media player component libraries, prioritizing platform-native development experiences while maintaining shared core logic. This document outlines the design philosophy, architectural influences, and key decisions that shape the VJS-10 ecosystem.

## Architectural Influences & Inspirations

### Media Elements: Platform-Agnostic HTMLMediaElement Contract

VJS-10's media state management architecture draws significant inspiration from the [media-elements monorepo](https://github.com/muxinc/media-elements), which pioneered the concept of creating HTMLMediaElement-compatible elements that work across different media providers while maintaining consistent interfaces.

#### 1. Extended HTMLMediaElement Contract Foundation

**Media Elements Innovation**: The media-elements monorepo established the pattern of creating custom elements that "look like" HTMLMediaElement but can be extended for different media providers (HLS, DASH, YouTube, Vimeo, etc.).

**Core Architecture Pattern**:

```typescript
// Media Elements: CustomVideoElement extends HTMLVideoElement
export class CustomVideoElement extends HTMLVideoElement implements HTMLVideoElement {
  readonly nativeEl: HTMLVideoElement;

  // Maintains HTMLMediaElement contract
  get currentTime() { return this.nativeEl?.currentTime ?? 0; }
  set currentTime(val) { if (this.nativeEl) this.nativeEl.currentTime = val; }

  play(): Promise<void> { return this.nativeEl?.play() ?? Promise.resolve(); }
  pause(): void { this.nativeEl?.pause(); }
}

// Provider-specific implementations
class HlsVideoElement extends CustomVideoElement {
  api: Hls | null = null;

  async load() {
    if (Hls.isSupported()) {
      this.api = new Hls(this.config);
      this.api.loadSource(this.src);
      this.api.attachMedia(this.nativeEl);
    }
  }
}
```

**Key Architectural Assumptions**:

- Media state owner must be an `HTMLElement` (DOM-based)
- Must implement the complete `HTMLMediaElement` interface
- Provider-specific logic encapsulated in custom element classes
- Shadow DOM for consistent styling and behavior

**Reference**: [`packages/custom-media-element/custom-media-element.ts`](https://github.com/muxinc/media-elements/blob/main/packages/custom-media-element/custom-media-element.ts)

#### 2. VJS-10's Platform-Agnostic Evolution

**VJS-10 Innovation**: Relaxed the HTMLElement requirement while maintaining the HTMLMediaElement contract, enabling true cross-platform compatibility.

**Architectural Relaxation**:

```typescript
// VJS-10: MediaStateOwner - JavaScript interface only
export type MediaStateOwner = Partial<HTMLVideoElement>
  & Pick<HTMLMediaElement, 'play' | 'paused' | 'addEventListener' | 'removeEventListener'>
  & EventTarget & { // Only requires EventTarget, not HTMLElement
    // HTMLMediaElement contract maintained
    currentTime?: number;
    duration?: number;
    volume?: number;
    muted?: boolean;
    paused?: boolean;

    // Extended media-specific properties (Media Elements influence)
    streamType?: StreamTypes;
    targetLiveWindow?: number;
    videoRenditions?: Rendition[] & EventTarget;
    audioTracks?: AudioTrack[] & EventTarget;

    // Platform-specific extensions
    webkitDisplayingFullscreen?: boolean;
    webkitCurrentPlaybackTargetIsWireless?: boolean;
  };
```

**Cross-Platform Implementation**:

**HTML Platform** (Media Elements Heritage):

```typescript
// Direct evolution from media-elements CustomVideoElement
export class MediaVideoElement extends HTMLVideoElement implements MediaStateOwner {
  connectedCallback() {
    // Media Elements pattern: delegate to native element
    this.mediaStore = createMediaStore(this.nativeEl);
  }
}
```

**React Platform** (Platform-Agnostic Contract):

```typescript
// Uses HTMLVideoElement but not as DOM element
export function useVideoElement(): MediaStateOwner {
  const videoRef = useRef<HTMLVideoElement>(null);

  return useMemo(() => ({
    // Maintains HTMLMediaElement contract without DOM assumptions
    get currentTime() { return videoRef.current?.currentTime ?? 0; },
    set currentTime(val) { if (videoRef.current) videoRef.current.currentTime = val; },

    play: () => videoRef.current?.play() ?? Promise.resolve(),
    pause: () => videoRef.current?.pause(),

    addEventListener: (type, listener) => videoRef.current?.addEventListener(type, listener),
    removeEventListener: (type, listener) => videoRef.current?.removeEventListener(type, listener),
  }), []);
}
```

**React Native Platform** (Contract Without HTMLMediaElement):

```typescript
// Implements MediaStateOwner contract with React Native Video
export function useVideoElementNative(): MediaStateOwner {
  const videoRef = useRef<Video>(null);

  return useMemo(() => ({
    // Same interface, different implementation
    get currentTime() { return this.currentTime ?? 0; },
    set currentTime(val) { videoRef.current?.seek(val); },

    play: () => {
      videoRef.current?.resume();
      return Promise.resolve();
    },
    pause: () => videoRef.current?.pause(),

    // EventTarget implementation for React Native
    addEventListener: (type, listener) => this.eventEmitter.on(type, listener),
    removeEventListener: (type, listener) => this.eventEmitter.off(type, listener),
  }), []);
};
```

#### 3. Interface Abstraction vs. Implementation Requirements

**Media Elements Approach**: Tight coupling between contract and DOM implementation

- Must extend `HTMLVideoElement` or `HTMLAudioElement`
- Requires Shadow DOM and custom element registration
- Web Components as the primary abstraction layer

**VJS-10 Evolution**: Contract-based abstraction with implementation flexibility

- Interface defines behavior, implementation varies by platform
- JavaScript properties and methods only (no DOM methods like `getAttribute()`)
- EventTarget requirement for event-driven architecture

**Contract Comparison**:

| Aspect                        | Media Elements              | VJS-10 Evolution          |
| ----------------------------- | --------------------------- | ------------------------- |
| **Base Class**                | `HTMLVideoElement` required | `EventTarget` + interface |
| **DOM Requirements**          | Shadow DOM, custom elements | None (platform-dependent) |
| **Platform Support**          | Web Components only         | HTML, React, React Native |
| **HTMLMediaElement Contract** | Full native implementation  | JavaScript interface only |
| **Extension Method**          | Class inheritance           | Interface implementation  |

#### 4. State Mediation Architecture

**Media Elements Pattern**: Custom elements as state mediators between providers and native elements:

```typescript
// Media Elements: Element-centric mediation
class HlsVideoElement extends CustomVideoElement {
  load() {
    // Element mediates between hls.js and native video element
    this.api = new Hls();
    this.api.attachMedia(this.nativeEl); // DOM element required
  }
}
```

**VJS-10 Pattern**: State mediators work with any MediaStateOwner:

```typescript
// VJS-10: Interface-based mediation
export const temporal = {
  currentTime: {
    get(stateOwners: { media: MediaStateOwner }) {
      return stateOwners.media?.currentTime ?? 0; // No DOM assumptions
    },
    set(value: number, stateOwners: { media: MediaStateOwner }) {
      if (stateOwners.media) {
        stateOwners.media.currentTime = value; // JavaScript interface only
      }
    },
    mediaEvents: ['timeupdate', 'loadedmetadata'],
  },
};
```

#### 5. Event-Driven Architecture Continuity

**Shared Foundation**: Both systems rely on EventTarget for reactive updates:

**Media Elements Implementation**:

```typescript
// DOM event forwarding
class MediaElement {
  // ...
  handleEvent(event: Event): void {
    if (event.target === this.nativeEl) {
      this.dispatchEvent(new CustomEvent(event.type, { detail: event.detail }));
    }
  }
}
```

**VJS-10 Implementation**:

```typescript
// Platform-agnostic event handling
const mediaStateOwner: MediaStateOwner = {
  addEventListener(type: string, listener: EventListener) {
    // Could be DOM element, React ref, or React Native component
    this.targetElement?.addEventListener?.(type, listener)
    || this.eventEmitter?.on?.(type, listener);
  }
};
```

#### Media Elements → VJS-10 Evolution Summary

| Architecture Layer       | Media Elements Foundation    | VJS-10 Platform-Agnostic Evolution         |
| ------------------------ | ---------------------------- | ------------------------------------------ |
| **Contract Definition**  | HTMLVideoElement inheritance | MediaStateOwner interface                  |
| **DOM Requirements**     | HTMLElement + Shadow DOM     | EventTarget only                           |
| **Platform Support**     | Web Components only          | Multi-platform (HTML, React, React Native) |
| **State Mediation**      | Element-based providers      | Interface-based state mediators            |
| **Event Architecture**   | DOM event forwarding         | Platform-agnostic EventTarget              |
| **Provider Integration** | Custom element classes       | State mediator functions                   |

**Key Innovation**: VJS-10 maintains the proven HTMLMediaElement contract from media-elements while removing platform-specific constraints, enabling the same state management patterns to work across web components, React components, and React Native.

**References**:

- [Media Elements Monorepo](https://github.com/muxinc/media-elements)
- [Custom Media Element](https://github.com/muxinc/media-elements/tree/main/packages/custom-media-element)
- [HLS Video Element](https://github.com/muxinc/media-elements/tree/main/packages/hls-video-element)

### Media Chrome: Foundational State Management & Media Architecture

VJS-10's core architectural principles are heavily rooted in [Media Chrome](https://github.com/muxinc/media-chrome)'s pioneering approach to media player component architecture. Media Chrome established several foundational patterns that VJS-10 has evolved and adapted.

#### 1. Extended HTMLMediaElement Contract

**Media Chrome Innovation**: Built around an "extended HTMLMediaElement" contract that goes beyond standard web APIs to support modern media features.

**VJS-10 Evolution**: The state mediator pattern directly inherits this concept through `MediaStateOwner`:

```typescript
// VJS-10's MediaStateOwner extends HTMLMediaElement concepts
export type MediaStateOwner = Partial<HTMLVideoElement>
  & Pick<
    HTMLMediaElement,
    'play' | 'paused' | 'addEventListener' | 'removeEventListener'
  > & {
    // Media Chrome-inspired extensions
    streamType?: StreamTypes;
    targetLiveWindow?: number;
    liveEdgeStart?: number;
    videoRenditions?: Rendition[] & EventTarget;
    audioTracks?: AudioTrack[] & EventTarget;
    webkitDisplayingFullscreen?: boolean;
    webkitCurrentPlaybackTargetIsWireless?: boolean;
    // ... additional media-specific properties
  };
```

**Key Inheritance**:

- **Extensible Media Interface**: Beyond basic HTMLMediaElement
- **Event-Driven Architecture**: Media element as event source
- **Cross-Platform Abstractions**: Handling platform-specific media APIs

**Reference**: [`packages/core/media-store/src/state-mediators/audible.ts`](packages/core/media-store/src/state-mediators/audible.ts)

#### 2. Decoupled State Management Architecture

**Media Chrome Pattern**: Complete separation of state management from UI components, with MediaStore as a central state coordinator.

**VJS-10 Adaptation**: Evolved into layered state mediators with framework-agnostic core:

```typescript
// Media Chrome's centralized MediaStore concept -> VJS-10's distributed mediators
export const audible = {
  muted: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.muted ?? false;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      media.muted = value;
      // Media Chrome-style side effects
      if (!value && !media.volume) {
        media.volume = 0.25;
      }
    },
    mediaEvents: ['volumechange'], // Media Chrome event-driven pattern
    actions: {
      muterequest: () => true,
      unmuterequest: () => false,
    },
  },
};
```

**Key Architectural Inheritances**:

- **State/UI Separation**: State logic completely independent of rendering
- **Event-Driven Updates**: Media element events trigger state changes
- **Side Effect Management**: Smart defaults (e.g., auto-volume on unmute)
- **Non-Optimistic Updates**: Wait for actual media element changes

**Reference**: Media Chrome's approach described in [`MEDIA_CHROME_MIGRATION.md`](MEDIA_CHROME_MIGRATION.md)

#### 3. Media-Specific State Abstractions

**Media Chrome Contribution**: Pioneered media-specific state concepts like `mediaVolumeLevel`, `streamType`, and advanced playback states.

**VJS-10 Implementation**: Organized into specialized state mediators:

```typescript
// Media Chrome's media-specific state -> VJS-10's organized mediators
export const temporal = {
  currentTime: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.currentTime ?? 0;
    },
    set(value: number, stateOwners: any) {
      const { media } = stateOwners;
      if (!media || !isValidNumber(value)) return;
      media.currentTime = value;
    },
    mediaEvents: ['timeupdate', 'loadedmetadata'],
    actions: {
      seekrequest: ({ detail = 0 }) => +detail,
    },
  },
  duration: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.duration ?? 0;
    },
    mediaEvents: ['durationchange', 'loadedmetadata'],
  },
};
```

**Media Chrome Concepts Evolved**:

- **Volume Level Abstraction**: `off`, `low`, `medium`, `high` instead of raw numbers
- **Temporal State Management**: Time-based controls with smart defaults
- **Playback State Modeling**: Beyond simple play/pause

**References**:

- [`packages/core/media-store/src/state-mediators/temporal.ts`](packages/core/media-store/src/state-mediators/temporal.ts)
- [`packages/core/media-store/src/state-mediators/audible.ts`](packages/core/media-store/src/state-mediators/audible.ts)

#### 4. Component State Change Side Effects

**Media Chrome Pattern**: State changes trigger coordinated side effects across the media ecosystem.

**VJS-10 Enhancement**: Systematic side effect management within state mediators:

```typescript
// Media Chrome's coordinated side effects -> VJS-10's systematic approach
const mediatorExample = {
  muted: {
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      media.muted = value;

      // Media Chrome-inspired smart side effects
      if (!value && !media.volume) {
        media.volume = 0.25; // Auto-restore volume on unmute
      }
    },
    // Multiple events can trigger state reevaluation
    mediaEvents: ['volumechange'],
  },

  volume: {
    set(value: number, stateOwners: any) {
      const { media } = stateOwners;
      if (!media || !Number.isFinite(+value)) return;
      media.volume = +value;

      // Coordinated state changes
      if (+value > 0) {
        media.muted = false; // Auto-unmute when volume increased
      }
    },
  },
};
```

**Key Side Effect Patterns**:

- **Coordinated State Changes**: Volume changes affect mute state
- **Smart Defaults**: Reasonable fallbacks for edge cases
- **Event Cascade Management**: State changes trigger related updates

#### 5. Event-Driven State Architecture

**Media Chrome Foundation**: All state changes flow through custom events, creating a reactive system.

**VJS-10 Evolution**: Maintained event-driven core with enhanced action system:

```typescript
// Media Chrome's custom events -> VJS-10's action-based system
export const playable = {
  paused: {
    get(stateOwners: any) {
      const { media } = stateOwners;
      return media?.paused ?? true;
    },
    set(value: boolean, stateOwners: any) {
      const { media } = stateOwners;
      if (!media) return;
      if (value) {
        media.pause();
      } else {
        media.play().catch(() => {}); // Media Chrome's error handling pattern
      }
    },
    mediaEvents: ['play', 'pause', 'loadstart'],
    actions: {
      // Media Chrome's request pattern evolved
      playrequest: () => false, // false = not paused
      pauserequest: () => true, // true = paused
    },
  },
};
```

**Event Architecture Evolution**:

- **Request/Response Pattern**: Components dispatch requests, state mediators handle responses
- **Event Normalization**: Consistent patterns across different media APIs
- **Error Handling**: Graceful degradation following Media Chrome patterns

#### 6. Web Component Architecture Foundations

**Media Chrome Legacy**: Established patterns for media-focused web components with Shadow DOM encapsulation.

**VJS-10 Platform Evolution**: Extended Media Chrome's component concepts across platforms:

**HTML Platform (Web Component Heritage)**:

```typescript
// Media Chrome's web component pattern -> VJS-10's HTML platform
export class MuteButtonBase extends MediaChromeButton {
  _state: MuteButtonState | undefined;

  handleEvent(event: Event) {
    const { type } = event;
    const state = this._state;
    if (state && type === 'click') {
      // Media Chrome's state-driven interaction pattern
      if (state.volumeLevel === 'off') {
        state.requestUnmute();
      } else {
        state.requestMute();
      }
    }
  }
}
```

**React Platform (Component Pattern Evolution)**:

```tsx
// Media Chrome's component logic -> React platform adaptation
export function renderMuteButton(props, state) {
  return (
    <button
      {...props}
      onClick={() => {
      // Same Media Chrome interaction logic, different platform
        if (state.volumeLevel === 'off') {
          state.requestUnmute();
        } else {
          state.requestMute();
        }
      }}
    >
      {props.children}
    </button>
  );
}
```

#### Media Chrome → VJS-10 Evolution Summary

| Aspect                     | Media Chrome Foundation       | VJS-10 Evolution                           |
| -------------------------- | ----------------------------- | ------------------------------------------ |
| **State Management**       | Centralized MediaStore        | Distributed state mediators                |
| **Media Interface**        | Extended HTMLMediaElement     | Systematic MediaStateOwner                 |
| **Component Architecture** | Web Components only           | Multi-platform (HTML, React, React Native) |
| **State Coupling**         | Event-driven decoupling       | Hook-based + event-driven                  |
| **Side Effects**           | Coordinated state changes     | Systematic mediator side effects           |
| **Platform Strategy**      | Web-first with React wrappers | Platform-native with shared core           |

**Media Chrome Migration Reference**: See [`MEDIA_CHROME_MIGRATION.md`](MEDIA_CHROME_MIGRATION.md) for detailed transformation examples.

### Base UI Component Primitives

VJS-10's React component architecture is heavily inspired by [Base UI](https://base-ui.com/), MUI's headless component library. This influence manifests in several key ways:

#### 1. Primitive Component Philosophy

**Base UI Approach**: Components are unstyled, behavior-focused primitives that provide functionality without imposing design decisions.

**VJS-10 Implementation**: All React components follow the primitive pattern, requiring explicit styling and content:

```tsx
// Primitive approach - no default styling or icons
<MuteButton className={styles.muteButton}>
  <VolumeOffIcon className={styles.icon} />
</MuteButton>;
```

**Reference**: [`packages/react/react/src/components/MuteButton.tsx`](packages/react/react/src/components/MuteButton.tsx)

#### 2. Render Function Architecture

**Base UI Pattern**: Components accept custom render props for complete presentation control.

**VJS-10 Implementation**:

```tsx
// Built-in render prop support via component factory
function ConnectedComponent({
  render = defaultRender,
  ...props
}: TProps & { render?: TRenderFn }) {
  const connectedState = useStateHook(props);
  const connectedProps = usePropsHook(props, connectedState);
  return render(connectedProps, connectedState);
}
```

**References**:

- [`packages/react/react/src/utils/component-factory.tsx`](packages/react/react/src/utils/component-factory.tsx)
- [Base UI Button Documentation](https://base-ui.com/react/components/button)

#### 3. Separation of State and Props in Render Functions

**Base UI Pattern**: Render functions receive computed props and component state as separate arguments.

**VJS-10 Implementation**:

```tsx
export function renderMuteButton(props: MuteButtonProps, // Computed props (data attrs, aria, etc.)
  state: MuteButtonState) {
  return (
    <button
      {...props}
      onClick={() => {
        if (state.volumeLevel === 'off') {
          state.requestUnmute();
        } else {
          state.requestMute();
        }
      }}
    >
      {props.children}
    </button>
  );
}
```

#### 4. Data Attributes for CSS-Driven State Changes

**Base UI Philosophy**: Expose component state via data attributes for CSS targeting.

**VJS-10 Implementation**:

```tsx
export function useMuteButtonProps(props, state) {
  return {
    'data-volume-level': state.volumeLevel, // "off", "low", "medium", "high"
    'data-muted': state.muted ? '' : undefined,
    'aria-label': state.muted ? 'unmute' : 'mute',
    ...props,
  };
}
```

This enables CSS-driven visual state changes:

```css
[data-volume-level='off'] .volume-high-icon {
  display: none;
}
[data-volume-level='off'] .volume-off-icon {
  display: block;
}
[data-muted] {
  opacity: 0.6;
}
```

#### 5. Accessibility-First Design

**Base UI Approach**: Accessibility attributes are built-in by default, not opt-in.

**VJS-10 Implementation**: All components include accessibility props automatically:

```tsx
export function useMuteButtonProps(props, state) {
  return {
    role: 'button',
    'aria-label': state.muted ? 'unmute' : 'mute', // Dynamic based on state
    ...props, // External props can override
  };
}
```

#### 6. Children Expected in All Use Cases

**Base UI Philosophy**: Even default implementations require explicit content provision.

**VJS-10 Example**: The default media skin must explicitly provide all styling and content:

```tsx
// Even "default" skin requires explicit icons and styling
<MuteButton className={`${styles.Button} ${styles.MediaMuteButton}`}>
  <VolumeHighIcon className={`${styles.Icon} ${styles.VolumeHighIcon}`} />
  <VolumeLowIcon className={`${styles.Icon} ${styles.VolumeLowIcon}`} />
  <VolumeOffIcon className={`${styles.Icon} ${styles.VolumeOffIcon}`} />
</MuteButton>;
```

**Reference**: [`packages/react/react/src/skins/MediaSkinDefault.tsx`](packages/react/react/src/skins/MediaSkinDefault.tsx)

## Base UI Compound Component Architecture

**Inspiration**: [Base UI Slider compound components](https://base-ui.com/react/components/slider) (`Slider.Root`, `Slider.Track`, `Slider.Thumb`)

```tsx
// Planned: Base UI-inspired compound architecture
<VolumeRange.Root value={volume} onValueChange={handleVolumeChange}>
  <VolumeRange.Control>
    <VolumeRange.Track>
      <VolumeRange.Indicator />
      <VolumeRange.Thumb />
    </VolumeRange.Track>
  </VolumeRange.Control>
  <VolumeRange.Value />
  {' '}
  {/* Optional: displays "75%" */}
</VolumeRange.Root>;
```

#### Planned TimeRange Compound Structure

```tsx
// Planned: Base UI-inspired compound architecture with media-specific enhancements
<TimeRange.Root value={currentTime} max={duration} onValueChange={handleSeek}>
  <TimeRange.Control>
    <TimeRange.Track>
      <TimeRange.BufferedIndicator />
      <TimeRange.ChapterMarkers />
      <TimeRange.Indicator />
      <TimeRange.Preview />
      {' '}
      {/* Media-specific: thumbnail preview */}
      <TimeRange.Thumb />
    </TimeRange.Track>
  </TimeRange.Control>
  <TimeRange.CurrentTime />
  <TimeRange.Duration />
</TimeRange.Root>;
```

### Media-Specific Enhancements

Unlike Base UI's generic sliders, VJS-10 compound ranges will support media-specific sub-components:

- **`TimeRange.Preview`**: Thumbnail previews on hover
- **`TimeRange.ChapterMarkers`**: Chapter marker integration
- **`TimeRange.BufferedIndicator`**: Buffered content visualization
- **`VolumeRange.MuteButton`**: Integrated mute functionality

### Architectural Benefits

1. **Maximum Flexibility**: Fine-grained control over each sub-component
2. **Media-Specific Features**: Support for previews, chapters, buffering indicators
3. **Base UI Consistency**: Familiar compound component API patterns
4. **Styling Granularity**: Target specific sub-components with CSS selectors
5. **Accessibility**: Built-in ARIA relationships between compound components
6. **Primitive Philosophy**: Maintains unstyled, behavior-focused approach

### VidStack: Multi-Framework Common Core Architecture

VJS-10's multi-platform architecture and component distribution philosophy draws significant inspiration from [VidStack](https://vidstack.io/), a modern video player library that pioneered several architectural patterns for cross-framework media component development.

#### 1. Common Core Philosophy & Framework Abstraction

**VidStack Innovation**: Built around a shared "common core" that targets both Web Components and React via their Maverick component library, avoiding the thin wrapper approach used by libraries like Media Chrome

**VJS-10 Adoption**: Direct architectural influence on the monorepo's core package strategy:

```tsx
// VidStack's common core concept -> VJS-10's core packages targeting multiple runtimes
// @vjs-10/media-store - Framework-agnostic state management
// @vjs-10/playback-engine - Runtime-independent media abstractions
// @vjs-10/media - HTMLMediaElement contracts usable across platforms

// HTML Platform Implementation
export class MediaButton extends HTMLElement {
  connectedCallback() {
    this.mediaStore = getMediaStore(); // Shared core state
  }
}

// React Platform Implementation
export function useMediaButton() {
  const mediaStore = useMediaStore(); // Same core state, different hook
  return mediaStore.getState();
};

// React Native Platform Implementation
export function MediaButtonNative() {
  const store = useMediaStore(); // Same core, native platform
  return <Pressable onPress={store.handlePress} />;
};
```

**Key Architectural Benefits**:

- **Code Sharing**: Core logic shared across HTML, React, React Native platforms
- **Framework Abstraction**: State management independent of rendering framework
- **Unified Developer Experience**: Consistent APIs across different platforms

**Reference**: VJS-10's strict dependency hierarchy prevents circular dependencies while enabling core package reuse

#### 2. Documentation-Based Copy-and-Own Philosophy

**VidStack Approach**: While not providing CLI tooling like shadcn/ui, VidStack accomplishes component ownership through comprehensive copy-paste functionality in its hosted documentation.

**VidStack Implementation**:

- **Code Snippet Distribution**: Provides copy-paste functionality with snippet IDs (e.g., `docs/main`) for lazy-loading examples
- **Example-Driven Development**: Maintains a dedicated examples repository showing implementation patterns across frameworks
- **Developer Ownership via Documentation**: Enables component customization through well-documented, copy-pasteable code patterns

**VJS-10 Planned Evolution**: VidStack's documentation-first approach influenced the decision to combine traditional npm packages with CLI-based copy-and-own tooling:

```bash
# Planned VJS-10 CLI (shadcn/ui inspired, VidStack documentation philosophy)
npx vjs-10 add mute-button --framework=react --skin=default
npx vjs-10 add time-range --framework=html --customizable=true
```

**Hybrid Distribution Model**:

- **Traditional npm**: Standard package consumption for rapid prototyping
- **Copy-and-Own CLI**: Full component source code ownership for production customization
- **Documentation Examples**: VidStack-style copy-paste patterns for learning and integration

#### 3. Maverick Signals & Reactive Architecture

**VidStack's Maverick Foundation**: Custom signals library (~1kB) providing reactive observables, computed properties, and effect subscriptions for framework-agnostic state management.

**VJS-10 State Management Influence**: While VJS-10 uses nanostores rather than signals, VidStack's reactive architecture patterns influenced the framework-agnostic approach:

```typescript
// VidStack's Maverick Signals concept -> VJS-10's nanostore approach
// Both achieve framework-agnostic reactive state

// VidStack Pattern (Maverick Signals)
const volume = signal(1.0);
const muted = signal(false);
const volumeLevel = computed(() =>
  muted.get() ? 'off' : volume.get() > 0.5 ? 'high' : 'low',
);

// VJS-10 Pattern (nanostores)
const $volume = atom(1.0);
const $muted = atom(false);
const $volumeLevel = computed([$volume, $muted], (volume, muted) =>
  muted ? 'off' : volume > 0.5 ? 'high' : 'low',);
```

**Reactive Architecture Parallels**:

- **Request-Response State Model**: Both systems use event-driven state changes
- **Framework Adaptation**: Reactive primitives that work across different frameworks
- **Performance Optimization**: Minimal bundle size with efficient reactivity

#### 4. Cross-Platform Component Patterns

**VidStack's Framework Strategy**: Base components define core logic independent of rendering, then adapt to specific frameworks via `Host(Component, HTMLElement)` for Web Components and `createReactComponent(Component)` for React.

**VJS-10 Implementation**: While not using VidStack's exact adaptation pattern, the philosophical approach directly influenced VJS-10's component architecture:

```typescript
// VidStack's base component concept -> VJS-10's shared state definitions
// Both separate behavior from presentation

// VidStack Pattern
class BaseButton {
  onSetup() {
    /* core logic */
  }

  onAttach() {
    /* platform attachment */
  }
}
const WebButton = Host(BaseButton, HTMLElement);
const ReactButton = createReactComponent(BaseButton);

// VJS-10 Pattern
const muteButtonStateDefinition = {
  stateTransform: state => ({
    muted: state.muted,
    volumeLevel: state.volumeLevel,
  }),
  createRequestMethods: dispatch => ({
    requestMute: () => dispatch({ type: 'mute' }),
    requestUnmute: () => dispatch({ type: 'unmute' }),
  }),
};

// HTML Platform
export class MuteButtonHTML extends HTMLElement {
  connectedCallback() {
    this.state = muteButtonStateDefinition.stateTransform(
      getMediaStore().getState(),
    );
  }
}

// React Platform
export function useMuteButtonState() {
  const mediaState = useMediaSelector(muteButtonStateDefinition.stateTransform);
  const methods = muteButtonStateDefinition.createRequestMethods(dispatch);
  return { ...mediaState, ...methods };
}
```

**Component Architecture Evolution**:

| Aspect                   | VidStack Approach                     | VJS-10 Evolution                       |
| ------------------------ | ------------------------------------- | -------------------------------------- |
| **Base Components**      | Framework-agnostic base classes       | Framework-agnostic state definitions   |
| **Framework Adaptation** | Host functions & createReactComponent | Platform-specific hook implementations |
| **State Management**     | Maverick Signals                      | nanostores with shared transformations |
| **Lifecycle Management** | onSetup/onAttach/onConnect/onDestroy  | Standard platform lifecycles           |

#### 5. Modular Architecture & Performance

**VidStack's Bundle Strategy**: Modular architecture enabling selective component inclusion and tree-shaking, with the library designed for scalability and minimal bundle size.

**VJS-10 Adoption**: Monorepo structure directly reflects VidStack's modular philosophy:

```json
// VidStack's selective inclusion -> VJS-10's granular packages
{
  "dependencies": {
    "@vjs-10/media-store": "^1.0.0", // Only state management
    "@vjs-10/react-icons": "^1.0.0", // Only icons
    "@vjs-10/react-mute-button": "^1.0.0" // Only specific components
  }
}
```

**Performance Characteristics**:

- **Tree-Shaking**: Import only needed components and utilities
- **Incremental Adoption**: Add components without importing entire player framework
- **Platform Targeting**: Include only relevant platform packages

#### VidStack → VJS-10 Architectural Summary

| Influence Area             | VidStack Foundation                   | VJS-10 Evolution                                     |
| -------------------------- | ------------------------------------- | ---------------------------------------------------- |
| **Multi-Framework Core**   | Maverick-based common core            | Core packages with strict dependency hierarchy       |
| **Component Distribution** | Documentation-based copy-paste        | Hybrid npm + CLI copy-and-own (planned)              |
| **Reactive State**         | Maverick Signals                      | nanostores with shared transformations               |
| **Framework Adaptation**   | Host functions + createReactComponent | Platform-specific implementations sharing core logic |
| **Bundle Strategy**        | Modular player components             | Granular monorepo packages                           |
| **Developer Experience**   | TypeScript-first, SSR-ready           | TypeScript project references, platform-native DX    |

**References**:

- [VidStack Player](https://vidstack.io/)
- [VidStack Architecture](https://vidstack.io/docs/player/getting-started/architecture/)
- [Maverick Signals](https://github.com/maverick-js/signals)
- [VidStack GitHub](https://github.com/vidstack/player)

### Adobe React Spectrum Hook Architecture

VJS-10's hook-based component architecture draws significant inspiration from [Adobe React Spectrum](https://react-spectrum.adobe.com/)'s three-layer separation of concerns, particularly their framework-agnostic approach to component behaviors.

#### Adobe Spectrum Three-Layer Architecture

**Adobe's Philosophy**: Split each component into three parts: state, behavior, and the rendered component, made possible by React Hooks.

**The Three Layers**:

1. **State Layer** (React Stately) - Platform-independent core logic
2. **Behavior Layer** (React Aria) - Platform-specific interactions & accessibility
3. **Component Layer** (React Spectrum) - Design system-specific rendering

**Reference**: [Adobe Spectrum Architecture Documentation](https://react-spectrum.adobe.com/architecture.html)

#### VJS-10's Adaptation: Hook-Based Component Factory

**Explicit Acknowledgment**: VJS-10's component factory directly references Adobe Spectrum as inspiration:

```tsx
/**
 * Generic factory function to create connected components following the hooks pattern
 * inspired by Adobe React Spectrum and Base UI architectures.
 */
export function toConnectedComponent(useStateHook, // State layer - media-specific state management
  usePropsHook, // Behavior layer - props transformation & accessibility
  defaultRender, // Component layer - platform-specific rendering
  displayName) {
  /* ... */
}
```

**Reference**: [`packages/react/react/src/utils/component-factory.tsx:20-27`](packages/react/react/src/utils/component-factory.tsx#L20-L27)

#### Layer-by-Layer Implementation

##### 1. State Layer: Framework-Agnostic Core Logic

**Adobe Spectrum Pattern**: State hooks "make no assumptions about the view system" and implement "core logic for the component."

**VJS-10 Implementation**: State hooks connect to framework-agnostic core packages:

```tsx
export function useMuteButtonState(_props: any) {
  const mediaStore = useMediaStore();
  const mediaState = useMediaSelector(
    muteButtonStateDefinition.stateTransform, // Core package logic
    shallowEqual,
  );

  const methods = React.useMemo(
    () => muteButtonStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  return {
    volumeLevel: mediaState.volumeLevel, // Framework-agnostic state
    muted: mediaState.muted,
    requestMute: methods.requestMute, // Framework-agnostic methods
    requestUnmute: methods.requestUnmute,
  } as const;
}
```

**Key Characteristics**:

- Uses core `muteButtonStateDefinition` from `@vjs-10/media-store`
- No platform-specific assumptions
- Could theoretically work with React Native or other platforms

**Reference**: [`packages/react/react/src/components/MuteButton.tsx:10-29`](packages/react/react/src/components/MuteButton.tsx#L10-L29)

##### 2. Behavior Layer: Props Transformation & Accessibility

**Adobe Spectrum Pattern**: Behavior hooks "implement event handling, accessibility, internationalization" and "return platform specific props that can be spread onto elements."

**VJS-10 Implementation**: Props hooks transform state into platform-specific attributes:

```tsx
export function useMuteButtonProps(props: React.PropsWithChildren<{ [k: string]: any }>, state: ReturnType<typeof useMuteButtonState>) {
  const baseProps: Record<string, any> = {
    // Accessibility (Adobe Spectrum influence)
    role: 'button',
    'aria-label': state.muted ? 'unmute' : 'mute',

    // Platform-specific data attributes
    'data-volume-level': state.volumeLevel,
    'data-tooltip': state.muted ? 'Unmute' : 'Mute',

    // Prop spreading pattern (Adobe Spectrum)
    ...props,
  };

  // Boolean data attribute handling
  if (state.muted) {
    baseProps['data-muted'] = '';
  }

  return baseProps;
}
```

**Key Adobe Spectrum Parallels**:

- **Prop Spreading**: Returns props object to be spread onto DOM elements
- **Accessibility Focus**: ARIA attributes built-in by default
- **Platform Specificity**: Handles React/DOM-specific attribute patterns
- **State Integration**: Takes state hook output as input parameter

**Reference**: [`packages/react/react/src/components/MuteButton.tsx:34-57`](packages/react/react/src/components/MuteButton.tsx#L34-L57)

##### 3. Component Layer: Platform-Specific Rendering

**Adobe Spectrum Pattern**: Components "provide the theme and design system specific logic, and renders the actual platform elements."

**VJS-10 Implementation**: Render functions compose the layers:

```tsx
export function renderMuteButton(props: MuteButtonProps, // From behavior layer
  state: MuteButtonState) {
  return (
    <button
      {...props} // Adobe Spectrum prop spreading pattern
      onClick={() => {
        if (state.volumeLevel === 'off') {
          state.requestUnmute(); // Framework-agnostic state methods
        } else {
          state.requestMute();
        }
      }}
    >
      {props.children}
      {' '}
      // Platform-specific content
    </button>
  );
}
```

**Adobe Spectrum Parallels**:

- **Prop Spreading**: `{...props}` applies behavior layer props to DOM element
- **State Method Usage**: Calls framework-agnostic state methods
- **Platform Elements**: Renders actual React/DOM elements (`<button>`)

#### Framework-Agnostic Benefits

**Adobe Spectrum Goal**: "Make reusing behavior across design systems as easy as possible, while allowing full design customizability."

**VJS-10 Achievement**: The three-layer separation enables:

1. **Cross-Platform State**: Core state definitions work across HTML, React, React Native
2. **Reusable Behavior**: Props transformation logic could be adapted to other frameworks
3. **Complete Styling Control**: No imposed design decisions
4. **Accessibility by Default**: ARIA patterns built into behavior layer

#### Component Factory Pattern

**Adobe Spectrum Inspiration**: Their architecture enables "complete control over the rendering" while maintaining clean separation.

**VJS-10's Factory**: Automates the Adobe Spectrum pattern:

```tsx
// Automated composition of Adobe Spectrum's three layers
export const MuteButton = toConnectedComponent(
  useMuteButtonState, // State layer
  useMuteButtonProps, // Behavior layer
  renderMuteButton, // Component layer
  'MuteButton',
);
```

This factory pattern systematically applies Adobe Spectrum's architectural principles across all VJS-10 components.

**References**:

- [Adobe React Spectrum Architecture](https://react-spectrum.adobe.com/architecture.html)
- [React Aria Hooks](https://react-spectrum.adobe.com/react-aria/hooks.html)
- [React Stately](https://react-spectrum.adobe.com/react-stately/index.html)

## Additional Resources

- [Base UI Documentation](https://base-ui.com/)
- [Base UI Slider Component](https://base-ui.com/react/components/slider)
- [Base UI Button Component](https://base-ui.com/react/components/button)
- [Compound Component Pattern](https://www.patterns.dev/react/compound-pattern)
- [Adobe React Spectrum](https://react-spectrum.adobe.com/)
- [Adobe Spectrum Architecture](https://react-spectrum.adobe.com/architecture.html)
- [React Aria Hooks](https://react-spectrum.adobe.com/react-aria/hooks.html)

---

_This document will continue to evolve as VJS-10's architecture develops and new influences are incorporated._
