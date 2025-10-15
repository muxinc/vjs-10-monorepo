# Lessons from V1 Implementation

## Purpose

This document captures technical lessons from the v1 compiler to inform v2 decisions. Every time we reference v1 code, we document insights here.

---

## How to Use This Document

**When implementing a feature:**

1. Search for the feature area in this document
2. Read what v1 did and why
3. Understand v2's decision and rationale
4. Reference the code locations for details

**When adding a new entry:**

1. Use the template below
2. Include file paths and line numbers
3. Explain what worked/didn't work
4. Document v2 decision and e2e validation status
5. Link to v2 implementation

---

## Lessons Documented

### Arbitrary Variant Selectors

**V1 Location:** `src-v1/tailwind-ast/index.ts`, `src-v1/tailwind-ast/candidate.ts` (~1000 lines)

**What V1 Did:**
Custom Tailwind AST parser that analyzed utility class strings and generated CSS rules manually. Handled `[&_selector]` variants by building selector trees.

**Why It Worked:**

- Full control over CSS generation
- Could handle any Tailwind syntax (including arbitrary variants)
- Generated clean, optimized CSS
- Worked reliably for production MediaSkinDefault

**Why It Didn't Work:**

- ~1000 lines of complex parsing logic
- Required maintenance when Tailwind syntax changed
- Difficult to test (many edge cases)
- Tightly coupled to Tailwind v3 syntax
- High cognitive load for maintainers

**V2 Decision:**
Attempted to use Tailwind v4 JIT directly for CSS generation. Works for simple utilities but NOT for arbitrary variants (`[&_selector]:utility`).

**E2E Validation Status:**

