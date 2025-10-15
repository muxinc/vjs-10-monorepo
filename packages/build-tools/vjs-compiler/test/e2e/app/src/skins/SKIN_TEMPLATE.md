# Test Skin Template

## Purpose

All test skins should follow this standardized template to ensure visual comparability between React and Web Component versions.

## Key Requirements

### 1. Consistent Structure

Use this exact JSX structure for all test skins:

```tsx
<MediaContainer className={className}>
  <div className={styles.Wrapper}>
    {children}
    <div className={styles.Overlay}>
      <div className={styles.TestElement}>
        Test Content Here
      </div>
    </div>
  </div>
</MediaContainer>
```

**Why:** This structure provides:
- `Wrapper` - Contains the video (children) with `relative` positioning
- `Overlay` - Absolutely positioned overlay with `inset-0` for full coverage
- `TestElement` - The element where test-specific styles are applied

### 2. Visible Base Styles

Every skin MUST include these baseline visible styles:

```typescript
const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  TestElement: cn(
    // Base visible styles (REQUIRED)
    'w-24 h-24',           // Size: 96px × 96px square
    'bg-white/90',         // Background: white with 90% opacity
    'rounded-lg',          // Border radius
    'pointer-events-auto', // Make clickable
    'flex items-center justify-center', // Center content

    // TEST-SPECIFIC STYLES GO HERE
    // Example for active pseudo-class test:
    'opacity-100 active:opacity-50',
  ),
};
```

**Why:** These base styles ensure:
- The test element is clearly visible on the video
- Size is consistent across all tests (24 = 96px)
- White background contrasts with video content
- Layout is predictable (flexbox centering)

### 3. Simplified JSX

**DON'T** use PlayButton, icons, or other complex components:
```tsx
// ❌ BAD - Different structure in React vs WC
<PlayButton className={styles.Button}>
  <PlayIcon />
  <PauseIcon />
</PlayButton>
```

**DO** use simple divs with text:
```tsx
// ✅ GOOD - Identical structure everywhere
<div className={styles.TestElement}>
  CLICK ME
</div>
```

**Why:** PlayButton and icons have different DOM structures in React vs Web Components, making visual comparison impossible. Simple divs ensure structural parity.

### 4. Test-Specific Styles

Add ONLY the minimal Tailwind needed to test that specific feature:

#### Active Pseudo-Class Test
```typescript
TestElement: cn(
  BASE_STYLES,
  'opacity-100 active:opacity-50', // ← Test-specific
),
```

#### Hover Pseudo-Class Test
```typescript
TestElement: cn(
  BASE_STYLES,
  'opacity-100 hover:opacity-70', // ← Test-specific
),
```

#### Color Utilities Test
```typescript
TestElement: cn(
  BASE_STYLES,
  'bg-blue-500/80', // ← Test-specific (replaces bg-white/90)
),
```

#### Border Utilities Test
```typescript
TestElement: cn(
  BASE_STYLES,
  'border-4 border-red-500', // ← Test-specific
),
```

## Complete Template Example

```tsx
// MediaSkinActivePseudoClass.tsx
import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinActivePseudoClass({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={styles.TestElement}>
            CLICK ME
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
```

```typescript
// styles.ts
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  TestElement: cn(
    // Base visible styles
    'w-24 h-24',
    'bg-white/90',
    'rounded-lg',
    'pointer-events-auto',
    'flex items-center justify-center',
    'text-sm font-medium text-gray-800',

    // Test-specific: active pseudo-class
    'opacity-100 active:opacity-50',
  ),
};

export default styles;
```

## Migration Checklist

When updating existing skins:

- [ ] Update JSX to use Wrapper → Overlay → TestElement structure
- [ ] Remove PlayButton, icons, and other complex components
- [ ] Add simple text content (e.g., "CLICK ME", "HOVER ME")
- [ ] Add base visible styles (w-24, h-24, bg-white/90, rounded-lg, etc.)
- [ ] Keep ONLY the test-specific Tailwind classes
- [ ] Update README.md to explain what's being tested
- [ ] Recompile and visually verify both React and WC versions

## Visual Verification

After updating a skin:

1. Run `pnpm compile-skins`
2. Run `pnpm dev`
3. Open React version: `http://localhost:5175/src/react/[skin-name].html`
4. Open WC version: `http://localhost:5175/src/wc/[skin-name].html`
5. Verify:
   - Both show a visible white rounded square in the center
   - The test-specific behavior works (e.g., clicking changes opacity)
   - React and WC versions look identical
