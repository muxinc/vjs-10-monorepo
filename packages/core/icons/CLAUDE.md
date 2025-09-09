# CLAUDE.md - @vjs-10/icons

This file provides guidance to Claude Code when working with the `@vjs-10/icons` package.

## Package Overview

`@vjs-10/icons` is the foundational icon package for VJS-10, providing environment-agnostic SVG icon definitions and utilities. This core package serves as the single source of truth for all media player icons, enabling consistent iconography across HTML, React, and React Native platforms.

**Key Responsibilities**:
- SVG icon asset storage and management
- Environment-agnostic icon utilities and metadata
- Icon transformation tooling and build processes
- Shared icon constants and naming conventions

## Architecture Position

### Dependency Hierarchy
- **Level**: Core (no dependencies)
- **Dependencies**: None (pure SVG assets and utilities)
- **Dependents**: `@vjs-10/html-icons`, `@vjs-10/react-icons`, `@vjs-10/react-native-icons`
- **Platform Target**: Universal (assets and utilities work everywhere)

### Architectural Influences
This package reflects several key design principles:

#### VidStack Influence
- **Modular Asset Management**: Individual SVG files that can be selectively imported and transformed
- **Build-Time Optimization**: SVG assets are processed and optimized at build time

#### Base UI Philosophy
- **Primitive Asset Approach**: Raw SVG assets without platform-specific styling or implementation
- **Transformation Flexibility**: Assets can be transformed into any platform-specific component format

## Key Files & Structure

```
src/
├── index.ts                    # Main exports (utilities, constants)
├── types.ts                    # TypeScript icon interfaces
└── utils/                      # Icon utilities and helpers
    ├── icon-metadata.ts        # Icon naming, sizing, categorization
    └── transforms.ts           # SVG processing utilities

assets/
├── play.svg                    # Play button icon
├── pause.svg                   # Pause button icon  
├── volume-high.svg             # High volume icon
├── volume-low.svg              # Low volume icon
└── volume-off.svg              # Muted/off volume icon
```

## Development Guidelines

### SVG Asset Standards
All SVG icons must follow consistent standards:

```xml
<!-- ✅ Good: Optimized, accessible SVG -->
<svg 
  viewBox="0 0 24 24" 
  fill="currentColor" 
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-hidden="true"
>
  <path d="M8 5v14l11-7z"/>
</svg>

<!-- ❌ Bad: Fixed dimensions, accessibility issues -->
<svg width="24px" height="24px" fill="#000000">
  <path d="M8 5v14l11-7z"/>
</svg>
```

**SVG Requirements**:
- Use `viewBox` instead of fixed `width`/`height` 
- Use `currentColor` for fill to enable CSS theming
- Include `role="img"` and `aria-hidden="true"` for accessibility
- Optimize paths using SVGO or similar tools
- Use consistent 24x24 viewBox dimensions

### Icon Naming Convention
Follow consistent kebab-case naming that transforms predictably:

```
SVG File Name          → Generated Component Name
play.svg              → PlayIcon
pause.svg             → PauseIcon  
volume-high.svg       → VolumeHighIcon
volume-low.svg        → VolumeLowIcon
volume-off.svg        → VolumeOffIcon
my-custom-icon.svg    → MyCustomIconIcon
```

### Icon Metadata
Define consistent metadata for icon management:

```typescript
// ✅ Good: Comprehensive icon metadata
export interface IconMetadata {
  name: string;
  category: 'playback' | 'volume' | 'navigation' | 'utility';
  description: string;
  keywords: string[];
  defaultSize: number;
  variants?: string[];
}

export const ICON_METADATA: Record<string, IconMetadata> = {
  play: {
    name: 'play',
    category: 'playback',
    description: 'Start or resume media playback',
    keywords: ['play', 'start', 'resume'],
    defaultSize: 24,
  },
  // ...
};
```

### Icon Categories
Organize icons into logical categories:

- **playback**: play, pause, stop, replay
- **volume**: volume-high, volume-low, volume-off, mute
- **navigation**: skip-forward, skip-backward, fast-forward, rewind
- **utility**: settings, fullscreen, picture-in-picture, closed-captions

## Build Process

### Rollup Configuration
The package uses Rollup with string plugin for SVG processing:

```javascript
// rollup.config.js pattern
import string from 'rollup-plugin-string';

export default {
  input: 'src/index.ts',
  plugins: [
    string({
      include: ['**/*.svg'], // Include SVG files as strings
    }),
    // ... other plugins
  ],
};
```

### SVG Processing
SVG assets are processed at build time:

```typescript
// ✅ Good: Runtime-agnostic SVG processing
import playSvg from '../assets/play.svg';

export const ICONS = {
  play: playSvg,
  // Transform SVG string for different platforms
} as const;

export function getSvgString(iconName: keyof typeof ICONS): string {
  return ICONS[iconName];
}
```

