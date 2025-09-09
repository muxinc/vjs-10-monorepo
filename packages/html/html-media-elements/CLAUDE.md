# CLAUDE.md - @vjs-10/html-media-elements

This file provides guidance to Claude Code when working with the `@vjs-10/html-media-elements` package.

## Package Overview

`@vjs-10/html-media-elements` provides HTML/DOM-specific media element components and utilities. This package implements web components that follow VJS-10's architectural patterns while leveraging the browser's native HTMLMediaElement capabilities and modern web standards.

**Key Responsibilities**:
- Web component implementations of media UI elements
- HTMLMediaElement integration and enhancement
- DOM-specific media controls and interactions
- Context protocol integration for component communication

## Architecture Position

### Dependency Hierarchy
- **Level**: HTML Platform (builds on core)
- **Dependencies**: `@vjs-10/media-store`, `@open-wc/context-protocol`
- **Dependents**: `@vjs-10/html-media-store`, `@vjs-10/html`
- **Platform Target**: Browser/DOM environments with Custom Elements support

### Architectural Influences
This package directly implements several key architectural patterns:

#### Media Chrome Heritage
- **Web Component Media Controls**: Direct evolution from Media Chrome's component-based architecture
- **HTMLMediaElement Extension**: Enhances native media elements with custom functionality
- **Event-Driven Interactions**: Follows Media Chrome's event-based communication patterns

#### Media Elements Evolution
- **Custom Element Foundation**: Built on media-elements' Custom Elements patterns
- **Native Element Enhancement**: Extends rather than replaces native HTMLMediaElement
- **Shadow DOM Encapsulation**: Uses Shadow DOM for component isolation

#### Base UI Influence
- **Primitive Components**: Unstyled, behavior-focused web components
- **Data Attribute State**: Exposes state via data attributes for CSS targeting

## Development Guidelines

### Custom Element Implementation
Create web components following modern standards and VJS-10 patterns:

```javascript
// ✅ Good: Modern custom element with VJS-10 integration
import { ContextConsumer } from '@open-wc/context-protocol';
import { mediaStoreContext } from '@vjs-10/media-store';

class VjsPlayButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'aria-label'];
  }
  
  #contextConsumer = new ContextConsumer(this, mediaStoreContext);
  #unsubscribe = null;
  
  connectedCallback() {
    this.#setupShadowDOM();
    this.#setupEventListeners();
    this.#setupStoreSubscription();
  }
  
  disconnectedCallback() {
    this.#unsubscribe?.();
    this.removeEventListener('click', this.#handleClick);
  }
  
  #setupShadowDOM() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          
          :host([disabled]) {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }
          
          button {
            background: none;
            border: none;
            color: inherit;
            font: inherit;
            cursor: inherit;
            padding: var(--vjs-button-padding, 0.5em);
          }
        </style>
        <button part="button">
          <slot></slot>
        </button>
      `;
    }
  }
  
  #setupStoreSubscription() {
    this.#contextConsumer.subscribe((store) => {
      if (!store) return;
      
      this.#unsubscribe?.();
      this.#unsubscribe = store.subscribe(['paused'], (state) => {
        this.toggleAttribute('data-paused', state.paused);
        this.setAttribute('aria-label', state.paused ? 'Play' : 'Pause');
      });
    });
  }
  
  #handleClick = (event) => {
    if (this.hasAttribute('disabled')) return;
    
    const store = this.#contextConsumer.context;
    if (store) {
      const action = this.hasAttribute('data-paused') ? 'playrequest' : 'pauserequest';
      store.dispatch({ type: action });
    }
  }
}

customElements.define('vjs-play-button', VjsPlayButton);

// ❌ Bad: Tightly coupled, non-standard implementation
class BadButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button>Play</button>';
    this.onclick = () => {
      window.globalVideoElement.play(); // Global coupling
    };
  }
}
```

### Context Protocol Integration
Use the context protocol for component communication:

```javascript
// ✅ Good: Context protocol for store access
import { ContextProvider, ContextConsumer } from '@open-wc/context-protocol';
import { mediaStoreContext } from '@vjs-10/media-store';

class VjsMediaProvider extends HTMLElement {
  #contextProvider = new ContextProvider(this, mediaStoreContext);
  
  connectedCallback() {
    const mediaElement = this.#getMediaElement();
    const store = createMediaStore({ media: mediaElement });
    
    this.#contextProvider.setValue(store);
  }
}

class VjsMediaConsumer extends HTMLElement {
  #contextConsumer = new ContextConsumer(this, mediaStoreContext);
  
  connectedCallback() {
    this.#contextConsumer.subscribe((store) => {
      if (store) {
        this.#subscribeToStore(store);
      }
    });
  }
}

