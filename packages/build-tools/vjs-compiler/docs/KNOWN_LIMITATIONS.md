# Known Limitations - VJS Compiler

**Last Updated:** 2025-10-15 (after Tailwind doc reorganization)
**Test Status:** 144/158 passing (91%), 5 failing, 9 skipped

This document covers **compiler-wide** limitations. For **Tailwind/CSS-specific** limitations, see `docs/tailwind/SUPPORT_STATUS.md`.

---

## Critical Limitations (Blocking Production Use)

### 1. Tailwind Arbitrary Variant Selectors Not Fully Supported

**Issue:** Some Tailwind v4 arbitrary variant selectors with `[&_selector]` syntax do not generate CSS in all cases.

**Status:** See `docs/tailwind/SUPPORT_STATUS.md` for detailed Tailwind feature support matrix.

**Impact:** Some production skin features require workarounds or are unavailable.

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
- See `docs/testing/E2E_GUIDE.md` for E2E test insights

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

**Issue:** E2E test infrastructure requires real build environment (not simple `file://` protocol)

**Impact:** Medium - automated E2E validation requires Vite/bundler setup
**See:** `docs/testing/E2E_GUIDE.md` for why this is correct

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

**For Tailwind feature comparisons**, see `docs/tailwind/SUPPORT_STATUS.md`.

---

## Testing Status (Updated 2025-10-08)

**Test Results:** 144/158 passing (91%), 5 failing, 9 skipped

### What Works (Validated)

- ✅ JSX → HTML transformation
- ✅ className → class attribute conversion
- ✅ Explicit closing tag generation
- ✅ **Import generation (Phase 1)**
- ✅ **Base template inclusion (Phase 1)**
- ✅ **Relative path calculation (Phase 1)**
- ✅ Compound components (TimeRange.Root → media-time-range-root)

### What Has Edge Cases (5 tests)

- ⚠️ Template literal className (1 test)
- ⚠️ Boolean attributes (1 test)
- ⚠️ Empty className (1 test)
- ⚠️ Self-closing elements (1 test)
- ⚠️ Browser E2E infrastructure (1 test)

**For Tailwind-specific features and limitations**, see `docs/tailwind/SUPPORT_STATUS.md`.

### Browser Testing

- ✅ **Demos work**: wc-demo.html and react-demo load successfully
- ✅ **Import generation complete**: Generated code includes all imports
- ⚠️ **Automated E2E tests**: Require Vite build environment (not `file://` protocol) - This is correct! See `docs/testing/E2E_GUIDE.md`

---

## Recommended Next Steps (Updated 2025-10-15)

### Priority 1: ✅ COMPLETE - Import Generation (Phase 1)

1. ✅ Implement relative path calculation
2. ✅ Add base template inclusion
3. ✅ Test in actual browser environment (demos work!)

### Priority 2: Tailwind Feature Support

**See `docs/tailwind/SUPPORT_STATUS.md` for complete Tailwind roadmap and feature status.**

### Priority 3: JSX Edge Cases (Optional)

- Fix template literal className support
- Fix boolean attribute handling
- Handle empty className removal
- Improve self-closing element handling

### Priority 4: Production Readiness

- Add validation for missing CSS rules
- Improve error messages
- Add comprehensive E2E tests with real build environment
- Visual regression testing

---

## References

- **Tailwind feature support:** `docs/tailwind/SUPPORT_STATUS.md`
- **Tailwind investigations:** `docs/tailwind/investigations/`
- **E2E test architecture:** `docs/testing/E2E_GUIDE.md`
- **Current status:** `docs/CURRENT_STATUS.md`

---

## Version History

- **2025-10-15**: Reorganized - Tailwind content moved to `docs/tailwind/`
- **2025-10-08**: Document created after fixing template literal and closing tag issues
