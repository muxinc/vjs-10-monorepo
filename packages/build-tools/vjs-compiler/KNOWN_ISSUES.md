# Known Issues and Limitations

This document tracks known limitations, unresolved issues, and incomplete functionality in the VJS Compiler.

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [Unresolved Tailwind Tokens](#unresolved-tailwind-tokens)
3. [CSS Modules Limitations](#css-modules-limitations)
4. [Configuration Limitations](#configuration-limitations)
5. [Workarounds](#workarounds)

## Critical Issues

### Orphaned & Selectors in CSS Output

**Status**: 🔴 Critical

**Description**: CSS Modules output sometimes contains orphaned `&` selectors that are invalid CSS.

**Examples**:
```css
/* Invalid - orphaned & selector */
&:has(+.Controls [data-paused]) {
  opacity: 100%;
  transition-delay: 0ms;
}

/* Invalid - orphaned & with :where() */
&:where(.TimeRangeRoot):focus-within {
  opacity: 100%;
}
```

**Location**:
- Output: `temp-skin-permutations/output/react-css-modules/MediaSkinDefault.module.css`
- Lines: 85-88, 321-323, 373-375

**Root Cause**: Tailwind v4 generates nested CSS with `&` selectors. While the compiler flattens nested CSS with postcss-nested, some selectors remain orphaned when they don't have a clear parent context.

**Impact**: Generated CSS is invalid and will not work in browsers.

**Workarounds**: None currently - manual fix required in output.

**Proposed Fix**:
1. Enhance CSS flattening logic to handle all nested selector cases
2. Add validation step to detect orphaned & selectors
3. Either associate with proper parent or remove if invalid

## Unresolved Tailwind Tokens

**Status**: 🟡 Medium Priority

**Description**: Many Tailwind utility classes do not compile to CSS. The compiler reports these as warnings during compilation.

### Categories of Unresolved Tokens

#### 1. Container Query Utilities

**Status**: 🟢 Resolved (as of 2025-10-06)

Container query modifiers are now working via enhanced Tailwind AST parsing.

**Examples** (now working):
- `@7xl/root:text-[0.9375rem]` → `@container root (min-width: 80rem) { .MediaContainer { font-size: 0.9375rem; } }`
- `@container/root` → `container-name: root; container-type: inline-size`
- `@container/controls` → `container-name: controls; container-type: inline-size`

**Resolution**: Integrated custom Tailwind AST parsing that categorizes container declarations and container queries separately, then generates appropriate CSS.

#### 2. Arbitrary Attribute Selectors

Complex attribute selectors with arbitrary values don't compile:

**Examples**:
- `[&[data-orientation="horizontal"]]:h-5`
- `[&[data-orientation="vertical"]]:w-5`
- `[&_svg]:ease-out`

**Affected Style Keys**: `TimeRangeRoot`, `TimeRangeTrack`, `VolumeRangeRoot`, `VolumeRangeTrack`, `IconButton`

**Reason**: Bracket notation with nested selectors may not be processed correctly by Tailwind.

#### 3. Custom Text Shadow Utilities

Text shadow utilities are not defined:

**Examples**:
- `text-shadow`
- `text-shadow-2xs`

**Affected Style Keys**: `Controls`, `TimeDisplay`

**Reason**: These are custom utilities not included in default Tailwind configuration.

**Workaround**: Define custom utilities in Tailwind config or use standard `shadow-` classes.

#### 4. Custom Variants

Several custom variants don't compile:

**Examples**:
- `hocus:` (hover + focus-visible)
- `group-hover/button:`
- `aria-expanded:`
- `group-active/slider:`
- `reduced-transparency:`
- `contrast-more:`

**Affected Style Keys**: `Button`, `FullscreenExitIcon`, `TimeRangeThumb`, `VolumeRangeThumb`, `Controls`

**Reason**: Custom variants are defined in the compiler code (`tailwindToCSSModules.ts:523-527`) but may not be applied correctly.

**Note**: `hocus`, `reduced-transparency`, and `contrast-more` ARE defined as custom variants, but still don't compile. This suggests an issue with variant application rather than definition.

#### 5. Positioning and Spacing Utilities

Some positioning and spacing utilities don't resolve:

**Examples**:
- `inset-x-3` (horizontal inset)
- `bottom-3`
- `p-1` (padding)
- `gap-0.5`, `gap-3`
- `px-1.5`

**Affected Style Keys**: `Controls`, `TimeControls`

**Reason**: These should be standard Tailwind utilities - may indicate a Tailwind compilation issue.

#### 6. Size Utilities with Decimals

Size utilities with decimal values:

**Examples**:
- `size-2.5`
- `size-3`
- `active:size-3`

**Affected Style Keys**: `TimeRangeThumb`, `VolumeRangeThumb`

**Reason**: `size-` shorthand may not be available or decimal values not supported.

**Workaround**: Use explicit `w-` and `h-` utilities instead.

#### 7. Color Opacity Modifiers

Color utilities with opacity modifiers:

**Examples**:
- `text-white/90`
- `bg-black/70`
- `bg-white/10`
- `ring-white/10`
- `from-black/50`
- `via-black/20`

**Affected Style Keys**: Many (Button, Controls, Overlay, etc.)

**Reason**: Color opacity syntax may not be fully supported or requires additional configuration.

#### 8. Shadow Utilities with Color

Shadow utilities with color values:

**Examples**:
- `shadow-black/15`
- `shadow-black/20`
- `shadow-black/50`
- `[&_svg]:shadow-black/20`

**Affected Style Keys**: `Controls`, `TimeDisplay`, `IconButton`, `TimeRangeThumb`, `VolumeRangeThumb`

**Reason**: Custom shadow colors with opacity not supported.

**Workaround**: Use standard shadow utilities or define custom shadows.

#### 9. Gradient Utilities

Gradient utilities with custom stops:

**Examples**:
- `from-black/50`
- `via-black/20`

**Affected Style Keys**: `Overlay`

**Reason**: Gradient utilities with opacity may not compile correctly.

### Complete List of Unresolved Tokens by Style Key

**Note**: As of 2025-10-06, container queries and many arbitrary values are now resolved. The list below reflects remaining unresolved tokens.

```
MediaContainer:
  - leading-normal
  - after:inset-0
  - after:ring-black/10
  - dark:after:ring-black/40
  - before:ring-white/15

Overlay:
  - inset-0
  - from-black/50
  - via-black/20

Controls:
  - inset-x-3
  - bottom-3
  - p-1
  - ring-white/10
  - gap-0.5
  - text-white
  - text-shadow
  - shadow-sm
  - shadow-black/15
  - bg-white/10
  - backdrop-blur-3xl
  - ease-out
  - after:inset-0
  - after:ring-black/15
  - reduced-transparency:bg-black/70
  - reduced-transparency:ring-black
  - reduced-transparency:after:ring-white/20
  - contrast-more:bg-black/90
  - contrast-more:ring-black
  - contrast-more:after:ring-white/20

Button:
  - p-2
  - text-white/90
  - hocus:bg-white/10
  - hocus:text-white
  - focus-visible:outline-blue-500
  - aria-expanded:bg-white/10
  - aria-expanded:text-white

IconButton:
  - [&_svg]:ease-out
  - [&_svg]:shadow-black/20

FullscreenButton:
  - ease-out

FullscreenExitIcon:
  - group-hover/button:[&_.arrow-1]:translate-0
  - group-hover/button:[&_.arrow-2]:translate-0

TimeControls:
  - gap-3
  - px-1.5

TimeDisplay:
  - text-shadow-2xs
  - shadow-black/50

TimeRangeRoot:
  - [&[data-orientation="horizontal"]]:h-5
  - [&[data-orientation="vertical"]]:w-5
  - [&[data-orientation="vertical"]]:h-20

TimeRangeTrack:
  - [&[data-orientation="horizontal"]]:h-1
  - [&[data-orientation="vertical"]]:w-1
  - bg-white/20
  - ring-black/5

TimeRangeProgress:
  - bg-white

TimeRangeThumb:
  - bg-white
  - ring-black/10
  - shadow-sm
  - shadow-black/15
  - ease-in-out
  - focus-visible:outline-blue-500
  - size-2.5
  - active:size-3
  - group-active/slider:size-3

VolumeRangeRoot:
  - [&[data-orientation="horizontal"]]:w-20
  - [&[data-orientation="horizontal"]]:h-5
  - [&[data-orientation="vertical"]]:w-5
  - [&[data-orientation="vertical"]]:h-20

VolumeRangeTrack:
  - [&[data-orientation="horizontal"]]:h-1
  - [&[data-orientation="vertical"]]:w-1
  - bg-white/20
  - ring-black/5

VolumeRangeProgress:
  - bg-white

VolumeRangeThumb:
  - bg-white
  - ring-black/10
  - shadow-sm
  - shadow-black/15
  - ease-in-out
  - focus-visible:outline-blue-500
  - size-2.5
  - active:size-3
  - group-active/slider:size-3
```

### Impact

**Functionality**: Remaining unresolved tokens result in missing styles in the output. The compiled CSS will lack these rules, resulting in incomplete styling.

**Visual**: Components may not display correctly, lack hover effects, or have missing responsive/state-based styles.

**Build**: Compilation succeeds with warnings - does not fail the build.

### Progress & Achievements

**Recent Improvements (2025-10-06)**:
- ✅ Container queries now fully supported
- ✅ Arbitrary values with custom dimensions now working
- ✅ Container declarations properly generate CSS
- ✅ Reduced unresolved token count by ~30% (container queries + arbitrary values)

### Recommendations

1. **Short-term**: Continue expanding enhanced AST parsing for remaining custom variants
2. **Medium-term**: Extend Tailwind configuration to include missing utilities (text-shadow, etc.)
3. **Long-term**: Investigate Tailwind v4 PostCSS plugin configuration to resolve remaining tokens

## CSS Modules Limitations

### Nested Selector Flattening

**Status**: 🟡 Medium Priority

**Description**: Some nested selectors are not fully flattened during CSS Modules compilation.

**Examples**:
- `@media (hover: hover) { &:where(.MediaContainer):hover { ... } }`
- Multiple consecutive `@media` blocks with same condition but different properties

**Location**: Throughout CSS Modules output

**Impact**: CSS becomes verbose with many duplicate media queries. While technically valid, it's not optimized.

**Proposed Fix**: Merge media queries with same conditions after flattening.

### Component Class Detection Edge Cases

**Status**: 🟢 Resolved

**Description**: Component classes with inconsistent casing (e.g., `FullScreenButton` vs `FullscreenButton`) could leak into class attributes.

**Resolution**: Fuzzy matching (case-insensitive) implemented in `ClassAttributeProcessor`.

**Status**: This is now working correctly with fuzzy matching.

## Configuration Limitations

### Hard-coded Theme Configuration

**Status**: 🟡 Medium Priority

**Description**: Tailwind theme variables and custom variants are embedded in the compiler code rather than discovered from project configuration.

**Location**:
- `src/cssProcessing/tailwindToCSSModules.ts:518-531` (theme and variants)
- `src/cssProcessing/tailwindToCSSModules.ts:17-55` (default --tw-* variables)

**Current Implementation**:
```typescript
const inputCss = `@theme {
  --font-sans: InterVariable, ui-sans-serif, system-ui, sans-serif, ...;
}

@custom-variant hocus (&:is(:hover, :focus-visible));
@custom-variant group-hocus (&:is(:hover, :focus-visible) &);
// ... more variants
`;
```

**Impact**:
- Users cannot customize theme without modifying compiler code
- Custom project-specific utilities/variants not supported
- Difficult to maintain as Tailwind evolves

**Proposed Fix**:
1. Add `tailwindConfig` option to compiler config
2. Support loading theme from project CSS files
3. Auto-discover `@theme` and `@custom-variant` blocks
4. Merge discovered config with defaults

### No Source Maps

**Status**: 🔵 Enhancement

**Description**: The compiler does not generate source maps for debugging.

**Impact**: Hard to trace compiled CSS back to original Tailwind utilities or React source.

**Proposed Fix**: Add source map generation for:
- CSS transformations (Tailwind → CSS Modules → Vanilla CSS)
- JSX transformations (React → HTML)

## Workarounds

### Drop-shadow Malformed Filter

**Status**: 🟢 Workaround Implemented

**Description**: Tailwind sometimes generates malformed `drop-shadow` filters.

**Example**:
```css
/* Malformed */
filter: drop-shadow(0 1px 0;

/* Expected */
filter: drop-shadow(0 1px 0 rgba(0,0,0,0.2));
```

**Location**: `src/pipelines/skinToWebComponentInlineTailwind.ts:132-138`

**Workaround**:
```typescript
// Fix malformed drop-shadow filter (missing closing paren and value)
fixedCSS = fixedCSS.replace(
  /filter:\s*drop-shadow\([^)]+;/g,
  'filter: drop-shadow(0 1px 0 rgba(0,0,0,0.2));'
);
```

**TODO**: Remove this workaround once root cause is identified (Tailwind issue or configuration issue).

### Missing Utility Definitions

**Status**: 🔵 User Workaround Available

**Description**: Some utilities like `text-shadow` are not in default Tailwind but are used in styles.

**Workaround**: Define custom utilities in Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      textShadow: {
        DEFAULT: '0 1px 2px rgba(0, 0, 0, 0.5)',
        '2xs': '0 1px 1px rgba(0, 0, 0, 0.5)',
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-2xs': {
          'text-shadow': '0 1px 1px rgba(0, 0, 0, 0.5)',
        }
      })
    }
  ]
}
```

**Note**: This requires the compiler to support loading project Tailwind config (see Configuration Limitations).

## Tracking

### High Priority
1. 🔴 Fix orphaned & selectors in CSS output
2. 🟡 Resolve remaining unresolved Tailwind tokens (custom variants, attribute selectors)

### Completed ✅
1. ~~Resolve container query utilities~~ - Resolved 2025-10-06
2. ~~Support arbitrary values in utilities~~ - Resolved 2025-10-06

### Medium Priority
1. 🟡 Make theme configuration discoverable
2. 🟡 Improve CSS optimization (merge duplicate media queries)

### Low Priority / Enhancements
1. 🔵 Add source map support
2. 🔵 Remove drop-shadow workaround (find root cause)
3. 🔵 Performance: Cache Tailwind compilation results

## Reporting Issues

If you encounter additional issues not listed here:

1. Check if the issue is already listed above
2. Test with the latest compiler version
3. Create a minimal reproduction
4. Report with:
   - Input files (React component + styles.ts)
   - Compiler config used
   - Expected vs actual output
   - Compiler version

---

Last Updated: 2025-10-06
