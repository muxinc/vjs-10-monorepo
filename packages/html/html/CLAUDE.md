# CLAUDE.md - @vjs-10/html

This file provides guidance to Claude Code when working with the `@vjs-10/html` package.

## Package Overview

`@vjs-10/html` is the complete HTML media player UI library that provides core UI components for building media player interfaces in DOM/browser environments. This package serves as both a comprehensive UI library and a convenient re-export of all HTML platform packages for discoverability and ease of use.

**Key Responsibilities**:
- Complete media player UI component library for HTML/DOM
- Convenient re-exports of all HTML platform packages
- Default media player skins and themes
- Integration examples and documentation

## Architecture Position

### Dependency Hierarchy
- **Level**: HTML Platform (complete UI library)
- **Dependencies**: `@vjs-10/html-icons`, `@vjs-10/html-media-elements`, `@vjs-10/html-media-store`
- **Dependents**: End-user applications and HTML media players
- **Platform Target**: Browser/DOM environments with full web component support

### Architectural Influences
This package represents the culmination of VJS-10's HTML platform architectural evolution:

#### Media Chrome Heritage
- **Complete Media Player UI**: Similar to Media Chrome's comprehensive component library
- **Web Component Architecture**: Full embrace of Custom Elements and Shadow DOM
- **Theme-able Components**: CSS custom property-driven theming system

#### Base UI Influence
- **Primitive Component Composition**: Build complex UIs from simple, composable primitives
- **Headless Component Philosophy**: Behavior-focused components with flexible styling
- **Copy-and-Own Ready**: Designed for future CLI-based component customization

#### VidStack Influence
- **Modular Import System**: Import only the components you need for optimal bundle size
- **Comprehensive Feature Set**: Complete player functionality out of the box

## Development Guidelines

### Package Re-Export Pattern
This package re-exports all HTML platform packages for convenience:

```typescript
// ✅ Good: Comprehensive re-exports for discoverability
// Re-export all icons
export * from '@vjs-10/html-icons';

// Re-export all media elements  
export * from '@vjs-10/html-media-elements';

// Re-export store integration
export * from '@vjs-10/html-media-store';

// Add package-specific components
export * from './components';
export * from './skins';
export * from './themes';

// Default exports for common use cases
export { default as MediaPlayer } from './components/MediaPlayer';
export { default as DefaultSkin } from './skins/DefaultSkin';
```

### Default Media Player Implementation
Provide a complete, ready-to-use media player component:

```javascript
// ✅ Good: Complete default media player
class VjsMediaPlayer extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'controls', 'skin', 'theme'];
  }
  
  connectedCallback() {
    this.#setupDefaultStructure();
    this.#applySkin();
    this.#applyTheme();
  }
  
  #setupDefaultStructure() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          background: var(--vjs-player-background, #000);
          color: var(--vjs-player-color, #fff);
        }
        
        .player-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .controls-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--vjs-controls-background, 
            linear-gradient(transparent, rgba(0,0,0,0.7))
          );
          padding: var(--vjs-controls-padding, 1rem);
        }
      </style>
      
      <div class="player-container" part="container">
        <vjs-video part="video">
          <slot name="sources"></slot>
          <slot name="tracks"></slot>
        </vjs-video>
        
        <div class="controls-container" part="controls-container">
          <vjs-media-controls part="controls">
            <!-- Default control layout -->
            <vjs-play-button slot="start" part="play-button">
              <vjs-play-icon></vjs-play-icon>
            </vjs-play-button>
            
            <vjs-current-time slot="start" part="current-time"></vjs-current-time>
            
            <vjs-time-range slot="center" part="time-range"></vjs-time-range>
            
            <vjs-duration slot="end" part="duration"></vjs-duration>
            
            <vjs-volume-control slot="end" part="volume-control">
              <vjs-volume-button part="volume-button">
                <vjs-volume-high-icon></vjs-volume-high-icon>
              </vjs-volume-button>
              <vjs-volume-range part="volume-range"></vjs-volume-range>
            </vjs-volume-control>
            
            <vjs-fullscreen-button slot="end" part="fullscreen-button">
              <vjs-fullscreen-icon></vjs-fullscreen-icon>
            </vjs-fullscreen-button>
          </vjs-media-controls>
        </div>
        
        <slot></slot> <!-- Additional content -->
      </div>
    `;
  }
  
  #applySkin() {
    const skinName = this.getAttribute('skin') || 'default';
    this.setAttribute('data-skin', skinName);
    
    // Load skin-specific styles dynamically
    import(`./skins/${skinName}.css`).then(styles => {
      const adoptedStyleSheet = new CSSStyleSheet();
      adoptedStyleSheet.replaceSync(styles.default);
      this.shadowRoot.adoptedStyleSheets = [adoptedStyleSheet];
    }).catch(() => {
      console.warn(`Skin "${skinName}" not found, using default`);
    });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'src':
        this.#updateVideoSrc(newValue);
        break;
      case 'skin':
        this.#applySkin();
        break;
      case 'theme':
        this.#applyTheme();
        break;
    }
  }
}

