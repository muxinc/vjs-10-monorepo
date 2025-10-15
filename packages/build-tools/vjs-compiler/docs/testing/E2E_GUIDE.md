# E2E Testing Guide

**Last Updated:** 2025-10-15

Comprehensive guide to end-to-end testing for the VJS Framework Compiler: validating React → Web Component equivalence.

---

## Table of Contents

1. [Overview](#overview)
2. [E2E Test Architecture](#e2e-test-architecture)
3. [Validation Strategy](#validation-strategy)
4. [Manual Validation Process](#manual-validation-process)
5. [Test Infrastructure](#test-infrastructure)
6. [Roadmap](#roadmap)
7. [Success Criteria](#success-criteria)

---

## Overview

### What is E2E Testing for This Compiler?

E2E testing validates that compiled Web Component skins are **appropriately equivalent** to their React counterparts across functional, compositional, and stylistic dimensions.

**NOT**: Unit tests with stubs
**YES**: Integration tests with real packages, real build tools, real components

### Why This Matters

The compiler transforms:
- **Input:** React + TSX + Tailwind CSS v4
- **Output:** Web Components + Inline Vanilla CSS

E2E tests ensure the output works identically to the input in real browser environments.

**For current feature support status**, see:
- **Tailwind features**: `docs/tailwind/SUPPORT_STATUS.md`
- **Compiler limitations**: `docs/CURRENT_STATUS.md (Known Limitations section)`

---

## E2E Test Architecture

### Key Insight: Integration Tests, Not Unit Tests

**CRITICAL:** E2E tests are **integration tests** requiring real build environments.

**Why Real Build Environment?**

1. **Real Package Imports**
   ```typescript
   import { MediaSkin } from '@vjs-10/html';
   import '@vjs-10/html/components/media-play-button';
   ```
   - Need Vite/bundler to resolve `@vjs-10/*` monorepo packages
   - Cannot use `file://` protocol with raw ES modules
   - Need dev server or static build with bundled dependencies

2. **Real Component Implementations**
   - All `media-*` components need working implementations from `@vjs-10/html`
   - Cannot use empty HTMLElement stubs for state/interaction testing
   - Components must handle video element communication

3. **Real CSS Processing**
   - Tailwind must process actual HTML structures
   - Shadow DOM styles must be encapsulated correctly
   - CSS variables must resolve correctly

### Why Browser-Compatible Stubs Don't Work

Our attempt to create self-contained fixtures failed because:

- ❌ Components like `<media-play-button>` need real implementations
- ❌ Video state synchronization requires component logic
- ❌ Cannot test CSS/interaction without functional components
- ❌ Stubbing 25+ components defeats the purpose of integration testing

**This is CORRECT** - we want integration testing, not unit testing.

---

## Validation Strategy

### Test Dimensions

#### 1. Functional Equivalence

Validate that user interactions produce equivalent results.

**Test Cases:**
- Play/pause button functionality
- Mute/unmute button functionality
- Seek functionality (time range interaction)
- Volume control
- Fullscreen toggle
- Keyboard navigation (tab, space, enter, arrow keys)

**Validation Method:**
- Trigger same interactions in both versions
- Compare resulting media element state (paused, muted, currentTime, volume)
- Compare resulting data attributes on components

#### 2. State Change Equivalence

Validate that media state changes trigger correct visual updates.

**Test Cases:**
- `data-paused` attribute when video paused
- `data-muted` attribute when video muted
- `data-fullscreen` attribute when fullscreen
- Progress bar updates during playback
- Volume slider reflects volume changes
- Time displays update correctly

**Validation Method:**
- Monitor data attributes on elements
- Use MutationObserver to track attribute changes
- Compare attribute state between React and WC versions

#### 3. Computed Styles Equivalence

Validate that rendered styles match under various conditions.

**Static Styles:**
- Initial render computed styles
- Layout properties (position, display, flex, grid)
- Spacing (margin, padding, gap)
- Sizing (width, height, min/max)
- Colors (background-color, color, border-color)
- Visual effects (opacity, box-shadow, border-radius)

**Conditional Styles:**
- `:hover` states (simulate via JS)
- `:focus-visible` states (simulate via JS)
- `data-*` attribute selectors
- Container query styles (`@container`)
- Group selectors (`group-hover`, `has-[]`)

**Validation Method:**
- `getComputedStyle()` on matching elements
- Compare critical style properties
- Allow for acceptable differences (shadow DOM scoping)

#### 4. Visual Regression Testing

Validate pixel-perfect visual equivalence.

**Test Cases:**
- Initial render screenshot
- Paused state screenshot
- Playing state screenshot
- Hover state screenshot (simulated)
- Focus state screenshot (simulated)
- Fullscreen state screenshot

**Validation Method:**
- Playwright screenshot comparison
- Pixel diff with tolerance threshold
- Visual snapshots stored in repo

---

## Manual Validation Process

Since Playwright tests require infrastructure setup, we currently use **manual E2E validation**:

### Step-by-Step Process

#### 1. Compile Test Skin

```bash
pnpm test -- compile-for-e2e.test.ts
```

- Compiles `MediaSkinDefault` from React + Tailwind to WC + Vanilla CSS
- Output: `test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js`

#### 2. Load Web Component Demo

```bash
open test/e2e/equivalence/demos/wc-demo.html
```

- Loads compiled WC skin with inline CSS
- Check browser console for errors (should be zero)
- Verify: Custom element registers, media controls visible

#### 3. Load React Demo

```bash
cd test/e2e/equivalence/demos/react-demo && pnpm dev
# Opens at http://localhost:5174
```

- Loads React skin with Tailwind CSS
- Check browser console for errors (should be zero)
- Verify: React renders without errors, media controls visible

#### 4. Visual Comparison

Open both demos side-by-side and compare:
- **Layout:** Spacing, positioning, sizing
- **Colors:** Backgrounds, text, borders
- **Typography:** Font sizes, weights, line heights
- **Interactions:** Hover states, focus states, active states
- **Functionality:** Play/pause, volume, seek, fullscreen
- **State Management:** Data attribute states (paused, muted, etc.)

#### 5. Document Results

- Record in commit message: "E2E validated manually (React demo + WC demo)"
- Update this document if new capabilities validated
- File issues for any discrepancies found

### Limitations of Manual Validation

- ❌ No pixel-perfect comparison (human error prone)
- ❌ No automated regression detection
- ❌ Time-consuming (5-10 minutes per feature)
- ❌ Cannot run in CI/CD
- ✅ Better than no validation at all
- ✅ Catches major visual/functional regressions
- ✅ Validates browser loadability

---

## Test Infrastructure

### Directory Structure

```
test/e2e/
├── equivalence/
│   ├── fixtures/
│   │   ├── test-video.mp4
│   │   ├── shared-tailwind.css
│   │   └── compiled/
│   │       └── MediaSkinDefault.browser.js
│   ├── demos/
│   │   ├── wc-demo.html              # Static HTML with WC
│   │   └── react-demo/                # Vite app with React
│   ├── utils/
│   │   ├── element-matcher.ts
│   │   ├── style-comparator.ts
│   │   └── state-simulator.ts
│   └── tests/
│       ├── functional-equivalence.test.ts
│       ├── state-equivalence.test.ts
│       ├── style-equivalence.test.ts
│       └── visual-equivalence.test.ts
```

### Test Utilities

**ElementMatcher:**
- Map React component hierarchy to WC element hierarchy
- Handle shadow DOM traversal for WC version
- Extract comparable elements from both versions

**StyleComparator:**
- Extract computed styles for critical properties
- Normalize values (e.g., rgb → hex, px → numeric)
- Report differences with context

**StateSimulator:**
- Trigger media state changes programmatically
- Simulate hover/focus states via JS
- Wait for state propagation

### Critical Style Properties to Compare

**Layout:**
- `position`, `display`, `flex-direction`, `align-items`, `justify-content`
- `width`, `height`, `min-width`, `max-width`
- `margin`, `padding`, `gap`

**Visual:**
- `background-color`, `color`, `opacity`
- `border-radius`, `border-width`, `border-color`
- `box-shadow`, `backdrop-filter`

**Transform/Animation:**
- `transform`, `translate`, `scale`, `rotate`
- `transition-property`, `transition-duration`

**Conditional:**
- Styles under `[data-paused]`, `[data-muted]`
- Styles under `:hover`, `:focus-visible` (simulated)
- Styles under `@container` queries

### Acceptable vs Unacceptable Differences

**Expected Differences (Non-Issues):**
- Shadow DOM scoping differences
- Specific color value formats (rgb vs hex)
- Sub-pixel rendering differences (<1px)
- Font rendering hinting differences
- Browser-specific default values

**Unacceptable Differences (Failures):**
- Layout shifts (position, size)
- Missing colors or backgrounds
- Missing visual effects
- Incorrect state-based styling
- Broken responsive/container queries

---

## Roadmap

### Phase 1: Basic Infrastructure ✅ COMPLETE

- ✅ Playwright configuration
- ✅ Test directory structure
- ✅ Basic browser automation setup
- ✅ Demo applications (WC + React)

### Phase 2: Test Utilities ✅ COMPLETE

- ✅ ElementMatcher: Shadow DOM traversal
- ✅ StyleComparator: Computed style comparison
- ✅ StateSimulator: Media state control
- ✅ Test HTML page templates

### Phase 3: Automated Testing ⏳ IN PROGRESS

**Current Status:**
- 11 Playwright tests written
- Infrastructure needs completion (real build environment)
- Manual validation working

**Next Steps:**
- Set up Vite build for test pages
- Point tests to dev server URLs (not `file://`)
- Ensure real package imports work
- Execute automated Playwright tests

### Phase 4: Tailwind Feature Completion 🎯 HIGH PRIORITY

**Blocking Features:**
1. Named groups (`group/root`, `group-hover/root:`)
2. Has selector (`:has()`)
3. Before/after pseudo-elements (`::before`, `::after`)
4. Container query variants (`@md/root:`)
5. ARIA state selectors (`aria-disabled:`)

**See:** `docs/tailwind/SUPPORT_STATUS.md` for details

### Phase 5: Visual Regression Testing 📋 PLANNED

- Screenshot comparison baseline
- Pixel diff analysis
- Visual regression detection
- State-based screenshot variants

### Phase 6: CI/CD Integration 📋 PLANNED

- Run E2E tests on every PR
- Automated visual regression checks
- Performance benchmarking
- Cross-browser testing

---

## Success Criteria

### Definition of E2E Validated

A feature is **E2E validated** when ALL of these are true:

1. ✅ **Both demos load** - React and WC demos load without errors
2. ✅ **Visual equivalence** - Side-by-side comparison shows identical appearance
3. ✅ **Functional equivalence** - Interactions work identically in both demos
4. ✅ **Automated test exists** - Playwright test captures this validation
5. ✅ **Test passes consistently** - Test runs on every commit and passes

### Validation Thresholds

**Functional:** 100% - All interactions must produce equivalent media state
**State:** 100% - All data attributes must match under same conditions
**Style:** >99% - <1% difference in critical computed style properties
**Visual:** >98% - <2% pixel difference in screenshots (after normalization)

### Not E2E Validated If...

- ❌ Only one demo works (WC or React, but not both)
- ❌ Manual testing only (no automated test)
- ❌ Test is skipped or commented out
- ❌ Test has known failures
- ❌ Works in fixture but not in real demo

---

## Using This Guide

### Before Implementing a Feature

1. Check `docs/tailwind/SUPPORT_STATUS.md` - Is this Tailwind feature supported?
2. Check `docs/CURRENT_STATUS.md (Known Limitations section)` - Are there known testing limitations?
3. Check "Validation Strategy" - How should I test this?
4. Plan E2E validation approach BEFORE coding
5. Ensure feature can be E2E validated (or document limitation)

### After Implementing a Feature

1. Follow "Manual Validation Process" to test
2. Update `docs/tailwind/SUPPORT_STATUS.md` if Tailwind-related
3. Update `docs/CURRENT_STATUS.md (Known Limitations section)` if limitation discovered
4. Create/update automated tests when infrastructure ready

### When Tests Fail

1. Check browser console for errors
2. Compare computed styles between versions
3. Verify component state synchronization
4. Check for Tailwind CSS generation issues
5. File issue with detailed reproduction steps

---

## References

- **Tailwind feature status:** `docs/tailwind/SUPPORT_STATUS.md` (includes test progression)
- **Tailwind investigations:** `docs/tailwind/investigations/`
- **Known limitations:** `docs/CURRENT_STATUS.md (Known Limitations section)`
- **Current status:** `docs/CURRENT_STATUS.md`

---

## Revision History

- **2025-10-15**: Consolidated from E2E_CAPABILITIES.md, E2E_TEST_ARCHITECTURE.md, and E2E_VALIDATION_STRATEGY.md
- **2025-10-10**: Baseline established with simplified demo skins
- **2025-10-08**: Infrastructure improvements, Phase 1 complete
