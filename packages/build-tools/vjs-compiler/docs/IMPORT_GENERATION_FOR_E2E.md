# Import Generation for E2E Unblocking

**Date:** 2025-10-08
**Author:** Claude Code
**Purpose:** Analyze whether implementing import generation now would unblock E2E tests while maintaining architectural principles

---

## Executive Summary

**YES** - We should implement import generation now. It:

- ✅ Directly unblocks Playwright E2E tests (needed for test pages to load)
- ✅ Aligns with forward-looking architectural goals (smart import mapping)
- ✅ Can be implemented incrementally with validation at each step
- ✅ Is already partially designed (categorization exists, projection stubbed)
- ✅ Enables E2E validation of the imports themselves

**Implementation Strategy:** 3-phase approach with E2E validation at each phase

---

## Current State Analysis

### What's Blocking E2E Tests Right Now

The Playwright tests timeout because **test pages don't have proper module imports**:

```html
<!-- test/e2e/equivalence/pages/wc-skin-default.html -->
<body>
  <media-skin-default>...</media-skin-default>

  <!-- Missing imports! -->
  <script type="module">
    // This page is loaded by Playwright tests
    // The web component is imported dynamically to match the test environment
    window.__E2E_TEST_PAGE__ = 'web-component';
  </script>
</body>
```

**Problem:** Custom elements never register because no module imports them.

**What's Needed:**

```html
<script type="module">
  // Import compiled skin (with its own imports)
  import './fixtures/compiled/MediaSkinDefault.browser.js';

  // Now custom element is registered and tests can run
</script>
```

### What the Compiled Output Currently Lacks

**Current Output (test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js):**

```typescript
// ❌ NO IMPORTS

export function getTemplateHTML() {
  return /* html */ `
    <!-- ❌ NO BASE TEMPLATE -->
    <style>/* CSS here */</style>
    <media-container>...</media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  /* ❌ MediaSkin not imported */
}

if (!customElements.get('media-skin-default')) {
  customElements.define('media-skin-default', MediaSkinDefault);
}
```

**What We Need for E2E Tests:**

```typescript
// ✅ Import base class
import { MediaSkin } from '../../../media-skin.js';
// ✅ Import components (triggers their registration)
import '../../../components/media-play-button.js';
import '../../../components/media-time-range.js';
// ... etc

// ✅ Import icons
import '@vjs-10/html-icons/play.js';
import '@vjs-10/html-icons/pause.js';

// ... etc

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()} <!-- ✅ Base template -->
    <style>/* CSS here */</style>
    <media-container>...</media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