customElements.define('vjs-media-player', VjsMediaPlayer);
```

### Skin System Implementation
Provide a themeable skin system:

```javascript
// ✅ Good: Flexible skin system
export const AVAILABLE_SKINS = {
  default: () => import('./skins/default/index.js'),
  minimal: () => import('./skins/minimal/index.js'),
  classic: () => import('./skins/classic/index.js'),
  modern: () => import('./skins/modern/index.js'),
};

export class VjsSkinManager {
  static async applySkin(element, skinName) {
    const skinLoader = AVAILABLE_SKINS[skinName];
    
    if (!skinLoader) {
      console.warn(`Skin "${skinName}" not available`);
      return false;
    }
    
    try {
      const skin = await skinLoader();
      await skin.apply(element);
      return true;
    } catch (error) {
      console.error(`Failed to load skin "${skinName}":`, error);
      return false;
    }
  }
  
  static getAvailableSkins() {
    return Object.keys(AVAILABLE_SKINS);
  }
}

// Skin definition structure
export class DefaultSkin {
  static async apply(element) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
      /* Default skin styles */
      :host {
        --vjs-primary-color: #007bff;
        --vjs-controls-height: 3rem;
        --vjs-border-radius: 0.25rem;
      }
      
      [part="play-button"] {
        background: var(--vjs-primary-color);
        border-radius: var(--vjs-border-radius);
        width: 2.5rem;
        height: 2.5rem;
      }
      
      [part="time-range"] {
        accent-color: var(--vjs-primary-color);
      }
    `);
    
    element.shadowRoot.adoptedStyleSheets = [
      ...element.shadowRoot.adoptedStyleSheets,
      styleSheet
    ];
  }
}
```

## Build & Development Commands

```bash
# Build the complete HTML package
npm run build

# Clean build artifacts
npm run clean

# Test (placeholder - no tests yet)
npm run test
```

## Code Patterns

### Convenient Import Patterns
Provide multiple import strategies for different use cases:

```typescript
// ✅ Good: Multiple import strategies

// 1. Everything (convenience)
import * as VjsHTML from '@vjs-10/html';

// 2. Default complete player
import { MediaPlayer } from '@vjs-10/html';

// 3. Individual components (tree-shaking friendly)
import { 
  VjsVideo,
  VjsPlayButton,
  VjsTimeRange,
  VjsVolumeControl 
} from '@vjs-10/html';

// 4. Specific categories
import { VjsPlayIcon, VjsPauseIcon } from '@vjs-10/html/icons';
import { VjsVideo, VjsAudio } from '@vjs-10/html/elements';
```

### Progressive Enhancement Pattern
Design components that work with or without JavaScript:

```html
<!-- ✅ Good: Progressive enhancement -->
<vjs-media-player src="video.mp4">
  <!-- Fallback for no-JS or unsupported browsers -->
  <video controls src="video.mp4">
    <p>Your browser doesn't support HTML5 video.</p>
  </video>
  
  <!-- Enhanced features -->
  <track kind="subtitles" src="captions.vtt" srclang="en" label="English">
</vjs-media-player>

<script type="module">
  // Enhanced functionality loads asynchronously
  import '@vjs-10/html';
</script>
```

### Plugin Architecture Foundation
Provide extensibility for custom components:

```javascript
// ✅ Good: Plugin system foundation
export class VjsPluginManager {
  static plugins = new Map();
  
  static register(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" already registered`);
      return;
    }
    
    this.plugins.set(name, plugin);
    
    // Auto-define custom element if provided
    if (plugin.elementName && plugin.elementClass) {
      if (!customElements.get(plugin.elementName)) {
        customElements.define(plugin.elementName, plugin.elementClass);
      }
    }
  }
  
  static get(name) {
    return this.plugins.get(name);
  }
  
  static getAll() {
    return Array.from(this.plugins.entries());
  }
}

