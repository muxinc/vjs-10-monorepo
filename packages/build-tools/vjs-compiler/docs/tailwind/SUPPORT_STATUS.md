# Tailwind CSS Support Status

**Last Updated:** 2025-10-15

Comprehensive overview of Tailwind CSS feature support in the VJS Framework Compiler for React → Web Component compilation.

---

## Quick Summary

**Production Readiness:** ~40% of production features supported

**Test Status:** 144/158 passing (91%), 5 failing, 9 skipped

**Critical Blockers (5):** Named groups, has selector, before/after pseudo-elements, container query variants, ARIA state selectors

---

## ✅ Supported (Working in Production)

### Basic Utilities
- **Layout:** `flex`, `grid`, `relative`, `absolute`, `inset-0`
- **Sizing:** `w-full`, `h-full`, `size-3`
- **Spacing:** `p-4`, `px-2`, `gap-3`, `m-4`
- **Colors:** `bg-blue-500`, `text-white`, `bg-[#3b82f6]`
- **Borders:** `rounded-full`, `rounded-lg`, `border`
- **Typography:** `text-lg`, `font-bold`, `leading-normal`, `tabular-nums`
- **Display:** `hidden`, `block`, `inline-flex`, `overflow-clip`
- **Positioning:** `z-10`, `top-0`, `bottom-3`
- **Others:** `shrink-0`, `select-none`, `pointer-events-none`, `cursor-pointer`

**Validated:** ✅ Levels 0-1 test skins, browser tested

### Color Opacity
- **Slash syntax:** `bg-white/10`, `text-black/50`, `ring-blue-500/30`
- **Arbitrary colors:** `bg-[#000]/40`

**Validated:** ✅ Level 7 test skin

