# Tailwind CSS Complexity Matrix

This document tracks Tailwind CSS features and their compatibility with the VJS compiler's CSS transformation pipeline.

## Purpose

As we transform Tailwind classes to inline vanilla CSS for web components, different Tailwind features have varying levels of complexity and compatibility. This matrix helps us:

1. **Choose appropriate utilities** for test cases at different complexity levels
2. **Identify transformation issues** when comparing React (Tailwind) vs WC (vanilla CSS)
3. **Plan compiler improvements** based on feature support gaps
4. **Document known limitations** for users

## Complexity Levels

### Level 0: Baseline ✅

**Status**: Works perfectly, no known issues

**Features**:
- Basic positioning: `relative`, `absolute`, `static`, `fixed`
- Basic display: `block`, `inline-block`, `inline`, `flex`, `grid`
- Basic spacing (simple numeric values): `p-4`, `m-2`, `gap-3`
- Basic sizing: `w-full`, `h-auto`, `w-screen`
- Basic alignment: `items-center`, `justify-center`, `items-start`

**Example**:
```typescript
// React
<div className="relative flex items-center justify-center">

// Generated CSS
.class {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Level 1: Simple Utilities ✅

**Status**: Works with minor caveats

**Features**:
- Border radius: `rounded`, `rounded-full`, `rounded-lg`
- Pointer events: `pointer-events-none`, `pointer-events-auto`
- Inset shortcuts: `inset-0`, `inset-x-0`, `inset-y-0`
- Text utilities: `text-white`, `text-center`

**Known Issues**:
- None currently identified

**Example**:
```typescript
// React
<button className="p-3 rounded-full pointer-events-auto">

// Generated CSS
.button {
  padding: var(--spacing-3);
  border-radius: var(--radius-full);
  pointer-events: auto;
}
```

### Level 2: Modern CSS Features ⚠️

**Status**: Requires feature queries or has compatibility issues

**Features**:
- **Opacity variants**: `bg-white/80`, `text-black/50` ⚠️ **PROBLEMATIC**
- Color mixing with opacity
- Modern color spaces

**Known Issues**:

#### Issue 1: Missing CSS Variable References
- **Tailwind class**: `bg-white/80`
- **Generated CSS**: `color-mix(in oklab, var(--color-white) 80%, transparent)`
- **Problem**: `--color-white` variable is not defined in generated `:host` block
- **Impact**: Background doesn't render (undefined variable)
- **Workaround**: Use `bg-white opacity-80` (two separate utilities) OR define color variables

#### Issue 2: Feature Query Mismatch
- **Generated**: `@supports (color: color-mix(in lab, red, red))`
- **Actually uses**: `color-mix(in oklab, ...)`
- **Problem**: Testing for `lab` but using `oklab`
- **Impact**: May not apply styles in browsers that support oklab but not lab

**Recommended Alternatives**:
```typescript
// Instead of: bg-white/80
// Use: bg-white opacity-80
Button: cn('bg-white', 'opacity-80')
```

### Level 3: Component-Specific Selectors ❌

**Status**: Not yet fully tested, known issues

**Features**:
- Icon/child element styling
- Data attribute selectors
- Child combinators
- Grid overlay patterns

**Known Issues**:

#### Issue 1: Icon Stacking in Custom Elements
- **Pattern**: Grid overlay for show/hide icons
- **React**: `<button>` has implicit layout behavior
- **WC**: `<media-play-button>` defaults to `display: inline`
- **Problem**: Icons lay out horizontally instead of overlaying
- **Solution needed**: Add explicit `display: grid` and grid-area rules

**Example from MediaSkinDefault**:
```typescript
IconButton: cn(
  'grid [&_.icon]:[grid-area:1/1]',  // Overlay all icons
),
PlayButton: cn(
  '[&_.pause-icon]:opacity-100',     // Show pause when playing
  '[&[data-paused]_.pause-icon]:opacity-0', // Hide when paused
  '[&_.play-icon]:opacity-0',        // Hide play when playing
  '[&[data-paused]_.play-icon]:opacity-100', // Show when paused
),
```

**Status**: Not yet tested in minimal skin

### Level 4: Advanced Features ⏸️

**Status**: Not yet implemented or tested

**Features**:
- Container queries: `@container`, `@lg`, `@md`
- Custom variants
- Arbitrary values: `w-[123px]`, `bg-[#abc123]`
- Complex pseudo-classes: `hover:`, `focus:`, `active:`
- Group variants: `group-hover:`, `group-focus:`

**Status**: Future work

## Test Coverage by Level

### Structural Skin (Level 0)
- **Purpose**: Pure structure, no styling
- **Tailwind level**: None (no classes)
- **Status**: ✅ Working

### Minimal Skin (Level 0-1)
- **Purpose**: Baseline E2E validation
- **Tailwind level**: 0 + partial 1
- **Current classes**: `relative`, `absolute`, `inset-0`, `flex`, `items-center`, `justify-center`, `p-3`, `rounded-full`, `pointer-events-none`, `pointer-events-auto`
- **Removed**: `bg-white/80` (Level 2 - problematic)
- **Status**: ⚠️ Needs simplification

### Default Skin (Level 3+)
- **Purpose**: Full-featured production skin
- **Tailwind level**: 0-3 with some Level 4
- **Status**: 🚧 Not yet tested with compiler

## Recommendations for Test Skins

### For Minimal/Baseline Testing
**Stick to Level 0 + Level 1** to ensure reliable equivalence:

```typescript
// GOOD - Level 0 + 1
const styles = {
  Wrapper: cn('relative'),
  Overlay: cn('absolute', 'inset-0', 'flex', 'items-center', 'justify-center'),
  Button: cn('p-3', 'rounded-full'),
};
```

```typescript
// AVOID - Level 2 (problematic)
const styles = {
  Button: cn('p-3', 'rounded-full', 'bg-white/80'), // ❌ opacity variant
};
```

```typescript
// USE INSTEAD - Level 0 + 1
const styles = {
  Button: cn('p-3', 'rounded-full', 'bg-white'), // ✅ or no background
};
```

### For Progressive Testing
Create test skins that incrementally add complexity:

1. **00-structural**: No Tailwind (Level 0 structure only)
2. **01-minimal**: Level 0 + Level 1 only
3. **02-modern-css**: Add Level 2 features (test color-mix, etc.)
4. **03-interactive**: Add Level 3 features (icon stacking, data attributes)
5. **04-advanced**: Add Level 4 features (hover, container queries)

## Future Work

### Compiler Improvements Needed

1. **Color variable generation**
   - Automatically define CSS variables for Tailwind color palette
   - Add `--color-white`, `--color-black`, etc. to `:host` block

2. **Feature query fixes**
   - Match test color space to actual usage (lab vs oklab)
   - Provide fallbacks for unsupported features

3. **Custom element defaults**
   - Consider adding `display: inline-block` or `display: block` to custom element selectors
   - Or document that skins must explicitly set display

4. **Icon stacking patterns**
   - Detect icon overlay patterns and generate appropriate grid CSS
   - Handle `[&_.icon]` child selector transformations

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [CSS color-mix() on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [CSS @supports on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports)
