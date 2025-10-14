# Production Default Skin - Tailwind Feature Analysis

**Source:** `/Users/cpillsbury/dev/muxinc/vjs-10-monorepo-robots/packages/react/react/src/skins/default/styles.ts`

This document catalogs ALL Tailwind CSS features used in the production default skin, organized by complexity.

## Feature Inventory

### ✅ Level 1: Basic Utilities (Already Supported)
- **Positioning:** `relative`, `absolute`, `inset-0`, `inset-x-3`, `inset-px`, `bottom-3`, `z-10`, `z-20`
- **Display:** `flex`, `grid`, `overflow-clip`
- **Flexbox:** `flex-1`, `items-center`, `justify-center`
- **Sizing:** `w-full`, `w-20`, `h-5`, `h-20`, `h-auto`, `size-2.5`, `size-3`
- **Spacing:** `p-1`, `p-2`, `px-1.5`, `gap-0.5`, `gap-3`
- **Border radius:** `rounded-full`, `rounded-[inherit]`
- **Text:** `text-white`, `text-shadow`, `tabular-nums`, `antialiased`, `leading-normal`
- **Colors:** `bg-transparent`, `bg-white`, `text-white/90`
- **Others:** `shrink-0`, `select-none`, `pointer-events-none`, `cursor-pointer`

**Status:** ✅ These all work in current Level 1-2 skins

---

### ✅ Level 2: Descendant Selectors (Already Supported)
- **Child combinators:**
  - `[&_svg]:[grid-area:1/1]` - SVG icon stacking
  - `[&_svg]:shrink-0` - SVG sizing
  - `[&_svg]:transition-opacity` - SVG animations
  - `[&_video]:rounded-[inherit]` - Video styling
  - `[&[data-paused]_.pause-icon]:opacity-0` - Icon visibility

- **Arbitrary grid-area:** `[grid-area:1/1]`

**Status:** ✅ These work in current Level 2 skin (02-interactive)

---

### ⚠️ Level 3: Container Queries (NEW - Not in our levels yet!)
```typescript
'@container/root' // Named container
'@7xl/root:text-[0.9375rem]' // Container query breakpoint
'@container/controls' // Another named container
```

**Discovery:** Production uses **named container queries**, not just `@container`!

**Syntax:**
- Define container: `@container/root`, `@container/controls`
- Query container: `@7xl/root:text-[0.9375rem]`

**Status:** ❌ NOT TESTED - We only support unnamed `sm:`, `md:`, `lg:` breakpoints

---

### ⚠️ Level 4: Pseudo-Classes (Partially Tested)
**Hover states:**
- `hover:bg-white/10`
- `hover:text-white`
- `group-hover/root:opacity-100` - **Group hover with named groups!**
- `group-hover/button:[&_.arrow-1]:-translate-x-px` - **Complex group hover**

**Focus states:**
- `focus-visible:outline-2`
- `focus-visible:outline-blue-500`
- `group-focus-within/slider:opacity-100` - **Group focus-within!**

**Active states:**
- `active:scale-95`
- `active:size-3`
- `group-active/slider:size-3` - **Group active!**

**Combined pseudo-classes:**
- `hocus:no-underline` - **Custom pseudo-class (hover OR focus)**
- `hocus:bg-white/10`

**ARIA states:**
- `aria-disabled:grayscale`
- `aria-disabled:opacity-50`
- `aria-busy:pointer-events-none`
- `aria-expanded:bg-white/10`

**Status:** ⚠️ Basic hover tested, but NOT group/named groups/aria/hocus

---

### ❌ Level 5: Advanced Selectors (Not Supported Yet)
**Has selector (parent state based on children):**
```typescript
'has-[+.controls_[data-paused]]:opacity-100' // Adjacent sibling with data attr
'has-[[data-paused]]:scale-100' // Child with data attr
```

**Before/After pseudo-elements:**
```typescript
'after:absolute after:inset-0 after:ring-black/10'
'before:absolute before:inset-px before:rounded-[inherit]'
```

**Fullscreen pseudo-class:**
```typescript
'[&:fullscreen]:rounded-none'
'[&:fullscreen]:[&_video]:h-full' // Nested fullscreen selector
```

**Data attribute with value:**
```typescript
'[&[data-volume-level="high"]_.volume-high-icon]:opacity-100'
'[&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0'
'[&[data-orientation="horizontal"]]:h-5'
```

