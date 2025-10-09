# CLAUDE.md - VJS Compiler

This file provides guidance to Claude Code when working with the VJS Framework Compiler.

## Package Purpose

The VJS Compiler transforms **React skins** (with Tailwind v4 styles) into **Web Component skins** (with inline vanilla CSS), enabling a single skin definition to work across multiple frameworks.

**Primary Transformation:**

- Input: React + TSX + Tailwind CSS v4 (styles in TypeScript)
- Output: Web Components + Inline Vanilla CSS (human-readable, semantic)

## Critical Requirements

### Output Quality Standards

Every compiled output MUST meet these standards:

1. **Syntactic Validity**
   - ✅ Valid TypeScript/JavaScript code (compiles without errors)
   - ✅ Valid HTML (no JSX syntax in template strings)
   - ✅ Valid CSS (parseable selectors and properties)
   - ❌ NO template literal expressions in HTML: `class={`${styles.X}`}` is INVALID
   - ✅ Use static strings: `class="button"` is VALID

2. **Completeness**
   - ✅ Proper imports (MediaSkin base class, component side-effects)
   - ✅ Complete CSS (all selectors including complex variants generate rules)
   - ✅ Explicit closing tags for ALL elements
   - ✅ Base template inclusion: `${MediaSkin.getTemplateHTML()}`

3. **Browser Loadability**
   - ✅ Code must load in browser without console errors
   - ✅ Custom elements must register successfully
   - ✅ No runtime JavaScript errors

4. **Visual Equivalence**
   - ✅ Compiled output must look identical to React version
   - ✅ Playwright screenshot comparison must pass
   - ✅ Computed styles must match expected values

### Common Pitfalls to Avoid

**❌ WRONG: JSX syntax in HTML template**

```javascript
// BAD - This is what v2 currently outputs (BROKEN)
return /* html */ `
  <media-play-button class={`${styles.Button}`}>
`;
```

**✅ CORRECT: Static strings in HTML template**

```javascript
// GOOD - This is what v1 outputs (CORRECT)
return /* html */ `
  <media-play-button class="button">
    <media-play-icon></media-play-icon>
  </media-play-button>
`;
```

**❌ WRONG: Missing closing tags**

```html
<media-time-range-pointer></media-time-range-pointer>
```

**✅ CORRECT: Explicit closing tags**

```html
<media-time-range-pointer></media-time-range-pointer>
```

**❌ WRONG: Missing CSS for complex selectors**

```css
.PlayButton {
  /* Tailwind classes: [&_.pause-icon]:opacity-100 [&[data-paused]_.pause-icon]:opacity-0 */
  /* No CSS generated */
}
```

**✅ CORRECT: Complete CSS rules**

```css
media-play-button .pause-icon {
  opacity: 100%;
}

media-play-button[data-paused] .pause-icon {
  opacity: 0%;
}
```

## Iteration Process (Read This First!)

**IMPORTANT:** Every code change follows this process. No exceptions.

### E2E Validation First Principle

**CRITICAL:** We can only claim a feature works if we can validate it end-to-end.

**E2E Validation means:**

1. React + Tailwind version works (loads in browser, no errors)
2. Web Component + Vanilla CSS version works (loads in browser, no errors)
3. Visual comparison shows equivalence (look identical)
4. Functional comparison shows equivalence (interactions work identically)
5. Automated test captures this validation (Playwright test exists and passes)

**Before implementing ANY feature:**

- Check `docs/E2E_CAPABILITIES.md` - Can we validate this e2e?
- Plan the e2e validation approach (which demos, which tests?)
- If no e2e validation path exists, document as known limitation

**See:** `docs/E2E_CAPABILITIES.md` for current e2e validation status

### Package Manager: ALWAYS USE PNPM

This monorepo uses **pnpm**, not npm. The root-level `CLAUDE.md` specifies this.

❌ **WRONG:** `npm install`, `npm test`, `npm run build`
✅ **CORRECT:** `pnpm install`, `pnpm test`, `pnpm build`

**Why:** pnpm provides better workspace management, faster installs, and stricter dependency resolution.

### Before Every Code Change

1. **Plan E2E Validation** - Can this be validated e2e? How?
2. **Understand Context** - Read v1 code if applicable (`src-v1/`)
3. **Plan Removal** - What obsolete code will this change remove?
4. **Plan Tests** - What tests will validate this change?
5. **Check Tools** - Using pnpm? TypeScript strict mode?

**See:** `docs/ITERATION_PROCESS.md` for detailed checklist

### During Code Changes

