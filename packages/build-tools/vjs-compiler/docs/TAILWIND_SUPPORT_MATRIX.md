# Tailwind CSS Support Matrix

**Status:** Updated 2025-10-14 after responsive variants implementation

This document tracks which Tailwind CSS features are currently supported by the v2 compiler pipeline.

## ✅ Fully Supported Features

### Level 0: Basic Structure (00-structural skin)
- **Status:** ✅ Working
- **Features:**
  - Pure JSX → HTML transformation
  - Element naming (React → Web Component)
  - Component imports
  - Icon rendering
  - No styling complexity

### Level 1: Basic Utilities (01-minimal skin)
- **Status:** ✅ Working
- **Features:**
  - Basic positioning: `relative`, `absolute`, `inset-0`
  - Flexbox: `flex`, `items-center`, `justify-center`
  - Spacing: `p-3`, `p-4`, `p-6`, `p-8`, `p-12`, `gap-2`, `gap-3`, `gap-4`
  - Border radius: `rounded-full`, `rounded-[12px]`
  - Pointer events: `pointer-events-none`, `pointer-events-auto`
  - Display: `grid`

**Compiled output:** 51 lines, valid CSS

### Level 2: Interactive Selectors (02-interactive skin)
- **Status:** ✅ Working
- **Features:**
  - Descendant selectors: `[&_.icon]:opacity-0`
  - Child combinators: `.button .icon`
  - Data attribute selectors: `[&[data-paused]_.play-icon]:opacity-100`
  - Arbitrary values in selectors: `[&_.icon]:[grid-area:1/1]`
  - Grid layout: `grid-area: 1/1`
  - Opacity utilities: `opacity-0`, `opacity-100`

**Compiled output:** 71 lines with proper descendant selector CSS:
```css
.button .icon {
  grid-area: 1/1
}

.button[data-paused] .play-icon {
  opacity: 100%
}
```

### Level 3: Responsive Variants (03-responsive skin)
- **Status:** ✅ Working (just implemented!)
- **Features:**
  - Responsive breakpoints: `sm:p-6`, `md:p-8`, `lg:p-12`
  - Container queries: `@container (min-width: 24rem)`
  - Multiple breakpoints in same component
  - Arbitrary values: `[rgba(...)]`, `[clamp(...)]`, `[#hex]`
  - Transitions: `transition-all`, `duration-300`
  - Transforms: `scale-100`, `hover:scale-110`
  - Backdrop filters: `backdrop-blur-[2px]`
  - Hover states: `hover:bg-[#color]`

**Compiled output:** 128 lines with 4 container query blocks:
```css
@container (min-width: 24rem) {
  .wrapper {
    padding: 1.5rem;
    gap: 0.75rem
  }
}

@container (min-width: 28rem) {
  .wrapper {
    padding: 2rem;
    gap: 1rem
  }
}
```

**Breakpoint mappings:**
- `sm:` → `24rem` (384px)
- `md:` → `28rem` (448px)
- `lg:` → `32rem` (512px)
- `xl:` → `36rem` (576px)

## ⚠️ Partially Supported Features

### Arbitrary Values in Utilities
- **Status:** ⚠️ Mixed support
- **Working:**
  - Arbitrary colors: `bg-[#1da1f2]`
  - Arbitrary sizing: `w-[clamp(3rem,10vw,5rem)]`
  - Arbitrary selectors: `[&_.icon]:[grid-area:1/1]`
  - Arbitrary radius: `rounded-[12px]`
- **Not working:**
  - Some arbitrary values don't generate CSS from Tailwind v4
  - Example: `rounded-[16px]` produces warning "No CSS found for utility"
  - Non-blocking: Feature works, just some values aren't in Tailwind's default config

### Hover and Pseudo-Classes
- **Status:** ⚠️ Basic support
- **Working:**
  - Simple hover: `hover:bg-blue-500`
  - Hover with arbitrary: `hover:bg-[#0d8ddb]`
  - Media query wrapping: `@media (hover: hover)`
- **Unknown:**
  - Focus states: `focus:`, `focus-visible:`
  - Active states: `active:`
  - Other pseudo-classes

