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

### Level 3: Hover and Pseudo-Classes ⚠️ TODO
**File:** `03-hover/MediaSkinHover.tsx` (NEW!)
**Status:** Not yet created
**Features to add ONE AT A TIME:**
- Basic hover: `hover:bg-blue-500`
- Hover with arbitrary values: `hover:bg-[#0d8ddb]`
- Media query wrapping: `@media (hover: hover)`
- Focus states: `focus:ring-2`
- Active states: `active:scale-95`

**Why separate from responsive:**
- Pseudo-classes are a distinct feature
- Need to validate hover/focus/active work independently
- Production skins use hover extensively

**Proposed styles:**
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

### Level 4: Arbitrary Values ⚠️ TODO
**File:** `04-arbitrary/MediaSkinArbitrary.tsx` (NEW!)
**Status:** Not yet created
**Features:**
- Arbitrary colors: `bg-[#1da1f2]`, `bg-[rgba(0,0,0,0.3)]`
- Arbitrary sizing: `w-[clamp(3rem,10vw,5rem)]`
- Arbitrary border radius: `rounded-[12px]`
- Arbitrary filters: `backdrop-blur-[2px]`

**Why separate:**
- Arbitrary values are Tailwind v3+ feature
- May have edge cases with bracket escaping
- Need to validate various value types

**Proposed styles:**
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

### Level 5: Responsive Variants ✅ PARTIALLY DONE
**File:** `05-responsive/MediaSkinResponsive.tsx` (rename current 03)
**Status:** Working but mixed with too many other features
**Features:**
- Responsive breakpoints: `sm:p-6`, `md:p-8`, `lg:p-12`
- Container queries: `@container (min-width: Xrem)`
- Multiple responsive properties per breakpoint

**Refactor needed:**
- Remove arbitrary values (move to Level 4)
- Remove hover states (move to Level 3)
- Remove transitions/transforms (move to Level 3)
- Keep ONLY responsive variants

**Simplified styles:**
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

### Level 6: Combined Features ⚠️ TODO
**File:** `06-combined/MediaSkinCombined.tsx` (NEW!)
**Status:** Not yet created
**Features:**
- Combine Levels 3-5: hover + arbitrary + responsive
- Test feature interactions

**This is what current 03-responsive actually is!**

**Tests:**
- Features don't conflict
- CSS generates correctly when combined
- Container queries + hover work together
- Responsive arbitrary values work

---

### Level 7+: Advanced Features ❌ NOT READY
**Future complexity:**
- CSS variables / theme tokens
- Dark mode variants
- Animations and keyframes
- Group/peer modifiers

## Migration Plan

### Immediate Actions

1. **Create 03-hover skin**
   - Test hover/focus/active independently
   - Validate pseudo-class support

2. **Create 04-arbitrary skin**
   - Test arbitrary values independently
   - Validate bracket escaping

3. **Simplify current 03-responsive**
   - Rename to 05-responsive
   - Remove hover states → goes to 03-hover
   - Remove arbitrary values → goes to 04-arbitrary
   - Keep ONLY responsive variants

4. **Create 06-combined skin**
   - Move current 03-responsive complexity here
   - Test feature combinations

### Benefits

- **Clear progression:** One feature at a time
- **Easier debugging:** Know exactly what broke
- **Better documentation:** Each level clearly scoped
- **Confidence:** Validate each feature independently before combining

### File Naming

```
test/e2e/app/src/skins/
├── 00-structural/     ✅ DONE
├── 01-minimal/        ✅ DONE
├── 02-interactive/    ✅ DONE
├── 03-hover/          ⚠️ TODO - Create new
├── 04-arbitrary/      ⚠️ TODO - Create new
├── 05-responsive/     ⚠️ TODO - Simplify current 03
└── 06-combined/       ⚠️ TODO - Current 03 complexity
```

## Current Status (Updated 2025-10-14)

| Level | Feature | Status | Size | Issues |
|-------|---------|--------|------|--------|
| 0 | Structure | ✅ Done | 826 bytes | None |
| 1 | Basic utilities | ✅ Done | 1245 bytes | None |
| 2 | Descendant selectors | ✅ Done | 1648 bytes | None |
| 3 | Hover/pseudo-classes | ✅ Done | 2313 bytes | Color vars not resolved |
| 4 | Arbitrary values | ✅ Done | 2395 bytes | None |
| 5 | Responsive variants | ✅ Done | 2305 bytes | None |
| 6 | Combined features | ✅ Done | 2976 bytes | None |
| 7-12 | **Production critical** | ❌ Not started | - | See TAILWIND_ROADMAP.md |

## Validation Checklist

Before marking a level as "Done":
- [ ] Skin compiles without errors
- [ ] Output loads in browser without console errors
- [ ] Visual equivalence with React version
- [ ] CSS matches expected patterns
- [ ] Feature works as documented
- [ ] Tests added to test suite

## Next Steps

1. Create 03-hover skin (simplest next step)
2. Test hover/focus/active in isolation
3. If that works, create 04-arbitrary
4. Then simplify 05-responsive to remove hover+arbitrary
5. Finally create 06-combined with everything

This approach lets us **validate one feature at a time** instead of debugging a complex combination.
