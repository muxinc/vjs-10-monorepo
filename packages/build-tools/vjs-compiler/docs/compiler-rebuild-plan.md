# VJS Compiler Rebuild: Comprehensive Phased Implementation Plan

## Executive Summary

**Primary Goal:** Build a compiler that transforms React skins (with Tailwind v4 in styles.ts) → Web Component skins (with inline vanilla CSS), achieving visual/functional equivalence with production skins (MediaSkinDefault, MediaSkinToasted).

**Strategy:** Progressive complexity across multiple dimensions, with separate styles.ts from the start, culminating in full compilation of production skins.

**Timeline:** ~24 phases over 3-4 weeks of focused work.

---

## Core Architecture Decisions

### 1. Separate styles.ts from Phase 0

**Rationale:**

- Usage analysis requires named style keys (can't work with inline styles)
- Selector categorization compares key names to component names
- Can pass styles source as string (no filesystem needed initially)
- More realistic to actual usage patterns

### 2. Single Transformation Path

**Focus:** React + Tailwind v4 → Web Component + Inline Vanilla CSS
**Defer:** Alternative CSS strategies (inline-tailwind-utilities)

### 3. CSS Modules as Intermediary

**Always:** Tailwind utilities → CSS Modules → PostCSS/Tailwind → Vanilla CSS with semantic selectors

### 4. End-to-End Validation from Phase 2 Onward

**Critical:** Every phase with CSS must validate:

1. **Syntactic Validity:** Generated code is valid TypeScript/HTML/CSS
2. **Browser Loadability:** Code can be loaded in a browser without errors
3. **Visual Equivalence:** Playwright screenshot comparison with React version
4. **CSS Semantic Equivalence:** Computed styles match expected values

**No phase is complete without visual validation proving the output works.**

---

## Complexity Dimensions & Phase Distribution

### Dimension 1: CSS Transformation Complexity (Primary - 14 phases)

Progressive Tailwind feature support, building to full production skin capability.

### Dimension 2: Selector Categorization (4 phases)

From class-only to full usage analysis with element/type/compound selectors.

### Dimension 3: Import/Path Resolution (5 phases)

From hypothetical paths to real packages with complex import scenarios.

### Dimension 4: JSX Transformation (3 phases)

From simple elements to compound components and special patterns.

### Dimension 5: Integration & Production (3 phases)

Visual validation, performance, production deployment.

**Total:** ~24 phase-level validation points (some phases overlap dimensions)

---

## Architectural Compliance Checkpoints

### Pre-Commit Checklist

Before each commit, verify compliance with core architectural principles from [architecture/ARCHITECTURE.md](./architecture/ARCHITECTURE.md):

#### ✅ **1. Separation of Concerns**

- [ ] Core transformation functions are pure (accept strings/config, return strings/data)
- [ ] No filesystem access in core transformation logic
- [ ] All file I/O isolated to boundary layer (CLI, build scripts)
- [ ] Functions testable without filesystem access

#### ✅ **2. Push Assumptions to Boundaries**

- [ ] No hardcoded VJS-specific logic deep in transformation (e.g., `if (pkg.startsWith('@vjs-10/'))`)
- [ ] Context and conventions passed as data through config
- [ ] Naming conventions configurable or passed as functions
- [ ] Discovery happens at boundaries, results passed as data

#### ✅ **3. Functional Over Declarative**

- [ ] Use predicate functions to answer questions (`isVJSComponent`, `isStyleImport`)
- [ ] Use projection functions for transformations (`projectImportToTarget`)
- [ ] Avoid large declarative data structures (use functions instead)
- [ ] Composable, injectable behavior

#### ✅ **4. Identify, Then Transform** (Most Critical)

- [ ] **Phase 1: Identification** - Extract structure (imports, JSX elements, className usage)
- [ ] **Phase 2: Categorization** - Classify based on usage + context (component vs style, VJS vs external)
- [ ] **Phase 3: Projection** - Transform based on category
- [ ] Clear separation between these phases
- [ ] Usage analysis drives categorization (not just naming conventions)

#### ✅ **5. VJS-Specific But Extensible**

- [ ] VJS conventions explicit and documented
- [ ] Conventions overridable through config
- [ ] Extension points clearly defined

### Post-Commit Review

After significant work (end of phase/milestone):

1. **Review separation of concerns**: Are transformations still pure?
2. **Check assumption creep**: Have VJS assumptions leaked into core logic?
3. **Assess categorization quality**: Is usage analysis driving decisions?
4. **Evaluate extensibility**: Could we support a new framework/CSS strategy without rewriting core?

### Current Implementation Status

**Completed (Phases 0-4) - Updated 2025-10-07**:

- ✅ **Separation of Concerns**: Core functions are pure (strings in, strings out)
- ✅ **Functional/Predicative**: Predicate and projection functions implemented
- ✅ **Identify, Then Transform**: Full 3-phase pipeline working
  - Phase 1: Identification (analyzeJSXUsage, analyzeClassNameUsage, buildUsageGraph)
  - Phase 2: Categorization (categorizeImport, categorizeStyleKey, categorizeUsageGraph)
  - Phase 3: Projection (projectImport, projectStyleSelector)
- ✅ **CSS Selector Matching**: Element selectors for component IDs, class selectors for types
- ✅ **Tailwind Theme**: Full utility support with CSS variables
- ⚠️ **Push Assumptions**: Some hardcoded conventions (e.g., `media-` prefix, VJS package patterns)
- ⚠️ **Extensibility**: Conventions not yet easily overridable

**Test Status**: 89 tests passing (14 test files)

- 70 unit tests
- 17 integration tests
- 2 E2E tests with CSS computed styles validation

**Next Priorities**:

1. Extract VJS-specific conventions to config (medium priority)
2. Compound components support (`<TimeRange.Root>`) for production skins
3. Data attributes support (`data-*`)
4. Production skin compilation (MediaSkinDefault, MediaSkinToasted)

---

## Phase 0: Foundation - Parse Only, No Transformation

### Goal

Validate we can parse skin source and styles source, extract structure, no CSS transformation yet.

### Scope

- ✅ Parse skin TSX (extract JSX, imports, default export)
- ✅ Parse styles.ts (extract styles object with keys)
- ✅ Build basic AST infrastructure
- ❌ No CSS transformation
- ❌ No selector categorization
- ❌ No import transformation

### Test Fixtures

```typescript
// minimal-skin.tsx
import { MediaContainer, PlayButton } from '@vjs-10/react';
import styles from './styles';

export default function MinimalSkin({ children, className = '' }) {
  return (
    <MediaContainer className={styles.Container}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={styles.Button} />
      </div>
    </MediaContainer>
  );
}

// styles.ts
const styles = {
  Container: 'relative',
  Controls: 'flex gap-2',
  Button: 'p-2 rounded',
};
export default styles;
```

### Expected Output

```typescript
// Parsed structure only, minimal transformation
{
  skinAST: { /* Babel AST */ },
  stylesObject: { Container: 'relative', Controls: 'flex gap-2', Button: 'p-2 rounded' },
  imports: [
    { source: '@vjs-10/react', specifiers: ['MediaContainer', 'PlayButton'] },
    { source: './styles', default: 'styles' }
  ],
  componentName: 'MinimalSkin'
}
```

### Tasks

- [ ] Setup: Rename src/ → src-v1/, test/ → test-v1/
- [ ] Create new directory structure (boundary/config/core/pipelines)
- [ ] Core types (CompileSkinConfig, PathContext, PackageInfo)
- [ ] Parser: parseSource.ts (Babel parsing)
- [ ] Parser: extractJSX.ts (extract JSX from component)
- [ ] Parser: extractImports.ts (extract import declarations)
- [ ] Parser: extractStyles.ts (parse styles.ts, extract object)
- [ ] Unit tests for each parser function

### Success Criteria

- ✅ Can parse skin TSX source
- ✅ Can parse styles.ts source
- ✅ Extracts JSX, imports, component name correctly
- ✅ Extracts styles object with keys
- ✅ All unit tests pass
- ✅ No filesystem required (strings only)

---

## End-to-End Validation Strategy (Phase 2+)

### Every Phase Must Prove Output Works

Starting from Phase 2 (when we have actual CSS), every phase must include:

#### 1. Syntactic Validation

```typescript
// Generated code must compile and pass linting
test('generated code is syntactically valid', async () => {
  const result = await compileSkin(source, config);

  // TypeScript compilation check
  expect(() => typescript.compile(result.code)).not.toThrow();

  // ESLint check
  expect(() => eslint.verify(result.code)).not.toThrow();
});
```

#### 2. Browser Loading Test

```typescript
// Generated code must load in browser without errors
test('compiled skin loads in browser', async () => {
  const result = await compileSkin(source, config);

  // Write to test file
  await fs.writeFile('/tmp/test-skin.js', result.code);

  // Load in Playwright
  await page.goto('http://localhost:3000/test.html');

  // Check for console errors
  const errors = await page.evaluate(() => window.__errors || []);
  expect(errors).toHaveLength(0);
});
```

#### 3. Visual Regression Test

```typescript
// Visual appearance must match React version
test('visual appearance matches React version', async () => {
  // Load React version
  await page.goto('http://localhost:3000/react-test.html');
  const reactScreenshot = await page.screenshot();

  // Load Web Component version
  await page.goto('http://localhost:3000/wc-test.html');
  const wcScreenshot = await page.screenshot();

  // Compare screenshots
  expect(wcScreenshot).toMatchImageSnapshot({
    customSnapshotIdentifier: 'skin-phase-2',
    failureThreshold: 0.01, // 1% difference allowed
    failureThresholdType: 'percent',
  });
});
```

#### 4. CSS Equivalence Test

```typescript
// Computed styles must match expected values
test('computed styles are equivalent', async () => {
  await page.goto('http://localhost:3000/wc-test.html');

  const styles = await page.evaluate(() => {
    const container = document.querySelector('media-container');
    const computed = window.getComputedStyle(container);
    return {
      position: computed.position,
      overflow: computed.overflow,
    };
  });

  expect(styles.position).toBe('relative');
  expect(styles.overflow).toBe('clip');
});
```

### Test Infrastructure Requirements

- **Test HTML pages** for both React and Web Component versions
- **Local dev server** to serve test pages
- **Playwright** configured for screenshot comparison
- **Visual regression baseline** images stored in repo

### Phase Completion Criteria

A phase is **NOT complete** until:

1. ✅ All unit tests pass
2. ✅ Integration test passes
3. ✅ Generated code compiles without errors
4. ✅ Code loads in browser without console errors
5. ✅ Visual screenshot matches React version
6. ✅ Computed styles match expected values

---

## Subsequent Phases

See plan document for full phase breakdown (Phases 1-24).

Key milestones:

- **Phase 1:** JSX + Import transformation
- **Phase 2:** Simple CSS with class selectors
- **Phase 5:** Element selectors (usage analysis)
- **Phase 12:** Compound components
- **Phase 17:** Full MediaSkinDefault compilation
- **Phase 18:** Full MediaSkinToasted compilation
- **Phase 24:** Production deployment
