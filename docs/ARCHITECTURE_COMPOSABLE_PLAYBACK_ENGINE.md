# Composable Playback Engine Architecture

_A Guide to Building Modular, Performance-Optimized Video Playback Systems_

# Executive Summary

Current video playback engines suffer from “Swiss Army knife” architecture—monolithic systems that bundle all possible features regardless of actual use case needs. This creates performance penalties, integration friction, and maintenance complexity. This document outlines a composable architecture that solves these problems by separating **outward-facing interfaces** from **inward-facing implementations** and enabling functional composition of both layers.

**Key Innovation**: Decouple what a playback engine exposes (outward API) from how it implements features (inward composition), allowing the same engine to serve multiple integration patterns while optimizing internal functionality for specific use cases.

# The Problem Space

## Current Architecture Limitations

### Monolithic Design Issues

- Bundle sizes routinely exceed 500KB-1MB (hls.js: ~800KB, Shaka: ~1.2MB)
- Features are diffused throughout codebase, making subsetting nearly impossible
- Tight coupling between components prevents modular replacement
- One-size-fits-all approach optimizes for no specific use case

### Performance Trade-offs

- **Core Web Vitals Impact**: Large JavaScript bundles hurt Time to Interactive, Largest Contentful Paint
- **Video QoE Impact**: Lazy loading improves CWV but delays video startup time
- **Framework Integration**: Event-driven, imperative player APIs clash with modern declarative, reactive frameworks

### Testing and Maintainability Challenges

- **Unit Testing Limitations**: Testing discrete functional units in isolation is difficult to impossible due to tight coupling and shared dependencies
- **Integration Testing Complexity**: Testing subsets of interrelated functional units is even more challenging, often requiring extensive mocking or full system setup
- **Debugging and Root Cause Analysis**: Extremely difficult to debug complex real-world issues by “narrowing the problem space” - you can’t easily compose a simplified playback engine to isolate where/when particular issues are introduced
- **Regression Prevention**: Avoiding regressions is nearly impossible due to interconnectedness of moving pieces - changes in one area can have unexpected effects in seemingly unrelated functionality

### Real-World Impact

- Media players often represent 30-50% of total page JavaScript
- No viable path from simple to advanced use cases without “throwing developers into the deep end”
- Custom implementations require either forking complex codebases or building from scratch
- Bug fixes and feature additions carry high risk of unintended side effects

# Architecture Vision: Outward vs Inward Separation

## The Fundamental Architectural Principle

Current playback engines fail to sufficiently separate their public-facing architecture from their internal implementation architecture. Both layers typically use the same OOP patterns: stateful, event-dispatching instances that manage complex internal state. Internally, this manifests as a collection of “Controllers,” “Managers,” and similar objects that mirror the external API patterns, creating tight coupling throughout the system.

This architectural uniformity creates rigid, monolithic systems where internal implementation details leak into public APIs and vice versa. Our architecture establishes a clear separation:

- **Outward-Facing Interface**: Stateful, event-based instances that provide familiar integration patterns
- **Inward-Facing Implementation**: Functional, composable units optimized for the actual work of media processing

This separation enables the same engine core to present multiple outward interfaces while optimizing internal behavior through functional composition rather than object orchestration.

## Outward-Facing Interface (The “What”)

The playback engine exposes a single, unified outward interface:

### Core Interface Definition

```tsx
interface ComposablePlaybackEngine extends EventTarget {
  // HTMLMediaElement subset
  readonly currentTime: number;
  readonly duration: number;
  readonly buffered: TimeRanges;
  readonly paused: boolean;
  readonly ended: boolean;
  readonly readyState: number;
  src: string;
  play: () => Promise<void>;
  pause: () => void;

  // Media-specific extensions for content permutations
  // NOTE: These are placeholder examples - actual API surface TBD
  // through implementation and testing of real use cases
  readonly currentLevel: number;
  // TODO: May need different structure for non-ABR content
  readonly levels: Array<{
    // TODO: This shape assumes HLS/DASH - needs generalization
    index: number;
    bitrate: number;
    width?: number;
    height?: number;
    codecs: string;
  }>;
  readonly audioTracks: Array<{
    // TODO: Consider relationship to native AudioTrackList
    id: string;
    label: string;
    language: string;
    enabled: boolean;
  }>;
  // Playback engine specific methods
  // NOTE: Method signatures are provisional and subject to change based on  // composable architecture requirements
  selectLevel: (level: number) => void; // TODO: How does this work with server-determined composition?
  selectAudioTrack: (trackId: string) => void; // TODO: Should this mirror native audio track selection?}
}
```

