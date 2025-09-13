# CLAUDE.md - @vjs-10/html-media-store

This file provides guidance to Claude Code when working with the `@vjs-10/html-media-store` package.

## Package Overview

`@vjs-10/html-media-store` provides HTML/DOM-specific media store integration and components. This package bridges the framework-agnostic `@vjs-10/media-store` with DOM/browser environments, enabling media state management for web components and vanilla HTML/JavaScript applications.

**Key Responsibilities**:
- DOM-specific media store integration utilities
- HTMLMediaElement and Custom Element state binding
- Browser event handling and lifecycle management  
- Web component media state providers and contexts

## Architecture Position

### Dependency Hierarchy
- **Level**: HTML Platform (builds on core)
- **Dependencies**: `@vjs-10/media-store`, `@vjs-10/html-media-elements`
- **Dependents**: `@vjs-10/html` (complete HTML UI library)
- **Platform Target**: Browser/DOM environments only

### Architectural Influences
This package implements key architectural bridging patterns:

#### Media Chrome Heritage
- **DOM Event Integration**: Bridges Media Chrome-style state mediators with DOM events
- **Element-Based State Owners**: Uses HTMLMediaElement as state owner, following Media Chrome patterns
- **Custom Element State Binding**: Connects VJS-10 state management to web components

#### Media Elements Evolution
- **Direct HTMLElement Integration**: Works with actual HTMLMediaElement instances and custom elements
- **DOM Lifecycle Management**: Handles element attachment, detachment, and cleanup

## Development Guidelines

### DOM State Owner Integration
Connect HTMLMediaElement instances to VJS-10 state management:

```javascript
// ✅ Good: Proper DOM state owner integration
import { createMediaStore } from '@vjs-10/media-store';

class MediaStoreProvider extends HTMLElement {
  connectedCallback() {
    // Find or create media element
    const mediaElement = this.querySelector('video, audio') || 
                        this.shadowRoot?.querySelector('video, audio');
    
    if (mediaElement) {
      // Create store with DOM element as state owner
      this.mediaStore = createMediaStore({
        media: mediaElement, // HTMLMediaElement as state owner
      });
      
      // Provide store to child elements
      this.dispatchEvent(new CustomEvent('vjs-media-store-ready', {
        detail: { store: this.mediaStore },
        bubbles: true
      }));
    }
  }
  
  disconnectedCallback() {
    // Clean up store
    this.mediaStore?.destroy?.();
  }
}

// ❌ Bad: No lifecycle management
class BadProvider extends HTMLElement {
  constructor() {
    super();
    this.store = createMediaStore(); // No media element, no cleanup
  }
}
```

### Custom Element State Binding
Bind custom elements to media store state:

```javascript
// ✅ Good: Custom element with store integration
class VjsPlayButton extends HTMLElement {
  #store = null;
  #unsubscribe = null;
  
  connectedCallback() {
    // Listen for store availability
    this.addEventListener('vjs-media-store-ready', this.#handleStoreReady);
    
    // Check if store already exists
    const storeEvent = new CustomEvent('vjs-media-store-request', { bubbles: true });
    this.dispatchEvent(storeEvent);
  }
  
  #handleStoreReady = (event) => {
    this.#store = event.detail.store;
    
    // Subscribe to playback state
    this.#unsubscribe = this.#store.subscribe(['paused'], (state) => {
      this.toggleAttribute('data-paused', state.paused);
      this.setAttribute('aria-label', state.paused ? 'Play' : 'Pause');
    });
  }
  
  disconnectedCallback() {
    this.#unsubscribe?.();
    this.removeEventListener('vjs-media-store-ready', this.#handleStoreReady);
  }
  
  #handleClick = () => {
    if (this.#store) {
      const action = this.hasAttribute('data-paused') ? 'playrequest' : 'pauserequest';
      this.#store.dispatch({ type: action });
    }
  }
}

// ❌ Bad: Direct DOM manipulation without store
class BadButton extends HTMLElement {
  connectedCallback() {
    this.onclick = () => {
      const video = document.querySelector('video');
      video.paused ? video.play() : video.pause(); // Direct manipulation
    };
  }
}
```

