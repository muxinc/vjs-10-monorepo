# VJS Compiler v2: Current Implementation Status

**Last Updated:** 2025-10-07
**Branch:** `build/framework-compiler`

---

## Summary

We have successfully implemented **Phases 0-3** of the compiler rebuild with a working E2E test infrastructure. The compiler can parse, transform, and generate working web components from React skins, but **lacks proper usage analysis and categorization layers** required by the architecture.

---

## What's Working ✅

### Core Infrastructure
- ✅ **Pure transformation functions** - All core logic works with strings, not files
- ✅ **Pipeline architecture** - Clean parse → transform → generate flow
- ✅ **TypeScript strict mode** - All code compiles with strict type checking
- ✅ **Comprehensive test coverage** - 43 tests passing (unit + integration + E2E)

### Phase 0: Parsing
- ✅ Parse React TSX to AST (`parseSource`)
- ✅ Extract JSX from component (`extractJSX`)
- ✅ Extract imports (`extractImports`)
- ✅ Extract styles object from styles.ts (`extractStyles`)
- ✅ Extract component name (`extractComponentName`)

### Phase 1: Basic Transformation
- ✅ Transform imports (React → Web Component packages)
- ✅ Transform JSX elements (PascalCase → kebab-case with `media-` prefix)
- ✅ Transform className → class
- ✅ Handle `{children}` → `<slot name="media" slot="media"></slot>`

### Phase 2: CSS Transformation
- ✅ Extract Tailwind utilities from styles.ts
- ✅ Process through PostCSS + Tailwind v4
- ✅ Generate vanilla CSS (basic utilities: `relative`, `flex`)
- ✅ Resc

ope CSS to style keys (`.Container`, `.Controls`, etc.)

### Phase 3: Code Generation & E2E Validation
- ✅ Generate web component module structure
- ✅ Generate template HTML with inline CSS
- ✅ Self-registration code (`customElements.define`)
- ✅ **Vite-based E2E test infrastructure** (Playwright + browser automation)
- ✅ **Browser loadability tests** - Components load without console errors
- ✅ **Component registration validation** - Custom elements defined correctly
- ✅ **Shadow DOM validation** - Shadow roots created and populated

---

## Critical Gaps ❌

### 1. Usage Analysis Layer (Biggest Gap)
**Status:** Not implemented
**Impact:** HIGH - Blocks proper CSS and import categorization

**Missing:**
- ❌ Scan JSX to identify which imports are used as elements (components)
- ❌ Scan className to identify which imports are used for styles
- ❌ Track compound component usage (`TimeRange.Root`, `TimeRange.Track`)
- ❌ Build usage graph showing what's used where and how

**Example of what we need:**
```typescript
// Should produce:
{
  imports: [
    { name: 'MediaContainer', usedAs: 'jsx-element' },
    { name: 'PlayButton', usedAs: 'jsx-element' },
    { name: 'styles', usedAs: 'className-member-access' }
  ],
  styleKeyUsage: {
    'Container': { usedOn: ['MediaContainer'], category: 'component-selector' },
    'Button': { usedOn: ['PlayButton'], category: 'type-selector' }
  }
}
```

### 2. Categorization Layer
**Status:** Not implemented
**Impact:** HIGH - Causes incorrect CSS and className transformation

**Missing:**
- ❌ Categorize imports by usage type (component vs style vs framework)
- ❌ Categorize style keys by relationship to components:
  - Component Selector Identifier (exact match: `styles.PlayButton` on `<PlayButton>`)
  - Component Type Selector (suffix: `styles.Button` on multiple button components)
  - Nested Component Selector (compound: `styles.RangeRoot` on `<TimeRange.Root>`)
  - Generic Selector (no match: `styles.Controls` on `<div>`)
- ❌ Determine VJS vs external components based on usage + package context

**Current Behavior:**
- Just lowercases everything: `styles.Container` → `class="container"`
- Doesn't match to component names
- No element selectors (everything is a class selector)

**Expected Behavior:**
```typescript
// styles.Container on <MediaContainer>
// → Category: Component Selector Identifier
// → CSS: media-container { } (element selector)
// → HTML: <media-container> (no class attribute)

// styles.Button on <PlayButton>
// → Category: Component Type Selector
// → CSS: .button { } (class selector)
// → HTML: <media-play-button class="button">
```

### 3. Functional/Predicative Approach
**Status:** Not implemented
**Impact:** MEDIUM - Makes code less extensible and composable

**Missing:**
- ❌ Predicate functions (`isVJSComponent`, `isStyleImport`, `isComponentSelector`)
- ❌ Projection functions (`projectImportToTarget`, `projectSelectorToCSSRule`)
- ❌ Composable transformation pipeline

**Current Approach:** Direct transformation mixed with identification

**Better Approach:**
```typescript
// Identify → Categorize → Project
const imports = extractImports(ast);
const categorized = imports.map(imp => ({
  import: imp,
  category: categorizeImport(imp, usageGraph, packageContext)
}));
const transformed = categorized.map(({ import, category }) =>
  projectImport(import, category, targetContext)
);
```

### 4. Configuration/Convention Injection
**Status:** Partially implemented
**Impact:** MEDIUM - Makes conventions harder to override

**Issues:**
- ⚠️ Naming conventions hardcoded (`media-` prefix, kebab-case conversion)
- ⚠️ VJS-specific logic embedded in core transformations
- ⚠️ Package mappings not easily configurable

**Should Be:**
```typescript
interface NamingConvention {
  componentToTag: (name: string) => string;
  styleKeyToSelector: (key: string, category: SelectorCategory) => string;
  packageMapping: (source: string, target: Platform) => string;
}
```

---

## Observed Issues

