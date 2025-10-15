# Test Skin Reorganization Proposal

**Created:** 2025-10-15
**Status:** PROPOSAL - Awaiting approval before implementation

---

## Problem Statement

Our current test skin organization has issues:

### 1. "Level" Terminology is Implementation-Focused
- **Current:** `01-minimal` (Level 1), `03-hover` (Level 3), etc.
- **Problem:** "Levels" imply progressive complexity and implementation order
- **Issue:** Creates false dependencies between skins - you shouldn't need Level 1 to understand Level 3

### 2. Mixed Concerns in Single Skins
- **Example:** `06-combined` tests multiple unrelated features
- **Problem:** When it fails, unclear which feature is broken
- **Issue:** Poor regression testing - can't isolate which feature regressed

### 3. Duplicate/Overlapping Coverage
- **Example:** `07-color-opacity` AND `07-semantic-colors` both test color features
- **Problem:** Unclear distinction between the two
- **Issue:** Test maintenance burden

### 4. Implementation Order Baked Into Structure
- **Current:** Numbered 00-12 based on implementation phases
- **Problem:** New features don't fit cleanly into sequence
- **Issue:** Renumbering cascade when adding features

---

## Core Principles for Reorganization

### Principle 1: One Feature Per Skin
**Each skin tests exactly ONE Tailwind or transformation feature in isolation.**

**Why:**
- Clear failure diagnosis (if `hover-test` fails, hover is broken)
- Easy regression testing (re-run specific feature test)
- Simple mental model (name = feature being tested)

**Example:**
```
hover-pseudo-class/       # Tests ONLY :hover mechanism
focus-pseudo-class/       # Tests ONLY :focus-visible mechanism
data-attribute/           # Tests ONLY [data-*] selector generation
```

### Principle 1a: Use Opacity for Isolation
**When testing modifiers (hover:, focus:, dark:), use ONLY opacity utilities to avoid dependencies.**

**Why:**
- Modifier tests should validate the MODIFIER works, not the utility
- Using `hover:bg-blue-500` tests both hover AND color utilities
- Using `hover:opacity-80` tests ONLY hover mechanism

**Bad Examples (multiple dependencies):**
```tsx
// ❌ Tests hover + colors + transforms simultaneously
hover:bg-blue-500 hover:scale-110 hover:text-white

// ❌ Tests focus + ring + outline simultaneously
focus:ring-2 focus:ring-blue-500 focus:outline-none

// ❌ Tests active + colors + transforms simultaneously
active:bg-blue-700 active:scale-95
```

**Good Examples (isolated features):**
```tsx
// ✅ Tests ONLY hover modifier mechanism
hover:opacity-80 hover:opacity-50

// ✅ Tests ONLY focus-visible modifier mechanism
focus-visible:opacity-80 focus-visible:opacity-60

// ✅ Tests ONLY active modifier mechanism
active:opacity-60 active:opacity-40
```

### Principle 2: Feature-Based Naming, Not Complexity-Based
**Name skins after the feature they test, not their complexity level.**

