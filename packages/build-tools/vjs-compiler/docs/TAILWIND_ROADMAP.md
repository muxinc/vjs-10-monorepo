# Tailwind Feature Support Roadmap

This document tracks the progression from basic Tailwind support to full production default skin support.

## Current Status (2025-10-14)

### ✅ Completed Levels (00-06)

| Level | Name | Features | Size | Status |
|-------|------|----------|------|--------|
| 0 | Structural | Pure JSX → HTML | 826 bytes | ✅ DONE |
| 1 | Minimal | Basic utilities | 1245 bytes | ✅ DONE |
| 2 | Interactive | Descendant selectors, data attributes | 1648 bytes | ✅ DONE |
| 3 | Hover | Hover/focus/active pseudo-classes | 2313 bytes | ✅ DONE |
| 4 | Arbitrary | Arbitrary values (colors, sizing, filters) | 2395 bytes | ✅ DONE |
| 5 | Responsive | Responsive breakpoints (sm:, md:, lg:) | 2305 bytes | ✅ DONE |
| 6 | Combined | All above features together | 2976 bytes | ✅ DONE |

**Current capability:** ~40% of production features

---

## Missing Levels for Production (07-13)

### 🔴 Level 7: Color Opacity Modifiers (HIGH PRIORITY)
**Purpose:** Test Tailwind's slash opacity syntax

**Features:**
- Color with opacity: `text-white/90`, `bg-white/10`, `bg-black/50`
- Ring with opacity: `ring-white/10`
- Shadow with opacity: `shadow-black/15`

**Why critical:** Used extensively in production default skin for semi-transparent overlays

**Expected output:**
```css
.text-white-90 {
  color: rgba(255, 255, 255, 0.9);
}

.bg-white-10 {
  background-color: rgba(255, 255, 255, 0.1);
}
```

**Status:** ⚠️ Should work with Tailwind v4, but NOT explicitly tested

---

### 🔴 Level 8: Before/After Pseudo-Elements (CRITICAL)
**Purpose:** Test ::before and ::after pseudo-element support

**Features:**
- `before:absolute`, `before:inset-px`, `before:rounded-[inherit]`
- `after:absolute`, `after:inset-0`, `after:ring-black/10`

**Why critical:** Used in production for decorative borders and overlays

**Expected output:**
```css
.button::before {
  position: absolute;
  inset: 1px;
  border-radius: inherit;
}

.button::after {
  position: absolute;
  inset: 0;
}
```

**Status:** ❌ NOT SUPPORTED - Requires pseudo-element parsing

---

### 🔴 Level 9: Has Selector (CRITICAL)
**Purpose:** Test :has() parent selector support

**Features:**
- `has-[[data-paused]]:scale-100` - Parent state based on child
- `has-[+.controls_[data-paused]]:opacity-100` - Adjacent sibling
- Complex nested has patterns

**Why critical:** Used in production for show/hide controls logic based on media state

**Expected output:**
```css
.wrapper:has([data-paused]) {
  scale: 100% 100%;
}

.overlay:has(+ .controls [data-paused]) {
  opacity: 100%;
}
```

**Status:** ❌ NOT SUPPORTED - Requires :has() pseudo-class support

---

### 🔴 Level 10: Named Groups (CRITICAL)
**Purpose:** Test Tailwind's named group system

**Features:**
- Define groups: `group/root`, `group/button`, `group/slider`
- Target groups: `group-hover/root:opacity-100`
- Complex targeting: `group-hover/button:[&_.arrow-1]:-translate-x-px`
- Group with focus: `group-focus-within/slider:opacity-100`
- Group with active: `group-active/slider:size-3`

**Why critical:** Used extensively in production for nested component interactions

**Expected output:**
```css
.group-root:hover .child {
  opacity: 100%;
}

.group-button:hover .arrow-1 {
  transform: translateX(-1px);
}
```

**Status:** ❌ NOT SUPPORTED - Requires group system implementation

---

### 🔴 Level 11: ARIA State Selectors (CRITICAL)
**Purpose:** Test ARIA attribute-based state selectors

**Features:**
- `aria-disabled:grayscale`, `aria-disabled:opacity-50`
- `aria-busy:pointer-events-none`
- `aria-expanded:bg-white/10`

**Why critical:** Required for accessibility and proper disabled/busy states

**Expected output:**
```css
.button[aria-disabled="true"] {
  filter: grayscale(100%);
  opacity: 50%;
}

.button[aria-busy="true"] {
  pointer-events: none;
}
```