// Plugin example
VjsPluginManager.register('quality-selector', {
  elementName: 'vjs-quality-selector',
  elementClass: VjsQualitySelector,
  defaultConfig: { /* ... */ }
});
```

## Integration Examples

### Basic Usage
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@vjs-10/html@latest"></script>
</head>
<body>
  <vjs-media-player 
    src="https://example.com/video.mp4" 
    skin="default"
    controls>
  </vjs-media-player>
</body>
</html>
```

### Advanced Customization
```html
<vjs-media-player skin="custom">
  <source src="video.mp4" type="video/mp4" slot="sources">
  <source src="video.webm" type="video/webm" slot="sources">
  
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" slot="tracks">
  <track kind="captions" src="captions-es.vtt" srclang="es" label="Spanish" slot="tracks">
  
  <!-- Custom controls layout -->
  <vjs-media-controls slot="controls">
    <div slot="start">
      <vjs-play-button>
        <vjs-play-icon></vjs-play-icon>
      </vjs-play-button>
      <vjs-skip-backward-button>
        <vjs-skip-backward-icon></vjs-skip-backward-icon>
      </vjs-skip-backward-button>
    </div>
    
    <vjs-time-range slot="center"></vjs-time-range>
    
    <div slot="end">
      <vjs-captions-button>
        <vjs-captions-icon></vjs-captions-icon>
      </vjs-captions-button>
      <vjs-settings-button>
        <vjs-settings-icon></vjs-settings-icon>
      </vjs-settings-button>
    </div>
  </vjs-media-controls>
</vjs-media-player>
```

## Testing Guidelines

When tests are implemented:
- Test complete media player functionality
- Verify skin system loading and application
- Test progressive enhancement fallbacks
- Validate plugin registration and loading
- Test responsive behavior across device sizes
- Verify accessibility across all included components

## Common Pitfalls

### ❌ Assuming All Features Are Loaded
```javascript
// Don't assume all components are available immediately
customElements.get('vjs-quality-selector').create(); // Might not be loaded

// Should check availability or use dynamic imports
if (customElements.get('vjs-quality-selector')) {
  // Use component
} else {
  // Load or provide fallback
}
```

### ❌ Breaking Tree-Shaking
```javascript
// Don't import everything in index files
export * from './every-single-component'; // Breaks tree-shaking

// Should provide targeted exports
export { VjsPlayButton } from './components/VjsPlayButton';
export { VjsTimeRange } from './components/VjsTimeRange';
// Only export what's needed
```

### ❌ Ignoring Bundle Size
```javascript
// Don't include unnecessary dependencies
import './skins/all-skins.css'; // Loads all skins always

// Should lazy load
const loadSkin = (name) => import(`./skins/${name}.css`);
```

### ❌ Poor Default Experience
```html
<!-- Don't provide a poor no-JS experience -->
<vjs-media-player>
  <!-- No fallback content -->
</vjs-media-player>

<!-- Should include fallback -->
<vjs-media-player>
  <video controls>
    Your browser doesn't support this video format.
  </video>
</vjs-media-player>
```

## Performance Considerations

- Implement lazy loading for non-essential components
- Use dynamic imports for skins and themes
- Provide tree-shaking friendly exports
- Implement efficient CSS loading strategies
- Consider using `adoptedStyleSheets` for shared styles
- Optimize for Core Web Vitals (LCP, CLS, FID)

## Browser Compatibility & Progressive Enhancement

- Provide meaningful fallbacks for unsupported browsers
- Use feature detection before using advanced APIs
- Consider polyfill loading strategies
- Test across different device capabilities
- Implement responsive design patterns

## Migration Path from Other Players

Design the API to facilitate easy migration from other media players:

```javascript
// ✅ Good: Migration-friendly API
// Video.js-like initialization
const player = VjsHTML.create('my-video', {
  src: 'video.mp4',
  controls: true,
  skin: 'default'
});

// Media Chrome-like declarative usage
<vjs-media-player src="video.mp4" controls></vjs-media-player>

// Custom implementation
const mediaPlayer = new VjsHTML.MediaPlayer({
  target: document.getElementById('player'),
  props: { src: 'video.mp4' }
});
```

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- [MEDIA_CHROME_MIGRATION.md](../../../MEDIA_CHROME_MIGRATION.md) - Migration from Media Chrome
- `@vjs-10/html-icons` - Icon component dependency
- `@vjs-10/html-media-elements` - Media element dependency
- `@vjs-10/html-media-store` - Store integration dependency
- [Web Components Standards](https://webcomponents.org/) - Web component specifications
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) - Theming system foundation