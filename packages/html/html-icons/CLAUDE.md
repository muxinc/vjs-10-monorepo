# CLAUDE.md - @vjs-10/html-icons

This file provides guidance to Claude Code when working with the `@vjs-10/html-icons` package.

## Package Overview

`@vjs-10/html-icons` provides HTML/DOM-specific icon components derived from `@vjs-10/icons`. This package transforms SVG assets from the core icons package into web components and DOM elements optimized for HTML/browser environments.

**Key Responsibilities**:
- Web component icon elements using Custom Elements API
- DOM-specific icon utilities and helpers
- SVG-to-HTMLElement transformation
- Browser-optimized icon rendering and styling

## Architecture Position

### Dependency Hierarchy
- **Level**: HTML Platform (depends on core)
- **Dependencies**: `@vjs-10/icons` (core SVG assets)
- **Dependents**: `@vjs-10/html-media-elements`, `@vjs-10/html`
- **Platform Target**: Browser/DOM environments only

### Architectural Influences
This package implements several key architectural patterns:

#### Media Elements Heritage
- **Custom Elements**: Uses Custom Elements API for icon components, similar to media-elements' approach
- **Shadow DOM**: Encapsulated styling and rendering for consistent icon appearance
- **HTML Standard Compliance**: Works with standard DOM APIs and CSS

#### Base UI Influence  
- **Primitive Components**: Unstyled icon primitives that accept external styling
- **CSS-Driven State**: Icons can be styled via CSS custom properties and data attributes

## Development Guidelines

### Custom Element Implementation
Create web components for icons following the Custom Elements standard:

```javascript
// ✅ Good: Standard Custom Element implementation
class VjsPlayIcon extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            width: 1em;
            height: 1em;
            fill: currentColor;
          }
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
        ${playSvgString}
      `;
    }
  }
}

customElements.define('vjs-play-icon', VjsPlayIcon);

// ❌ Bad: Non-standard implementation
class BadIcon {
  render() {
    document.body.innerHTML = '<svg>...</svg>'; // Manipulates global DOM
  }
}
```

### Shadow DOM Styling
Use Shadow DOM for style encapsulation:

```javascript
// ✅ Good: Encapsulated styling with CSS custom properties
class VjsIcon extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: var(--vjs-icon-display, inline-block);
          width: var(--vjs-icon-size, 1em);
          height: var(--vjs-icon-size, 1em);
          fill: var(--vjs-icon-color, currentColor);
        }
        
        svg {
          width: 100%;
          height: 100%;
        }
        
        :host([disabled]) {
          opacity: var(--vjs-icon-disabled-opacity, 0.5);
          pointer-events: none;
        }
      </style>
      <svg viewBox="0 0 24 24">
        ${this.getIconPath()}
      </svg>
    `;
  }
}

// ❌ Bad: No encapsulation
class BadIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<svg style="width:24px">...</svg>'; // No Shadow DOM
  }
}
```

### Icon Registration Pattern
Use consistent naming and registration:

```javascript
// ✅ Good: Consistent naming pattern  
const iconComponents = {
  'vjs-play-icon': () => new VjsPlayIcon(),
  'vjs-pause-icon': () => new VjsPauseIcon(),
  'vjs-volume-high-icon': () => new VjsVolumeHighIcon(),
  'vjs-volume-low-icon': () => new VjsVolumeLowIcon(),
  'vjs-volume-off-icon': () => new VjsVolumeOffIcon(),
};

// Register all components
Object.keys(iconComponents).forEach(tagName => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, iconComponents[tagName]);
  }
});

// ❌ Bad: Inconsistent naming
customElements.define('play-button', PlayIcon); // Should be vjs-play-icon
customElements.define('VolumeIcon', VolumeIcon); // Should be kebab-case
```

### Accessibility Implementation
Ensure all icon components are accessible:

```javascript
// ✅ Good: Accessible icon implementation
class VjsIcon extends HTMLElement {
  static get observedAttributes() {
    return ['aria-label', 'aria-hidden', 'role'];
  }
  
  connectedCallback() {
    // Set default accessibility attributes
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'img');
    }
    
    if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-hidden', 'true');
    }
    
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // Update accessibility attributes
    if (name === 'aria-label' && newValue) {
      this.removeAttribute('aria-hidden');
    }
  }
}

// Usage examples:
// <vjs-play-icon aria-label="Play video"></vjs-play-icon>
// <vjs-pause-icon aria-hidden="true"></vjs-pause-icon> (decorative)
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

## Code Patterns

### SVG Asset Integration
Import and use SVG assets from the core icons package:

```javascript
// ✅ Good: Import from core icons package
import { ICONS, getSvgString } from '@vjs-10/icons';