if (!customElements.get('media-skin-default')) {
  customElements.define('media-skin-default', MediaSkinDefault);
}
```

**Why This Unblocks E2E:**

1. Base class `MediaSkin` is imported → class can extend it
2. Component imports trigger side-effects → custom elements register
3. Icon imports load SVG definitions → icons render
4. Base template included → foundational HTML is present
5. Module loads without errors → Playwright tests can run

---

## Architectural Alignment

### This Fits Our "Identify, Then Transform" Architecture

**We've already done the hard part (Phase 2: Categorization):**

```typescript
// src/core/categorization/categorizeImport.ts
export function categorizeImport(imp: ImportDeclaration): ImportCategory {
  if (isFrameworkImport(imp)) return 'framework-import';
  if (isStyleImport(imp)) return 'style-import';
  if (isVJSIconPackage(imp)) return 'vjs-icon-package';
  if (isVJSCorePackage(imp)) return 'vjs-core-package';
  if (isVJSComponentSamePackage(imp)) return 'vjs-component-same-package';
  if (isVJSComponentExternal(imp)) return 'vjs-component-external';
  if (isExternalPackage(imp)) return 'external-package';
  return 'unknown';
}
```

**We already know WHAT each import is. Now we implement HOW to transform it.**

**Phase 3 (Projection) is partially stubbed:**

```typescript
// src/core/projection/projectImport.ts (lines 99-106)
function projectVJSIconPackage(source: string): ImportProjection {
  // TODO: Transform path based on target package structure
  // For now, keep as-is
  return {
    shouldKeep: true,
    shouldTransform: false, // ← Should be TRUE
    reason: `Icon package '${source}' needed in web component`,
  };
}
```

**All we need to do:** Implement the `transformedSource` calculation.

### This Aligns with Forward-Looking Goals

From your question:

> "if the react + tailwind css skin module is part of the react/react package source, and we know we want to (at least eventually) support smarter import/export mappings based on whether our input and output paths are inside or outside of vjs packages"

**Exactly right!** This is the **Path Context** problem, and we can implement it incrementally:

**Phase 1: Relative Path Transformation (E2E Unblocking)**

- Input: `packages/react/react/src/skins/MediaSkinDefault.tsx`
- Output: `packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts`
- Transform: `'../../../media-skin'` (relative from output to target)

**Phase 2: Cross-Package Smart Mapping (Production Feature)**

- Input: `packages/react/react/src/skins/MediaSkinDefault.tsx`
- Output: `packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts`
- Transform: `'@vjs-10/react-icons' → '@vjs-10/html-icons'` (package mapping)

**Phase 3: External/Standalone Mode (CLI Feature)**

- Input: `my-app/src/CustomSkin.tsx` (outside monorepo)
- Output: `my-app/dist/CustomSkin.js`
- Transform: Keep package imports as-is (user provides dependencies)

**We can implement Phase 1 NOW to unblock E2E, then extend for Phases 2-3 later.**

---

## Implementation Plan (3-Phase, E2E Validated)

### Phase 1: Basic Import Generation (Relative Paths)

**Goal:** Generate imports with relative paths for E2E test fixtures

**Scope:**

- Add `PathContext` type to capture input/output locations
- Implement `calculateRelativePath()` utility
- Update `projectImport()` to compute `transformedSource`
- Update code generator to emit imports at top of module
- Add base template inclusion: `${MediaSkin.getTemplateHTML()}`

**Architecture Compliance:**

- ✅ Pure functions (string → string transformations)
- ✅ Context passed as parameter (not global state)
- ✅ Testable in isolation (unit tests for path calculation)
- ✅ Separation of concerns (projection logic separate from generation)

**E2E Validation:**

```bash
# Level 1: Syntactic
pnpm test -- import-generation.test.ts  # Unit tests
npx tsc --noEmit test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js

# Level 2: Comparison
diff <(grep "^import" v1-output.ts) <(grep "^import" v2-output.ts)

# Level 3: Browser
open test/e2e/equivalence/demos/wc-demo.html
# Check: Zero console errors, custom element registered

# Level 4: Playwright (UNBLOCKED!)
pnpm test:e2e
# Tests should RUN (may fail on assertions, but they RUN)
```

**Estimated Effort:** 4-6 hours (includes tests and validation)

**Risk:** Low (relative path calculation is well-understood)

---

### Phase 2: Smart Package Mapping

**Goal:** Transform package imports based on target format (React → HTML)

**Scope:**

- Add `PackageMapping` configuration type
- Implement `resolvePackageMapping()` (e.g., `@vjs-10/react-icons` → `@vjs-10/html-icons`)
- Update `projectImport()` to use package mappings
- Add configuration file or CLI option for custom mappings

**Architecture Compliance:**

- ✅ Configuration-driven (not hardcoded logic)
- ✅ Pure functions (mapping lookup is deterministic)
- ✅ Extensible (users can provide custom mappings)

**E2E Validation:**

```bash
# Level 1: Syntactic
pnpm test -- package-mapping.test.ts

# Level 2: Comparison (with production skin)
# Compile MediaSkinDefault from react/react to html/html
# Compare imports to v1 output

# Level 3: Browser (production context)
# Load compiled skin in actual packages/html/html context
# Verify imports resolve correctly