**Status:** ❌ NOT SUPPORTED - Complex has/before/after/fullscreen selectors

---

### ⚠️ Level 6: Color Opacity Modifiers (Partially Working)
```typescript
'text-white/90' // 90% opacity
'bg-white/10'
'bg-black/50'
'ring-white/10'
'shadow-black/15'
```

**Status:** ⚠️ Should work with Tailwind v4, but not explicitly tested

---

### ❌ Level 7: Backdrop Filters (Not Tested)
```typescript
'backdrop-blur-3xl'
'backdrop-saturate-150'
'backdrop-brightness-90'
```

**Status:** ⚠️ We tested `backdrop-blur-[2px]` (arbitrary), but not utility classes

---

### ❌ Level 8: Gradients (Not Tested)
```typescript
'bg-gradient-to-t'
'from-black/50'
'via-black/20'
'to-transparent'
```

**Status:** ❌ NOT TESTED

---

### ⚠️ Level 9: Transitions & Transforms (Partially Working)
**Transitions:**
```typescript
'transition' // All properties
'transition-opacity'
'transition-[opacity,height,width]' // Multiple properties (arbitrary)
'ease-out', 'ease-in-out'
'duration-300'
'delay-0', 'delay-500'
'will-change-transform'
```

**Transforms:**
```typescript
'scale-90', 'scale-95', 'scale-100'
'translate-x-px', 'translate-y-px', '-translate-x-px'
'origin-bottom'
```

**Status:** ⚠️ Basic transitions tested, but not arbitrary property lists

---

### ❌ Level 10: Custom Variants (Not Supported)
```typescript
'reduced-transparency:bg-black/70' // Prefers-reduced-transparency
'contrast-more:bg-black/90' // Prefers-contrast
```

**Status:** ❌ NOT SUPPORTED - Media query variants for accessibility

---

### ❌ Level 11: Group Modifiers with Named Groups (Not Supported)
```typescript
'group/root' // Define named group
'group-hover/root:opacity-100' // Target named group
'group/button' // Another named group
'group-hover/button:[&_.arrow-1]:-translate-x-px' // Complex targeting
```

**Status:** ❌ NOT SUPPORTED - Named group system

---

### ❌ Level 12: Drop Shadow (Not Tested)
```typescript
'drop-shadow-[0_1px_0_var(--tw-shadow-color)]'
'shadow-black/20'
```

**Status:** ❌ NOT TESTED - Drop shadow with CSS variables

---

### ❌ Level 13: Ring Utilities (Not Tested)
```typescript
'ring', 'ring-1'
'ring-white/10'
'ring-black/5'
'ring-inset'
```

**Status:** ⚠️ Should work, but not explicitly tested

---

### ❌ Level 14: Text Shadows (Custom Plugin?)
```typescript
'text-shadow'
'text-shadow-2xs'
```

**Status:** ❌ UNKNOWN - May be custom Tailwind plugin

---

### ❌ Level 15: Arbitrary Font Weight (Not Tested)
```typescript
'font-[510]' // Very specific weight between 500-600
```

**Status:** ⚠️ Should work with Tailwind v4, but not tested

---

### ❌ Level 16: Arbitrary Responsive Typography (Not Tested)
```typescript
'text-[0.8125rem]' // Base
'@7xl/root:text-[0.9375rem]' // Container query responsive
```

**Status:** ❌ NOT TESTED - Responsive arbitrary values

---

### ❌ Level 17: Letter Spacing (Not Tested)
```typescript
'tracking-[-0.0125em]' // Negative letter-spacing
```

**Status:** ⚠️ Should work, but not tested

---

### ❌ Level 18: Outline Offset (Not Tested)
```typescript
'-outline-offset-2'
'focus-visible:outline-offset-2'
```

**Status:** ⚠️ Should work, but not tested

---

## Feature Categories Summary