**Status:** ❌ NOT TESTED - Should work if Tailwind v4 supports it

---

### 🔴 Level 12: Named Container Queries (CRITICAL)
**Purpose:** Test Tailwind's named container query system

**Features:**
- Define containers: `@container/root`, `@container/controls`
- Query containers: `@7xl/root:text-[0.9375rem]`
- Named breakpoints with arbitrary values

**Why critical:** Used in production for responsive typography and component sizing

**Expected output:**
```css
.container-root {
  container-name: root;
  container-type: inline-size;
}

@container root (min-width: 90rem) {
  .text {
    font-size: 0.9375rem;
  }
}
```

**Status:** ❌ NOT SUPPORTED - We only support unnamed sm:/md:/lg:

---

### 🟡 Level 13: Advanced Features (MEDIUM PRIORITY)
**Purpose:** Test additional production features

**Features:**
- Gradients: `bg-gradient-to-t`, `from-black/50`, `via-black/20`
- Backdrop filters: `backdrop-blur-3xl`, `backdrop-saturate-150`
- Ring utilities: `ring-1`, `ring-inset`, `ring-black/5`
- Drop shadows: `drop-shadow-[0_1px_0_var(--tw-shadow-color)]`
- Fullscreen: `[&:fullscreen]:rounded-none`
- Data attributes with values: `[&[data-volume-level="high"]]:opacity-100`

**Status:** ⚠️ Mixed - Some should work, others untested

---

## Implementation Priority

### Phase 1: Critical Features (Blocking Production)
Must be completed before production default skin works:

1. ✅ **Levels 0-6** - Basic features (DONE)
2. 🔴 **Level 7** - Color opacity (HIGH)
3. 🔴 **Level 8** - Before/After pseudo-elements (CRITICAL)
4. 🔴 **Level 9** - Has selector (CRITICAL)
5. 🔴 **Level 10** - Named groups (CRITICAL)
6. 🔴 **Level 11** - ARIA states (CRITICAL)
7. 🔴 **Level 12** - Named containers (CRITICAL)

### Phase 2: Polish Features (Production Quality)
Nice to have for full production parity:

8. 🟡 **Level 13** - Advanced features (gradients, backdrop, ring, etc.)
9. 🟡 **Level 14** - Custom variants (reduced-transparency, contrast-more)
10. 🟡 **Level 15** - Text shadows (may be custom plugin)

---

## Test Skin Creation Plan

For each missing level, create:

1. **Source skin:** `test/e2e/app/src/skins/XX-name/`
   - `MediaSkinName.tsx` - React component
   - `styles.ts` - Tailwind classes focused on ONE feature

2. **Compiled output:** `test/e2e/app/src/compiled/XX-name.js`
   - Web Component version
   - Inline CSS with feature validated

3. **HTML demo:** `test/e2e/app/src/wc/XX-name.html`
   - Browser-testable demo
   - Visual verification

4. **Documentation:**
   - Feature description
   - Expected CSS output
   - Known issues/limitations

---

## Success Criteria

A level is "DONE" when:

- ✅ Source skin compiles without errors
- ✅ Output loads in browser without console errors
- ✅ CSS matches expected patterns
- ✅ Feature works as documented
- ✅ Visual comparison passes (if applicable)
- ✅ Tests added to test suite

---

## Estimated Timeline

**Phase 1 (Critical):** 6 levels × 2-4 hours each = 12-24 hours
**Phase 2 (Polish):** 3 levels × 1-2 hours each = 3-6 hours

**Total:** 15-30 hours of focused work to reach production parity

---

## Known Limitations

Some features may be impossible or impractical:

1. **Custom variants** (reduced-transparency, contrast-more)
   - May require PostCSS plugin system
   - Consider if worth the complexity

2. **Text shadows** (text-shadow, text-shadow-2xs)
   - Likely a custom Tailwind plugin
   - May not be standard Tailwind

3. **Hocus pseudo-class** (hover OR focus)
   - Custom variant
   - May need special handling

---

## Next Actions

1. **Create Level 7 (color-opacity)** - Quick win, should mostly work
2. **Create Level 8 (before-after)** - Complex, may require parser changes
3. **Create Level 9 (has-selector)** - Complex, modern CSS feature
4. **Create Level 10 (named-groups)** - Very complex, core Tailwind feature
5. **Create Level 11 (aria-states)** - Should be straightforward
6. **Create Level 12 (named-containers)** - Complex, requires container system

After each level, commit and validate before moving to next.