### Responsive Breakpoints (Viewport)
- **Standard breakpoints:** `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Example:** `sm:p-6 md:p-8 lg:p-10`

**Validated:** ✅ Level 4 test skin

### Arbitrary Values
- **Properties:** `[grid-area:1/1]`
- **Colors:** `bg-[#1da1f2]`, `bg-[rgba(0,0,0,0.3)]`
- **Sizing:** `w-[clamp(100px,50%,500px)]`
- **Border radius:** `rounded-[12px]`

**Validated:** ✅ Level 6 test skin

### Descendant Selectors
- **Child selectors:** `[&_.icon]:opacity-0`
- **Nested selectors:** `[&_svg]:shrink-0`
- **Complex paths:** `[&[data-paused]_.play-icon]:opacity-100`

**Validated:** ✅ Level 2, 5 test skins

### Data Attributes
- **Presence:** `[&[data-paused]]:opacity-0`
- **With value:** `[&[data-state="active"]]:bg-blue`
- **With child selectors:** `[&[data-paused]_.icon]:hidden`

**Validated:** ✅ Level 2, 5 test skins

### Basic Pseudo-Classes
- **Hover:** `hover:bg-blue-500`
- **Focus:** `focus:ring-2`, `focus-visible:outline-2`
- **Active:** `active:scale-95`

**Validated:** ✅ Level 3 test skin

### Transitions & Transforms
- **Transitions:** `transition`, `transition-opacity`, `duration-300`, `ease-in-out`
- **Transforms:** `scale-90`, `translate-x-4`, `rotate-45`, `origin-bottom`

**Validated:** ✅ Level 3 test skin (fixed 2025-10-14, CSS variables properly resolved)

### Backdrop Filters
- **Filters:** `backdrop-blur-3xl`, `backdrop-saturate-150`, `backdrop-brightness-90`

**Validated:** ✅ Level 3 test skin (fixed 2025-10-14)

### Gradients
- **Directions:** `bg-gradient-to-t`, `bg-gradient-to-r`
- **Stops:** `from-black/50`, `via-black/20`, `to-transparent`

**Validated:** ✅ Test coverage exists

---

## ❌ Not Supported (Blocking Production)

### 1. Named Groups
**Status:** NOT SUPPORTED

```tsx
// React code (works)
<div className="group/root">
  <div className="group-hover/root:opacity-100">Controls</div>
</div>

// Compiler cannot handle named groups
```

**Used in production for:**
- Show/hide controls on hover: `group-hover/root:opacity-100`
- Interactive button states: `group-hover/button:[&_.arrow]:translate-x-1`
- Focus interactions: `group-focus-within/slider:opacity-100`
- Active states: `group-active/slider:size-3`

**Impact:** CRITICAL - Extensive use in production default skin

---

### 2. Has Selector
**Status:** NOT SUPPORTED

```tsx
// React code (works)
<div className="has-[[data-paused]]:scale-100">
  <button data-paused>Pause</button>
</div>

// Compiler cannot handle :has() pseudo-class
```

**Used in production for:**
- Parent styling based on child state: `has-[[data-paused]]:scale-100`
- Adjacent sibling detection: `has-[+.controls_[data-paused]]:opacity-100`

**Impact:** CRITICAL - Required for show/hide controls logic

---

### 3. Before/After Pseudo-Elements
**Status:** NOT SUPPORTED

```tsx
// React code (works)
<div className="after:absolute after:inset-0 after:ring-1">
  Content
</div>

// Compiler cannot handle ::before and ::after
```

**Used in production for:**
- Decorative borders: `after:ring-black/10`
- Overlays: `before:absolute before:inset-px`
- Visual polish: `after:rounded-[inherit]`

**Impact:** HIGH - Required for visual polish

---

### 4. Container Query Variants
**Status:** PARTIALLY SUPPORTED (definitions work, variants don't)

```tsx
// Container definition (WORKS)
<div className="@container/root">

// Container query variant (DOESN'T WORK)
<div className="@md/root:text-lg @lg/root:p-4">

// Compiler generates container-type but not @container media queries
```

**Used in production for:**
- Responsive typography: `@7xl/root:text-[0.9375rem]`
- Responsive spacing: `@md/controls:gap-2`

**Root Cause:** Tailwind CLI limitation - doesn't scan HTML files with `@tailwind` directives

**Impact:** CRITICAL - Required for responsive typography and spacing based on container size

**Deep dive:** See `docs/tailwind/investigations/CONTAINER_QUERIES_LIMITATION.md`

---

### 5. ARIA State Selectors
**Status:** NOT TESTED (unknown if works)

```tsx
// React code (works)
<button className="aria-disabled:opacity-50 aria-busy:pointer-events-none">
  Submit
</button>

// Compiler support unknown
```

**Used in production for:**
- Disabled states: `aria-disabled:grayscale`, `aria-disabled:opacity-50`
- Busy states: `aria-busy:pointer-events-none`
- Expanded states: `aria-expanded:bg-white/10`

**Impact:** HIGH - Required for accessibility states

---

### 6. Group Focus/Active Variants
**Status:** NOT TESTED

```tsx
// Untested variants:
group-focus-within/slider:opacity-100
group-active/button:scale-95
```

**Impact:** HIGH - Used in production for slider interactions

---

### 7. Fullscreen Pseudo-Class
**Status:** NOT SUPPORTED

```tsx
[&:fullscreen]:rounded-none
[&:fullscreen]:[&_video]:h-full
```

**Impact:** MEDIUM - Required for fullscreen mode styling

---

### 8. Custom Accessibility Variants
**Status:** NOT SUPPORTED

```tsx
reduced-transparency:bg-black/70  // prefers-reduced-transparency
contrast-more:bg-black/90         // prefers-contrast
```

**Impact:** LOW - Nice-to-have for accessibility preferences

---

## ⚠️ Untested (Probably Works)

These features are part of standard Tailwind and should work, but haven't been explicitly tested:

- **Ring utilities:** `ring-1`, `ring-white/10`, `ring-inset`
- **Shadow utilities:** `shadow-lg`, `shadow-black/15`
- **Outline utilities:** `outline-2`, `outline-blue-500`, `-outline-offset-2`
- **Drop shadow:** `drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]`
- **Letter spacing:** `tracking-[-0.0125em]`
- **Font weight:** `font-[510]` (arbitrary weight)

---

## Production Readiness Summary

**Current Status:** ~40% of production features supported

**Critical Blockers (must implement):**
1. Named groups (`group/root`, `group-hover/root:`)
2. Has selector (`:has()`)
3. Before/after pseudo-elements (`::before`, `::after`)
4. Container query variants (`@md/root:`)
5. ARIA state selectors (`aria-disabled:`)

**Next Steps:**
- Implement the 5 critical features
- Test with production default skin
- Validate visual equivalence with React version

---

## Implementation Context

### How Supported Features Work

**Major fixes (2025-10-08):** Test pass rate 8% → 92%

1. **Utility extraction regex** - Fixed to capture escaped chars: `/^.((?:[^:[\\\\\\s]|\\\\.)+)/`
2. **Character unescaping** - Added `=` unescaping for data attributes: `\\=` → `=`
3. **@media preservation** - Changed data structure to store parent at-rules with each rule
4. **Rule separation** - Base, variant, and media rules generate separately
5. **CSS variables** - Added color palette to `@theme` block for Tailwind v4

**Deep dive:** See `docs/tailwind/investigations/CSS_FIXES_APPLIED.md`

**Processing architecture:**
- **PostCSS Plugin API** (Levels 0-11): Fast, in-memory, handles HTML scanning
- **CLI-based** (Level 12+): Full v4 features but doesn't scan HTML with `@tailwind` directives

---

## Testing Status

**Test Skins (Levels 0-11):**
- ✅ Level 0: Structural (imports, base template)
- ✅ Level 1: Basic utilities
- ✅ Level 2: Descendant selectors
- ✅ Level 3: Hover states
- ✅ Level 4: Responsive breakpoints
- ✅ Level 5: Complex combinators
- ✅ Level 6: Arbitrary values
- ✅ Level 7: Color opacity
- ✅ Level 8: Before/after pseudo-elements
- ✅ Level 9: Has selector
- ✅ Level 10: Named groups
- ✅ Level 11: ARIA states

**Test Skins (Level 12+):**
- ⚠️ Level 12: Container queries (definitions only)

**Production Skin:**
- ❌ Cannot compile yet (missing 5 critical features)

---

## V1 vs V2 Comparison

| Feature | V1 | V2 | Notes |
|---------|----|----|-------|
| Basic CSS utilities | ✅ | ✅ | Works in both |
| Element selectors | ✅ | ✅ | Works in both |
| Class selectors | ✅ | ✅ | Works in both |
| CSS variables (Tailwind v4) | ❌ | ✅ | V2 uses modern approach |
| Descendant selectors | ✅ | ✅ | Works in v2 |
| Data attribute styling | ✅ | ✅ | Fixed 2025-10-08 |
| Pseudo-classes (hover/focus) | ✅ | ✅ | Works in v2 |
| Media queries | ✅ | ✅ | Fixed 2025-10-08 |
| Named groups | ✅ | ❌ | V1 has custom parser |
| Has selector | ✅ | ❌ | Blocked by Tailwind JIT |
| Before/after pseudo-elements | ✅ | ❌ | Blocked by Tailwind JIT |
| Import generation | ✅ | ✅ | Phase 1 complete |
| Base template inclusion | ✅ | ✅ | Phase 1 complete |

---

## References

- **Implementation details:** `docs/tailwind/investigations/CSS_FIXES_APPLIED.md`
- **Container query limitation:** `docs/tailwind/investigations/CONTAINER_QUERIES_LIMITATION.md`
- **Test progression details:** `docs/tailwind/TEST_PROGRESSION.md` (detailed level-by-level breakdown)
- **General compiler limitations:** `docs/CURRENT_STATUS.md (Known Limitations section)`