- ❌ CANNOT validate arbitrary variants e2e (feature doesn't work in v2)
- ✅ CAN validate simple utilities e2e (works in both demos)
- Gap documented in `docs/testing/E2E_GUIDE.md`

**Current Status:**
V2 blocked on arbitrary variants. Options:

1. Port v1's AST parser (known to work, but maintenance burden)
2. Build full HTML context before Tailwind processing (simpler, may not handle all cases)
3. Hybrid: Use Tailwind v4 for simple utilities, custom parser for arbitrary variants only

**Next Step:** Document decision in ADR and implement chosen approach. E2E validate with MediaSkinDefault icon visibility.

**V2 Code Reference:** `src/core/css/transformStyles.ts`, `src/core/css/processCSS.ts`

---

### CSS Modules to Vanilla CSS Transformation

**V1 Location:** `src-v1/cssProcessing/cssModulesToVanillaCSS.ts:60-150`

**What V1 Did:**
Two-pass transformation:

1. Replace `.ClassName` with component element selectors OR kebab-case classes based on component map
2. Remove empty rules after replacement

**Why It Worked:**

- Component map provided context for selector decisions
- Clear separation: identify components, then transform selectors
- Handled both element selectors and class selectors
- Simple and predictable transformation

**Why It Didn't Work:**

- Post-processing approach (transform CSS after generation)
- Required full component map up front
- CSS generated, then modified (inefficient)
- Some edge cases with complex selectors

**V2 Decision:**
Earlier categorization (Phase 2). V2 categorizes style keys BEFORE CSS generation using usage analysis, not just naming conventions. This allows generating correct selectors from the start.

**E2E Validation Status:**

- ✅ CAN validate element selectors e2e (visual comparison shows correct styles)
- ✅ CAN validate class selectors e2e (works in both demos)
- Test: Load both demos, verify styles apply correctly
- Validated: Pseudo-classes, data attributes, dark mode all working

**V2 Improvement:**
Earlier categorization allows CSS processor to generate correct selectors from the start (no post-processing needed). More efficient and cleaner architecture.

**V2 Code Reference:**

- `src/core/css/transformStyles.ts` (CSS generation with categorization)
- `src/core/projection/projectStyleSelector.ts` (selector projection)
- `src/core/analysis/categorizeStyleKey.ts` (usage-based categorization)

---

### Import Path Transformation

**V1 Location:** `src-v1/importTransforming/transformImports.ts:45-80`

**What V1 Did:**
Used explicit import mappings passed via config:

```typescript
{
  '@vjs-10/react': '@vjs-10/html',
  '@vjs-10/react-icons': '@vjs-10/html-icons'
}
```

**Why It Worked:**

- Explicit and predictable
- Easy to debug (just look at mapping table)
- No magic heuristics
- Works for any package pair (not VJS-specific)

**Why It Didn't Work:**

- Required manual configuration for every package pair
- Not discoverable (had to know mappings exist)
- Duplication of knowledge (package structure implicit in mapping)
- Doesn't scale to many packages

**V2 Decision:**
Use `PathContext` to compute relative paths based on source/target package structure. More automatic but requires understanding package layout.

**E2E Validation Status:**

- ⚠️ PARTIALLY validated e2e (imports work in test fixtures with stubs)
- ❌ CANNOT validate production deployment e2e (missing import generation)
- Gap documented in `docs/testing/E2E_GUIDE.md`

**V2 Trade-off:**
More automatic but less explicit. Works well for VJS monorepo structure but less flexible for other use cases. Consider adding `importMappings` config override for explicit control when needed.

**V2 Code Reference:**

- `src/core/transformer/transformImports.ts` (import transformation)
- `src/types.ts` (PathContext interface)

---

### Tailwind Theme Configuration

**V1 Location:** `src-v1/cssProcessing/tailwindToCSSModules.ts:100-200`

**What V1 Did:**
Embedded Tailwind theme configuration directly in the compiler with spacing scale, colors, and custom variants.

**Why It Worked:**

- All utilities worked out of the box
- No external configuration needed
- Consistent theme across all projects
- Custom variants (hocus:, etc.) available

**Why It Didn't Work:**

- Theme couldn't be customized per project
- Hard to update when design system changed
- Colors and spacing values baked into compiler
- No way to use project's Tailwind config

**V2 Decision:**
Similar approach for v2 - embedded theme in `src/core/css/processCSS.ts` with `@theme` block for Tailwind v4. Includes spacing, border-radius, and colors.

**E2E Validation Status:**

- ✅ CAN validate theme e2e (spacing, colors, border-radius all working)
- ✅ Tests: Integration tests for theme utilities
- ✅ Visual validation: Styles render correctly in both demos

**V2 Improvement:**
Uses Tailwind v4's `@theme` syntax which is cleaner than v3's config object. CSS variables allow runtime customization.

**Future Enhancement:**
Add support for discovering and using project's `tailwind.config.js` (Phase 3+ feature).

**V2 Code Reference:** `src/core/css/processCSS.ts:191-245` (@theme block)

---

### Pipeline Architecture

**V1 Location:** `src-v1/pipelines/skinToWebComponentInline.ts`

**What V1 Did:**
Pipeline-based approach where different combinations of input/output determined compilation strategy. Clean, composable design.

**Why It Worked:**

- Clear separation of concerns
- Easy to add new pipelines
- Testable in isolation
- Good abstraction level

**Why It Didn't Work:**

- File I/O mixed with transformation logic
- Hard to test pure transformation (needed real files)
- Pipeline orchestration coupled to filesystem
- Difficult to unit test individual transformations

**V2 Decision:**
Adopted pipeline concept but with pure transformation functions. All core transformations work with strings, not files. File I/O pushed to boundary layer.

**E2E Validation Status:**

- ✅ CAN validate pipeline e2e (full compilation working)
- ✅ Test: `test/integration/compile-for-e2e.test.ts`
- ✅ Both demos use compiled output successfully

**V2 Improvement:**

- Pure functions throughout core (no file I/O)
- Easier to test (just pass strings)
- Better separation of concerns (boundary vs core vs config)
- Follows "Identify, Then Transform" architecture

**V2 Code Reference:**

- `src/pipelines/compileSkin.ts` (main pipeline)
- All functions in `src/core/` are pure

---

### CLI Design

**V1 Location:** `src-v1/cli.ts`

**What V1 Did:**
Simple CLI with `compile` command taking file path and options as flags:

```bash
vjs-compiler compile src/Skin.tsx --format web-component --css inline
```

**Why It Worked:**

- Simple and straightforward
- Easy to understand
- Works for single file compilation

**Why It Didn't Work:**

- No batch processing
- No config file support
- Repetitive for multiple files
- Hard to maintain consistent options across files

**V2 Decision:**
NOT YET IMPLEMENTED in v2. CLI exists but not fully functional.

**E2E Validation Status:**

- ❌ CANNOT validate CLI e2e (not implemented)
- Current use: Programmatic API only

**Future Enhancement:**
Implement CLI with:

- `compile` command for single files
- `build` command with config file support
- Watch mode for development
- Better error messages and validation

**Priority:** Medium (after arbitrary variants fixed)

---

## Template for New Entries

```markdown
### [Feature/Area Name]

**V1 Location:** `src-v1/[path]/[file].ts:line-range`

**What V1 Did:**
[Brief description of v1 approach]

**Why It Worked:**
[Technical explanation - what were the benefits?]

**Why It Didn't Work:**
[Problems/limitations - what were the drawbacks?]

**V2 Decision:**
[What v2 does differently and why]

**E2E Validation Status:**
[Can we validate this e2e? How? What's working/not working?]

**V2 Improvement/Trade-off:**
[How is v2 better or different? What did we give up?]

**V2 Code Reference:**
[Link to v2 implementation with file paths and line numbers]
```

---

## Contributing to This Document

When you reference v1 code during v2 development:

1. Add an entry using the template above
2. Include specific file paths and line numbers
3. Explain both what worked AND what didn't work
4. Document v2's decision and rationale
5. **Document e2e validation status** (critical!)
6. Link to v2 implementation

This creates a living knowledge base that:

- Prevents repeated mistakes
- Captures architectural decisions
- Explains why v2 differs from v1
- Helps new developers understand the codebase
- Validates we can e2e test what we claim works