### Event Extensions for Media Content

```tsx
interface PlaybackEngineEventMap {
  // Standard HTMLMediaElement events
  loadstart: Event;
  loadedmetadata: Event;
  canplay: Event;
  playing: Event;
  pause: Event;
  ended: Event;
  error: ErrorEvent;

  // Media-specific events
  levelLoaded: CustomEvent<{ level: number; details: object }>;
  manifestParsed: CustomEvent<{ levels: Array<object>; audioTracks: Array<object> }>;
  fragmentLoaded: CustomEvent<{ frag: object; stats: object }>;
  audioTrackSwitched: CustomEvent<{ trackId: string }>;
  subtitleTrackLoaded: CustomEvent<{ track: object }>;
}

// Usage
const engine: ComposablePlaybackEngine = new ComposablePlaybackEngineImpl(mediaElement, config);
engine.addEventListener('levelLoaded', (event) => {
  console.log('Level loaded:', event.detail.level);
});
engine.addEventListener('loadstart', handleLoadStart);
engine.src = 'playlist.m3u8';
```

**Integration Adapters**:
Other integration patterns (VideoJS Tech, React hooks, etc.) are **adapters** that wrap this core interface rather than separate implementations:

```tsx
// VideoJS Tech adapter
class ComposableTech extends Tech {
  private engine: ComposablePlaybackEngine;
  constructor(options: object, ready: () => void) {
    super(options, ready);
    this.engine = new ComposablePlaybackEngineImpl(this.el(), options);
    // Map engine events to VideoJS events
  }
}
// React hook adapter
function usePlaybackEngine(src: string, options: object): {
  engine: ComposablePlaybackEngine;
  state: PlaybackState;
} {
  const engine = useMemo(() => new ComposablePlaybackEngineImpl(null, options), []);
  // Return reactive state derived from engine
}
```

## Inward-Facing Implementation (The “How”)

Internal architecture could use patterns **inspired by XState’s actors and state machines** as one approach to replace traditional “Controllers” and “Managers” with composable, event-driven functional units. The following examples are intended to demonstrate these concepts without requiring XState as a dependency. **_However_**, there are some core concepts and constructs in XState that would very likely be beneficial to this architecture. A non-exhaustive list includes:

- A distinction between different kinds of “state”
  - **Context** - Defines the state that is generically used for information and processing - things like modeling playlist, identifying what is(n’t) buffered, filter state, selection state, etc.
  - **Finite State** - Defines the relationships between parts of the system and possible state and state transitions. In most architectures, this is some mix of modeled “state” (sometimes global, sometimes local, sometimes ethereal) and hardcoded relationships between functionality and (**_sometimes_**) some amount of overriding of “Controllers” and the like.
- Declarative/Functional + Functional Reactive Principles - Both kinds of “state” (context and finite state) are updated in non-mutative ways. These “handcuffs” will at least help to make sure our architecture and building blocks avoid common assumptions and couplings in player/playback engine architectures.
- Well defined generic core constructs and transforms
  - Actors
  - (Finite) State Machines (A particular kind of actor)
  - Promises (can be translated as a simple state machine)
  - Observables (can be translated as a simple state machine)
  - Reducers (used for immutable and reactive context “state” transforms via e.g. “assign” functions)
  - Actions vs. Events
- JSON-serializable context and state machine composition definitions - Both kinds of state can be defined as POJOs that are JSON-(de)serializable. This unlocks several possibilities, including client+server use cases discussed elsewhere in the doc.