### CSS Generation
**Issue:** CSS selectors don't match HTML classes
**Example:**
- CSS: `.Container { position: relative }`
- HTML: `<media-container class="container">`
- Result: Styles not applied ❌

**Root Cause:** Missing selector categorization. Should be:
- CSS: `media-container { position: relative }` (element selector)
- HTML: `<media-container>` (no class needed)

### Some Tailwind Utilities Not Generating
**Issue:** `p-2`, `rounded`, `gap-2`, `px-4`, `py-2`, `flex-1`, `overflow` return empty CSS
**Status:** Documented in tests as TODO
**Likely Cause:** Missing Tailwind theme configuration (spacing, border-radius values)

---

## Test Coverage

### Unit Tests (34 passing)
- ✅ Parser functions (parseSource, extractJSX, extractImports, extractStyles)
- ✅ Basic transformations

### Integration Tests (7 passing)
- ✅ Phase 1: JSX + Import transformation
- ✅ Phase 2: CSS transformation with Tailwind

### E2E Tests (2 passing)
- ✅ Browser loadability (no console errors)
- ✅ Component registration and shadow DOM
- ⏳ CSS computed styles validation (TODO - blocked by categorization)

---

## Next Steps (Prioritized)

### 1. Add Usage Analysis Layer 🔴 HIGH PRIORITY
**Goal:** Scan AST to build usage graph

**Tasks:**
- [ ] `analyzeJSXUsage(ast)` - Find which imports are used as JSX elements
- [ ] `analyzeClassNameUsage(ast)` - Find which imports are used in className
- [ ] `analyzeCompoundComponents(ast)` - Track namespace member access
- [ ] `buildUsageGraph()` - Combine into unified usage graph

**Test:** Can accurately identify component vs style imports based on usage

### 2. Add Categorization Layer 🔴 HIGH PRIORITY
**Goal:** Classify imports and style keys based on usage + context

**Tasks:**
- [ ] `categorizeImport(import, usageGraph, packageContext)` - Categorize imports
- [ ] `categorizeStyleKey(key, componentNames)` - Match style keys to components
- [ ] `determineSelectorCategory()` - Component/Type/Nested/Generic
- [ ] Integration with transformation pipeline

**Test:** Correct categories assigned, CSS selectors match HTML

### 3. Implement Proper Selector Generation 🔴 HIGH PRIORITY
**Goal:** Generate element selectors for component identifiers, class selectors for others

**Tasks:**
- [ ] Update `transformStyles` to use categorization
- [ ] Generate element selectors for Component Selector Identifiers
- [ ] Generate class selectors for Type/Generic selectors
- [ ] Update `transformJSX` to emit classes only for Type/Generic

**Test:** CSS applied correctly, computed styles match expectations

### 4. Extract Conventions to Config 🟡 MEDIUM PRIORITY
**Goal:** Make VJS-specific logic configurable

**Tasks:**
- [ ] Create `NamingConvention` interface
- [ ] Create `PackageMappingStrategy` interface
- [ ] Pass conventions through config
- [ ] Remove hardcoded VJS assumptions from core

**Test:** Can inject custom conventions, non-VJS projects supported

### 5. Add Predicate/Projection Functions 🟡 MEDIUM PRIORITY
**Goal:** Make transformations composable and testable

**Tasks:**
- [ ] Create predicate functions (`isVJSComponent`, etc.)
- [ ] Create projection functions (`projectImportToTarget`, etc.)
- [ ] Refactor transformation pipeline to use these
- [ ] Document extension points

**Test:** Predicates/projections independently testable, composable

### 6. Complete E2E Validation 🟢 LOW PRIORITY (after above)
**Goal:** Full visual and semantic equivalence validation

**Tasks:**
- [ ] CSS computed styles validation (unblocked after categorization)
- [ ] Visual regression tests (Playwright screenshots)
- [ ] React vs Web Component comparison tests

**Test:** Visual pixel-perfect match, all computed styles equivalent

---

## Architecture Compliance

### ✅ Compliant
1. **Separation of Concerns** - Pure transformation functions

### ⚠️ Partial Compliance
2. **Push Assumptions to Boundaries** - Some hardcoded conventions
5. **VJS-Specific But Extensible** - Conventions not easily overridable

### ❌ Non-Compliant
3. **Functional Over Declarative** - No predicates/projections yet
4. **Identify, Then Transform** - Missing usage analysis and categorization

**See:** `docs/compiler-rebuild-plan.md` "Architectural Compliance Checkpoints"

---

## Files Changed (From v1)

### Core Structure
- `src/` → Renamed to `src-v1/`
- `test/` → Renamed to `test-v1/`
- New `src/` directory with clean v2 implementation

### New Files (v2)
- `src/types.ts` - Core type definitions
- `src/core/parser/` - Parsing functions
- `src/core/transformer/` - Transformation functions
- `src/core/css/` - CSS processing
- `src/core/generator/` - Code generation
- `src/pipelines/compileSkin.ts` - Main compilation pipeline
- `test/unit/` - Unit tests
- `test/integration/` - Integration tests
- `test/e2e/` - Browser E2E tests with Vite + Playwright
- `test/fixtures/` - Test fixtures

### Documentation
- `docs/CURRENT_STATUS.md` - This file
- `docs/compiler-rebuild-plan.md` - Implementation plan with checkpoints

---

## How to Continue

1. **Start with usage analysis** - This unblocks everything else
2. **Add categorization** - Enables correct CSS and import transformation
3. **Update transformation logic** - Use categories to drive decisions
4. **Extract conventions** - Make VJS assumptions explicit and overridable
5. **Add predicates/projections** - Make transformations composable
6. **Complete E2E validation** - Prove visual/semantic equivalence

**All changes should maintain the 43 passing tests while adding new capabilities.**
