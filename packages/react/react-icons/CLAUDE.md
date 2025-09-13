# CLAUDE.md - @vjs-10/react-icons

This file provides guidance to Claude Code when working with the `@vjs-10/react-icons` package.

## Package Overview

`@vjs-10/react-icons` provides React-specific icon components automatically generated from `@vjs-10/icons` SVG assets using SVGR. This package transforms SVG files into optimized React components with TypeScript support, following React best practices and accessibility standards.

**Key Responsibilities**:
- Auto-generated React icon components from core SVG assets
- SVGR-based SVG-to-React transformation
- TypeScript definitions for all icon components
- React-specific optimizations and prop interfaces

## Architecture Position

### Dependency Hierarchy
- **Level**: React Platform (depends on core)
- **Dependencies**: `@vjs-10/icons` (core SVG assets), `react` (peer dependency)
- **Dependents**: `@vjs-10/react-media-elements`, `@vjs-10/react`
- **Platform Target**: React environments (>=16.8.0)

### Architectural Influences
This package implements several key architectural patterns:

#### VidStack Influence
- **Documentation-Based Copy-and-Own**: Prepared for CLI-based component distribution
- **Auto-Generation**: Build-time component generation from source assets

#### Base UI Influence
- **Primitive Components**: Unstyled icon components that accept styling props
- **Composable Design**: Icons designed to work within larger component systems

## Development Guidelines

### Auto-Generation Workflow
**IMPORTANT**: All React components are auto-generated. Never edit them directly.

```bash
# ✅ Good: Proper workflow for adding/modifying icons
# 1. Add or modify SVG in core package
cd packages/core/icons/assets/
# Edit play.svg, pause.svg, etc.

# 2. Regenerate React components
cd packages/react/react-icons/
npm run generate

# 3. New components available
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';

# ❌ Bad: Editing generated components directly  
# Don't edit files in src/generated-icons/ - they'll be overwritten
```

### SVGR Configuration
Configure SVGR for optimal React component generation:

```javascript
// ✅ Good: svgr.config.js setup
module.exports = {
  typescript: true,
  jsx: {
    babelConfig: {
      plugins: [
        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
      ]
    }
  },
  dimensions: false, // Use viewBox instead of width/height
  svgProps: {
    fill: 'currentColor',
    role: 'img',
    'aria-hidden': 'true'
  },
  replaceAttrValues: {
    '#000': 'currentColor', // Replace hardcoded colors
    '#000000': 'currentColor'
  },
  template: (variables, { tpl }) => {
    return tpl`
