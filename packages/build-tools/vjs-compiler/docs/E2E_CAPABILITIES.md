# E2E Validation Capabilities

**Purpose:** Document what we CAN and CANNOT validate end-to-end today.

**Last Updated:** 2025-10-08

---

## What We CAN Validate E2E (Today)

### ✅ Basic Compilation Pipeline

- **React + Tailwind → Web Component + Vanilla CSS**
- **Test:** `pnpm test -- compile-for-e2e.test.ts`
- **Demo:** `test/e2e/equivalence/demos/wc-demo.html`
- **Status:** Works

### ✅ Browser Loading (Web Component)

- **Load WC demo in browser**
- **Test:** Manual - open `wc-demo.html` in browser
- **Validation:** Zero console errors, custom element registered
- **Status:** Works

### ✅ Browser Loading (React)

- **Load React demo with Vite dev server**
- **Test:** `cd test/e2e/equivalence/demos/react-demo && pnpm dev`
- **Validation:** Zero console errors, renders without errors
- **Status:** Works (dependencies now installed)

### ✅ Simple Tailwind Utilities

- **Utilities:** `p-4`, `rounded-lg`, `flex`, `gap-2`
- **Test:** Integration tests + manual visual check
- **Validation:** CSS generates correctly, visual output matches
- **Status:** Works

### ✅ Pseudo-Class Variants

- **Variants:** `:hover`, `:focus-visible`, `:active`
- **Test:** Conditional styles test (11/12 passing)
- **Validation:** CSS generates with pseudo-class selectors
- **Status:** Works (tests pass)

### ✅ Data Attribute Variants

- **Variants:** `data-[state=active]:bg-blue`
- **Test:** Conditional styles test
- **Validation:** CSS generates with attribute selectors
- **Status:** Works (tests pass)

### ✅ Dark Mode (Media Queries)

- **Variant:** `dark:bg-gray-900`
- **Test:** Conditional styles test
- **Validation:** CSS wrapped in `@media (prefers-color-scheme: dark)`
- **Status:** Works (tests pass)

---

## What We CANNOT Validate E2E (Today)

### ❌ Arbitrary Variant Selectors

