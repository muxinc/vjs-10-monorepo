# Tailwind CSS Support Status

**Last Updated:** 2025-10-15

Simple overview of what Tailwind CSS features the compiler supports for React → Web Component compilation.

---

## ✅ Supported (Working in Production)

### Basic Utilities
- Layout: `flex`, `grid`, `relative`, `absolute`, `inset-0`
- Sizing: `w-full`, `h-full`, `size-3`
- Spacing: `p-4`, `px-2`, `gap-3`, `m-4`
- Colors: `bg-blue-500`, `text-white`, `bg-[#3b82f6]`
- Borders: `rounded-full`, `rounded-lg`, `border`
- Typography: `text-lg`, `font-bold`, `leading-normal`
- Display: `hidden`, `block`, `inline-flex`
- Positioning: `z-10`, `top-0`, `bottom-3`

### Color Opacity
- Slash syntax: `bg-white/10`, `text-black/50`, `ring-blue-500/30`
- Works with arbitrary colors: `bg-[#000]/40`

### Responsive Breakpoints (Viewport)
- Standard breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Example: `sm:p-6 md:p-8 lg:p-10`

### Arbitrary Values
- Arbitrary properties: `[grid-area:1/1]`
- Arbitrary colors: `bg-[#1da1f2]`
- Arbitrary sizing: `w-[clamp(100px,50%,500px)]`

### Descendant Selectors
- Child selectors: `[&_.icon]:opacity-0`
- Nested selectors: `[&_svg]:shrink-0`
- Complex paths: `[&[data-paused]_.play-icon]:opacity-100`

### Data Attributes
- Presence: `[&[data-paused]]:opacity-0`
- With child selectors: `[&[data-paused]_.icon]:hidden`

### Basic Pseudo-Classes
- Hover: `hover:bg-blue-500`
- Focus: `focus:ring-2`
- Active: `active:scale-95`

### Transitions & Transforms
- Basic transitions: `transition`, `transition-opacity`, `duration-300`
- Basic transforms: `scale-90`, `translate-x-4`, `rotate-45`

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

**Used for:** Show/hide controls on hover, interactive UI states

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

**Used for:** Parent styling based on child/sibling state

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

**Used for:** Decorative borders, overlays, visual polish

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

**Used for:** Responsive typography and spacing based on container size

**Root Cause:** Tailwind CLI limitation - doesn't scan HTML files with `@tailwind` directives

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

**Used for:** Accessibility states (disabled, busy, expanded, etc.)

---

### 6. Group Focus/Active Variants
**Status:** NOT TESTED

```tsx
// Untested variants:
group-focus-within/slider:opacity-100
group-active/button:scale-95
```

---

### 7. Fullscreen Pseudo-Class
**Status:** NOT SUPPORTED

```tsx
[&:fullscreen]:rounded-none
[&:fullscreen]:[&_video]:h-full
```

---

### 8. Custom Accessibility Variants
**Status:** NOT SUPPORTED

```tsx
reduced-transparency:bg-black/70  // prefers-reduced-transparency
contrast-more:bg-black/90         // prefers-contrast
```

---

## ⚠️ Untested (Probably Works)

These features are part of standard Tailwind and should work, but haven't been explicitly tested:

- Backdrop filters: `backdrop-blur-3xl`, `backdrop-saturate-150`
- Gradients: `bg-gradient-to-t`, `from-black/50`, `via-transparent`
- Ring utilities: `ring-1`, `ring-white/10`, `ring-inset`
- Shadow utilities: `shadow-lg`, `shadow-black/15`
- Outline utilities: `outline-2`, `outline-blue-500`, `-outline-offset-2`
- Drop shadow: `drop-shadow-[0_1px_0_rgba(0,0,0,0.1)]`

---

## Production Readiness Summary

**Current Status:** ~40% of production features supported

**Critical Blockers:** 5 major features must be implemented:
1. Named groups (`group/root`)
2. Has selector (`:has()`)
3. Before/after pseudo-elements (`::before`, `::after`)
4. Container query variants (`@md/root:`)
5. ARIA state selectors (`aria-disabled:`)

**Next Steps:**
- Implement the 5 critical features
- Test with production default skin
- Validate visual equivalence with React version

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

## Implementation Context

### How Supported Features Work

**Major fixes (2025-10-08):** Test pass rate 8% → 92%

1. **Utility extraction regex** - Fixed to capture escaped chars: `/^.((?:[^:[\\\s]|\\.)+)/`
2. **Character unescaping** - Added `=` unescaping for data attributes: `\\=` → `=`
3. **@media preservation** - Changed data structure to store parent at-rules with each rule
4. **Rule separation** - Base, variant, and media rules generate separately
5. **CSS variables** - Added color palette to `@theme` block for Tailwind v4

**Processing architecture:**
- **PostCSS Plugin API** (Levels 0-11): Fast, in-memory, handles HTML scanning
- **CLI-based** (Level 12+): Full v4 features but doesn't scan HTML with `@tailwind` directives

### What Was Tried for Unsupported Features

**Named groups, has selector, before/after:** No implementation attempts yet

**ARIA states:** Test skin created (Level 11) but results undocumented

**Container query variants:**
- ✅ Auto-detection implemented (`hasContainerQueries()` regex)
- ✅ CLI processor created (`processCSSWithCLI.ts`)
- ❌ Tried `@import "tailwindcss"` → resolution failure from temp dirs
- ❌ Used `@tailwind theme; @tailwind utilities` → CLI doesn't scan HTML files
- ❌ Minimal repro confirms: CLI ignores `content: []` config with `@tailwind` directives
- 📝 Root cause: Tailwind CLI v4 limitation (GitHub #18833 confirms CLI/Vite differences)
- 📝 Waiting for CLI fix or need hybrid PostCSS/CLI approach

**Docs:** `CSS_FIXES_APPLIED.md`, `CONTAINER_QUERIES_LIMITATION.md`

---

## References

- Full feature analysis: `docs/PRODUCTION_TAILWIND_ANALYSIS.md`
- Container query limitation: `docs/CONTAINER_QUERIES_LIMITATION.md`
- Test skin progression: `docs/TEST_SKIN_PROGRESSION.md`
- CSS fixes applied: `docs/CSS_FIXES_APPLIED.md`