## ❌ Not Yet Supported

### CSS Variables / Theme Customization
- **Status:** ❌ Not implemented
- **Missing:**
  - CSS variable references: `bg-[var(--color-primary)]`
  - Theme token usage: `colors.blue.500`
  - Custom CSS variables in `:host` rule
  - Theme configuration beyond basic spacing/colors

### Advanced Arbitrary Variants
- **Status:** ❌ Not tested
- **Missing:**
  - Complex nesting: `[&[data-state="active"]:hover]:bg-blue-500`
  - Group modifiers: `group-hover:`, `peer-focus:`
  - Multiple pseudo-classes: `hover:focus:bg-blue-500`

### Animation and Keyframes
- **Status:** ❌ Not implemented
- **Missing:**
  - Animation utilities: `animate-spin`, `animate-pulse`
  - Custom animations
  - Keyframe definitions

### Dark Mode
- **Status:** ❌ Not tested
- **Missing:**
  - `dark:` variant support
  - Dark mode strategy configuration

### Print and Media Queries
- **Status:** ❌ Not tested
- **Missing:**
  - `print:` variants
  - Custom media queries
  - Traditional `@media` breakpoints (we use `@container` instead)

## Test Skin Progression

Our test skins follow an incremental complexity model:

| Skin | Level | LOC | Features | Status |
|------|-------|-----|----------|--------|
| **00-structural** | 0 | 31 | Structure only, no styling | ✅ |
| **01-minimal** | 1 | 51 | Basic utilities | ✅ |
| **02-interactive** | 2 | 71 | Descendant selectors, data attributes | ✅ |
| **03-responsive** | 3 | 128 | Container queries, arbitrary values | ✅ |
| **04-production?** | 4+ | ? | Full production complexity | ⚠️ TOO EARLY |

## Recommended Next Steps

### Before Tackling Production Skins

1. **Validate current levels in browser**
   - Load all 4 demos: http://localhost:5175/src/wc/
   - Verify no console errors
   - Check visual equivalence with React versions
   - Test responsive behavior (resize containers)

2. **Add missing Level 2-3 features**
   - Test focus states: `focus:`, `focus-visible:`
   - Test active states: `active:`
   - Verify all pseudo-classes work

3. **Create intermediate test skins**
   - **03.5-hover-focus**: Comprehensive pseudo-class testing
   - **03.7-arbitrary-advanced**: Complex arbitrary variants
   - Each skin validates ONE additional feature

4. **Document gaps clearly**
   - What CSS variable support is needed?
   - What theme customization is required?
   - What animations are expected?

### Production Skin Readiness Checklist

Before attempting to compile the full production `MediaSkinDefault`:

- [ ] All test skins (00-03) load without errors
- [ ] Visual equivalence verified for all test skins
- [ ] All Level 1-3 features documented as working
- [ ] Missing features documented with examples
- [ ] Clear plan for handling unsupported features

## Known Limitations

1. **Tailwind v4 config limitations**
   - Default spacing scale stops at `12` (48px)
   - Some arbitrary values don't generate CSS
   - Non-blocking warnings like "No CSS found for utility: p-5"

2. **Container queries vs media queries**
   - We use container queries for responsive breakpoints
   - Smaller breakpoints than standard Tailwind (designed for component sizing)
   - May need adjustment for production use

3. **No CSS variable resolution yet**
   - Tailwind generates CSS variables for some utilities
   - We don't resolve these to concrete values
   - May cause issues with complex production skins

## Validation Commands

```bash
# Compile all test skins
pnpm test -- compile-for-e2e.test.ts

# Run dev server
cd test/e2e/app && pnpm dev

# Check for console errors in browser
open http://localhost:5175/src/wc/00-structural.html
open http://localhost:5175/src/wc/01-minimal.html
open http://localhost:5175/src/wc/02-interactive.html
open http://localhost:5175/src/wc/03-responsive.html
```

## Summary

**Current capability:** ✅ Levels 0-3 (basic → responsive)
**Production readiness:** ⚠️ Not yet - need intermediate validation steps
**Next milestone:** Validate all current features in browser before adding complexity