- **Variants:** `[&_.child]:opacity-0`, `[&[data-x]_.child]:opacity-100`
- **Why:** Tailwind v4 doesn't generate CSS for these (needs full HTML context)
- **Impact:** State-based icon visibility (play/pause icons, mute states)
- **Test:** Conditional styles test (5 tests skipped)
- **E2E Gap:** Cannot compare React vs WC for this feature (doesn't work in WC)
- **Workaround:** Must port v1's custom Tailwind AST parser OR build full HTML context

### ❌ Automated E2E Testing (Playwright)

- **What:** Automated screenshot comparison and interaction testing (React vs WC)
- **Why:** Requires real build environment - cannot use `file://` with ES modules
- **What's Needed:**
  - Vite/bundler setup for test pages (like react-demo has)
  - Real package imports (`@vjs-10/html`, `@vjs-10/html-icons`)
  - Real component implementations (not stubs)
  - Dev server or bundled build (not static HTML files)
- **Impact:** Manual validation only (time-consuming, error-prone)
- **E2E Gap:** 11 Playwright tests written but infrastructure incomplete
- **Current Workaround:** Manual side-by-side comparison using demos
- **Why This Is Correct:** E2E tests are integration tests, not unit tests
  - They SHOULD require real packages and build tools
  - They SHOULD test realistic usage scenarios
  - Stub-based approach was wrong - learned this in Phase 1 work
- **Next Step:** Set up Vite build for test pages OR adapt demos for Playwright

### ✅ Import Generation & Base Template (PHASE 1 COMPLETE - 2025-10-08)

- **What:** Generated modules include correct relative imports and base template
- **Status:** ✅ IMPLEMENTED (Phase 1)
- **Implementation:**
  - `calculateRelativePath()` - Pure function for relative path calculation
  - `resolveImportPath()` - Category-based import transformation
  - `includeBaseTemplate` - Generates `${MediaSkin.getTemplateHTML()}`
  - 29 tests passing (22 path calc + 7 projection)
- **E2E Status:** ✅ Can validate import correctness
- **Remaining Work:** Phase 2 (package mapping), Phase 3 (external mode)

### ❌ Container Queries

- **Variants:** `@container(min-width:400px):flex-row`
- **Why:** Not implemented in v2 (Phase 3+ feature)
- **Impact:** Responsive container-based layouts don't work
- **E2E Gap:** Cannot compare React vs WC for this feature
- **Workaround:** Use media queries instead

---

## Current E2E Validation Approach (2025-10-08)

Since Playwright tests are blocked on infrastructure, we use **manual E2E validation**:

### Manual E2E Validation Process

1. **Compile Test Skin**

   ```bash
   pnpm test -- compile-for-e2e.test.ts
   ```

   - Compiles `MediaSkinDefault` from React + Tailwind to WC + Vanilla CSS
   - Output: `test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js`

2. **Load Web Component Demo**

   ```bash
   open test/e2e/equivalence/demos/wc-demo.html
   ```

   - Loads compiled WC skin with inline CSS
   - Check browser console for errors (should be zero)
   - Verify: Custom element registers, media controls visible

3. **Load React Demo**

   ```bash
   cd test/e2e/equivalence/demos/react-demo && pnpm dev
   # Opens at http://localhost:5174
   ```

   - Loads React skin with Tailwind CSS
   - Check browser console for errors (should be zero)
   - Verify: React renders without errors, media controls visible

4. **Visual Comparison**
   - Open both demos side-by-side
   - Compare: Layout, spacing, colors, typography
   - Test: Hover states, focus states, active states
   - Test: Play/pause, volume, seek interactions
   - Test: Data attribute states (paused, muted, etc.)

5. **Document Results**
   - Record in commit message: "E2E validated manually (React demo + WC demo)"
   - Update E2E_CAPABILITIES.md if new capabilities validated

### Limitations of Manual Validation

- ❌ No pixel-perfect comparison (human error prone)
- ❌ No automated regression detection
- ❌ Time-consuming (5-10 minutes per feature)
- ❌ Can't run in CI/CD
- ✅ Better than no validation at all
- ✅ Catches major visual/functional regressions
- ✅ Validates browser loadability

**Goal:** Move to automated Playwright tests once page infrastructure is complete.

---

## E2E Validation Roadmap

### Phase 1: Make Current E2E Tests Runnable (This Week) ⚠️ BLOCKED

- [x] Install React demo dependencies
- [x] Install Playwright test packages (@playwright/test, playwright 1.56.0)
- [x] Fix Playwright config (testDir, version mismatches)
- [x] Fix `__dirname` errors in ES module tests (use `import.meta.url`)
- [x] Install Playwright browsers (`npx playwright install chromium`)
- [x] Verify tests load: 11 Playwright tests ready to run
- [x] Attempt to run `pnpm test:e2e`
- [ ] **BLOCKED:** Tests timeout (120s) because test pages are incomplete
  - Missing: Web component module imports in HTML pages
  - Missing: React app compilation/build
  - Issue: Remote video URLs cause network delays
  - Issue: Custom elements never register (no imports)

### Phase 2: Fill E2E Test Gaps (Next 2 Weeks)

- [ ] Add Playwright visual regression tests (screenshot comparison)
- [ ] Add Playwright interaction tests (button clicks, keyboard nav)
- [ ] Set up baseline screenshots for comparison
- [ ] Add CI pipeline to run e2e tests on every PR

### Phase 3: Fix Arbitrary Variant Support (Week 3-4)

- [ ] Document v1 approach in LESSONS_FROM_V1.md
- [ ] Choose approach (port v1 parser vs HTML context vs hybrid)
- [ ] Implement chosen approach
- [ ] Validate with e2e tests (icon visibility, state-based styles)

### Phase 4: Production Deployment Validation (Week 5-6)

- [ ] Implement import generation
- [ ] Implement base template inclusion
- [ ] Test production build (not just dev demos)
- [ ] Validate deployment to actual web server

---

## E2E Validation Success Criteria

A feature is **e2e validated** when:

1. ✅ **Both demos load** - React and WC demos load without errors
2. ✅ **Visual equivalence** - Side-by-side comparison shows identical appearance
3. ✅ **Functional equivalence** - Interactions work identically in both demos
4. ✅ **Automated test exists** - Playwright test captures this validation
5. ✅ **Test passes consistently** - Test runs on every commit and passes

A feature is **NOT e2e validated** if:

- ❌ Only one demo works (WC or React, but not both)
- ❌ Manual testing only (no automated test)
- ❌ Test is skipped or commented out
- ❌ Test has known failures
- ❌ Works in fixture but not in real demo

---

## Using This Document

**Before implementing a feature:**

1. Check "What We CAN Validate" - Can I test this?
2. Check "What We CANNOT Validate" - Is this a known gap?
3. Plan e2e validation approach BEFORE coding

**After implementing a feature:**

1. Update this document with e2e validation status
2. Add to "What We CAN Validate" if fully e2e tested
3. Add to "What We CANNOT Validate" if gaps exist
4. Update KNOWN_LIMITATIONS.md if feature doesn't work

**Review this document:**

- Weekly: Update status as capabilities change
- Before each release: Ensure no false claims of e2e validation