**Why:**
- Self-documenting (name tells you what's tested)
- No artificial ordering (hover isn't "more complex" than data attributes)
- Flexible (add new features without renumbering)

**Bad:** `03-hover`, `05-responsive`
**Good:** `hover-pseudo-class`, `responsive-breakpoints`

### Principle 3: Minimal Complexity For Target Feature
**Each skin should be as simple as possible while testing its target feature.**

**Why:**
- Clear focus on what's being tested
- Easier to understand test failures
- Faster to write and maintain

**For React → WC transformation tests (Category 1):**
Test the specific JSX pattern, use minimal Tailwind CSS (or none).

```tsx
// ✅ GOOD: Testing template literal className
<Button className={`${styles.A} ${styles.B}`} />
// Uses simple opacity utilities to verify classes generated

// ❌ BAD: Adding unnecessary React complexity
<Button className={`${styles.A} ${styles.B} ${condition ? styles.C : ''}`} />
// Tests template literals AND conditionals simultaneously
```

**For Tailwind tests (Categories 2-5):**
Use simplest JSX pattern possible, focus on Tailwind CSS feature.

```tsx
// ✅ GOOD: Testing hover pseudo-class
<Button className={styles.Button} />
// styles.Button = 'hover:opacity-80'

// ❌ BAD: Adding unnecessary JSX complexity
<Button className={`${styles.Button} ${styles.Icon}`} />
// Tests hover AND template literals simultaneously
```

### Principle 4: Clear Feature Documentation
**Each skin's README should clearly state what feature is being tested and why.**

**Template:**
```markdown
# Feature: [Feature Name]

## What This Tests
[Single sentence describing the feature]

## Tailwind Classes Used
- `hover:bg-blue-500` - Hover state background color
- `transition-colors` - Smooth color transitions

## Expected Behavior
- [What should work in the compiled output]

## Known Issues
- [Any known limitations or blockers]
```

---

## Proposed Reorganization

### Category 1: Compiler Baseline (React → WC Transformation)

These test the compiler's ability to transform React to Web Components, independent of Tailwind. Each focuses on a specific JSX/React pattern.

```
structural/              # 00-structural (keep as-is)
  Purpose: Basic structure - imports, template, registration
  Tests: React → WC transformation, base template, imports
  JSX: Minimal valid structure

minimal/                 # 01-minimal (rename from level-based)
  Purpose: Simplest working skin with one button
  Tests: End-to-end compilation baseline
  JSX: Single className with styles.Key reference

jsx-single-style-key/    # NEW
  Purpose: Single style key in className
  JSX: className={styles.Button}
  Tests: Simple member expression → class attribute
  Expected: <button class="button">

jsx-template-literal-two-keys/ # NEW
  Purpose: Template literal with two style keys
  JSX: className={`${styles.Button} ${styles.Primary}`}
  Tests: Template literal → space-separated classes
  Expected: <button class="button primary">

jsx-template-literal-mixed/ # NEW
  Purpose: Template literal with styles + static string
  JSX: className={`${styles.Button} custom-class`}
  Tests: Mixed template literal → combined classes
  Expected: <button class="button custom-class">

jsx-static-classname/    # NEW
  Purpose: Static string className (no styles object)
  JSX: className="custom-button"
  Tests: String literal passthrough
  Expected: <button class="custom-button">

jsx-conditional-simple/  # NEW
  Purpose: Ternary conditional className
  JSX: className={isActive ? styles.Active : styles.Inactive}
  Tests: Conditional expression (takes consequent branch)
  Expected: <button class="active">

jsx-compound-components/ # NEW (extract from existing)
  Purpose: Member expression components
  JSX: <TimeRange.Root>, <TimeRange.Track>
  Tests: Compound component → kebab-case
  Expected: <media-time-range-root>, <media-time-range-track>

jsx-self-closing-tags/   # NEW
  Purpose: Self-closing elements
  JSX: <Icon />, <Separator />
  Tests: Self-closing → explicit closing tags
  Expected: <media-icon></media-icon>, <separator></separator>

jsx-children-slot/       # NEW
  Purpose: {children} expression
  JSX: <Container>{children}</Container>
  Tests: {children} → <slot name="media" slot="media"></slot>
  Expected: <media-container><slot name="media" slot="media"></slot></media-container>

jsx-nested-elements/     # NEW
  Purpose: Deeply nested component tree
  JSX: <Container><Div><Button><Icon /></Button></Div></Container>
  Tests: Recursive JSX transformation
  Expected: Correct nesting with all closing tags
```

**Rationale:** React → WC transformation has complexity independent of Tailwind. These tests validate JSX transformation patterns used in real skins (like MediaSkinDefault).

---

### Category 2: Tailwind Utilities (Basic CSS Generation)

Each skin tests one category of Tailwind utilities.

```
layout-utilities/        # NEW (extract from current skins)
  Purpose: flex, grid, relative, absolute, inset
  Classes: flex, items-center, justify-center, absolute, inset-0

spacing-utilities/       # NEW (extract from current skins)
  Purpose: padding, margin, gap
  Classes: p-3, px-4, gap-2, m-2

sizing-utilities/        # NEW (extract from current skins)
  Purpose: width, height, size
  Classes: w-full, h-full, size-10

color-utilities/         # NEW (consolidate color tests)
  Purpose: Basic color application
  Classes: bg-blue-500, text-white, border-red-300

border-utilities/        # NEW (extract from current skins)
  Purpose: border-radius, border-width
  Classes: rounded-full, rounded-lg, border-2
```

**Rationale:** Validate that basic Tailwind utility generation works across all categories.

---

### Category 3: Tailwind Modifiers (CSS Variants)

Each skin tests one type of CSS variant/modifier using ONLY opacity to avoid dependencies.

```
hover-pseudo-class/      # 03-hover (rename)
  Purpose: :hover pseudo-class generates correct selector
  Classes: hover:opacity-80, hover:opacity-50
  Why opacity: Tests hover mechanism without depending on colors/transforms

focus-pseudo-class/      # NEW (extract from 03-hover)
  Purpose: :focus-visible pseudo-class
  Classes: focus-visible:opacity-80, focus-visible:opacity-50
  Why opacity: Tests focus mechanism without depending on ring utilities

active-pseudo-class/     # NEW (extract from 03-hover)
  Purpose: :active pseudo-class
  Classes: active:opacity-60, active:opacity-40
  Why opacity: Tests active mechanism without depending on colors/transforms

data-attribute-presence/ # NEW (extract from 02-interactive)
  Purpose: [data-*] attribute presence selector
  Classes: [&[data-paused]]:opacity-0, [&[data-playing]]:opacity-100
  Why opacity: Tests data attribute matching without depending on other features

data-attribute-value/    # NEW (split from above)
  Purpose: [data-*] attribute with specific value
  Classes: [&[data-state="active"]]:opacity-100, [&[data-state="inactive"]]:opacity-50
  Why separate: Different CSS generation (attribute vs attribute=value)

responsive-breakpoints/  # 05-responsive (rename)
  Purpose: Viewport-based @media queries
  Classes: sm:opacity-50, md:opacity-70, lg:opacity-90
  Why opacity: Tests media query generation without depending on layout

dark-mode/               # NEW (extract from existing tests)
  Purpose: prefers-color-scheme @media query
  Classes: dark:opacity-80, dark:opacity-60
  Why opacity: Tests color-scheme detection without depending on colors
```

**Rationale:** Using opacity for all modifier tests ensures we're testing the MODIFIER mechanism (hover, focus, data-*) not the UTILITY (colors, transforms). This achieves true isolation.

---

### Category 4: Advanced Tailwind Features

Each skin tests one advanced Tailwind feature using minimal utilities.

```
arbitrary-values-color/  # NEW (split from 04-arbitrary)
  Purpose: Arbitrary color values
  Classes: bg-[#1da1f2], text-[rgb(255,0,0)], border-[#3b82f6]
  Why separate: Tests color parsing in arbitrary values

arbitrary-values-size/   # NEW (split from 04-arbitrary)
  Purpose: Arbitrary sizing values
  Classes: w-[clamp(100px,50%,500px)], h-[calc(100vh-64px)]
  Why separate: Tests calc/clamp parsing in arbitrary values

arbitrary-values-property/ # 04-arbitrary (refocus)
  Purpose: Arbitrary CSS property syntax
  Classes: [grid-area:1/1], [mask-image:linear-gradient(...)]
  Why: Tests arbitrary property name/value pairs

color-opacity-slash/     # 07-color-opacity (rename + focus)
  Purpose: Color opacity slash syntax specifically
  Classes: bg-white/10, bg-black/50, text-blue-500/30
  Why: Tests slash opacity parsing (different from opacity utility)

descendant-selectors/    # NEW (extract from 02-interactive, 05, 06)
  Purpose: Arbitrary variant with child selectors
  Classes: [&_.icon]:opacity-0, [&_.icon]:opacity-100
  Why opacity: Tests descendant selector generation without depending on shrink

transitions-property/    # NEW (extract from 03-hover)
  Purpose: CSS transition-property
  Classes: transition-opacity, transition-transform, transition-all
  Why separate: Tests which properties are transitioned

transitions-timing/      # NEW (split from above)
  Purpose: CSS transition timing
  Classes: duration-300, duration-150, ease-in-out, ease-linear
  Why separate: Tests timing function generation

transforms-translate/    # NEW (extract from 03-hover)
  Purpose: CSS translate transforms
  Classes: translate-x-4, translate-y-2, -translate-x-1
  Why separate: Tests translate value generation

transforms-scale/        # NEW (split from above)
  Purpose: CSS scale transforms
  Classes: scale-90, scale-110, scale-x-50
  Why separate: Tests scale value generation (different parsing)

transforms-rotate/       # NEW (split from above)
  Purpose: CSS rotate transforms
  Classes: rotate-45, rotate-90, -rotate-12
  Why separate: Tests rotation angle generation

gradients-direction/     # NEW (if not already covered)
  Purpose: Linear gradient direction
  Classes: bg-gradient-to-r, bg-gradient-to-t, bg-gradient-to-br
  Why separate: Tests direction parsing

gradients-stops/         # NEW (split from above)
  Purpose: Gradient color stops
  Classes: from-white, via-gray-500, to-black
  Why separate: Tests color stop generation (depends on color utilities working)

backdrop-filters/        # NEW (extract from existing)
  Purpose: Backdrop filter effects
  Classes: backdrop-blur-md, backdrop-saturate-150, backdrop-brightness-90
  Why: Tests backdrop-filter CSS generation
```

**Rationale:** Split complex features into atomic tests. Each test validates ONE parsing/generation mechanism.

---

### Category 5: Critical Unsupported Features

These document features that DON'T work yet (tests should fail/skip). Using opacity to isolate the feature being tested.

```
named-groups/            # 10-named-groups (rename)
  Purpose: Tailwind named group feature
  Classes: group/root, group-hover/root:opacity-100, group-focus/controls:opacity-80
  Why opacity: Tests named group mechanism without depending on colors
  Status: ❌ NOT SUPPORTED (critical blocker)

has-selector/            # 09-has-selector (rename)
  Purpose: CSS :has() pseudo-class
  Classes: has-[[data-paused]]:opacity-0, has-[+button]:opacity-100
  Why opacity: Tests :has() selector without depending on transforms
  Status: ❌ NOT SUPPORTED (critical blocker)

before-pseudo-element/   # NEW (split from 08-before-after)
  Purpose: ::before pseudo-element
  Classes: before:opacity-50, before:[content:""]
  Why separate: Different from ::after (separate pseudo-element)
  Status: ❌ NOT SUPPORTED (critical blocker)

after-pseudo-element/    # NEW (split from 08-before-after)
  Purpose: ::after pseudo-element
  Classes: after:opacity-50, after:[content:""]
  Why separate: Different from ::before (separate pseudo-element)
  Status: ❌ NOT SUPPORTED (critical blocker)

container-definition/    # NEW (split from 12-container-queries)
  Purpose: Container definition (@container/name)
  Classes: @container/root, @container/controls
  Why separate: Container definition works, variants don't
  Status: ✅ WORKS (container-type generates correctly)

container-query-variant/ # NEW (split from 12-container-queries)
  Purpose: Container query variant (@md/name:)
  Classes: @md/root:opacity-80, @lg/controls:opacity-90
  Why opacity: Tests container query variant without depending on layout
  Status: ❌ NOT SUPPORTED (CLI limitation - critical blocker)

aria-disabled/           # NEW (split from 11-aria-states)
  Purpose: aria-disabled attribute selector
  Classes: aria-disabled:opacity-50, aria-disabled:opacity-30
  Why separate: Different ARIA attribute
  Status: ❌ NOT TESTED (unknown if works)

aria-expanded/           # NEW (split from 11-aria-states)
  Purpose: aria-expanded attribute selector
  Classes: aria-expanded:opacity-100, aria-expanded:opacity-0
  Why separate: Different ARIA attribute
  Status: ❌ NOT TESTED (unknown if works)
```

**Rationale:** Document blockers clearly with failing tests. Split features so we can track which specific selector/mechanism is broken.

---

## Implementation Plan

### Phase 1: Audit & Document Current State ✅ (This Doc)

- [x] List all existing test skins
- [x] Identify what each currently tests
- [x] Propose new organization
- [x] Get approval

### Phase 2: Create New Skins (Feature Extraction)

For each new skin category:
1. Create directory with clear name (`hover-pseudo-class/` not `03-hover/`)
2. Extract minimal TSX code from existing skins
3. Create focused `styles.ts` with ONLY relevant classes
4. Write `README.md` documenting the feature
5. Update HTML demos (React + WC versions)

### Phase 3: Migrate Existing Skins

For each existing skin:
1. Rename directory (remove number prefix)
2. Update comments to remove "Level X" terminology
3. Simplify if needed (remove unnecessary React complexity)
4. Update README to match new template

### Phase 4: Update Documentation

- Update `docs/tailwind/SUPPORT_STATUS.md` (remove "Level" references)
- Update `docs/testing/E2E_GUIDE.md` (new skin organization)
- Update `docs/LESSONS_FROM_V1.md` (if referencing test skins)
- Update test scripts (remove level-based naming)

### Phase 5: Update Test Infrastructure

- Update compile scripts to use new names
- Update HTML demo generation
- Update Playwright test discovery
- Verify all tests still pass (or fail appropriately)

---

## Migration Examples

### Example 1: Simple Rename

**Before:** `03-hover/MediaSkinHover.tsx`
```tsx
/**
 * Level 3: Hover and Pseudo-Classes Test Skin
 * ...
 */
```

**After:** `hover-pseudo-class/MediaSkinHoverPseudoClass.tsx`
```tsx
/**
 * Feature: Hover Pseudo-Class
 *
 * Tests: Tailwind :hover modifier generates correct CSS
 * Classes: hover:bg-*, hover:opacity-*, hover:scale-*
 */
```

### Example 2: Feature Extraction

**Before:** `03-hover/` tests hover + focus + active + transitions

**After:** Split into 4 skins:
- `hover-pseudo-class/` - ONLY hover:
- `focus-pseudo-class/` - ONLY focus:
- `active-pseudo-class/` - ONLY active:
- `transitions/` - ONLY transition utilities

### Example 3: Consolidation

**Before:**
- `07-color-opacity/` - opacity slash syntax
- `07-semantic-colors/` - semantic color utilities

**After:**
- `color-opacity/` - opacity slash syntax (rename)
- Delete `07-semantic-colors/` (covered by `color-utilities/`)

---

## Benefits of This Reorganization

### For Developers

1. **Clear Intent:** Name tells you what's being tested
2. **Easy Debugging:** Test failure points to specific feature
3. **Fast Iteration:** Run only the relevant test for your feature
4. **Simple Addition:** Add new feature test without renumbering

### For Documentation

1. **Self-Documenting:** Skin names match feature names in docs
2. **Easy Cross-Reference:** Link directly from SUPPORT_STATUS.md
3. **Clear Coverage:** Can see at a glance what's tested

### For Regression Testing

1. **Isolated Failures:** Know exactly what broke
2. **Targeted Fixes:** Only retest the affected feature
3. **Clear History:** Git log shows feature-specific changes

### For New Contributors

1. **Low Barrier:** Understand what each skin tests from name alone
2. **No Implied Order:** Can work on any feature independently
3. **Clear Examples:** See how to test a specific Tailwind feature

---

## Open Questions

1. **Naming Convention:** Use kebab-case or PascalCase for directories?
   - **Proposal:** kebab-case (matches URL/file conventions)

2. **HTML Demo Structure:** Keep all in one demo or separate per feature?
   - **Proposal:** One demo app, dynamically load skins via routes

3. **Test Discovery:** How do Playwright tests find new skins?
   - **Proposal:** Use glob pattern `test/e2e/app/src/skins/*/`

4. **README Template:** Enforce strict template or allow flexibility?
   - **Proposal:** Template required, can add extra sections

---

## Success Criteria

This reorganization is successful when:

- ✅ Every test skin name clearly describes what it tests
- ✅ No "Level" terminology in code or docs
- ✅ Each skin tests exactly one feature
- ✅ New features can be added without renumbering
- ✅ Test failures clearly indicate which feature is broken
- ✅ Documentation references align with test skin names
- ✅ All existing tests still pass (or fail appropriately)

---

## Next Steps

1. **Get Approval:** Review this proposal with team
2. **Prioritize:** Which skins to migrate first?
3. **Execute:** Follow implementation plan
4. **Validate:** Ensure no regressions in test coverage
5. **Document:** Update all references to old names

---

## Appendix: Current vs Proposed Mapping

### Category 1: React → WC Transformation

| Current | Proposed | Notes |
|---------|----------|-------|
| 00-structural | structural/ | Keep as-is |
| 01-minimal | minimal/ | Simple rename |
| (NEW) | jsx-single-style-key/ | Extract pattern from existing |
| (NEW) | jsx-template-literal-two-keys/ | From MediaSkinDefault pattern |
| (NEW) | jsx-template-literal-mixed/ | From MediaSkinDefault pattern |
| (NEW) | jsx-static-classname/ | Edge case coverage |
| (NEW) | jsx-conditional-simple/ | From MediaSkinDefault pattern |
| 02-interactive (partial) | jsx-compound-components/ | Extract compound pattern |
| (NEW) | jsx-self-closing-tags/ | Edge case coverage |
| (NEW) | jsx-children-slot/ | Core transformation |
| (NEW) | jsx-nested-elements/ | Recursive transformation |

### Category 2-5: Tailwind Features

| Current | Proposed | Category | Notes |
|---------|----------|----------|-------|
| (NEW) | layout-utilities/ | Utilities | Extract from existing |
| (NEW) | spacing-utilities/ | Utilities | Extract from existing |
| (NEW) | color-utilities/ | Utilities | Extract from existing |
| (NEW) | sizing-utilities/ | Utilities | Extract from existing |
| (NEW) | border-utilities/ | Utilities | Extract from existing |
| 03-hover | hover-pseudo-class/ | Modifiers | Refocus on hover only + opacity |
| (NEW) | focus-pseudo-class/ | Modifiers | Extract from 03-hover |
| (NEW) | active-pseudo-class/ | Modifiers | Extract from 03-hover |
| 02-interactive (partial) | data-attribute-presence/ | Modifiers | Extract data-* pattern |
| (NEW) | data-attribute-value/ | Modifiers | Split from presence |
| 05-responsive | responsive-breakpoints/ | Modifiers | Refocus on media queries + opacity |
| (NEW) | dark-mode/ | Modifiers | Extract from existing |
| 04-arbitrary | arbitrary-values-property/ | Advanced | Refocus on property syntax |
| (NEW) | arbitrary-values-color/ | Advanced | Split from 04-arbitrary |
| (NEW) | arbitrary-values-size/ | Advanced | Split from 04-arbitrary |
| 07-color-opacity | color-opacity-slash/ | Advanced | Refocus on slash syntax |
| 02-interactive (partial) | descendant-selectors/ | Advanced | Refocus on [&_child] + opacity |
| (NEW) | transitions-property/ | Advanced | Extract from 03-hover |
| (NEW) | transitions-timing/ | Advanced | Split from property |
| (NEW) | transforms-translate/ | Advanced | Extract from 03-hover |
| (NEW) | transforms-scale/ | Advanced | Split from translate |
| (NEW) | transforms-rotate/ | Advanced | Split from translate |
| (NEW) | gradients-direction/ | Advanced | Extract from existing |
| (NEW) | gradients-stops/ | Advanced | Split from direction |
| (NEW) | backdrop-filters/ | Advanced | Extract from existing |
| 10-named-groups | named-groups/ | Unsupported | Refocus + opacity |
| 09-has-selector | has-selector/ | Unsupported | Refocus + opacity |
| 08-before-after | before-pseudo-element/ | Unsupported | Split ::before |
| (NEW) | after-pseudo-element/ | Unsupported | Split ::after |
| 12-container-queries | container-definition/ | Unsupported | Split definition (works) |
| (NEW) | container-query-variant/ | Unsupported | Split variants (broken) |
| 11-aria-states | aria-disabled/ | Unsupported | Split aria-disabled |
| (NEW) | aria-expanded/ | Unsupported | Split aria-expanded |

### Deletions

| Current | Reason |
|---------|--------|
| 06-combined | Mixed concerns - split into focused tests |
| 07-semantic-colors | Duplicate of color-utilities/ |

---

**Total Skins:**
- **Current:** 14 skins (numbered 00-12 with one duplicate 07)
- **Proposed:** ~40 skins organized by category:
  - Category 1 (React → WC): 11 skins
  - Category 2 (Utilities): 5 skins
  - Category 3 (Modifiers): 7 skins
  - Category 4 (Advanced): 15 skins
  - Category 5 (Unsupported): 8 skins