### Actor-Based Composition Example:

```tsx
// Each functional unit could be modeled as an actor-like pattern
// NOTE: This example uses XState-like syntax for illustration -
// actual implementation may use different patterns or libraries

const PlaylistParsingActor = setup({
  types: {
    context: {} as { manifest?: ParsedManifest; error?: Error },
    events: {} as
    | { type: 'PARSE_MANIFEST'; url: string }
    | { type: 'RETRY' },
    input: {} as { manifestUrl: string }
  }
}).createMachine({
  id: 'playlist-parser',
  initial: 'idle',
  states: {
    idle: {
      on: { PARSE_MANIFEST: 'parsing' }
    },
    parsing: {
      invoke: {
        src: 'fetchAndParseManifest',
        input: ({ event }) => ({ url: event.url }),
        onDone: {
          target: 'parsed',
          actions: [
            assign(({ event }) => ({ manifest: event.output })),
            sendParent({ type: 'MANIFEST_PARSED', manifest: event.output })
          ]
        },
        onError: { target: 'failed', actions: assign(({ event }) => ({ error: event.data })) }
      }
    },
    parsed: { on: { PARSE_MANIFEST: 'parsing' } },
    failed: { on: { RETRY: 'parsing' } }
  }
});

const BufferManagementActor = setup({
  types: {
    context: {} as { bufferedRanges: TimeRanges; pendingSegments: Segment[] },
    events: {} as
    | { type: 'APPEND_SEGMENT'; segment: Segment }
    | { type: 'FLUSH_BUFFER' }
  }
}).createMachine({
  id: 'buffer-manager',
  initial: 'idle',
  states: {
    idle: { on: { APPEND_SEGMENT: 'appending' } },
    appending: {
      invoke: {
        src: 'appendToSourceBuffer',
        input: ({ event }) => ({ segment: event.segment }),
        onDone: {
          target: 'idle',
          actions: [
            assign(({ context, event }) => ({
              bufferedRanges: event.output.buffered,
              pendingSegments: context.pendingSegments.slice(1)
            })),
            sendParent({ type: 'BUFFER_UPDATED', buffered: event.output.buffered })
          ]
        }
      }
    }
  }
});
```

**Server-Driven Composition Example**:

