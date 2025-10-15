# Lessons from V1 Implementation

## Purpose

This document captures technical lessons from the v1 compiler to inform v2 decisions. Every time we reference v1 code, we document insights here.

## V1 Code Location

**V1 source code has been removed from the main branch** (as of 2025-10-15). It is preserved in two places:

1. **Archive Branch:** `archive/v1-compiler` (created from commit `a4d55a5`)
   ```bash
   git checkout archive/v1-compiler
   ```

2. **Tailwind AST Parser:** Migrated to `src/tailwind-ast/` for potential future use
   - See `src/tailwind-ast/README.md` for details
   - This code handled named groups support in V1

All V1 file paths referenced in this document (e.g., `src-v1/...`) can be found in the archive branch.

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

### Arbitrary Variant Selectors and Complex Tailwind Features

**V1 Location:**
- `src-v1/tailwind-ast/index.ts`, `src-v1/tailwind-ast/candidate.ts` (~1000 lines - custom parser)
- `src-v1/cssProcessing/detectUnparseableClasses.ts` (unparseable class detection)
- `src-v1/cssProcessing/generateSupplementaryCSS.ts` (manual CSS generation workarounds)

**What V1 Did:**
Hybrid approach combining custom Tailwind AST parser with manual CSS generation workarounds for classes Tailwind couldn't parse.

**Feature Support in V1:**

| Feature | V1 Status | How It Worked |
|---------|-----------|---------------|
| Named groups (`group/root`, `group-hover/root:`) | ✅ **Worked** | Custom AST parser supported compound variant syntax |
| Simple descendant selectors (`[&_.icon]:opacity-0`) | ⚠️ **Workaround** | Detected as "unparseable", manual CSS generation |
| Has selectors (`:has()`) | ❌ **Didn't Work** | Marked as unparseable "other" category, no workaround |
| Pseudo-elements (`::before`, `::after`) | ❌ **Didn't Work** | Marked as unparseable "other" category, no workaround |
| ARIA selectors (`aria-disabled:`) | ❌ **Didn't Work** | No special handling, unparseable |
| Drop-shadow filters | ⚠️ **Buggy** | Generated malformed CSS, required regex fixes |

**Why Parts Worked:**

- Custom AST parser handled named groups (`group-hover/group-name` syntax)
- Manual CSS generation provided workarounds for SOME unparseable classes
- Pattern matching for specific selector types (descendant selectors, data attributes)
- Full control over CSS generation when Tailwind failed

**Why It Didn't Work:**

- ~1000 lines of complex parsing logic (high maintenance burden)
- Brittle workarounds (regex pattern matching for unparseable classes)
- Many features still didn't work (has selectors, pseudo-elements, ARIA selectors)
- Tailwind bugs required additional regex fixes (drop-shadow)
- Production MediaSkinDefault uses features V1 couldn't handle
- Difficult to test (many edge cases)

**V2 Decision:**
Uses Tailwind v4 JIT engine directly. Works for simple utilities and descendant selectors, but missing named groups and other complex features.

**Feature Support in V2:**

| Feature | V2 Status | How It Works |
|---------|-----------|--------------|
| Named groups (`group/root`, `group-hover/root:`) | ❌ **Doesn't Work** | Not implemented |
| Simple descendant selectors (`[&_.icon]:opacity-0`) | ✅ **Works** | Native Tailwind v4 JIT support |
| Has selectors (`:has()`) | ❌ **Doesn't Work** | Not implemented |
| Pseudo-elements (`::before`, `::after`) | ❌ **Doesn't Work** | Not implemented |
| ARIA selectors (`aria-disabled:`) | ❌ **Doesn't Work** | Not implemented |

**E2E Validation Status:**

- ✅ Simple descendant selectors validated e2e (test skins 01-06)
- ❌ Named groups NOT validated e2e (test skin 10-named-groups fails)
- ❌ Has selectors NOT validated e2e (test skin 09-has-selector fails)
- ❌ Before/after NOT validated e2e (test skin 08-before-after fails)
- ❌ ARIA selectors NOT validated e2e (test skin 11-aria-states fails)
- ❌ **Production MediaSkinDefault cannot be compiled by either V1 or V2**

**Key Insight:**
Neither V1 nor V2 can fully compile production MediaSkinDefault. V1 had MORE workarounds but still couldn't handle has selectors, pseudo-elements, and ARIA selectors. V2 has cleaner architecture but is missing critical features for production use.

**Current Status:**
V2 blocked on multiple Tailwind features. Options:

1. Port v1's AST parser (would add named groups back, but still missing has/before/after/ARIA)
2. Extend Tailwind v4 JIT to handle these features (contribute upstream?)
3. Build custom selector transformation layer (complex, maintenance burden)
4. Simplify production skin to use only supported features (limits design flexibility)

**Next Step:** Prioritize which features are most critical for production use. Named groups likely highest priority (used 15+ times in MediaSkinDefault).

**V2 Code Reference:**
- `src/core/css/transformStyles.ts` (current CSS generation)
- `src/core/css/processCSS.ts` (Tailwind processing)
- `docs/tailwind/SUPPORT_STATUS.md` (detailed feature status)

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