class VjsPlayIcon extends HTMLElement {
  connectedCallback() {
    const svgContent = getSvgString('play');
    this.shadowRoot.innerHTML = `
      <style>/* ... */</style>
      ${svgContent}
    `;
  }
}

// ❌ Bad: Hardcoded SVG content
class BadIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<svg><path d="..."></path></svg>'; // Should use core assets
  }
}
```

### Theming Support
Provide CSS custom properties for theming:

```css
/* ✅ Good: Comprehensive theming support */
:host {
  /* Size */
  --vjs-icon-size: 1em;
  
  /* Colors */
  --vjs-icon-color: currentColor;
  --vjs-icon-hover-color: var(--vjs-icon-color);
  --vjs-icon-active-color: var(--vjs-icon-color);
  
  /* States */
  --vjs-icon-disabled-opacity: 0.5;
  --vjs-icon-focus-outline: 2px solid var(--vjs-focus-color, blue);
}

:host(:hover) {
  fill: var(--vjs-icon-hover-color);
}

:host(:focus-visible) {
  outline: var(--vjs-icon-focus-outline);
}
```

### Element Definition Safety
Always check for existing definitions:

```javascript
// ✅ Good: Safe element definition
function defineIconElement(tagName, elementClass) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  } else {
    console.warn(`Custom element ${tagName} already defined`);
  }
}

// ❌ Bad: Unsafe definition
customElements.define('vjs-icon', VjsIcon); // Could throw if already defined
```

## Testing Guidelines

When tests are implemented:
- Test custom element registration and lifecycle
- Verify Shadow DOM content and styling
- Test accessibility attribute handling
- Validate CSS custom property theming
- Test icon rendering across different browsers
- Verify SVG asset integration from core package

## Common Pitfalls

### ❌ Breaking Shadow DOM Encapsulation
```javascript
// Don't manipulate global styles
class BadIcon extends HTMLElement {
  connectedCallback() {
    document.head.appendChild(styleSheet); // Breaks encapsulation
  }
}

// Should use Shadow DOM styles
class GoodIcon extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>...</style>`;
  }
}
```

### ❌ Ignoring Accessibility
```javascript
// Don't forget accessibility
class BadIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<svg>...</svg>'; // No ARIA attributes
  }
}

// Should include accessibility
class GoodIcon extends HTMLElement {
  connectedCallback() {
    this.setAttribute('role', 'img');
    if (!this.getAttribute('aria-label')) {
      this.setAttribute('aria-hidden', 'true');
    }
  }
}
```

### ❌ Hardcoding Icon Assets
```javascript
// Don't duplicate SVG content
class BadIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<svg><path d="M8 5v14l11-7z"/></svg>'; // Duplicated from core
  }
}

// Should import from @vjs-10/icons
import { getSvgString } from '@vjs-10/icons';
class GoodIcon extends HTMLElement {
  connectedCallback() {
    this.innerHTML = getSvgString('play');
  }
}
```

### ❌ Missing Custom Element Lifecycle
```javascript
// Don't skip lifecycle methods
class BadIcon extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = '<svg>...</svg>'; // Too early - not connected to DOM
  }
}

// Should use connectedCallback
class GoodIcon extends HTMLElement {
  connectedCallback() {
    this.render(); // DOM is ready
  }
}
```

## Performance Considerations

- Use `{ mode: 'open' }` for Shadow DOM to allow styling from outside
- Implement lazy registration (define elements only when needed)
- Cache SVG content to avoid repeated parsing
- Use CSS custom properties for efficient theming
- Consider using `adoptedStyleSheets` for shared styles

## Browser Compatibility

- Custom Elements require modern browsers or polyfills
- Shadow DOM requires polyfill for older browsers  
- Test with Web Components polyfills if supporting legacy browsers
- Use progressive enhancement where possible

## Integration with VJS-10 HTML Components

These icon components are designed to work seamlessly with other VJS-10 HTML components:

```html
<!-- Icon components in media controls -->
<vjs-media-controls>
  <vjs-play-button>
    <vjs-play-icon aria-hidden="true"></vjs-play-icon>
  </vjs-play-button>
  
  <vjs-mute-button>
    <vjs-volume-high-icon aria-hidden="true"></vjs-volume-high-icon>
  </vjs-mute-button>
</vjs-media-controls>
```

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- `@vjs-10/icons` - Core SVG asset dependency
- `@vjs-10/html` - Parent HTML UI library
- [Custom Elements Specification](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM Specification](https://dom.spec.whatwg.org/#shadow-trees)
- [Web Components Best Practices](https://web.dev/web-components-best-practices/)