```tsx
// Server determines which actors to spawn based on content analysis
// NOTE: This demonstrates the architectural concept - implementation
// details may vary significantly from this XState-inspired example
interface ServerContentAnalysis {
  manifestType: 'hls' | 'dash';
  hasMultipleRenditions: boolean;
  requiresDRM: boolean;
  hasSubtitles: boolean;
  containerFormat: 'fmp4' | 'ts';
  // Pre-processed data
  initialManifest?: ParsedManifest;
  initialRenditionSelection?: RenditionInfo;
}

const ComposablePlaybackEngine = setup({
  types: {
    context: {} as {
      // Outward-facing state (maps to interface)
      currentTime: number;
      duration: number;
      buffered: TimeRanges;
      paused: boolean;
      currentLevel: number;
      levels: Level[];

      // Server analysis results
      contentAnalysis: ServerContentAnalysis;

      // Actor references for communication
      playlistParserRef?: ActorRefFrom<typeof PlaylistParsingActor>;
      bufferManagerRef?: ActorRefFrom<typeof BufferManagementActor>;
      abrLogicRef?: ActorRefFrom<typeof AdaptiveBitrateActor>;
    },
    events: {} as PlaybackEngineEvents,
    input: {} as {
      mediaElement: HTMLVideoElement;
      contentAnalysis: ServerContentAnalysis;
    }
  },
  actors: {
    playlistParser: PlaylistParsingActor,
    bufferManager: BufferManagementActor,
    abrLogic: AdaptiveBitrateActor,
    drmManager: DRMManagementActor,
    subtitleManager: SubtitleManagementActor
  }
}).createMachine({
  id: 'composable-playback-engine',
  initial: 'initializing',
  context: ({ input }) => ({
    // Initialize outward-facing state
    currentTime: 0,
    duration: 0,
    buffered: createTimeRanges([]),
    paused: true,
    currentLevel: 0,
    levels: [],

    // Server analysis
    contentAnalysis: input.contentAnalysis
  }),
  states: {
    initializing: {
      entry: [
        // Always spawn core actors
        assign({
          bufferManagerRef: ({ spawn }) => spawn('bufferManager')
        }),

        // Conditionally spawn based on server analysis
        assign({
          playlistParserRef: ({ spawn, context }) =>
            context.contentAnalysis.initialManifest
              ? undefined // No need to parse - already done server-side
              : spawn('playlistParser'),

          abrLogicRef: ({ spawn, context }) =>
            context.contentAnalysis.hasMultipleRenditions
              ? spawn('abrLogic')
              : undefined,

          // Only spawn DRM actor if content requires it
          drmManagerRef: ({ spawn, context }) =>
            context.contentAnalysis.requiresDRM
              ? spawn('drmManager')
              : undefined
        }),

        // If manifest was pre-processed, skip to ready state
        choose([{
          guard: ({ context }) => !!context.contentAnalysis.initialManifest,
          actions: [
            assign({
              levels: ({ context }) => context.contentAnalysis.initialManifest!.levels,
              duration: ({ context }) => context.contentAnalysis.initialManifest!.duration
            }),
            raise({ type: 'MANIFEST_READY' })
          ]
        }])
      ],
      on: {
        MANIFEST_READY: 'ready',
        LOAD_SOURCE: {
          actions: sendTo(
            ({ context }) => context.playlistParserRef!,
            ({ event }) => ({ type: 'PARSE_MANIFEST', url: event.url })
          )
        }
      }
    },

    ready: {
      type: 'parallel',
      states: {
        playback: {
          initial: 'paused',
          states: {
            paused: {
              on: {
                PLAY: {
                  target: 'playing',
                  actions: [
                    assign({ paused: false }),
                    // Notify outward interface
                    emit({ type: 'playing' })
                  ]
                }
              }
            },
            playing: {
              // Handle time updates, seeking, etc.
              on: {
                PAUSE: {
                  target: 'paused',
                  actions: [
                    assign({ paused: true }),
                    emit({ type: 'pause' })
                  ]
                },
                TIME_UPDATE: {
                  actions: assign({
                    currentTime: ({ event }) => event.time
                  })
                }
              }
            }
          }
        },

        // Only active if ABR logic was spawned
        adaptiveStreaming: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                LEVEL_SWITCH_REQUEST: {
                  guard: ({ context }) => !!context.abrLogicRef,
                  actions: sendTo(
                    ({ context }) => context.abrLogicRef!,
                    ({ event }) => ({ type: 'SELECT_LEVEL', level: event.level })
                  )
                }
              }
            }
          }
        }
      },

      // Hub-and-spoke event coordination
      on: {
        // Events from child actors update parent state
        MANIFEST_PARSED: {
          actions: assign({
            levels: ({ event }) => event.manifest.levels,
            duration: ({ event }) => event.manifest.duration
          })
        },
        BUFFER_UPDATED: {
          actions: assign({
            buffered: ({ event }) => event.buffered
          })
        },
        LEVEL_SWITCHED: {
          actions: [
            assign({ currentLevel: ({ event }) => event.level }),
            emit({ type: 'levelLoaded', level: event.level })
          ]
        }
      }
    }
  }
});
```

**Server-Side Content Analysis Example**:

```tsx
// Server pre-processes content and determines client composition
async function analyzeContentForClient(manifestUrl: string): Promise<ServerContentAnalysis> {
  const manifest = await fetchAndParseManifest(manifestUrl);

  return {
    manifestType: detectManifestType(manifest),
    hasMultipleRenditions: manifest.levels.length > 1,
    requiresDRM: manifest.levels.some(level => level.encrypted),
    hasSubtitles: manifest.subtitleTracks.length > 0,
    containerFormat: detectContainerFormat(manifest),

    // Pre-processed data reduces client work
    initialManifest: manifest,
    initialRenditionSelection: selectInitialRendition(manifest, clientHints)
  };
}

// Client receives optimized bundle + analysis
const contentAnalysis = await analyzeContentForClient('/playlist.m3u8');
const engine = createActor(ComposablePlaybackEngine, {
  input: { mediaElement, contentAnalysis }
});
```