// ❌ Bad: Global state or direct coupling
class BadConsumer extends HTMLElement {
  connectedCallback() {
    this.store = window.globalMediaStore; // Global coupling
  }
}
```

### HTMLMediaElement Enhancement
Enhance native media elements while maintaining compatibility:

```javascript
// ✅ Good: HTMLMediaElement enhancement
class VjsVideo extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'controls', 'autoplay', 'muted', 'loop'];
  }
  
  connectedCallback() {
    this.#createVideoElement();
    this.#setupMediaStore();
    this.#forwardAttributes();
  }
  
  #createVideoElement() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          video {
            width: 100%;
            height: 100%;
          }
        </style>
        <video part="video">
          <slot name="tracks"></slot>
          <slot name="sources"></slot>
        </video>
        <slot></slot>
      `;
    }
    
    this.videoElement = this.shadowRoot.querySelector('video');
  }
  
  #setupMediaStore() {
    this.mediaStore = createMediaStore({
      media: this.videoElement
    });
    
    // Provide store via context
    this.#contextProvider = new ContextProvider(this, mediaStoreContext);
    this.#contextProvider.setValue(this.mediaStore);
  }
  
  #forwardAttributes() {
    // Forward host attributes to video element
    const forwardedAttrs = ['src', 'controls', 'autoplay', 'muted', 'loop'];
    forwardedAttrs.forEach(attr => {
      if (this.hasAttribute(attr)) {
        this.videoElement.setAttribute(attr, this.getAttribute(attr) || '');
      }
    });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.videoElement) {
      if (newValue === null) {
        this.videoElement.removeAttribute(name);
      } else {
        this.videoElement.setAttribute(name, newValue);
      }
    }
  }
  
  // Proxy important video element methods
  play() { return this.videoElement?.play(); }
  pause() { this.videoElement?.pause(); }
  load() { this.videoElement?.load(); }
}

// ❌ Bad: Replacing instead of enhancing
class BadVideo extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div class="fake-video"></div>'; // Not a real video element
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

### Slot-Based Composition
Use slots for flexible component composition:

```javascript
// ✅ Good: Slot-based composition
class VjsMediaControls extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          gap: var(--vjs-controls-gap, 0.5em);
        }
        
        ::slotted(vjs-play-button) {
          flex-shrink: 0;
        }
        
        ::slotted(vjs-time-range) {
          flex: 1;
        }
      </style>
      
      <slot name="start"></slot>
      <slot name="center"></slot>
      <slot name="end"></slot>
      <slot></slot> <!-- Default slot for unnamed content -->
    `;
  }
}

// Usage:
// <vjs-media-controls>
//   <vjs-play-button slot="start"></vjs-play-button>
//   <vjs-time-range slot="center"></vjs-time-range>
//   <vjs-volume-control slot="end"></vjs-volume-control>
// </vjs-media-controls>
```

### State Reflection Pattern
Reflect internal state as attributes for CSS targeting:

```javascript
// ✅ Good: State reflection for styling
class VjsVolumeButton extends HTMLElement {
  #updateStateAttributes(state) {
    // Boolean states
    this.toggleAttribute('data-muted', state.muted);
    
    // Enumerated states  
    this.setAttribute('data-volume-level', state.volumeLevel);
    
    // Update ARIA
    this.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute');
    this.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
  }
}

// CSS can target these attributes:
/*
vjs-volume-button[data-muted] .volume-high-icon { display: none; }
vjs-volume-button[data-muted] .volume-off-icon { display: block; }
vjs-volume-button[data-volume-level="low"] .volume-high-icon { display: none; }
vjs-volume-button[data-volume-level="low"] .volume-low-icon { display: block; }
*/
```

### Accessibility Integration
Ensure all components are fully accessible:

