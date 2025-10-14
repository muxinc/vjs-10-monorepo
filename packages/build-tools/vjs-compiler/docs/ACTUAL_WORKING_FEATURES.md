# What ACTUALLY Works - Honest Assessment

**Date:** 2025-10-14
**Context:** After analyzing compiled output from test skins 00-03

This document separates what we **claim** works from what **actually** works based on inspecting compiled CSS.

## ✅ Fully Working Features

### Level 0: Structure (00-structural)
- JSX → HTML transformation
- Element naming (PlayButton → media-play-button)
- Icon imports and rendering
- Custom element registration
- **Status:** ✅ Confirmed working, 31 lines

---

### Level 1: Basic Utilities (01-minimal)
- Positioning: `relative`, `absolute`, `inset-0`
- Flexbox: `flex`, `items-center`, `justify-center`
- Spacing: `p-3` → `padding: 0.75rem`
- Border radius: `rounded-full` → `border-radius: 9999px`
- Pointer events: `pointer-events-none`, `pointer-events-auto`
- **Status:** ✅ Confirmed working, generates clean CSS, 51 lines

**Compiled CSS example:**
```css
.button {
  padding: 0.75rem;
  border-radius: 9999px;
  pointer-events: auto;
  display: flex
}
```

---

### Level 2: Descendant Selectors (02-interactive)
- Child combinators: `[&_.icon]` → `.button .icon`
- Data attribute selectors: `[&[data-paused]_.play-icon]` → `.button[data-paused] .play-icon`
- Arbitrary grid-area: `[grid-area:1/1]` → `grid-area: 1/1`
- Opacity utilities: `opacity-0`, `opacity-100`
- **Status:** ✅ Confirmed working, generates correct descendant selectors, 71 lines

**Compiled CSS example:**
```css
.button .icon {
  grid-area: 1/1
}

.button[data-paused] .play-icon {
  opacity: 100%
}
```

---

### Level 3A: Container Queries (03-responsive - PARTIAL)
**What works:**
- Responsive breakpoint parsing: `sm:p-6`, `md:p-8`, `lg:p-12`
- Container query generation: `@container (min-width: 24rem)`
- Multiple breakpoints per component
- **Status:** ✅ Confirmed working for basic utilities

**Compiled CSS example:**
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

---

### Level 3B: Arbitrary Values (03-responsive - PARTIAL)
**What works:**
- Arbitrary colors: `bg-[#1da1f2]` → `background-color: #1da1f2`
- Arbitrary rgba: `bg-[rgba(0,0,0,0.3)]` → `background-color: rgba(0,0,0,0.3)`
- Arbitrary sizing: `w-[clamp(3rem,10vw,5rem)]` → `width: clamp(3rem, 10vw, 5rem)`
- Arbitrary border-radius: `rounded-[12px]` → `border-radius: 12px`
- **Status:** ✅ Confirmed working for colors and sizing

---

### Level 3C: Basic Hover (03-responsive - PARTIAL)
**What works:**
- Simple hover: `hover:bg-[#0d8ddb]` → `.button:hover { background-color: #0d8ddb }`
- Media query wrapping: `@media (hover: hover)`
- **Status:** ✅ Confirmed working with media query wrapper

**Compiled CSS example:**
```css
@media (hover: hover) {
  .button:hover {
    background-color: #0d8ddb
  }
}
```

---

### Level 3D: Transitions ✅ FULLY WORKING (Fixed 2025-10-14)
- Transitions: `transition-all`, `duration-300`, `ease-in-out`
- Timing functions resolve to concrete values
- No CSS variable pollution
- **Status:** ✅ Fully working with clean CSS

**Compiled CSS example:**
```css
.button {
  transition-property: all;
  transition-timing-function: ease;
  transition-duration: 300ms;
}
```

---

### Level 3E: Transforms ✅ FULLY WORKING (Fixed 2025-10-14)
- Scale: `scale-100`, `hover:scale-110`
- Translate: `translate-x-1`, `-translate-y-2`
- Variables resolved to concrete values
- **Status:** ✅ Fully working with clean CSS

**Compiled CSS example:**
```css
.button {
  scale: 110% 110%;
}
```

---

### Level 3F: Backdrop Filters ✅ FULLY WORKING (Fixed 2025-10-14)
- Backdrop blur: `backdrop-blur-[2px]`
- Clean output without undefined variables
- **Status:** ✅ Fully working with clean CSS

**Compiled CSS example:**
```css
.overlay {
  backdrop-filter: blur(2px);
}
```

---