**Key Architectural Benefits of This Approach**:

1. **Functional Composition**: Each unit encapsulates pure functions while a coordination layer manages interactions
2. **Selective Composition**: Server analysis could determine which functional units to include
3. **Event-Driven Communication**: Hub-and-spoke pattern via parent coordinator prevents tight coupling
4. **Server Optimization**: Pre-processing could eliminate client-side work and code
5. **Declarative State Management**: State machine patterns could replace imperative “Controller” architectures
6. **Testable Units**: Each functional unit can be tested in isolation

# Dimensions of Playback Engine Requirements

Understanding what determines playback engine functionality helps explain why composable architecture is necessary. Rather than building one system that handles all permutations (the “Swiss Army knife” problem, also a bit of the “lowest common denominator” problem in this context), composable architecture allows selective optimization across multiple dimensions:

## 1. Media Content Characteristics

### Protocol and Standards

- **Streaming Protocols**: HLS vs DASH vs MoQ vs progressive download
- **Stream Types**: VOD vs live vs low-latency live vs DVR/EVENT
- **Container Formats**: fMP4/CMAF vs MPEG-TS vs Matroska/WebM
- **Codecs**: H.264/HEVC, AAC, VP9, AV1, etc.

### Content Complexity

- **Track Variations**: Video-only, audio-only, multi-track audio, subtitles/captions
- **Adaptive Features**: Multiple bitrates/resolutions vs single rendition
- **Content Security**: Clear vs encrypted vs DRM (Widevine/FairPlay/PlayReady)
- **Content Structure**: Simple linear vs stitched content vs multi-cam vs interstitials
- **Metadata Integration**: ID3, IMSC/TTML, CEA-608 text tracks, externally linked data

## 2. Playback Environment

### Runtime Platform

- **Media APIs**: MediaSource vs ManagedMediaSource vs native playback
- **Processing Context**: Main thread vs Web Workers vs WASM vs Service Workers
- **Network Layer**: XHR vs fetch vs ReadableStream vs WebTransport
- **Advanced APIs**: WebCodecs, Web Audio API, Screen API

### Platform Constraints

- **Device Capabilities**: Mobile vs desktop, memory/CPU limitations
- **Browser Support**: Modern vs legacy browser feature sets
- **Framework Context**: Server-side rendering vs client-only vs edge computing

## 3. Desired Usage and Functionality

### Playback Engine Requirements

- **Interaction Models**:
  - Background/ambient playback (no seeking, minimal buffering)
  - Interactive playback (seeking, scrubbing, time-based navigation)
  - Backgrounding/foregrounding playback
- **Playback Patterns:**
  - Audio-only playback (no video processing pipeline)
  - Single media playback
  - Playlist/sequential playback (shared buffer management)
  - Player pools (multiple engine instances, resource sharing)
  - Continuous stitching (single MediaSource, multiple sources)
- **Content Lifecycle**:
  - Short-form/ephemeral content (TikTok-style, minimal buffering)
  - Long-form/persistent content (extensive buffering, gap handling)
  - Live streaming (sliding window, latency management)

### Performance Priorities

- **Startup Optimization**: Time to first frame vs bandwidth efficiency
- **Memory Management**: Buffer strategies, garbage collection, resource cleanup
- **Error Recovery**: Retry strategies, failover logic, segment recovery

## 4. Computational Distribution

### Server-Side Pre-processing

- **Content Analysis**: Manifest parsing, capability detection, optimization hints
- **Data Pre-computation**: Rendition selection, buffer strategies, feature requirements
- **Bundle Optimization**: Code splitting based on actual content needs

### Client-Side Optimization