## Build & Development Commands

```bash
# Build the package (processes SVGs)
npm run build

# Clean build artifacts  
npm run clean

# Test (placeholder - no tests yet)
npm run test
```

## Adding New Icons

### Step-by-Step Process
1. **Create optimized SVG** following the SVG Asset Standards
2. **Add to assets/directory** using kebab-case naming
3. **Update icon metadata** in `src/utils/icon-metadata.ts`
4. **Export in index.ts** for programmatic access
5. **Build package** to generate processed assets
6. **Dependent packages** will pick up new icons on their next build

### Example: Adding a "stop" icon

1. **Create `assets/stop.svg`**:
```xml
<svg 
  viewBox="0 0 24 24" 
  fill="currentColor" 
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-hidden="true"
>
  <rect x="6" y="6" width="12" height="12"/>
</svg>
```

2. **Update metadata**:
```typescript
export const ICON_METADATA = {
  // ... existing icons
  stop: {
    name: 'stop',
    category: 'playback',
    description: 'Stop media playback',
    keywords: ['stop', 'end', 'halt'],
    defaultSize: 24,
  },
};
```

3. **Build and test**:
```bash
npm run build
# New icon will be available as StopIcon in platform packages
```

## TypeScript Configuration

This package uses:
- **Rollup + TypeScript**: For processing SVG assets and utilities
- **rollup-plugin-string**: For SVG-to-string transformation  
- **tsconfig.build.json**: Build-specific TypeScript configuration
- **Strict Mode**: Enabled for reliable type checking

## Code Patterns

### Platform-Agnostic Utilities
Provide utilities that work across all platforms:

```typescript
// ✅ Good: Environment-agnostic icon utilities
export function getIconList(category?: string): string[] {
  return Object.keys(ICON_METADATA).filter(name => 
    !category || ICON_METADATA[name].category === category
  );
}

export function getIconSvg(name: string): string | undefined {
  return ICONS[name as keyof typeof ICONS];
}

// ❌ Bad: Platform-specific logic
export function renderIcon(name: string): React.ReactElement {
  // This belongs in @vjs-10/react-icons, not core!
}
```

### Asset Export Patterns
Export assets in consumable formats:

```typescript
// ✅ Good: Multiple export formats for flexibility
export const ICONS = {
  play: playSvg,
  pause: pauseSvg,
  // ...
} as const;

export type IconName = keyof typeof ICONS;

// Named exports for direct imports
export { default as playSvg } from '../assets/play.svg';
export { default as pauseSvg } from '../assets/pause.svg';
```

## Testing Guidelines

When tests are implemented:
- Verify all SVG assets are valid XML
- Test icon metadata completeness and consistency
- Validate SVG optimization (no unnecessary attributes)
- Check that all assets follow naming conventions
- Test utility functions with various inputs

## Common Pitfalls

### ❌ Platform-Specific Code
```typescript
// Don't include React/DOM/React Native specific logic
const IconComponent = () => <svg>...</svg>; // Wrong package!

// Don't assume specific rendering environments
document.createElement('div'); // Not available everywhere
```

### ❌ Inconsistent SVG Format
```xml
<!-- Don't use fixed dimensions -->
<svg width="24" height="24">...</svg>

<!-- Don't hardcode colors -->
<svg fill="#FF0000">...</svg>

<!-- Don't skip accessibility attributes -->
<svg viewBox="0 0 24 24">...</svg>
```

### ❌ Breaking Asset Naming
```
// Don't break the naming convention
PlayButton.svg        → PlayButtonIcon (confusing)
play_button.svg       → Play_buttonIcon (invalid)
PLAY.svg             → PLAYIcon (poor casing)
```

## Icon Design Guidelines

### Visual Consistency
- Use consistent stroke width (typically 1.5-2px for 24px icons)
- Align to pixel grid for crispness
- Use consistent corner radius and styling
- Design for minimum 16px size (accessibility)

### Semantic Clarity  
- Icons should be immediately recognizable
- Follow established UI conventions (play = right-pointing triangle)
- Consider cultural differences for international use
- Test icon recognition at small sizes

### Accessibility
- Icons work with screen readers when properly labeled
- Sufficient contrast in default color schemes
- Scalable for high DPI displays
- Not dependent on color alone for meaning

## Related Documentation

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - VJS-10 architectural context
- Platform-specific icon packages:
  - `@vjs-10/react-icons` - React icon components
  - `@vjs-10/html-icons` - Web component icons  
  - `@vjs-10/react-native-icons` - React Native icons
- [SVGO Documentation](https://github.com/svg/svgo) - SVG optimization
- [SVG Accessibility Guidelines](https://css-tricks.com/accessible-svgs/) - Icon accessibility