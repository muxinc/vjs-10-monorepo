# @vjs-10/react-icons

React-specific icon components derived from `@vjs-10/icons`.

## Overview

This package provides React components for media player icons that are automatically generated from SVG files. All icon components are built using [SVGR](https://react-svgr.com/) to transform SVG assets into optimized React components.

## 🔄 Auto-Generated Components

**Important:** The React components in this package are automatically generated. Do not edit them directly.

### Generated Files Location

```bash
src/generated-icons/
├── index.ts          # Auto-generated exports (DO NOT EDIT)
├── Play.tsx          # Auto-generated component (DO NOT EDIT)
├── Pause.tsx         # Auto-generated component (DO NOT EDIT)
├── VolumeHigh.tsx    # Auto-generated component (DO NOT EDIT)
├── VolumeLow.tsx     # Auto-generated component (DO NOT EDIT)
└── VolumeOff.tsx     # Auto-generated component (DO NOT EDIT)
```

### Source of Truth

All icons originate from SVG files located in:

```bash
packages/core/icons/assets/
├── play.svg
├── pause.svg
├── volume-high.svg
├── volume-low.svg
└── volume-off.svg
```

## Usage

```tsx
import { PauseIcon, PlayIcon, VolumeHighIcon } from '@vjs-10/react-icons';

function MediaControls() {
  return (
    <div>
      <PlayIcon color="blue" width={24} height={24} />
      <PauseIcon color="red" className="pause-btn" />
      <VolumeHighIcon />
    </div>
  );
}
```

### IconProps Interface

All generated icon components accept the following props:

```tsx
interface IconProps extends SVGAttributes<SVGElement> {
  children?: never;
  color?: string;
}
```

- **`color`**: Sets the icon color (default: `'currentColor'`)
- **All SVG attributes**: `width`, `height`, `className`, `onClick`, etc.
- **No children**: Icon components don't accept children

## 🔧 Development Workflow

### Adding New Icons

1. **Add SVG file** to `packages/core/icons/assets/filename.svg`
2. **Regenerate components**: Run `pnpm generate` in this package
3. **New component** will be available as `FilenameIcon`

### Modifying Existing Icons

1. **Edit SVG file** in `packages/core/icons/assets/`
2. **Regenerate components**: Run `pnpm generate` in this package
3. **Component updates automatically**

### Build Process

```bash
# Generate React components from SVG files
pnpm generate

# Build the package (includes generation step)
pnpm build

# Clean generated files and dist
pnpm clean
```

## 📦 Package Scripts

- **`generate`**: Transform SVG files into React components using SVGR
- **`build`**: Generate components + build distribution files
- **`clean`**: Remove generated components and build artifacts

## 🏗️ Architecture

This package follows the monorepo's dependency hierarchy:

- **Depends on**: `@vjs-10/icons` (for shared SVG assets)
- **Peer dependency**: `react` (>=16.8.0)
- **Build tool**: SVGR for SVG-to-React transformation

## 🚫 What NOT to Edit

- `src/generated-icons/` - All files are auto-generated
- Generated components have `@generated` JSDoc tags
- Generated files include clear "DO NOT EDIT" warnings

## ✅ What You CAN Edit

- `src/types.d.ts` - TypeScript interface definitions
- `src/index.ts` - Main export file (if needed)
- `svgr.config.js` - SVGR configuration
- `package.json` - Package configuration
- This `README.md`

## 🎯 Icon Naming Convention

SVG filename → React component name:

- `play.svg` → `PlayIcon`
- `volume-high.svg` → `VolumeHighIcon`
- `my-custom-icon.svg` → `MyCustomIconIcon`

## 🔍 Technical Details

- **Generator**: [SVGR](https://react-svgr.com/) v8
- **Output**: TypeScript React components
- **Optimization**: Automatic SVG optimization via SVGO
- **Styling**: Uses `currentColor` for easy theming
