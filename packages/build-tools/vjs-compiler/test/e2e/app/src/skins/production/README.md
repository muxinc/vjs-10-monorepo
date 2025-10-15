# Production Skin Test

**Category:** Production / Comprehensive Test
**Purpose:** Validate compiler against real-world production skin with full complexity

## What This Tests

This skin is a **direct copy** of the actual production `MediaSkinDefault` from `packages/react/react/src/skins/default/`. It tests the compiler's ability to handle a real, production-quality media player skin.

### Complexity Features Tested

**React → HTML Transformation:**
- ✅ Template literal className patterns: `className={`${styles.A} ${styles.B}`}`
- ✅ Compound components: `TimeSlider.Root`, `Tooltip.Trigger`, `Popover.Positioner`
- ✅ Complex nesting: Tooltips with portals, popovers with positioning
- ✅ Multiple imports from different packages
- ✅ Conditional rendering via data attributes

**Tailwind CSS Features:**
- ✅ Container queries: `@container/root`, `@7xl/root:text-sm`
- ✅ Named groups: `group/root`, `group/button`, `group/slider`
- ✅ Complex pseudo-selectors: `has-[[data-paused]]`, `[&:fullscreen]`
- ✅ Arbitrary values: `text-[0.8125rem]`, `[grid-area:1/1]`
- ✅ Descendant selectors: `[&_.icon]:opacity-0`
- ✅ Multiple modifiers: `hover:`, `focus-visible:`, `aria-*:`, `data-*:`
- ✅ Before/after pseudo-elements for borders and effects
- ✅ Backdrop filters: `backdrop-blur-3xl`, `backdrop-saturate-150`
- ✅ Gradients: `bg-gradient-to-t from-black/50`
- ✅ Transitions and transforms: `transition-opacity`, `scale-95`, `translate-x-px`
- ✅ Custom variants: `reduced-transparency:`, `contrast-more:`
- ✅ Shadow utilities: `shadow-sm`, `drop-shadow-[0_1px_0_var(--tw-shadow-color)]`

**Real-World Patterns:**
- ✅ Dark mode support
- ✅ Accessibility features (ARIA attributes, focus states)
- ✅ Responsive design with container queries
- ✅ Performance optimizations (`will-change-transform`)
- ✅ Browser compatibility patterns (fullscreen, video element handling)

## Expected Behavior

When compiled, this should produce a web component skin that:
1. Matches the React version visually (pixel-perfect via Playwright)
2. Supports all interactive states (play/pause, volume, fullscreen)
3. Handles all media states correctly (paused, playing, muted, fullscreen)
4. Maintains all accessibility features
5. Works across browsers without errors

## Why This Matters

**This is the ultimate validation of the compiler.** If the compiler can handle this production skin correctly, it can handle any skin in the VJS ecosystem.

**Known Limitations:**
- Named groups (`group/root`, `group/button`) are NOT currently supported by the compiler (see `docs/tailwind/SUPPORT_STATUS.md`)
- Custom variants (`reduced-transparency:`) require Tailwind config (may not work in all contexts)

## File Structure

```
production/
├── README.md                    # This file
├── MediaSkinProduction.tsx      # Main skin component
├── styles.ts                    # Tailwind styles definitions
└── types.ts                     # TypeScript types for styles
```

## Source

Copied from: `/Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/react/react/src/skins/default/`

This is an exact copy as of 2025-10-15, preserving all complexity for comprehensive testing.