##  ⚠️ Deprecated / Old Issues (FIXED)

### ~~CSS Variables - ISSUE #1: Not Resolved~~ ✅ FIXED

**Problem:** Tailwind generates CSS variables, but we don't resolve them to concrete values.

**Example from 03-responsive output:**
```css
/* Lines 31-33: Backdrop filter */
--tw-backdrop-blur: blur(2px);
backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) ...

/* Lines 43-50: Transitions */
transition-timing-function: var(--tw-ease, ease);
transition-duration: var(--tw-duration, 0s);
--tw-duration: 300ms;
transition-duration: 300ms; /* Redundant! */

/* Lines 47-50, 60-63: Transforms */
--tw-scale-x: 100%;
--tw-scale-y: 100%;
--tw-scale-z: 100%;
scale: var(--tw-scale-x) var(--tw-scale-y);
```

**Issues:**
1. Empty variable references: `var(--tw-backdrop-brightness,)` - note the trailing comma with no fallback
2. Redundant declarations: Sets both var and concrete value
3. Variables not resolved: Should be `scale: 1` not `scale: var(--tw-scale-x) var(--tw-scale-y)`

**Impact:**
- Browser might handle it, but CSS is bloated and ugly
- Variables without definitions will fail
- Not "human-readable, semantic CSS" as per CLAUDE.md requirements

**Status:** ⚠️ BROKEN - CSS variables not being resolved properly

**Affects:**
- `backdrop-blur-[2px]` → generates CSS vars
- `transition-all`, `duration-300` → generates CSS vars
- `scale-100`, `hover:scale-110` → generates CSS vars

---

### Transitions & Transforms - ISSUE #2: CSS Variable Dependency

**What we claim:** ✅ Transitions and transforms work
**Reality:** ⚠️ They "work" but generate CSS variables

**Example input:**
```typescript
'transition-all',
'duration-300',
'scale-100',
'hover:scale-110'
```

**Actual output:**
```css
.button {
  transition-property: all;
  transition-timing-function: var(--tw-ease, ease);
  transition-duration: var(--tw-duration, 0s);
  --tw-duration: 300ms;
  transition-duration: 300ms;  /* Why twice? */
  --tw-scale-x: 100%;
  --tw-scale-y: 100%;
  --tw-scale-z: 100%;
  scale: var(--tw-scale-x) var(--tw-scale-y);
}

@media (hover: hover) {
  .button:hover {
    --tw-scale-x: 110%;
    --tw-scale-y: 110%;
    --tw-scale-z: 110%;
    scale: var(--tw-scale-x) var(--tw-scale-y)
  }
}
```

**What it SHOULD be:**
```css
.button {
  transition-property: all;
  transition-timing-function: ease;
  transition-duration: 300ms;
  transform: scale(1);
}

@media (hover: hover) {
  .button:hover {
    transform: scale(1.1);
  }
}
```

**Status:** ⚠️ WORKS but generates bloated CSS with variables

---

### Backdrop Filters - ISSUE #3: Variable References Without Definitions

**Input:**
```typescript
'backdrop-blur-[2px]'
```

**Output:**
```css
--tw-backdrop-blur: blur(2px);
-webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) ...;
backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) ...;
```

**Problems:**
1. References undefined variables: `--tw-backdrop-brightness`, etc.
2. Empty fallbacks: `var(--tw-backdrop-blur,)` - trailing comma!
3. Vendor prefixes included (may be unnecessary)

**What it SHOULD be:**
```css
backdrop-filter: blur(2px);
```

**Status:** ⚠️ Compiles but CSS is broken (undefined vars)

---

## ❌ Not Working / Not Tested

### Named Groups
```typescript
'group/root'
'group-hover/root:opacity-100'
```
**Status:** ❌ Not implemented, not tested

---

### Has Selector
```typescript
'has-[[data-paused]]:scale-100'
```
**Status:** ❌ Not implemented, not tested

---

### Before/After Pseudo-Elements
```typescript
'after:absolute after:inset-0'
'before:ring-1'
```
**Status:** ❌ Not implemented, not tested

---

### Named Container Queries
```typescript
'@container/root'
'@7xl/root:text-[0.9375rem]'
```
**Status:** ❌ Not implemented - we only support unnamed sm:/md:/lg:

---

### ARIA State Selectors
```typescript
'aria-disabled:opacity-50'
'aria-busy:pointer-events-none'
```
**Status:** ❌ Not tested

---

