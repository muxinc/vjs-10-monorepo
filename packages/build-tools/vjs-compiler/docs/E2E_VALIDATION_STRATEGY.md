# E2E Validation Strategy: React vs Web Component Equivalence

## Goal

Validate that compiled web components are "appropriately equivalent" to their React counterparts across functional, compositional, and stylistic dimensions.

## Test Dimensions

### 1. Functional Equivalence

Validate that user interactions produce equivalent results.

**Test Cases:**

- Play/pause button functionality
- Mute/unmute button functionality
- Seek functionality (time range interaction)
- Volume control (volume range interaction)
- Fullscreen toggle
- Keyboard navigation (tab, space, enter, arrow keys)

**Validation Method:**

- Trigger same interactions in both versions
- Compare resulting media element state (paused, muted, currentTime, volume)
- Compare resulting data attributes on components

### 2. State Change Equivalence

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

### 3. Computed Styles Equivalence

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
- `data-*` attribute selectors (`[data-paused]`, `[data-muted]`)
- Container query styles (`@container`)
- Group selectors (`group-hover`, `has-[]`)
- Arbitrary variant selectors (`[&_selector]`)

**Validation Method:**

- `getComputedStyle()` on matching elements
- Compare critical style properties
- Allow for acceptable differences (e.g., shadow DOM scoping)

### 4. Visual Regression Testing

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

## Test Infrastructure Requirements

### Component Rendering Setup

**React Version:**

```tsx
<MediaProvider>
  <MediaSkinDefault className="rounded-4xl shadow-lg">
    <Video src="test-video.mp4" />
  </MediaSkinDefault>
</MediaProvider>
```

**Web Component Version:**

```html
<media-provider>
  <media-skin-default class="rounded-4xl shadow-lg">
    <video slot="media" src="test-video.mp4"></video>
  </media-skin-default>
</media-provider>
```

### Shared Test Environment

**Requirements:**

1. Vite dev server for React version
2. Static HTML server for WC version
3. Playwright for browser automation
4. Shared test video file (deterministic duration, content)
5. Shared Tailwind configuration
6. Viewport size consistency (1280x720)

### Test Utilities

**Element Matchers:**

- Map React component hierarchy to WC element hierarchy
- Handle shadow DOM traversal for WC version
- Extract comparable elements from both versions

**Style Comparator:**

- Extract computed styles for critical properties
- Normalize values (e.g., rgb → hex, px → numeric)
- Report differences with context

**State Simulator:**

- Trigger media state changes programmatically
- Simulate hover/focus states via JS
- Wait for state propagation

## Test Structure

### Directory Layout

```
test/e2e/
├── equivalence/
│   ├── fixtures/
│   │   ├── test-video.mp4
│   │   └── shared-tailwind.css
│   ├── pages/
│   │   ├── react-skin-default.html
│   │   └── wc-skin-default.html
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

### Test Execution Flow

1. **Setup Phase**
   - Start Vite dev server (React)
   - Start static server (WC)
   - Open two Playwright browser contexts
   - Load both pages with same test video

2. **Baseline Phase**
   - Capture initial state
   - Extract baseline computed styles
   - Take baseline screenshots

3. **Interaction Phase**
   - Trigger same interactions in parallel
   - Validate state changes
   - Validate style changes
   - Validate visual changes

4. **Comparison Phase**
   - Compare computed styles
   - Compare screenshots
   - Compare DOM attributes
   - Report differences

## Critical Style Properties to Compare

### Layout

- `position`, `display`, `flex-direction`, `align-items`, `justify-content`
- `width`, `height`, `min-width`, `max-width`
- `margin`, `padding`, `gap`

### Visual

- `background-color`, `color`, `opacity`
- `border-radius`, `border-width`, `border-color`
- `box-shadow`, `backdrop-filter`

### Transform/Animation

- `transform`, `translate`, `scale`, `rotate`
- `transition-property`, `transition-duration`
- `animation-name`, `animation-duration`

### Conditional

- Styles under `[data-paused]`
- Styles under `:hover` (simulated)
- Styles under `:focus-visible` (simulated)
- Styles under `@container` queries

## Acceptable Differences

### Expected Differences (Non-Issues)

- Shadow DOM scoping differences
- Specific color value formats (rgb vs hex)
- Sub-pixel rendering differences (<1px)
- Font rendering hinting differences
- Browser-specific default values

### Unacceptable Differences (Failures)

- Layout shifts (position, size)
- Missing colors or backgrounds
- Missing visual effects
- Incorrect state-based styling
- Broken responsive/container queries

## Success Criteria

**Functional:** All interactions produce equivalent media state
**State:** All data attributes match under same conditions
**Style:** <1% difference in critical computed style properties
**Visual:** <2% pixel difference in screenshots (after normalization)

## Implementation Phases

### Phase 1: Basic Infrastructure ✅ COMPLETE

- Playwright configuration
- Test directory structure
- Basic browser automation setup

### Phase 2: Test Utilities ✅ COMPLETE

- ElementMatcher: Shadow DOM traversal and element pairing
- StyleComparator: Computed style comparison with normalization
- StateSimulator: Media state control and pseudo-state simulation

### Phase 3: Test Cases ✅ COMPLETE

- State equivalence tests (4 cases)
- Style equivalence tests (7 cases)
- Test HTML page templates

### Phase 4: Component Integration ✅ COMPLETE

**Status:** Demo applications created and ready for testing

**Completed:**

- ✅ MediaSkinDefault compiled to browser-compatible JS (14.9KB)
- ✅ Test HTML page templates created
- ✅ Compilation test writes to fixtures/compiled/
- ✅ **Web Component demo** (wc-demo.html) - Static HTML loading compiled component
- ✅ **React demo** (react-demo/) - Vite app with stub MediaSkinDefault component
- ✅ Both demos use identical video source and matching structure
- ✅ React demo uses extracted CSS from WC output for equivalence

**Demo Locations:**

- WC: `test/e2e/equivalence/demos/wc-demo.html`
- React: `test/e2e/equivalence/demos/react-demo/`

**Next Steps:**

1. Install React demo dependencies (`cd react-demo && npm install`)
2. Update E2E test pages to point to demo URLs
3. Execute Playwright tests (`npm run test:e2e`)

### Phase 5: Style Testing ⏳ READY (Tests Written)

- All test cases implemented
- Waiting for component integration to execute

### Phase 6: Visual Testing ⏳ PLANNED

- Screenshot comparison
- Pixel diff analysis
- Visual regression detection

### Phase 7: Interaction Testing ⏳ PLANNED

- User interaction simulation
- Keyboard navigation
- Accessibility validation

## Notes

- Tests must be deterministic (no flaky failures)
- Use fixed-duration test videos with known content
- Pause video playback for screenshot comparisons
- Allow configurable tolerance thresholds
- Provide detailed failure reports with diffs