# Level 4: Integration
# Run full monorepo build, verify no broken imports
```

**Estimated Effort:** 6-8 hours (includes config design and tests)

**Risk:** Medium (need to validate across multiple package boundaries)

---

### Phase 3: External/Standalone Mode

**Goal:** Support compilation outside monorepo (CLI users)

**Scope:**

- Add `--mode` CLI option: `internal` vs `external`
- In external mode: Keep package imports as-is, document peer dependencies
- Add `--import-map` CLI option for custom path transformations
- Update docs with examples for CLI users

**Architecture Compliance:**

- ✅ Mode is explicit (not inferred)
- ✅ Fail-fast with clear error messages if imports can't resolve
- ✅ Documentation includes examples for each mode

**E2E Validation:**

```bash
# Level 1: CLI integration tests
pnpm test -- cli-external-mode.test.ts

# Level 2: Standalone project test
# Create temp project outside monorepo
# Compile skin with --mode external
# Verify imports are correct for npm publish

# Level 3: Documentation validation
# Follow docs step-by-step to compile external skin
# Verify all steps work as documented
```

**Estimated Effort:** 4-6 hours (mostly documentation and examples)

**Risk:** Low (external mode is simpler - keep imports as-is)

---

## Why This Should Be Done NOW

### Reason 1: E2E Validation Requires It

**Current situation:**

- ❌ Playwright tests written but can't run (timeout)
- ❌ Manual E2E validation only (5-10 min per feature, error-prone)
- ❌ No CI/CD validation possible
- ❌ Can't validate import correctness at all

**After Phase 1 implementation:**

- ✅ Playwright tests run automatically (catches regressions)
- ✅ CI/CD integration possible (run on every commit)
- ✅ Import correctness validated (part of test suite)
- ✅ 11 test cases automated (4 state + 7 style)

### Reason 2: We Can Validate Incrementally

**Unlike arbitrary variants (complex, requires v1 parser study), import generation is:**

- ✅ Well-understood problem (relative path calculation)
- ✅ Clear requirements (we have v1 output as reference)
- ✅ Pure functions (easy to unit test)
- ✅ Can validate at each step (Level 1-4 validation)

**We can follow our own process:**

```markdown
## Before Implementation

- [x] Plan E2E validation path (above)
- [x] Check v1 code (LESSONS_FROM_V1.md has notes)
- [x] Plan tests (unit + integration + E2E)
- [x] Architectural compliance check (passes)

## During Implementation

- [ ] TDD: Write tests first, watch fail, make pass
- [ ] Type safety: `npx tsc --noEmit` continuously
- [ ] E2E validation: Load demos after each change
- [ ] Remove TODOs: Delete `// TODO: Transform path` as we go

## After Implementation