- **Selective Loading**: Include only required functionality
- **Runtime Adaptation**: Dynamic feature activation based on conditions
- **Edge Computing**: CDN-level processing and optimization

## The Multiplicative Complexity Problem

Each dimension creates **multiplicative complexity** - a playback engine that attempts to handle all permutations becomes the monolithic “Swiss Army knife” architecture that our composable approach aims to replace.

**Traditional Approach:** Build one engine that handles every combination

- Results in large, complex codebases where features are diffused throughout
- Impossible to remove unused functionality
- One-size-fits-all optimization that optimizes for no specific case

**Composable Approach:** Selective optimization across dimensions

- **Media Content** determines which parsing/processing functions are needed
- **Playback Environment** determines which APIs and runtime strategies to use
- **Desired Usage** determines which interaction and lifecycle patterns to include
- **Computational Distribution** determines what happens server-side vs client-side

This multidimensional approach enables the server-side content analysis and conditional composition patterns described in the implementation sections.

# Implementation Architecture

## 1. Functional Core Design

### Pure Functions Wherever Possible

```jsx
// Instead of:
PlaylistManager.updatePlaylist(newData);
// Use:
const updatedState = updatePlaylist(currentState, newData);
```

### **State Management**

- Immutable state updates
- Well-defined state shape
- Clear dependency injection for side effects
- Event-driven communication between units before or after functional transitions

### Avoid Legacy Patterns

- No “Managers” or “Controllers” with implicit dependencies
- No shared mutable state between components
- No circular dependencies

## 2. Compositional API Design

### Use Case Based Composition

```jsx
// NOTE: This is "by way of example" and not a hard requirement of design
// Background looping video
const backgroundPlayer = createPlayer({
  features: [
    'hls-parsing',
    'single-rendition',
    'loop-optimization'
  ],
  exclude: [
    'audio-support',
    'seek-controls',
    'live-streaming',
    'drm',
    'subtitles'
  ]
});

// Full-featured streaming
const fullPlayer = createPlayer({
  features: [
    'hls-parsing',
    'adaptive-bitrate',
    'live-streaming',
    'drm-support',
    'multi-audio',
    'subtitles'
  ]
});
```

## 3. Server-Side Content Analysis

### **Manifest Pre-processing**

```jsx
// Server-side analysis determines client requirements
const contentAnalysis = await analyzeHLSManifest(playlistUrl);
const requiredFeatures = determineFeatures(contentAnalysis);
const optimizedBundle = buildClientBundle(requiredFeatures);
```

### Examples of Server-Side Optimization

- **Single Rendition Detection**: Omit ABR logic entirely
- **Container Format Analysis**: Include only fMP4 OR transport stream handling
- **DRM Requirements**: Include encryption handling only when needed
- **Subtitle Detection**: Skip text track parsing when no captions exist
- **Live vs VOD**: Exclude live-specific buffering and timing logic for VOD

## 4. Framework Integration Patterns

### Modern Framework Support

```jsx
// React integration
function VideoPlayer({ src, features }) {
  const playerState = usePlaybackEngine({ src, features });
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video ref={playerState.mediaRef} {...playerState.attributes} />;
}

// Vue composition API
// eslint-disable-next-line react-hooks/rules-of-hooks
const { playerState, controls } = usePlaybackEngine(src, options);

// Svelte reactive integration
$: player = createPlayer(src, $dynamicFeatures);
```

### Traditional Integration

```jsx
// Still support imperative APIs when needed
const player = new ComposablePlayer(element, {
  src: 'playlist.m3u8',
  features: ['adaptive-streaming', 'subtitles']
});
```

# Implementation Roadmap

## Phase 1: Stable Outward Interface + Pragmatic Internal Foundation

The primary goal of Phase 1 is to establish a **stable, well-defined outward interface** while building internal functionality using pragmatic patterns that align with our architectural principles without over-engineering the coordination system.

### Outward Interface Stabilization