```javascript
// ✅ Good: Comprehensive accessibility
class VjsTimeRange extends HTMLElement {
  connectedCallback() {
    this.#setupShadowDOM();
    this.#setupAccessibility();
    this.#setupKeyboardHandling();
  }
  
  #setupShadowDOM() {
    this.shadowRoot.innerHTML = `
      <style>
        input[type="range"] {
          width: 100%;
        }
        
        input:focus-visible {
          outline: 2px solid var(--vjs-focus-color, blue);
          outline-offset: 2px;
        }
      </style>
      <input 
        type="range" 
        part="range"
        min="0" 
        max="100" 
        step="0.1"
        aria-label="Seek"
      />
    `;
    
    this.rangeInput = this.shadowRoot.querySelector('input');
  }
  
  #setupAccessibility() {
    // Update ARIA attributes based on media state
    this.#storeSubscription = this.store?.subscribe(['currentTime', 'duration'], (state) => {
      const currentTimeText = this.#formatTime(state.currentTime);
      const durationText = this.#formatTime(state.duration);
      
      this.rangeInput.setAttribute('aria-valuetext', 
        `${currentTimeText} of ${durationText}`
      );
      this.rangeInput.setAttribute('aria-valuenow', 
        String(state.currentTime)
      );
      this.rangeInput.setAttribute('aria-valuemax', 
        String(state.duration)
      );
    });
  }
  
  #setupKeyboardHandling() {
    this.rangeInput.addEventListener('keydown', (event) => {
      // Custom keyboard shortcuts
      switch (event.key) {
        case 'Home':
          event.preventDefault();
          this.#seekTo(0);
          break;
        case 'End':
          event.preventDefault();
          this.#seekTo(this.duration);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          // Let native range handle these
          break;
      }
    });
  }
}
```

## Testing Guidelines

When tests are implemented:
- Test custom element lifecycle and attribute handling
- Verify context protocol integration and store communication
- Test accessibility features (ARIA attributes, keyboard navigation)
- Validate Shadow DOM structure and slot composition
- Test HTMLMediaElement integration and proxying
- Verify component cleanup and memory management

## Common Pitfalls

### ❌ Breaking Shadow DOM Encapsulation
```javascript
// Don't manipulate external DOM from components
class BadComponent extends HTMLElement {
  connectedCallback() {
    document.body.style.background = 'red'; // Breaks encapsulation
  }
}

// Should stay within component boundaries
class GoodComponent extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<style>:host { background: red; }</style>';
  }
}
```

### ❌ Ignoring Context Protocol
```javascript
// Don't use global state or direct element queries
class BadConsumer extends HTMLElement {
  connectedCallback() {
    this.store = document.querySelector('vjs-provider').store; // Fragile coupling
  }
}

// Should use context protocol
class GoodConsumer extends HTMLElement {
  #contextConsumer = new ContextConsumer(this, mediaStoreContext);
  
  connectedCallback() {
    this.#contextConsumer.subscribe((store) => {
      this.store = store;
    });
  }
}
```

### ❌ Missing Accessibility
```javascript
// Don't forget accessibility
class BadButton extends HTMLElement {
  connectedCallback() {
    this.shadowRoot.innerHTML = '<div onclick="...">Play</div>'; // Not accessible
  }
}

// Should include proper accessibility
class GoodButton extends HTMLElement {
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <button aria-label="Play" role="button">
        <slot></slot>
      </button>
    `;
  }
}
```

### ❌ Not Handling Context Unavailability
```javascript
// Don't assume context is always available
class BadConsumer extends HTMLElement {
  connectedCallback() {
    this.store.subscribe(() => {}); // Could be undefined
  }
}

// Should handle missing context gracefully
class GoodConsumer extends HTMLElement {
  #contextConsumer = new ContextConsumer(this, mediaStoreContext);
  
  connectedCallback() {
    this.#contextConsumer.subscribe((store) => {
      if (store) {
        this.store = store;
        this.#subscribeToStore();
      } else {
        this.#showFallbackUI();
      }
    });
  }
}
```

## Performance Considerations

- Use `part` and CSS custom properties for efficient styling
- Implement lazy loading for complex components
- Use efficient DOM queries within Shadow DOM
- Consider using `adoptedStyleSheets` for shared styles
- Minimize attribute observations (only observe what you need)

## Browser Compatibility

- Requires Custom Elements v1 support (modern browsers)
- Shadow DOM v1 required for encapsulation
- Use Web Components polyfills for older browser support
- Context protocol requires modern browser features

## Integration Examples

```html
<!-- Complete media player structure -->
<vjs-video src="video.mp4" controls>
  <vjs-media-controls>
    <vjs-play-button slot="start">
      <vjs-play-icon></vjs-play-icon>
    </vjs-play-button>
    
    <vjs-time-range slot="center"></vjs-time-range>
    
    <vjs-volume-control slot="end">
      <vjs-volume-button>
        <vjs-volume-high-icon></vjs-volume-high-icon>
      </vjs-volume-button>
      <vjs-volume-range></vjs-volume-range>
    </vjs-volume-control>
  </vjs-media-controls>
</vjs-video>
```

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- `@vjs-10/media-store` - Core state management dependency
- `@vjs-10/html-icons` - Icon components for media controls
- [Custom Elements Specification](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Context Protocol](https://github.com/open-wc/context-protocol) - Component communication
- [Shadow DOM Specification](https://dom.spec.whatwg.org/#shadow-trees)