- [ ] All validation commands pass
- [ ] E2E validated (4 levels)
- [ ] Obsolete code removed
- [ ] Documentation updated
```

### Reason 3: It's Architecturally Sound

**This isn't "hacking something in" - it's completing Phase 3.**

**Our architecture has 3 phases:**

1. ✅ **Identify** - Extract imports from source (DONE)
2. ✅ **Categorize** - Classify imports by type (DONE)
3. ⚠️ **Project** - Transform imports for target (STUBBED)

**We're just finishing what we started.**

**Projection functions already exist:**

```typescript
// src/core/projection/projectImport.ts
export function projectImport(categorizedImport: CategorizedImport): ImportProjection {
  // Category-based dispatch (DONE)
  // Path transformation (STUBBED with TODOs)
  // This is where we add the logic
}
```

### Reason 4: Future Features Depend On It

**Features blocked by missing import generation:**

1. Production skin compilation (can't load in packages/html)
2. Automated E2E tests (can't run Playwright)
3. CI/CD integration (depends on #2)
4. CLI standalone mode (depends on import mapping)
5. Cross-package compilation (React → HTML transformation)

**Implementing now unblocks all of these.**

---

## Risks and Mitigations

### Risk 1: Path Calculation Complexity

**Concern:** Relative path calculation between arbitrary source/target paths might be complex.

**Mitigation:**

- Use Node.js built-in `path.relative()` (battle-tested)
- Add comprehensive unit tests (20+ test cases with edge cases)
- Use v1 output as oracle (compare generated paths to v1)

**Validation:**

```typescript
// test/unit/projection/calculateRelativePath.test.ts
it('calculates path from nested output to sibling target', () => {
  const from = '/packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts';
  const to = '/packages/html/html/src/media-skin.ts';
  const result = calculateRelativePath(from, to);
  expect(result).toBe('../../../media-skin.js'); // Add .js extension
});
```

### Risk 2: Breaking Existing Tests

**Concern:** Adding import generation might break existing integration tests.

**Mitigation:**

- Run full test suite after each change: `pnpm test`
- Keep existing fixtures unchanged (add new ones for import generation)
- Use feature flag if needed: `generateImports: boolean` option

**Validation:**

- Require 122/136 tests still passing (don't break existing tests)
- New tests added for import generation (increase pass count)

### Risk 3: Scope Creep

**Concern:** "Smart import mapping" could expand into a massive refactor.

**Mitigation:**

- **Phase 1 ONLY for E2E unblocking:** Relative paths, no smart mapping
- Keep Phase 2 (package mapping) as separate PR
- Document future work in KNOWN_LIMITATIONS.md

**Success Criteria for Phase 1:**

- E2E tests run (don't timeout)
- WC demo loads with zero console errors
- Imports are correct (manual verification)
- Takes < 8 hours total (including tests)

---

## Decision: Proceed with Phase 1

**Recommendation:** Implement Phase 1 (Basic Import Generation) NOW.

**Justification:**

1. Directly unblocks Playwright E2E tests
2. Architecturally sound (completes Phase 3 projection)
3. Can be validated incrementally (4-level validation)
4. Low risk (relative paths are well-understood)
5. Foundation for future features (package mapping, CLI mode)

**Success Criteria:**

- ✅ `pnpm test:e2e` runs without timeout
- ✅ Generated imports are correct (match v1 quality)
- ✅ WC demo loads with zero console errors
- ✅ 11 Playwright tests execute (may have assertion failures, but they RUN)
- ✅ All existing tests still pass (122/136 minimum)
- ✅ TypeScript compiles with zero errors
- ✅ E2E validated (4 levels)

**Time Estimate:** 4-6 hours (1 day of focused work)

**Next Steps:**

1. Read v1 import generation code (src-v1/) for reference
2. Design `PathContext` type and `calculateRelativePath()` function
3. Write unit tests for path calculation (TDD)
4. Implement `projectImport()` path transformation
5. Update code generator to emit imports
6. Add base template inclusion
7. Run E2E validation (4 levels)
8. Update documentation (E2E_CAPABILITIES.md, KNOWN_LIMITATIONS.md)
9. Commit with comprehensive message

---

## Appendix: Code Structure

### New Files to Create

```
src/
  core/
    projection/
      PathContext.ts          # NEW - Input/output path context
      calculateRelativePath.ts # NEW - Path calculation utility

test/
  unit/
    projection/
      calculateRelativePath.test.ts  # NEW - Path calc tests
      projectImport.test.ts           # UPDATE - Add path tests

  integration/
    import-generation.test.ts  # NEW - E2E import generation
```

### Existing Files to Update

```
src/
  core/
    projection/
      projectImport.ts         # UPDATE - Add path transformation

  boundary/
    generator/
      generateWebComponent.ts  # UPDATE - Emit imports at top

  types.ts                     # UPDATE - Add PathContext type
```

### Documentation to Update

```
docs/
  E2E_CAPABILITIES.md          # UPDATE - Mark import generation as validated
  KNOWN_LIMITATIONS.md         # UPDATE - Remove import generation limitation
  CURRENT_STATUS.md            # UPDATE - Add Phase 3 completion status
  LESSONS_FROM_V1.md           # UPDATE - Add notes from v1 import study
```

---

## Questions for User

1. **Scope confirmation:** Should we implement Phase 1 (relative paths only) now, or include Phase 2 (package mapping) as well?

2. **v1 reference:** Should we study v1's import generation before implementing, or is the current understanding sufficient?

3. **Base template:** Should base template inclusion (`${MediaSkin.getTemplateHTML()}`) be part of Phase 1, or separate?

4. **Validation depth:** Is 4-level validation sufficient, or should we add additional checks (e.g., import resolution verification)?

5. **Timeline:** Is 4-6 hours (1 day) acceptable, or should this be faster/slower?
