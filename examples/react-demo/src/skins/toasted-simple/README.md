# Toasted Simple - Simplified Demo Skin

## Purpose

This is a **simplified version** of the Toasted skin with all arbitrary variant selectors removed.

## Why This Exists

The VJS compiler (v2) currently has a known limitation: **arbitrary variant selectors** like `[&_.child]:opacity-0` do not generate CSS. This is because Tailwind v4's JIT processor requires full HTML context to process these selectors.

This simplified version:

- ✅ Uses ONLY simple Tailwind utilities that work with current compiler
- ✅ Provides a baseline for E2E validation
- ✅ Demonstrates what's working today
- ❌ Does NOT include state-based icon visibility (play/pause, mute, fullscreen)
- ❌ Does NOT include nested element styling

## Removed Features

### Icon Grid Layout

```typescript
// REMOVED - Arbitrary variants
'[&_.icon]:[grid-area:1/1]';
'[&_.icon]:shrink-0';
'[&_.icon]:transition';
```

### Icon Visibility (Play/Pause)

```typescript
// REMOVED - Arbitrary variants
'[&_.pause-icon]:opacity-100';
'[&[data-paused]_.pause-icon]:opacity-0';
'[&_.play-icon]:opacity-0';
'[&[data-paused]_.play-icon]:opacity-100';
```

### Volume Button States

```typescript
// REMOVED - Arbitrary variants
'[&_.icon]:hidden';
'[&[data-volume-level="high"]_.volume-high-icon]:inline';
```

### Fullscreen Button States

```typescript
// REMOVED - Arbitrary variants
'[&_.fullscreen-enter-icon]:opacity-100';
'[&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0';
```

### SVG Path Animations

```typescript
// REMOVED - Arbitrary variants
'[&_path]:transition-transform';
'[&_.arrow-1]:-translate-x-px';
```

## What Still Works

- ✅ Layout and positioning
- ✅ Colors and backgrounds (black theme)
- ✅ Hover states (on the button itself)
- ✅ Focus states
- ✅ Disabled states
- ✅ Gradients and overlays
- ✅ Transitions and animations
- ✅ Container queries
- ✅ Named groups (group/button, group/slider, etc.)
- ✅ Data attribute selectors on root element ([data-orientation])

## Next Steps

Once arbitrary variant support is implemented (Phase 2), this skin will be replaced with the full version from `toasted/`.

## Usage in Compiler Tests

This skin is used in:

- Baseline E2E validation tests
- Package import mapping tests
- CSS compilation tests

See `packages/build-tools/vjs-compiler/test/integration/compile-demo-skins.test.ts` for usage.
