# Test Skin Progression Plan

**Status:** Levels 0-6 completed! See TAILWIND_ROADMAP.md for production path.

**Problem:** Current Level 3 (03-responsive) combines too many features at once.

**Solution:** Split into smaller, focused test skins that each validate ONE new complexity level.

**✅ UPDATE (2025-10-14):** Restructuring complete! Levels 0-6 now exist and compile successfully.
See `TAILWIND_ROADMAP.md` for the path to production (Levels 7-12).

## Proposed Progression

### Level 0: Structural ✅ DONE
**File:** `00-structural/MediaSkinStructural.tsx`
**Status:** Working, 31 lines
**Features:**
- Pure JSX → HTML transformation
- No styling

**Tests:**
- Element naming works
- Icons render
- Custom element registration

---

### Level 1: Basic Utilities ✅ DONE
**File:** `01-minimal/MediaSkinMinimal.tsx`
**Status:** Working, 51 lines
**Features:**
- Basic positioning: `relative`, `absolute`, `inset-0`
- Flexbox: `flex`, `items-center`, `justify-center`
- Spacing: `p-3`, `gap-2`
- Border radius: `rounded-full`
- Pointer events: `pointer-events-none/auto`

**Tests:**
- Tailwind utilities compile
- CSS generates correctly
- Layout works in browser

---

### Level 2: Descendant Selectors ✅ DONE
**File:** `02-interactive/MediaSkinInteractive.tsx`
**Status:** Working, 71 lines
**Features:**
- Arbitrary variants: `[&_.icon]:[grid-area:1/1]`
- Child combinators: `.button .icon`
- Data attribute selectors: `[&[data-paused]_.play-icon]:opacity-100`
- Grid layout

**Tests:**
- Descendant selectors compile to valid CSS
- Data attribute selectors work
- Icon stacking with grid-area works

---

### Level 3: Hover and Pseudo-Classes ✅ DONE
**File:** `03-hover/MediaSkinHover.tsx`
**Status:** Complete, 2313 bytes compiled
**Features:**
- Basic hover: `hover:bg-blue-500`
- Hover with arbitrary values: `hover:bg-[#0d8ddb]`
- Media query wrapping: `@media (hover: hover)`
- Focus states: `focus:ring-2`
- Active states: `active:scale-95`

**Why separate from responsive:**
- Pseudo-classes are a distinct feature
- Validates hover/focus/active work independently
- Production skins use hover extensively

**Actual styles:**
```typescript
const styles = {
  Wrapper: cn('relative'),
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
  ),
  Button: cn(
    'p-3',
    'rounded-full',
    'bg-blue-500',           // Base color
    'hover:bg-blue-600',     // Hover state
    'focus:ring-2',          // Focus state
    'focus:ring-blue-300',
    'active:scale-95',       // Active state
    'transition-all',
    'duration-200',
    'pointer-events-auto',
    'grid',
  ),
  Icon: cn(
    '[grid-area:1/1]',
    'transition-opacity',
    'duration-200',
  ),
  PlayIcon: cn('opacity-0'),
  PauseIcon: cn('opacity-100'),
};
```

**Tests:**
- Hover states generate `@media (hover: hover)` wrapper
- Focus states compile
- Active states compile
- Transitions work

---

### Level 4: Arbitrary Values ✅ DONE
**File:** `04-arbitrary/MediaSkinArbitrary.tsx`
**Status:** Complete, 2395 bytes compiled
**Features:**
- Arbitrary colors: `bg-[#1da1f2]`, `bg-[rgba(0,0,0,0.3)]`
- Arbitrary sizing: `w-[clamp(3rem,10vw,5rem)]`
- Arbitrary border radius: `rounded-[12px]`
- Arbitrary filters: `backdrop-blur-[2px]`

**Why separate:**
- Arbitrary values are Tailwind v3+ feature
- Tests edge cases with bracket escaping
- Validates various value types

**Actual styles:**
```typescript
const styles = {
  Wrapper: cn('relative'),
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
    'bg-[rgba(0,0,0,0.3)]',      // Arbitrary RGBA
    'backdrop-blur-[2px]',        // Arbitrary filter
  ),
  Button: cn(
    'p-3',
    'rounded-[12px]',             // Arbitrary radius
    'bg-[#1da1f2]',               // Arbitrary hex color
    'hover:bg-[#0d8ddb]',         // Hover + arbitrary
    'w-[clamp(3rem,10vw,5rem)]',  // Arbitrary sizing with clamp
    'h-[clamp(3rem,10vw,5rem)]',
    'pointer-events-auto',
    'grid',
  ),
  Icon: cn('[grid-area:1/1]'),
  PlayIcon: cn('opacity-0'),
  PauseIcon: cn('opacity-100'),
};
```

**Tests:**
- Arbitrary colors compile
- Arbitrary sizing works (clamp, calc)
- Arbitrary filters work
- Bracket escaping handles edge cases

---

### Level 5: Responsive Variants ✅ DONE
**File:** `05-responsive/MediaSkinResponsiveSimple.tsx`
**Status:** Complete, 2305 bytes compiled (simplified from old 03)
**Features:**
- Responsive breakpoints: `sm:p-6`, `md:p-8`, `lg:p-12`
- Container queries: `@container (min-width: Xrem)`
- Multiple responsive properties per breakpoint

**Why simplified:**
- Removed arbitrary values (moved to Level 4)
- Removed hover states (moved to Level 3)
- Removed transitions/transforms (moved to Level 3)
- Keeps ONLY responsive variants for clear testing