${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
 
${variables.componentName}.displayName = '${variables.componentName}';

${variables.exports};
`;
  }
};

// ❌ Bad: Manual component creation
const PlayIcon = () => <svg>...</svg>; // Should be auto-generated
```

### TypeScript Interface Definition
Define consistent interfaces for all generated icons:

```typescript
// ✅ Good: Comprehensive icon props interface
import { SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGElement> {
  children?: never; // Icons don't accept children
  color?: string;   // Shorthand for fill/stroke
  size?: number | string; // Shorthand for width/height
}

// Generated components follow this interface
export const PlayIcon: React.FC<IconProps>;
export const PauseIcon: React.FC<IconProps>;

// ❌ Bad: Inconsistent or missing interfaces
export const PlayIcon: any; // No type safety
```

### Component Generation Pipeline
Implement efficient build-time generation:

```javascript
// ✅ Good: Build pipeline integration
// package.json scripts
{
  "scripts": {
    "generate": "node scripts/generate-icons.js",
    "build": "npm run generate && tsc && vite build",
    "clean": "rm -rf src/generated-icons/ dist/"
  }
}

// scripts/generate-icons.js
const { transform } = require('@svgr/core');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

async function generateIcons() {
  const iconsDir = '../../../core/icons/assets';
  const outputDir = 'src/generated-icons';
  
  // Read SVG files from core package
  const svgFiles = glob.sync(`${iconsDir}/*.svg`);
  
  for (const svgFile of svgFiles) {
    const svgContent = readFileSync(svgFile, 'utf8');
    const componentName = path.basename(svgFile, '.svg')
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/^([a-z])/, (g) => g[0].toUpperCase()) + 'Icon';
    
    const componentCode = await transform(
      svgContent, 
      svgrConfig, 
      { componentName }
    );
    
    writeFileSync(
      path.join(outputDir, `${componentName}.tsx`),
      `/* @generated - DO NOT EDIT */\n${componentCode}`
    );
  }
}

// ❌ Bad: Manual component creation or copying
const components = [
  'PlayIcon.tsx', // Don't create manually
  'PauseIcon.tsx'  // Don't copy from elsewhere
];
```

## Build & Development Commands

```bash
# Generate React components from SVG files
npm run generate

# Build the package (includes generation step)
npm run build

# Clean generated files and dist
npm run clean

# Test (placeholder - no tests yet)
npm run test
```

## Code Patterns

### Icon Usage Patterns
Use generated icons following React best practices:

```tsx
// ✅ Good: Proper icon usage
import { PlayIcon, PauseIcon, VolumeHighIcon } from '@vjs-10/react-icons';

function MediaControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? (
          <PauseIcon 
            aria-label="Pause" 
            color="blue" 
            size={24} 
          />
        ) : (
          <PlayIcon 
            aria-label="Play" 
            color="blue" 
            size={24} 
          />
        )}
      </button>
      
      <VolumeHighIcon 
        className="volume-icon"
        style={{ color: 'currentColor' }}
      />
    </div>
  );
}

// ❌ Bad: Hardcoded SVG or wrong imports
function BadControls() {
  return (
    <div>
      <svg>...</svg> {/* Should use generated component */}
      <img src="play.svg" alt="Play" /> {/* Should use component */}
    </div>
  );
}
```

### Accessibility Implementation
Ensure generated components are accessible:

```tsx
// ✅ Good: Accessible icon usage
<button>
  <PlayIcon aria-label="Play video" />
  Play
</button>

<span>
  <VolumeHighIcon aria-hidden="true" />
  Volume: 75%
</span>

// Decorative icons
<div>
  Status: Active <CheckIcon aria-hidden="true" />
</div>

// ❌ Bad: Missing accessibility
<button>
  <PlayIcon /> {/* No label, screen readers can't understand */}
</button>
```

### Theme Integration
Design icons to work with theme systems:

```tsx
// ✅ Good: Theme-aware icon usage
const theme = useTheme();

<PlayIcon 
  color={theme.colors.primary}
  size={theme.iconSizes.medium}
/>

// CSS custom properties
<PlayIcon 
  style={{
    color: 'var(--vjs-icon-color)',
    width: 'var(--vjs-icon-size)',
    height: 'var(--vjs-icon-size)'
  }}
/>

// ❌ Bad: Hardcoded styling
<PlayIcon color="#ff0000" size="24px" /> // Not themeable
```

## Testing Guidelines

When tests are implemented:
- Test icon component rendering with different props
- Verify accessibility attributes are properly applied
- Test theme integration and CSS custom properties
- Validate SVGR generation pipeline
- Test tree-shaking (only imported icons should be bundled)
- Verify TypeScript types are correctly generated

## Common Pitfalls

### ❌ Editing Generated Files
```typescript
// Don't edit files in src/generated-icons/
// PlayIcon.tsx
export const PlayIcon = () => { // ❌ Will be overwritten
  return <svg>modified content</svg>;
};

// Should modify source SVG and regenerate
// packages/core/icons/assets/play.svg
```

### ❌ Missing Regeneration After SVG Changes
```bash
# Don't forget to regenerate after SVG changes
# 1. Edit packages/core/icons/assets/play.svg
# 2. Must run: npm run generate
# 3. Otherwise changes won't appear in React components
```

### ❌ Breaking Icon Naming Convention
```typescript
// Don't break the naming pattern
export const play = () => {}; // ❌ Should be PlayIcon
export const PlayButton = () => {}; // ❌ Should be PlayIcon

// Should follow: {Name}Icon pattern
export const PlayIcon = () => {};
export const PauseIcon = () => {};
export const VolumeHighIcon = () => {};
```

### ❌ Adding Children to Icons
```tsx
// Don't add children to icon components
<PlayIcon>
  <span>Text inside icon</span> {/* ❌ Icons don't accept children */}
</PlayIcon>

// Should use icons as self-closing or with content alongside
<button>
  <PlayIcon />
  <span>Play</span>
</button>
```

### ❌ Performance Issues with Large Icons
```tsx
// Don't import all icons if you only need a few
import * as Icons from '@vjs-10/react-icons'; // ❌ Imports everything

// Should import only what you need
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons'; // ✅ Tree-shakable
```

## Icon Naming Reference

Generated component names follow this pattern:

| SVG File | Generated Component |
|----------|-------------------|
| `play.svg` | `PlayIcon` |
| `pause.svg` | `PauseIcon` |
| `volume-high.svg` | `VolumeHighIcon` |
| `volume-low.svg` | `VolumeLowIcon` |
| `volume-off.svg` | `VolumeOffIcon` |
| `skip-forward.svg` | `SkipForwardIcon` |

## Bundle Optimization

- All icons are tree-shakable (import only what you use)
- Generated components use React.FC type annotations
- SVG content is optimized during generation
- TypeScript definitions enable better IDE support and bundler optimization

## Integration with VJS-10 React Components

Icons are designed to work seamlessly with other VJS-10 React components:

```tsx
import { PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';

<PlayButton>
  {({ paused }) => paused ? <PlayIcon /> : <PauseIcon />}
</PlayButton>
```

## Related Documentation

- [README.md](./README.md) - Package-specific usage documentation
- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context  
- `@vjs-10/icons` - Core SVG asset dependency
- `@vjs-10/react` - Parent React UI library
- [SVGR Documentation](https://react-svgr.com/) - SVG-to-React transformation
- [React Icon Best Practices](https://react-icons.github.io/react-icons/) - Icon component patterns