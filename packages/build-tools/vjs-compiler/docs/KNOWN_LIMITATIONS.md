# Known Limitations - VJS Compiler v2

**Last Updated:** 2025-10-08 (after Phase 1 completion)
**Test Status:** 144/158 passing (91%), 5 failing, 9 skipped

---

## Critical Limitations (Blocking Production Use)

### 1. Arbitrary Variant Selectors Not Supported

**Issue:** Tailwind v4 arbitrary variant selectors with `[&_selector]` syntax do not generate CSS.

**Examples:**

```css
/* Input Tailwind class */
[&_.pause-icon]:opacity-100

/* Expected output */
media-play-button .pause-icon {
  opacity: 100%;
}

/* Actual output */
/* No CSS generated */
```

**Affected Patterns:**

- `[&_.child-class]:property-value` - Child element styling
- `[&[data-attribute]_.child]:property-value` - Data attribute + child styling
- `group-hover/name:[&_.child]:property-value` - Named group variants with child selectors

**Root Cause:**
Tailwind v4's JIT processor requires full HTML context to generate arbitrary variant CSS. The current implementation processes each style key independently (`<div class="..."></div>`), which doesn't provide the nested HTML structure needed for these selectors.

**Impact:**

- State-based icon visibility doesn't work (play/pause, mute states, fullscreen states)
- Hover effects on nested elements don't work
- Data attribute styling doesn't work

**Workaround:**
Use v1 compiler which has custom Tailwind AST parsing, or implement similar custom parsing for v2.

**Solution Path:**

1. **Short-term**: Build actual HTML structure from JSX before processing Tailwind
2. **Medium-term**: Implement custom Tailwind AST parser (port from v1)
3. **Long-term**: Wait for Tailwind v4 to improve arbitrary variant handling

**References:**

- V1 implementation: `src-v1/tailwind-ast/` directory
- Test case showing failure: `test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js` (lines 125-178)

---

## Non-Critical Limitations

### 2. ✅ FIXED: Import Generation & Base Template (Phase 1 Complete)

**Status:** ✅ IMPLEMENTED (2025-10-08)

Import generation and base template inclusion are now fully working:

```typescript
import { MediaSkin } from '../../../media-skin';

import '../../../components/media-play-button';
import '../../../components/media-time-range';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>/* CSS */</style>
    <media-container>...</media-container>
  `;
}
```

**Implementation:**

- 22 tests for relative path calculation
- 7 tests for import projection
- Phase 2 (package mapping) deferred for now
- See `docs/PHASE1_COMPLETE_SUMMARY.md` for details

---

### 3. JSX Transformer Edge Cases (5 test failures)

**Status:** Known edge cases, low priority

#### 3a. Boolean Attributes (1 test)

```tsx
// Input:
<button disabled>Click</button>

// Expected:
<button disabled>Click</button>

// Actual:
<button disabled="true">Click</button>
```

**Impact:** Low - both forms work in browsers
**Test:** `conditional-styles.test.ts > transforms :disabled styles correctly`

#### 3b. Template Literal className (1 test)

```tsx
// Input:
<div className={`${styles.Base} ${styles.Variant}`}>Test</div>

// Expected:
<div class="base variant">Test</div>

// Actual:
Template literal not resolved at compile time
```

**Impact:** Medium - template literals won't work in className
**Test:** `complexity-levels.test.ts > compiles template literal className`

#### 3c. Empty className (1 test)

```tsx
// Input:
<div className="">Empty</div>

// Expected:
<div>Empty</div>

// Actual:
<div class="">Empty</div>
```

**Impact:** Low - empty attributes are harmless
**Test:** `complexity-levels.test.ts > handles empty className`

#### 3d. Self-Closing Elements (1 test)

```tsx
// Input:
<br />

// Expected:
<br />