| Category | Example | Current Status | Priority |
|----------|---------|----------------|----------|
| Basic utilities | `flex`, `p-2`, `rounded-full` | ✅ Working | - |
| Descendant selectors | `[&_.icon]:opacity-0` | ✅ Working | - |
| Data attribute selectors | `[&[data-paused]]:opacity-0` | ✅ Working | - |
| Container queries (unnamed) | `sm:p-6`, `md:p-8` | ✅ Working | - |
| **Named container queries** | `@container/root`, `@7xl/root:` | ❌ Not tested | **HIGH** |
| Basic hover/focus | `hover:bg-blue`, `focus:ring-2` | ⚠️ Partial | **HIGH** |
| **Group modifiers** | `group-hover/root:opacity-100` | ❌ Not supported | **CRITICAL** |
| **Has selector** | `has-[[data-paused]]:scale-100` | ❌ Not supported | **CRITICAL** |
| **Before/After** | `after:absolute`, `before:ring-1` | ❌ Not supported | **HIGH** |
| **ARIA states** | `aria-disabled:opacity-50` | ❌ Not tested | **HIGH** |
| Color opacity | `bg-white/10`, `text-white/90` | ⚠️ Should work | MEDIUM |
| Backdrop filters | `backdrop-blur-3xl` | ⚠️ Partial | MEDIUM |
| Gradients | `bg-gradient-to-t` | ❌ Not tested | MEDIUM |
| Transitions | `transition-all`, `duration-300` | ⚠️ Partial | MEDIUM |
| Transforms | `scale-95`, `-translate-x-px` | ⚠️ Partial | MEDIUM |
| **Custom variants** | `reduced-transparency:` | ❌ Not supported | LOW |
| Ring utilities | `ring-1`, `ring-inset` | ⚠️ Should work | MEDIUM |
| Drop shadow | `drop-shadow-[...]` | ❌ Not tested | LOW |
| Text shadow | `text-shadow` | ❌ Unknown (plugin?) | LOW |

## Critical Missing Features

These are **BLOCKING** for production default skin:

1. **Named groups** (`group/root`, `group-hover/root:`)
   - Used extensively for control visibility
   - Required for hover/focus interactions

2. **Has selector** (`has-[[data-paused]]:scale-100`)
   - Used for parent state based on child state
   - Required for show/hide controls logic

3. **Before/After pseudo-elements** (`after:absolute`, `before:ring-1`)
   - Used for fancy borders and overlays
   - Required for visual polish

4. **Named container queries** (`@container/root`, `@7xl/root:`)
   - Used for responsive typography
   - Required for proper scaling

5. **ARIA state selectors** (`aria-disabled:opacity-50`)
   - Used for accessibility
   - Required for disabled/busy states

## Recommended Level Progression (Production-Ready)

Based on this analysis, here's the progression to support production:

```
Level 0: Structure ✅
Level 1: Basic utilities ✅
Level 2: Descendant selectors ✅
Level 3: Container queries (unnamed) ✅
Level 4: Color opacity modifiers ⚠️ (test existing)
Level 5: Basic hover/focus/active ⚠️ (test existing)
Level 6: Before/After pseudo-elements ❌ (CRITICAL)
Level 7: Has selector ❌ (CRITICAL)
Level 8: Named groups ❌ (CRITICAL)
Level 9: ARIA state selectors ❌ (CRITICAL)
Level 10: Named container queries ❌ (CRITICAL)
Level 11: Backdrop filters, gradients ⚠️
Level 12: Advanced transforms/transitions ⚠️
Level 13: Custom accessibility variants ❌
```

## Next Steps

1. **Audit current Level 3 (03-responsive)**
   - What actually works vs. what we think works?
   - Test in browser with visual comparison

2. **Create focused test skins for critical features:**
   - `04-pseudo-elements` - Test `before:`, `after:`
   - `05-has-selector` - Test `has-[...]` patterns
   - `06-named-groups` - Test `group/name` and `group-hover/name:`
   - `07-aria-states` - Test `aria-disabled:`, `aria-busy:`, etc.
   - `08-named-containers` - Test `@container/name` and `@7xl/name:`

3. **Implement missing features incrementally**
   - Don't try to support everything at once
   - Each feature gets its own test skin
   - Validate in browser before moving on

4. **Create simplified production skin**
   - Strip out unsupported features
   - Validate that works
   - Incrementally add back complexity

## Estimated Complexity

**Current capability:** ~40% of production features
**Critical missing:** 5 major features (groups, has, before/after, aria, named containers)
**Nice-to-have missing:** ~8 features

**Reality check:** We're further from production than we thought. Need focused work on the 5 critical features before attempting full production compilation.