- **E2E Validation:** Load both demos, compare visually and functionally
- **Type Safety:** `npx tsc --noEmit` must always pass
- **Test-Driven:** Write test first, watch it fail, make it pass
- **Remove Code:** Delete obsolete code immediately (don't leave TODOs)
- **Document Why:** Code comments explain why, not what

### After Code Changes (Pre-Commit)

**FIRST: Clean up background processes** (prevents system slowdown):

```bash
# Check for hanging test processes from interrupted runs
ps aux | grep -E "(vitest|playwright)" | grep -v grep

# Kill any hanging processes
pkill -f "node.*vitest"
pkill -f "node.*playwright"
```

**Why:** Interrupted test runs (Ctrl+C, timeouts) leave vitest workers consuming 500MB-900MB each.

**REQUIRED - Run these commands before EVERY commit:**

```bash
# TypeScript compilation (MUST pass)
npx tsc --noEmit

# All tests (MUST pass OR document failures)
pnpm test

# Linting (MUST pass)
pnpm lint

# Formatting (auto-fix)
pnpm format
```

**If tests timeout or you interrupt:** Run `pkill -f "node.*vitest"` to cleanup workers before retrying.

**For output-affecting changes, ALSO do:**

```bash
# Compile test skin
pnpm test -- compile-for-e2e.test.ts

# Load WC demo
open test/e2e/equivalence/demos/wc-demo.html

# Load React demo (in new terminal)
cd test/e2e/equivalence/demos/react-demo && pnpm dev
# Opens at http://localhost:5174

# Compare side-by-side:
# - Do they look identical?
# - Do interactions work the same?
# - Are there console errors in either?

# Run e2e tests (if applicable)
pnpm test:e2e
```

**NO COMMITS** if any validation fails (except documented known limitations).

### Definition of Done

A change is NOT complete until:

1. ✅ All validation commands pass
2. ✅ Tests added/updated for the change
3. ✅ Obsolete code removed
4. ✅ Documentation updated (if needed)
5. ✅ Commit message follows Conventional Commits
6. ✅ **E2E validation completed** (if output-affecting):
   - Level 1: Syntactic (TypeScript compiles, HTML valid)
   - Level 2: Comparison (vs v1 output if applicable)
   - Level 3: Browser (loads without errors in both demos)
   - Level 4: Visual & Functional (matches React equivalent)
7. ✅ **E2E status documented** (in commit message and E2E_CAPABILITIES.md)

**See:** `docs/ITERATION_PROCESS.md` for full checklist
**See:** `docs/E2E_CAPABILITIES.md` for current e2e validation capabilities
**See:** `docs/LESSONS_FROM_V1.md` for v1 insights

## Architecture References

**Key Documents:**

- `docs/compiler-architecture.md` - Core principles and transformation pipeline
- `docs/compiler-rebuild-plan.md` - Phase-by-phase implementation plan with validation requirements
- `README.md` - Package overview and CLI usage
- `docs/CURRENT_STATUS.md` - Implementation progress tracking

**Core Principles from Architecture:**

1. **Separation of Concerns** - Pure transformation functions (strings in, strings out)
2. **Identify, Then Transform** - 3-phase pipeline (identification → categorization → projection)
3. **Usage Analysis** - Determine component/style relationships from JSX usage patterns
4. **Push Assumptions to Boundaries** - No hardcoded logic deep in transformers

## Reference Implementation: V1 Compiler

The **v1 compiler** (in `src-v1/`) produced correct output and should be used as a reference:

**V1 Output Quality (from `packages/html/html/src/skins/compiled/inline/media-skin-default.ts`):**

- ✅ 513 lines of valid TypeScript
- ✅ Proper imports with MediaSkin base class
- ✅ Complete CSS with all selectors (element + class + pseudo + data-attribute)
- ✅ Valid HTML with explicit closing tags
- ✅ Proper template structure with base template inclusion

**Key V1 Files to Reference:**

- `src-v1/transforms/compileJSXToHTML.ts` - Correct JSX → HTML transformation
- `src-v1/transformer.ts` - Handles template literals correctly
- `src-v1/serializer.ts` - Generates valid HTML output
- `src-v1/pipelines/skinToWebComponentInline.ts` - Complete pipeline

## Validation Framework

Every implementation step MUST pass these 4 validation levels:

### Level 1: Syntactic Validation

```bash
# TypeScript compilation check
tsc --noEmit <compiled-output>.ts

# HTML validation (no JSX syntax in strings)
grep -n 'class={\`\${' <compiled-output>.ts  # Should find NOTHING
```

### Level 2: Output Comparison

```bash
# Compare to v1 reference
wc -l <v1-output>.ts <v2-output>.ts  # Line counts should be comparable
diff <v1-output>.ts <v2-output>.ts   # Understand differences
```

### Level 3: Browser Validation

```javascript
// Load in browser and check console
const errors = [];
window.addEventListener('error', (e) => errors.push(e));
// After loading compiled module:
console.assert(errors.length === 0, 'No runtime errors');
console.assert(customElements.get('media-skin-default'), 'Component registered');
```

### Level 4: Visual Validation

```bash
# Playwright screenshot comparison
npm run test:e2e:equivalence
```

## Definition of Done

A phase is **NOT complete** until:

- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Generated code passes TypeScript compilation
- ✅ Generated code loads in browser without errors
- ✅ Visual screenshot matches React version (< 2% pixel diff)
- ✅ Computed styles match expected values
- ✅ Output quality matches v1 compiler standards

## File Structure

```
vjs-compiler/
├── src/
│   ├── boundary/           # CLI, file I/O (impure)
│   ├── config/             # Configuration types
│   ├── core/
│   │   ├── analyzer/       # Phase 1: Identification (extract structure)
│   │   ├── categorizer/    # Phase 2: Categorization (classify by usage)
│   │   └── transformer/    # Phase 3: Projection (transform to target)
│   └── pipelines/          # End-to-end transformation pipelines
├── src-v1/                 # Reference implementation (DO NOT DELETE)
├── test/
│   ├── unit/               # Pure function tests
│   ├── integration/        # Pipeline tests
│   └── e2e/                # Browser-based equivalence tests
└── docs/
    ├── compiler-architecture.md
    ├── compiler-rebuild-plan.md
    └── CURRENT_STATUS.md
```

## Current Implementation Status (2025-10-08)

**Status:** Phase 2 incomplete - critical output defects identified

**Known Issues:**

1. JSX transformer produces invalid template literal syntax in HTML
2. Missing closing tags on custom elements
3. Complex CSS selectors (arbitrary variants) not generating rules
4. Missing imports and base template in generated code

**Next Steps:**

1. Fix JSX transformer template literal handling
2. Fix JSX transformer closing tag generation
3. Fix Tailwind processor for complex selectors
4. Fix code generator imports and base template
5. Re-validate Phase 2 with complete 4-level validation

## Working with This Package

### Before Making Changes

1. **Read architecture docs** - Understand the 3-phase transformation pipeline
2. **Review v1 reference** - See how it was done correctly
3. **Check current status** - Review `docs/CURRENT_STATUS.md`
4. **Identify validation requirements** - What must pass after this change?

### After Making Changes

1. **Run unit tests** - `npm test`
2. **Check output quality** - Compile a test skin and inspect the output
3. **Compare to v1** - Does it match v1 quality?
4. **Run 4-level validation** - Don't skip any levels
5. **Update CURRENT_STATUS.md** - Document progress and any issues

### When Output Looks Wrong

1. **Check for common pitfalls** - JSX syntax in templates, missing closing tags
2. **Compare to v1 output** - Line-by-line diff to understand gaps
3. **Validate architecture compliance** - Are we following the 3-phase approach?
4. **Review transformation logic** - Is JSX → HTML logic correct?

## Questions to Ask

Before claiming a phase is complete:

1. ✅ Does the output compile without TypeScript errors?
2. ✅ Does the output load in a browser without console errors?
3. ✅ Does the output match v1 quality standards?
4. ✅ Are there any JSX expressions left in HTML template strings?
5. ✅ Do all custom elements have explicit closing tags?
6. ✅ Is all CSS generating correctly (including complex selectors)?
7. ✅ Are all imports present (base class, components)?
8. ✅ Does the visual output match the React version?

If ANY answer is "no", the phase is NOT complete.

## Example: Correct Output Structure

```typescript
// From v1 compiler - THIS IS THE STANDARD
import { MediaSkin } from '../../../media-skin';

import '../../../components/media-play-button';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>
      media-play-button {
        padding: 0.5rem;
        border-radius: calc(infinity * 1px);
      }

      media-play-button[data-paused] .pause-icon {
        opacity: 0%;
      }

      media-play-button .play-icon {
        opacity: 0%;
      }

      media-play-button[data-paused] .play-icon {
        opacity: 100%;
      }
    </style>

    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="controls">
        <media-play-button class="button">
          <media-play-icon></media-play-icon>
          <media-pause-icon></media-pause-icon>
        </media-play-button>
      </div>
    </media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

if (!customElements.get('media-skin-default')) {
  customElements.define('media-skin-default', MediaSkinDefault);
}
```

Note:

- ✅ Valid TypeScript
- ✅ Proper imports
- ✅ Base template inclusion
- ✅ Complete CSS rules
- ✅ Valid HTML with closing tags
- ✅ Static class attributes (no JSX expressions)

## Key Contacts / Resources

- **Architecture Document**: See `docs/compiler-architecture.md` for full pipeline details
- **Phase Plan**: See `docs/compiler-rebuild-plan.md` for phase requirements
- **V1 Reference**: See `src-v1/` for working implementation
- **Monorepo Structure**: See `/CLAUDE.md` in repo root for VJS package organization