- [ ] **Core Interface Definition**
  - [ ] Finalize TypeScript interface extending EventTarget + HTMLMediaElement subset
  - [ ] Define media-specific extensions (levels, tracks, etc.) with clear provisional status
  - [ ] Establish event contracts and naming conventions
  - [ ] Create comprehensive interface documentation
- [ ] **Basic Integration Adapters**
  - [ ] Web Components wrapper (following mux-background-video pattern)
  - [ ] Simple React hook for state synchronization
  - [ ] Basic imperative API for direct usage
  - [ ] Framework-agnostic usage examples

### Internal Building Blocks (Pragmatic Approach)

Following the [**mux-background-video**](https://github.com/muxinc/mux-background-video) model, focus on creating pure, composable functions that can be “passed in” to core coordination logic:

- [ ] **Pure Function Foundation**

  ```tsx
  // Example: Pure playlist parsing functionsconst parseHLSManifest = (manifestText: string): ParsedManifest => { /* pure */ }
  function selectInitialRendition(manifest: ParsedManifest, hints: ClientHints): Rendition { /* pure */ }
  function determineBufferStrategy(contentType: string, useCase: string): BufferConfig { /* pure */ }
  ```

- [ ] **Pluggable Function Architecture**

  ```tsx
  // Functions can be passed in rather than hard-coded
  interface PlaybackEngineConfig {
    parseManifest: (text: string) => ParsedManifest;
    selectRendition: (manifest: ParsedManifest) => Rendition;
    processSegment: (segment: ArrayBuffer) => ProcessedSegment;
    // Start simple - don't over-architect coordination
  }
  ```

- [ ] **Simple State Management**

  ```tsx
  // Pure state updates, avoid complex state machines initially
  interface PlaybackState {
    currentTime: number;
    duration: number;
    buffered: TimeRanges;
    manifest?: ParsedManifest;
    currentRendition?: Rendition;
  }
  // Pure reducer pattern
  function updatePlaybackState(state: PlaybackState, action: StateAction): PlaybackState {
    // Immutable updates, no side effects
  }
  ```

### Minimal Viable Coordination

Start with simple, direct coordination rather than complex actor systems:

- [ ] **Basic Event-Driven Core**

  ```tsx
  class PlaybackEngineCore {
    constructor(
      private config: PlaybackEngineConfig,
      private mediaElement: HTMLVideoElement,
    ) {}

    // Simple method calls to pluggable functions
    private async loadManifest(url: string) {
      const text = await fetch(url).then(r => r.text());
      // Pure function call
      const manifest = this.config.parseManifest(text);
      this.updateState({ manifest });
    }
  }
  ```

- [ ] **Use Case Specific Configurations**

  ```tsx
  // Background video configuration (like mux-background-video)
  const backgroundVideoConfig = {
    parseManifest: parseHLSManifest,
    selectRendition: manifest => selectLowestBandwidth(manifest), // No ABR needed
    processSegment: processFMP4Segment, // Assume fMP4, skip TS transmuxing
  };
  // Full streaming configuration
  const streamingConfig = {
    parseManifest: parseHLSManifest,
    selectRendition: selectAdaptiveRendition,
    processSegment: detectContainerAndProcess, // Handle both fMP4 and TS
  };
  ```

## Validation Criteria for Phase 1

### Interface Stability:

- [ ] Outward interface works consistently across multiple integration patterns
- [ ] Event contracts remain (relatively) stable as internal implementation evolves
- [ ] TypeScript types provide good developer experience

### Internal Flexibility:

- [ ] Core functions can be swapped without changing coordination logic
- [ ] New use cases can be supported by providing different function configurations
- [ ] State updates remain predictable and testable

### Practical Functionality:

- [ ] Basic HLS playback works end-to-end
- [ ] Simple use cases (like background video) require minimal configuration
- [ ] Foundation supports multiple integration patterns without architectural changes

## Future Phases (Refined Based on Phase 1 Learnings)

**Phase 2**: Server-side content analysis and dynamic function composition

**Phase 3**: Advanced coordination patterns (informed by Phase 1 practical experience)

**Phase 4**: Specialized optimizations and advanced features

## Key Architectural Principles for Phase 1

1. **“Don’t Let Perfect Be the Enemy of Good”**: Start with working functionality, refine architecture iteratively
2. **Pure Functions First**: Break functionality into testable, composable pure functions
3. **Pluggable by Design**: Functions are injected rather than hard-coded, enabling easy customization
4. **Stable Outward Contract**: Interface remains consistent even as internal implementation evolves
5. **Use Case Driven**: Prove the architecture with real scenarios (background video, basic streaming, etc.)

This approach mirrors the **mux-background-video** philosophy: solve real problems with clean, composable code while keeping the door open for architectural improvements based on practical experience.

## Technical Specifications

None of these are set in stone, and the actual code implementations certainly are not. They are instead plausible candidates for functional/compositional building blocks and groupings of behaviors.

### Compositional Units

**Playlist Parsing**:

```jsx
// Composed of smaller units
PlaylistParsing = compose([
  MultivariantPlaylistParsing,
  MediaPlaylistParsing,
  TagParsing,
  AttributeParsing
]);
```

**Segment Processing**:

```jsx
// Conditional composition based on content
const segmentProcessor = contentAnalysis.containerType === 'fmp4'
  ? createFMP4Processor()
  : createTransportStreamProcessor();
```

**Buffer Management**:

```jsx
// Use case specific optimization
const bufferStrategy = useCase === 'background-loop'
  ? createLoopOptimizedBuffer()
  : createStandardBuffer();
```

### State Architecture

**State Shape Example**:

```jsx
const playbackState = {
  // Media state
  currentTime: 0,
  duration: 0,
  buffered: TimeRanges,
  // Playlist state
  currentLevel: 0,
  availableLevels: [],
  // Loading state
  loading: false,
  error: null,
  // Feature flags
};
```

# Benefits & Outcomes

## Performance Improvements

- **Bundle Size**: 50-80% reduction for focused use cases
- **Startup Time**: Faster initial load, no unused code parsing
- **Core Web Vitals**: Better TTI and LCP scores
- **Memory Usage**: Lower runtime footprint

## Developer Experience

- **Framework Integration**: Natural fit with React/Vue/Svelte patterns
- **Customization**: Easy to modify behavior without forking
- **Testing**: Isolated units are easier to test
- **Debugging**: Clear separation of concerns aids troubleshooting

## Business Value

- **Cost Optimization**: Reduced bandwidth and CDN costs
- **User Experience**: Better page performance + video QoE
- **Development Velocity**: Faster iteration on new features
- **Maintenance**: Easier to update and extend

# Migration and Adoption Strategy

The outward/inward separation enables flexible adoption without requiring complete rewrites.

## Decision Framework

**1. Analyze your requirements** against the Dimensions of Playback Engine Requirements above.

**2. If the composable architecture covers your needs:** Use the Phase 1 approach with pure functions and pluggable configuration.

**3. If your requirements exceed current support:** Wrap existing engines (hls.js, dash.js, shaka-player) to conform to the composable interface while maintaining full functionality.

**4. If some of your use cases can use (2) and others require (3):** Use simple routing logic to direct supported cases to the composable engine and complex cases to wrapped engines.

**5. For existing applications:** Incrementally migrate integration points to use the composable interface while preserving functionality through wrapper strategies.

**6. Regardless of approach:** You can build individual pure functions using composable principles and contribute them back to existing engines or use in your forks.

# Call to Action

The composable playback engine architecture solves fundamental problems in video delivery while unlocking new possibilities for optimization and integration. Implementation should begin with core infrastructure, focusing on functional composition and state management primitives.

**Next Steps**:

1. Review existing codebases for composable patterns
2. Identify first use case for prototype (possible candidate: single-rendition VOD or https://github.com/muxinc/mux-background-video or similar)
3. Design state management system
4. Build playlist parsing as first composable module
5. Validate performance improvements with real-world testing

This architecture represents the future of web video delivery—one that doesn’t force compromises between application performance and media quality of experience.
