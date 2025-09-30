# Option A vs B: Strategic Analysis

**Date:** 2025-10-08
**Question:** Which should we do first - Option A (fix test pages) or Option B (package mapping)?

---

## Quick Answer: **Option A First** (Fix Test Pages)

**Reasoning:** Package mapping is currently a non-issue because the E2E fixture doesn't use any package imports.

---

## Evidence

### Current E2E Fixture Analysis

Looking at `test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js`:

```javascript
// Line 18: "Compiled web component (imports removed for browser use)"

class MediaSkin extends HTMLElement {
  /* stub */
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>/* CSS */</style>
    <media-container>...</media-container>
  `;
}
```

**Key Observations:**

1. ✅ No `@vjs-10/react-icons` imports present
2. ✅ No `@vjs-10/html-icons` imports present
3. ✅ MediaSkin is stubbed directly in the file
4. ✅ No component imports (they're commented as "removed for browser use")

**Conclusion:** The E2E fixture is intentionally simplified for browser testing. It doesn't import any packages that need mapping.

---

## Why Option A is Sufficient for E2E Testing

### What the E2E Tests Need

**Playwright tests are checking:**

1. **State synchronization** - Does play/pause/mute work the same?
2. **Style equivalence** - Do computed styles match?
3. **Visual comparison** - Do they look the same?

**What the E2E tests DON'T need:**

- ❌ Real icon package imports
- ❌ Real component imports
- ❌ Package name transformations

### Why the Fixture Works As-Is

The E2E fixture (`MediaSkinDefault.browser.js`) is a **self-contained browser module** that:

- Has MediaSkin stubbed in the same file
- Has all HTML/CSS inlined
- Doesn't depend on external packages
- Can load directly in a browser

**This is by design** - it's a minimal test fixture.

---

## What Option A Would Fix

**Current Blocker:**

```html
<!-- test/e2e/equivalence/pages/wc-skin-default.html -->
<body>
  <media-skin-default>...</media-skin-default>

  <!-- ❌ MISSING: Import statement -->
  <script type="module">
    window.__E2E_TEST_PAGE__ = 'web-component';
  </script>
</body>
```

**After Option A:**

```html
<body>
  <media-skin-default>
    <video slot="media" src="..."></video>
  </media-skin-default>

  <!-- ✅ FIXED: Import the compiled fixture -->
  <script type="module">
    import '../fixtures/compiled/MediaSkinDefault.browser.js';

    window.__E2E_TEST_PAGE__ = 'web-component';
  </script>
</body>
```

**This alone would:**

- ✅ Make custom element register
- ✅ Make component render
- ✅ Unblock all 11 Playwright tests
- ✅ Enable state/style/visual comparison

**No package mapping needed!**

---

## When Would We Need Option B (Package Mapping)?

**Scenario 1: Production Skin Compilation**

```typescript
// Input: packages/react/react/src/skins/MediaSkinDefault.tsx

// Output: packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts
import { PauseIcon, PlayIcon } from '@vjs-10/html-icons'; // ← Needs mapping
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
```

**Scenario 2: Full E2E Test (Not Current Fixture)**

```typescript
// If we were testing the REAL production compilation:
import '@vjs-10/html-icons/play.js'; // ← Would need package mapping
import '@vjs-10/html-icons/pause.js';
```

**But the current E2E fixture doesn't do this!** It's a simplified browser-compatible version.

---

## Strategic Recommendation

### Do Option A First

**Benefits:**

1. **Immediate E2E Validation**
   - Unblocks all 11 Playwright tests
   - Can validate state/style/visual equivalence
   - Proves the compiler pipeline works end-to-end

2. **Validates Phase 1 Work**
   - Confirms import generation works in browser
   - Confirms base template works
   - Tests actual output in real browser

3. **Establishes Test Infrastructure**
   - Once test pages work, we have a baseline
   - Can add more tests incrementally
   - Can run in CI/CD

4. **Faster Feedback Loop**
   - Estimated: 1-2 hours for Option A
   - Can validate immediately
   - Low risk

### Then Do Option B

**After Option A proves the pipeline works:**

1. Add package mapping for production skins
2. Test with real `@vjs-10/react-icons` → `@vjs-10/html-icons`
3. Validate in actual production context

**Benefits of Doing B Second:**

1. **Informed Implementation**
   - Know the E2E tests work (from Option A)
   - Can add tests for package mapping
   - Can validate mapping works in E2E context

2. **Independent Validation**
   - Option A proves basic pipeline
   - Option B adds production feature
   - Each can be validated separately

3. **Lower Risk**
   - If Option B breaks something, we know Option A works
   - Can roll back Option B without losing Option A
   - Clear separation of concerns

---

## Implementation Plan

### Phase 1: Option A (1-2 hours)

**Step 1: Update WC Test Page (30 min)**

```html
<!-- test/e2e/equivalence/pages/wc-skin-default.html -->
<script type="module">
  import '../fixtures/compiled/MediaSkinDefault.browser.js';
</script>
```

**Step 2: Update React Test Page (30 min)**

- Either build React demo statically
- Or use Vite dev server with proper URLs
- Or create simplified React fixture

**Step 3: Fix Video Loading (15 min)**

- Use local video file or data URL
- Or mock video element for tests

**Step 4: Run Tests (15 min)**

- `pnpm test:e2e`
- Validate at least some tests pass
- Document results

### Phase 2: Option B (2-3 hours)

**After Option A is working:**

**Step 1: Add Package Mapping Config**

```typescript
export interface PackageMapping {
  from: string; // '@vjs-10/react-icons'
  to: string; // '@vjs-10/html-icons'
}
```

**Step 2: Update resolveImportPath()**

```typescript
if (category === 'vjs-icon-package') {
  return applyPackageMapping(source, config.packageMappings);
}
```

**Step 3: Test with Production Skin**

- Compile actual MediaSkinDefault from react/react
- Verify icon imports are transformed
- Validate in browser

**Step 4: Add E2E Tests for Mapping**

- Create fixture with icon imports
- Verify mapping works
- Add to test suite

---

## Risk Analysis

### Option A First (Low Risk)

**Risks:**

- Test pages might need more work than expected
- React demo setup might be complex
- Video loading might be tricky

**Mitigations:**

- Start with WC page only (simpler)
- Use existing demos if test pages too complex
- Mock video if needed

### Option B First (Higher Risk)

**Risks:**

- Can't validate without working E2E tests
- Might break existing output
- Harder to debug without E2E feedback

**Why Higher Risk:**

- Need E2E tests to validate package mapping
- Option A gives us that validation infrastructure
- Doing B first means blind implementation

---

## Conclusion

**Do Option A First** because:

1. ✅ **Sufficient for E2E testing** - Current fixture doesn't need package mapping
2. ✅ **Faster validation** - Get E2E tests working in 1-2 hours
3. ✅ **Lower risk** - Proves pipeline before adding complexity
4. ✅ **Better feedback** - Can validate Option B using Option A's infrastructure

**Then Do Option B** because:

1. ✅ **Production feature** - Needed for real skin compilation
2. ✅ **Can be validated** - E2E tests from Option A will work
3. ✅ **Independent** - Won't break Option A's tests
4. ✅ **Informed** - Know what works from Option A

**Time Estimate:**

- Option A: 1-2 hours
- Option B: 2-3 hours
- Total: 3-5 hours (vs 5-6 hours if done in parallel with debugging)

**We'll have E2E tests working after 1-2 hours, then can add production features with confidence.**