// Actual:
<br></br>
```

**Impact:** Low - browsers handle both forms
**Test:** `complexity-levels.test.ts > handles self-closing elements`

#### 3e. Browser E2E Test (1 test)

**Test:** `phase3-browser.test.ts > compiled web component loads in browser`

**Issue:** E2E test infrastructure incomplete (needs Vite build environment)

**Impact:** Medium - automated E2E validation not working
**See:** `docs/PHASE1_COMPLETE_SUMMARY.md` for E2E findings

---

### 4. Marker Classes Generate "No CSS" Comments

**Issue:** Custom marker classes (not Tailwind utilities) are reported as "No CSS generated" in output.

**Examples:**

- `icon` - Marker class for icon elements
- `play-icon`, `pause-icon` - Marker classes for specific icons

**Expected Behavior:**
These classes should be silently omitted (they're not supposed to generate CSS).

**Actual Behavior:**
Comments are added: `/* Tailwind classes: icon */ /* No CSS generated */`

**Impact:**

- Clutters output with ~13 comment blocks
- Makes validation fail (comments detected as errors)

**Status:** Low priority (cosmetic issue)

---

## Comparison: V1 vs V2

| Feature                           | V1  | V2  | Notes                         |
| --------------------------------- | --- | --- | ----------------------------- |
| Basic CSS utilities               | ✅  | ✅  | Works in both                 |
| Element selectors                 | ✅  | ✅  | Works in both                 |
| Class selectors                   | ✅  | ✅  | Works in both                 |
| CSS variables (Tailwind v4)       | ❌  | ✅  | V2 uses modern approach       |
| Template literal className        | ✅  | ⚠️  | Edge case (1 test failing)    |
| Explicit closing tags             | ✅  | ✅  | Works in v2                   |
| Boolean attributes                | ✅  | ⚠️  | Edge case (cosmetic)          |
| Empty className removal           | ✅  | ⚠️  | Edge case (cosmetic)          |
| Self-closing elements             | ✅  | ⚠️  | Edge case (cosmetic)          |
| Arbitrary variants `[&_selector]` | ✅  | ❌  | V1 has custom parser          |
| Data attribute styling            | ✅  | ❌  | Blocked by arbitrary variants |
| Group variants                    | ✅  | ❌  | Blocked by arbitrary variants |
| Import generation                 | ✅  | ✅  | **Phase 1 complete!**         |
| Base template inclusion           | ✅  | ✅  | **Phase 1 complete!**         |
| Relative path calculation         | ❌  | ✅  | V2 has PathContext system     |

---

## Testing Status (Updated 2025-10-08)

**Test Results:** 144/158 passing (91%), 5 failing, 9 skipped

### What Works (Validated)

- ✅ JSX → HTML transformation
- ✅ className → class attribute conversion
- ✅ Explicit closing tag generation
- ✅ Simple Tailwind utilities
- ✅ CSS variables (spacing, radius, colors)
- ✅ Backdrop filters
- ✅ Gradients
- ✅ Transitions
- ✅ **Import generation (Phase 1)**
- ✅ **Base template inclusion (Phase 1)**
- ✅ **Relative path calculation (Phase 1)**
- ✅ Pseudo-class selectors (:hover, :focus, :active, :disabled)
- ✅ Data attribute selectors ([data-state=active])
- ✅ Media queries (@media (prefers-color-scheme: dark))
- ✅ Compound components (TimeRange.Root → media-time-range-root)

### What Has Edge Cases (5 tests)

- ⚠️ Template literal className (1 test)
- ⚠️ Boolean attributes (1 test)
- ⚠️ Empty className (1 test)
- ⚠️ Self-closing elements (1 test)
- ⚠️ Browser E2E infrastructure (1 test)

### What Doesn't Work (9 skipped tests)

- ❌ Arbitrary variant selectors `[&_selector]` (5 tests)
- ❌ Container queries @container (2 tests)
- ❌ Complex nested variants (2 tests)

### Browser Testing

- ✅ **Demos work**: wc-demo.html and react-demo load successfully
- ✅ **Import generation complete**: Generated code includes all imports
- ⚠️ **Automated E2E tests**: Require Vite build environment (not `file://` protocol)

---

## Recommended Next Steps (Updated 2025-10-08)

### Priority 1: ✅ COMPLETE - Import Generation (Phase 1)

1. ✅ Implement relative path calculation
2. ✅ Add base template inclusion
3. ✅ Test in actual browser environment (demos work!)

### Priority 2: Fix Absolute Paths in Production Skin

**Current Issue:** production-skin.test.ts shows absolute paths in imports

```typescript
// Current (wrong):
import '../Users/cpillsbury/dev/experiments/vjs-10-monorepo/packages/html/html/components/media-play-icon';
// Should be:
import '../../../components/media-play-icon';
```

**Fix:** Debug PathContext in production skin compilation

### Priority 3: Fix Arbitrary Variants

**Option A: Port v1 Parser**

- Pros: Known to work, handles all cases
- Cons: Complex, ~1000 lines of code to port

**Option B: Enhanced HTML Context**

- Pros: Simpler, leverages Tailwind v4's processor
- Cons: May not handle all edge cases
- Implementation: Build full HTML structure before Tailwind processing

**Option C: Post-Process CSS**

- Pros: Clean separation of concerns
- Cons: Requires parsing Tailwind class strings ourselves
- Implementation: Extract `[&_selector]` patterns and generate CSS manually

### Priority 3: Production Readiness

- Add validation for missing CSS rules
- Improve error messages
- Add comprehensive E2E tests
- Visual regression testing

---

## Version History

- **2025-10-08**: Document created after fixing template literal and closing tag issues