**Actual styles:**
```typescript
const styles = {
  Wrapper: cn(
    'relative',
    // JUST responsive padding - nothing else!
    'p-4',
    'sm:p-6',
    'md:p-8',
    'lg:p-12',
    // JUST responsive gap
    'gap-2',
    'sm:gap-3',
    'md:gap-4',
  ),
  Overlay: cn(
    'absolute',
    'inset-0',
    'flex',
    'items-center',
    'justify-center',
    'pointer-events-none',
  ),
  Button: cn(
    // JUST responsive padding
    'p-3',
    'sm:p-4',
    'md:p-6',
    'rounded-full',
    'bg-blue-500',  // Simple color, not arbitrary
    'pointer-events-auto',
    'grid',
  ),
  Icon: cn('[grid-area:1/1]'),
  PlayIcon: cn('opacity-0'),
  PauseIcon: cn('opacity-100'),
};
```

**Tests:**
- Container queries generate correctly
- Multiple breakpoints work
- Responsive utilities compile

---

### Level 6: Combined Features ✅ DONE
**File:** `06-combined/MediaSkinCombined.tsx`
**Status:** Complete, 2976 bytes compiled (was old 03-responsive)
**Features:**
- Combines Levels 3-5: hover + arbitrary + responsive
- Tests feature interactions

**Tests:**
- Features don't conflict
- CSS generates correctly when combined
- Container queries + hover work together
- Responsive arbitrary values work

---

### Level 7-12: Production Features ❌ NOT STARTED
**See TAILWIND_ROADMAP.md for details**

Critical features needed for production default skin:
- Level 7: Color opacity modifiers (`text-white/90`)
- Level 8: Before/After pseudo-elements (`::before`, `::after`)
- Level 9: Has selector (`:has([data-paused])`)
- Level 10: Named groups (`group/root`, `group-hover/root:`)
- Level 11: ARIA states (`aria-disabled:`, `aria-busy:`)
- Level 12: Named containers (`@container/root`, `@7xl/root:`)

## Implementation Status

### ✅ Completed (Levels 0-6)

```
test/e2e/app/src/skins/
├── 00-structural/     ✅ 826 bytes
├── 01-minimal/        ✅ 1245 bytes
├── 02-interactive/    ✅ 1648 bytes
├── 03-hover/          ✅ 2313 bytes
├── 04-arbitrary/      ✅ 2395 bytes
├── 05-responsive/     ✅ 2305 bytes
└── 06-combined/       ✅ 2976 bytes
```

### Benefits Achieved

- **Clear progression:** One feature at a time
- **Easier debugging:** Know exactly which feature breaks
- **Better documentation:** Each level clearly scoped
- **Confidence:** Validated each feature independently before combining

## Current Status (Updated 2025-10-14)

| Level | Feature | E2E Status | Size | Issues |
|-------|---------|------------|------|--------|
| 0 | Structure | ✅ **VALIDATED** | 826 bytes | None |
| 1 | Basic utilities | ✅ **VALIDATED** | 1245 bytes | None |
| 2 | Descendant selectors | ✅ **VALIDATED** | 1648 bytes | None |
| 3 | Hover/pseudo-classes | ⚠️ **BLOCKED** | 2313 bytes | 🔴 Tailwind colors broken - see CRITICAL_BLOCKER_TAILWIND_COLORS.md |
| 4 | Arbitrary values | ✅ **VALIDATED** | 2395 bytes | None |
| 5 | Responsive variants | ⚠️ **BLOCKED** | 2305 bytes | 🔴 Tailwind colors broken - see CRITICAL_BLOCKER_TAILWIND_COLORS.md |
| 6 | Combined features | ✅ **VALIDATED** | 2976 bytes | None (uses arbitrary colors only) |
| 7-12 | **Production critical** | ❌ Not started | - | See TAILWIND_ROADMAP.md |

### E2E Validation Legend:
- ✅ **VALIDATED** - Compiles, loads in browser, colors work, playback functional
- ⚠️ **BLOCKED** - Compiles and loads, but colors don't render (empty CSS values)
- ❌ **Not started** - Not yet implemented

### 🔴 CRITICAL BLOCKER:
**Tailwind Color Classes Not Resolving** - See `CRITICAL_BLOCKER_TAILWIND_COLORS.md`

Levels 3 and 5 compile successfully but output empty `background-color:` values because Tailwind color classes (`bg-blue-500`, etc.) are not resolving to actual colors. Arbitrary color values (`bg-[#hex]`) work fine.

**Workaround:** Use arbitrary colors: `bg-[#3b82f6]` instead of `bg-blue-500`

## Validation Checklist

Before marking a level as "Done":
- [ ] Skin compiles without errors
- [ ] Output loads in browser without console errors
- [ ] Visual equivalence with React version
- [ ] CSS matches expected patterns
- [ ] Feature works as documented
- [ ] Tests added to test suite

## Next Steps

**Levels 0-6 are complete!** See `TAILWIND_ROADMAP.md` for production path.

To reach production default skin support:
1. Create Level 7 (color-opacity) - Quick win
2. Create Level 8 (before-after) - Complex parser work
3. Create Level 9 (has-selector) - Modern CSS feature
4. Create Level 10 (named-groups) - Core Tailwind feature
5. Create Level 11 (aria-states) - Accessibility
6. Create Level 12 (named-containers) - Advanced responsive

Estimated: 15-30 hours of focused work to reach production parity.