### Store Context Provider Pattern
Provide media store context to descendant elements:

```javascript
// ✅ Good: Context provider pattern
class VjsMediaProvider extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'autoplay', 'muted'];
  }
  
  connectedCallback() {
    this.#setupMediaStore();
    this.#setupContextProvider();
  }
  
  #setupMediaStore() {
    const mediaElement = this.#getOrCreateMediaElement();
    
    this.mediaStore = createMediaStore({
      media: mediaElement,
    });
    
    // Forward store state as DOM attributes for CSS styling
    this.#unsubscribe = this.mediaStore.subscribe('*', (state) => {
      this.toggleAttribute('data-paused', state.paused);
      this.toggleAttribute('data-muted', state.muted);
      this.setAttribute('data-volume-level', state.volumeLevel);
    });
  }
  
  #setupContextProvider() {
    // Provide store to any requesting child elements
    this.addEventListener('vjs-media-store-request', (event) => {
      event.stopPropagation();
      event.target.dispatchEvent(new CustomEvent('vjs-media-store-ready', {
        detail: { store: this.mediaStore }
      }));
    });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.mediaStore) return;
    
    // Forward attribute changes to store
    switch (name) {
      case 'src':
        this.mediaStore.dispatch({ type: 'srcchange', detail: newValue });
        break;
      case 'muted':
        this.mediaStore.dispatch({ 
          type: newValue !== null ? 'muterequest' : 'unmuterequest' 
        });
        break;
    }
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

## Code Patterns

### Event-Driven Store Communication
Use custom events for store communication between elements:

```javascript
// ✅ Good: Event-driven store communication
const STORE_EVENTS = {
  REQUEST: 'vjs-media-store-request',
  READY: 'vjs-media-store-ready',
  STATE_CHANGE: 'vjs-media-state-change',
};

class MediaStoreConsumer extends HTMLElement {
  connectedCallback() {
    // Request store from parent
    this.dispatchEvent(new CustomEvent(STORE_EVENTS.REQUEST, { 
      bubbles: true 
    }));
    
    this.addEventListener(STORE_EVENTS.READY, this.#handleStoreReady);
  }
  
  #handleStoreReady = (event) => {
    this.mediaStore = event.detail.store;
    this.#subscribeToStore();
  }
}
```

### DOM Attribute State Reflection
Reflect store state as DOM attributes for CSS styling:

```javascript
// ✅ Good: State reflection for CSS styling
class MediaStateReflector extends HTMLElement {
  #reflectState = (state) => {
    // Boolean states as presence/absence
    this.toggleAttribute('data-paused', state.paused);
    this.toggleAttribute('data-muted', state.muted);
    this.toggleAttribute('data-ended', state.ended);
    
    // Enumerated states as string values
    this.setAttribute('data-volume-level', state.volumeLevel); // 'off', 'low', 'high'
    this.setAttribute('data-stream-type', state.streamType || 'on-demand');
    
    // Numeric states (optional, for CSS custom properties)
    this.style.setProperty('--vjs-current-time', state.currentTime);
    this.style.setProperty('--vjs-duration', state.duration);
    this.style.setProperty('--vjs-volume', state.volume);
  }
}

// CSS can then target these attributes
/*
[data-paused] .play-icon { display: block; }
[data-paused] .pause-icon { display: none; }
[data-volume-level="off"] .volume-high-icon { display: none; }
[data-volume-level="off"] .volume-off-icon { display: block; }
*/
```

### Store Lifecycle Management
Properly manage store lifecycle with DOM elements:

```javascript
// ✅ Good: Proper lifecycle management
class MediaStoreManager extends HTMLElement {
  #store = null;
  #unsubscribe = null;
  #mediaObserver = null;
  