### Focus States
```typescript
'focus:ring-2'
'focus-visible:outline-2'
'group-focus-within/slider:opacity-100'
```
**Status:** ❌ Basic focus might work, but group variants don't exist

---

### Active States
```typescript
'active:scale-95'
'group-active/slider:size-3'
```
**Status:** ⚠️ Basic active might work (not tested), group variants don't exist

---

### Gradients
```typescript
'bg-gradient-to-t from-black/50 via-black/20 to-transparent'
```
**Status:** ❌ Not tested

---

### Custom Accessibility Variants
```typescript
'reduced-transparency:bg-black/70'
'contrast-more:bg-black/90'
```
**Status:** ❌ Not implemented

---

## ✅ FIXED: CSS Variable Resolution (2025-10-14)

### What was broken:
Tailwind v4 generates CSS variables for many utilities (transitions, transforms, backdrop-filters), but we weren't resolving them, leading to:

1. **Invalid CSS**: `var(--tw-backdrop-brightness,)` with empty fallbacks
2. **Unresolved variables**: `scale: var(--tw-scale-x) var(--tw-scale-y)` instead of `scale: 110% 110%`
3. **Redundant declarations**: Same property appearing twice

### What was fixed:
**File:** `src/core/css/resolveCSSVariables.ts`

**Changes made:**
1. **Extract inline variables**: Now extracts CSS variable definitions from ALL rules, not just `:root`/:host`
2. **Resolve with fallbacks**: Properly handles `var(--name, fallback)` syntax
3. **Remove invalid references**: Filters out `var(--undefined-var,)` with empty fallbacks
4. **Clean up inline definitions**: Removes resolved variable definitions to keep output terse
5. **Deduplicate properties**: Removes redundant property declarations

**Results:**
- ✅ Transitions resolve: `var(--tw-ease, ease)` → `ease`
- ✅ Transforms resolve: `scale: var(--tw-scale-x) var(--tw-scale-y)` → `scale: 110% 110%`
- ✅ Backdrop filters clean: `blur(2px)` instead of broken var() references
- ✅ File size reduced by 19.6% (3533 → 2840 bytes for 03-responsive)
- ✅ No redundant declarations
- ✅ Human-readable, semantic CSS output

---

## Revised Level Definitions

Based on actual working state:

| Level | Feature | Actual Status | Issues |
|-------|---------|---------------|--------|
| 0 | Structure | ✅ Fully working | None |
| 1 | Basic utilities | ✅ Fully working | None |
| 2 | Descendant selectors | ✅ Fully working | None |
| 3A | Container queries | ✅ Fully working | None |
| 3B | Arbitrary values | ✅ Fully working | None |
| 3C | Basic hover | ✅ Fully working | None |
| 3D | Transitions | ✅ Fully working (fixed 2025-10-14) | None |
| 3E | Transforms | ✅ Fully working (fixed 2025-10-14) | None |
| 3F | Backdrop filters | ✅ Fully working (fixed 2025-10-14) | None |
| 4 | Named groups | ❌ Not implemented | - |
| 5 | Has selector | ❌ Not implemented | - |
| 6 | Before/After | ❌ Not implemented | - |
| 7 | ARIA states | ❌ Not tested | - |
| 8 | Named containers | ❌ Not implemented | - |
| 9+ | Advanced features | ❌ Not implemented | - |

## Immediate Action Items

1. ~~**Fix CSS variable resolution** (CRITICAL)~~ ✅ **COMPLETED 2025-10-14**
   - ✅ Transitions/transforms now generate clean CSS
   - ✅ Backdrop filters work correctly
   - ✅ All CSS variables resolved or cleaned up

2. **Validate Level 0-3F in browser** (NEXT - REQUIRED)
   - Load demos, check for console errors
   - Verify visual appearance
   - Verify CSS variable fixes work in browser
   - Test responsive behavior

3. **Plan next feature level** (REQUIRED)
   - Level 4+: Named groups, has selectors, pseudo-elements
   - Reference production skin analysis for priorities
   - Create focused test skins for each new feature

4. **Document tested features** (ONGOING)
   - Mark features as tested after browser validation
   - Update support matrix with accurate status
   - Track which production features are supported

## Summary

**What we thought:** Levels 0-3 fully working (but with CSS variable issues)
**Reality after fixes (2025-10-14):**
- ✅ Levels 0-3F: **Fully working with clean, semantic CSS**
- ✅ CSS variables properly resolved
- ✅ 19.6% smaller output (3533 → 2840 bytes for 03-responsive)
- ✅ Ready for browser validation

**Next steps:** Browser validation, then implement Level 4+ features.