  connectedCallback() {
    this.#initializeStore();
    this.#observeMediaChanges();
  }
  
  disconnectedCallback() {
    this.#cleanup();
  }
  
  #cleanup() {
    this.#unsubscribe?.();
    this.#mediaObserver?.disconnect();
    this.#store?.destroy?.();
  }
  
  #observeMediaChanges() {
    // Watch for media element changes in DOM
    this.#mediaObserver = new MutationObserver((mutations) => {
      const hasMediaChanges = mutations.some(mutation =>
        Array.from(mutation.addedNodes).some(node => 
          node.matches?.('video, audio')
        )
      );
      
      if (hasMediaChanges) {
        this.#reinitializeStore();
      }
    });
    
    this.#mediaObserver.observe(this, { childList: true, subtree: true });
  }
}
```

## Testing Guidelines

When tests are implemented:
- Test store integration with various HTMLMediaElement types
- Verify custom element lifecycle with store binding
- Test event-driven communication between elements
- Validate state reflection as DOM attributes  
- Test cleanup and memory leak prevention
- Verify compatibility with different web component patterns

## Common Pitfalls

### ❌ Missing Cleanup
```javascript
// Don't forget cleanup
class BadElement extends HTMLElement {
  connectedCallback() {
    this.store = createMediaStore();
    this.subscription = this.store.subscribe(() => {}); // Never cleaned up
  }
}

// Should cleanup in disconnectedCallback
class GoodElement extends HTMLElement {
  disconnectedCallback() {
    this.subscription?.();
    this.store?.destroy?.();
  }
}
```

### ❌ Direct DOM Manipulation
```javascript
// Don't bypass the store
class BadButton extends HTMLElement {
  onclick = () => {
    const video = document.querySelector('video');
    video.play(); // Direct manipulation instead of using store
  }
}

// Should use store actions
class GoodButton extends HTMLElement {
  onclick = () => {
    this.store?.dispatch({ type: 'playrequest' });
  }
}
```

### ❌ Not Handling Store Unavailability
```javascript
// Don't assume store is always available
class BadConsumer extends HTMLElement {
  connectedCallback() {
    this.store.subscribe(() => {}); // Could be null/undefined
  }
}

// Should check store availability
class GoodConsumer extends HTMLElement {
  #handleStoreReady = (event) => {
    if (event.detail.store) {
      this.store = event.detail.store;
      this.store.subscribe(() => {});
    }
  }
}
```

### ❌ Memory Leaks in Event Listeners
```javascript
// Don't forget to remove listeners
class BadElement extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', this.handleClick); // Never removed
  }
}

// Should remove in disconnectedCallback
class GoodElement extends HTMLElement {
  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }
}
```

## Browser Compatibility

- Requires modern browsers with Custom Elements support
- Use Web Components polyfills for older browser support
- MutationObserver is widely supported (IE11+)
- Custom Events work in all modern browsers

## Performance Considerations

- Use efficient DOM queries (avoid repeated `querySelector` calls)
- Debounce frequent state updates to prevent excessive DOM manipulation
- Use `toggleAttribute` instead of `setAttribute`/`removeAttribute` for boolean states
- Consider using `requestAnimationFrame` for DOM updates if needed
- Implement lazy store creation (create only when media element is available)

## Integration Patterns

This package enables several integration patterns for HTML applications:

```html
<!-- Provider pattern -->
<vjs-media-provider src="video.mp4">
  <video></video>
  <vjs-media-controls>
    <vjs-play-button></vjs-play-button>
    <vjs-volume-control></vjs-volume-control>
  </vjs-media-controls>
</vjs-media-provider>

<!-- Attribute-driven styling -->
<style>
  vjs-media-provider[data-paused] .play-icon { display: block; }
  vjs-media-provider:not([data-paused]) .pause-icon { display: block; }
</style>
```

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- `@vjs-10/media-store` - Core state management dependency
- `@vjs-10/html-media-elements` - HTML media element components
- [Custom Elements Specification](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [MutationObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)