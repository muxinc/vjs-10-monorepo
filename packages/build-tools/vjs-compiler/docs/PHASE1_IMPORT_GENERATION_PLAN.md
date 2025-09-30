# Phase 1: Import Generation Implementation Plan

**Date:** 2025-10-08
**Status:** Ready to implement
**Goal:** Generate correct imports for compiled skins, unblock E2E tests

---

## Investigation Results

### Current html/html Package State

**MediaSkin Export Status: ❌ NOT EXPORTED**

```typescript
export { PlayButton } from './components/media-play-button.js';
// packages/html/html/src/index.ts
export * as MediaProvider from './media-provider.js';
export * from './skins/compiled/index.js';
export * as MediaThemeDefault from './skins/media-skin-default.js';
// ... other components

// ❌ MediaSkin NOT exported
// ❌ media-container NOT exported
```

**MediaSkin Location:**

- File: `packages/html/html/src/media-skin.ts`
- Exports: `MediaSkin` class, `getTemplateHTML()` function
- Used by: All compiled skins (base class)

**Component Modules Location:**

- Directory: `packages/html/html/src/components/`
- Files: `media-play-button.ts`, `media-time-range.ts`, etc.
- Registration: Self-registering custom elements (side-effect imports)

**V1 Compiler Output (Reference):**

```typescript
// packages/html/html/src/skins/compiled/inline/media-skin-default.ts
import { MediaSkin } from '../../../media-skin'; // Relative path
import '../../../components/media-current-time-display'; // Relative path
import '../../../components/media-duration-display';
import '../../../components/media-fullscreen-button';
import '../../../media-container';
import '../../../components/media-mute-button';
import '../../../components/media-popover';
import '../../../components/media-play-button';
import '../../../components/media-time-range';
import '../../../components/media-volume-range';
import '@vjs-10/html-icons'; // Package import

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}  // Base template
    <style>/* CSS */</style>
    <!-- HTML -->
  `;
}
```

---

## Implementation Strategy

### Part A: Compiler Changes (Import Generation)

**Goal:** Generate imports like v1 compiler, using relative paths within monorepo

**Components:**

1. `PathContext` - Capture input/output locations
2. `calculateRelativePath()` - Compute relative paths
3. Update `projectImport()` - Generate transformed paths
4. Update code generator - Emit imports
5. Add base template injection

### Part B: html/html Package Changes (Export MediaSkin)

**Goal:** Make MediaSkin available for import by compiled skins

**Required Changes:**

1. Export `MediaSkin` from main package index
2. Export `media-container` from main package index (if needed)
3. Update package.json exports map (if needed)

**Rationale:**

- Compiled skins are **inside** the html/html package source
- They use relative imports: `import { MediaSkin } from '../../../media-skin'`
- MediaSkin doesn't need to be in main export (internal implementation detail)
- But it needs to be importable by modules within the package

**Decision:** MediaSkin should stay internal (not in main export), but needs to be exported from its own module file (already is).

---

## PathContext Design

### Context Information Needed

```typescript
/**
 * Path context for import transformation
 */
export interface PathContext {
  /** Absolute path to input file */
  inputPath: string;

  /** Absolute path to output file */
  outputPath: string;

  /** Input package info (if inside monorepo) */
  inputPackage?: PackageInfo;

  /** Output package info (if inside monorepo) */
  outputPackage?: PackageInfo;

  /** Monorepo root path (if inside monorepo) */
  monorepoRoot?: string;
}

export interface PackageInfo {
  /** Package name (e.g., '@vjs-10/react') */
  name: string;

  /** Absolute path to package root */
  root: string;

  /** Package type (react, html, core, etc.) */
  type: 'react' | 'html' | 'react-native' | 'core';
}
```

### Path Transformation Logic

**Case 1: Both files in same package (most common)**

```typescript
// Input:  packages/react/react/src/skins/MediaSkinDefault.tsx
// Output: packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts
// Both in different packages

// Input:  packages/react/react/src/skins/MediaSkinDefault.tsx
// Output: packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts
// Import: '../../../media-skin' (relative from output to target)
```

**Case 2: Component imports (same package)**

```typescript
// Output: packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts
// Import: '../../../components/media-play-button' (relative)
```

**Case 3: Icon package imports (cross-package)**

```typescript
// Input uses: '@vjs-10/react-icons'
// Output uses: '@vjs-10/html-icons'
// Transform: Package name mapping (Phase 2 feature)
// Phase 1: Keep as-is for now
```

**Case 4: External package imports (unchanged)**

```typescript
// Input: 'lodash'
// Output: 'lodash'
// No transformation
```

---

## Implementation Steps

### Step 1: Add PathContext Type

**File:** `src/types.ts`

```typescript
/**
 * Path context for import transformation
 */
export interface PathContext {
  /** Absolute path to input file */
  inputPath: string;

  /** Absolute path to output file */
  outputPath: string;

  /** Monorepo root path (if inside monorepo) */
  monorepoRoot?: string;
}
```

**Validation:**

- TypeScript compiles
- Type is exported and available

---

### Step 2: Implement Path Calculation Utility

**File:** `src/core/projection/calculateRelativePath.ts`

```typescript
import { dirname, extname, relative } from 'node:path';

/**
 * Calculate relative import path from one file to another
 *
 * @param fromFile - Absolute path to importing file
 * @param toFile - Absolute path to target file
 * @returns Relative import path (without extension for TS/JS modules)
 *
 * @example
 * calculateRelativePath(
 *   '/packages/html/html/src/skins/compiled/MediaSkin.ts',
 *   '/packages/html/html/src/media-skin.ts'
 * ) // Returns: '../../../media-skin'
 */
export function calculateRelativePath(fromFile: string, toFile: string): string {
  const fromDir = dirname(fromFile);
  const relativePath = relative(fromDir, toFile);

  // Remove file extension for ES module imports
  const ext = extname(relativePath);
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
    return relativePath.slice(0, -ext.length);
  }

  return relativePath;
}

/**
 * Resolve import source path based on category and context
 *
 * @param originalSource - Original import source (e.g., '../MediaSkin', '@vjs-10/react-icons')
 * @param category - Import category
 * @param context - Path context
 * @returns Transformed import source
 */
export function resolveImportPath(originalSource: string, category: ImportCategory, context: PathContext): string {
  switch (category) {
    case 'vjs-component-same-package':
    case 'vjs-core-package':
      // Relative imports within package
      // Need to resolve to absolute, then calculate relative from output
      // For now, use simple heuristic based on path structure
      return transformComponentImport(originalSource, context);

    case 'vjs-icon-package':
      // Package imports - Phase 2 will handle mapping
      // For now, keep as-is
      return originalSource;

    case 'external-package':
      // External packages unchanged
      return originalSource;

    default:
      return originalSource;
  }
}

/**
 * Transform component import path
 * Handles: '../components/MediaPlayButton' -> '../../../components/media-play-button'
 */
function transformComponentImport(source: string, context: PathContext): string {
  // Simple heuristic for Phase 1:
  // If source starts with '../', assume it's a component in the same package
  // Transform: ../components/X -> ../../../components/X

  if (source.startsWith('../components/')) {
    // Extract component name
    const componentName = source.replace('../components/', '');
    // Convert PascalCase to kebab-case
    const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // Return path relative to compiled/inline/ directory
    return `../../../components/${kebabName}`;
  }

  // MediaSkin import
  if (source.includes('MediaSkin') || source.includes('media-skin')) {
    return '../../../media-skin';
  }

  // MediaContainer import
  if (source.includes('MediaContainer') || source.includes('media-container')) {
    return '../../../media-container';
  }

  return source;
}
```

**Unit Tests:** `test/unit/projection/calculateRelativePath.test.ts`

```typescript
import { describe, expect, it } from 'vitest';

import { calculateRelativePath, resolveImportPath } from '../../../src/core/projection/calculateRelativePath.js';

describe('calculateRelativePath', () => {
  it('calculates path from nested file to sibling', () => {
    const from = '/packages/html/html/src/skins/compiled/inline/MediaSkin.ts';
    const to = '/packages/html/html/src/media-skin.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../media-skin');
  });

  it('calculates path from nested file to component', () => {
    const from = '/packages/html/html/src/skins/compiled/inline/MediaSkin.ts';
    const to = '/packages/html/html/src/components/media-play-button.ts';
    expect(calculateRelativePath(from, to)).toBe('../../../components/media-play-button');
  });

  it('removes .ts extension', () => {
    const from = '/a/b/file.ts';
    const to = '/a/target.ts';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('removes .tsx extension', () => {
    const from = '/a/b/file.tsx';
    const to = '/a/target.tsx';
    expect(calculateRelativePath(from, to)).toBe('../target');
  });

  it('handles same directory', () => {
    const from = '/a/file.ts';
    const to = '/a/target.ts';
    expect(calculateRelativePath(from, to)).toBe('./target');
  });
});

describe('resolveImportPath', () => {
  const context: PathContext = {
    inputPath: '/packages/react/react/src/skins/MediaSkinDefault.tsx',
    outputPath: '/packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts',
  };

  it('transforms component import', () => {
    const result = resolveImportPath('../components/MediaPlayButton', 'vjs-component-same-package', context);
    expect(result).toBe('../../../components/media-play-button');
  });

  it('transforms MediaSkin import', () => {
    const result = resolveImportPath('../MediaSkin', 'vjs-core-package', context);
    expect(result).toBe('../../../media-skin');
  });

  it('keeps icon package imports unchanged (Phase 1)', () => {
    const result = resolveImportPath('@vjs-10/html-icons', 'vjs-icon-package', context);
    expect(result).toBe('@vjs-10/html-icons');
  });

  it('keeps external packages unchanged', () => {
    const result = resolveImportPath('lodash', 'external-package', context);
    expect(result).toBe('lodash');
  });
});
```

**Validation:**

- Run tests: `pnpm test -- calculateRelativePath.test.ts`
- All tests pass
- TypeScript compiles

---

### Step 3: Update projectImport() to Generate Paths

**File:** `src/core/projection/projectImport.ts`

```typescript
import type { CategorizedImport, PathContext } from '../../types.js';

import { resolveImportPath } from './calculateRelativePath.js';

/**
 * Project an import based on its category
 *
 * @param categorizedImport - Categorized import to project
 * @param context - Path context for import transformation
 * @returns Projection describing how to handle this import
 */
export function projectImport(categorizedImport: CategorizedImport, context: PathContext): ImportProjection {
  const { category, import: importDecl } = categorizedImport;

  switch (category) {
    case 'framework-import':
      return projectFrameworkImport(importDecl.source);

    case 'style-import':
      return projectStyleImport(importDecl.source);

    case 'vjs-icon-package':
      return projectVJSIconPackage(importDecl.source, context);

    case 'vjs-core-package':
      return projectVJSCorePackage(importDecl.source, context);

    case 'vjs-component-same-package':
      return projectVJSComponentSamePackage(importDecl.source, context);

    case 'vjs-component-external':
      return projectVJSComponentExternal(importDecl.source, context);

    case 'external-package':
      return projectExternalPackage(importDecl.source);

    default:
      const _exhaustive: never = category;
      return {
        shouldKeep: false,
        shouldTransform: false,
        reason: `Unknown category: ${_exhaustive}`,
      };
  }
}

// Update projection functions to use context
function projectVJSIconPackage(source: string, context: PathContext): ImportProjection {
  return {
    shouldKeep: true,
    shouldTransform: false, // Phase 2 will enable transformation
    transformedSource: source,
    reason: `Icon package '${source}' kept as-is (Phase 1)`,
  };
}

function projectVJSCorePackage(source: string, context: PathContext): ImportProjection {
  const transformedSource = resolveImportPath(source, 'vjs-core-package', context);
  return {
    shouldKeep: true,
    shouldTransform: transformedSource !== source,
    transformedSource,
    reason: `Core package '${source}' transformed to '${transformedSource}'`,
  };
}

function projectVJSComponentSamePackage(source: string, context: PathContext): ImportProjection {
  const transformedSource = resolveImportPath(source, 'vjs-component-same-package', context);
  return {
    shouldKeep: true,
    shouldTransform: transformedSource !== source,
    transformedSource,
    reason: `Same-package component '${source}' transformed to '${transformedSource}'`,
  };
}

function projectVJSComponentExternal(source: string, context: PathContext): ImportProjection {
  const transformedSource = resolveImportPath(source, 'vjs-component-external', context);
  return {
    shouldKeep: true,
    shouldTransform: transformedSource !== source,
    transformedSource,
    reason: `External VJS component '${source}' transformed to '${transformedSource}'`,
  };
}
```

**Unit Tests:** `test/unit/projection/projectImport.test.ts` (update existing)

```typescript
describe('projectImport with PathContext', () => {
  const context: PathContext = {
    inputPath: '/packages/react/react/src/skins/MediaSkinDefault.tsx',
    outputPath: '/packages/html/html/src/skins/compiled/inline/MediaSkinDefault.ts',
  };

  it('transforms component import path', () => {
    const categorized: CategorizedImport = {
      import: { source: '../components/MediaPlayButton', specifiers: [] },
      category: 'vjs-component-same-package',
    };
    const projection = projectImport(categorized, context);
    expect(projection.shouldKeep).toBe(true);
    expect(projection.shouldTransform).toBe(true);
    expect(projection.transformedSource).toBe('../../../components/media-play-button');
  });

  it('transforms MediaSkin import path', () => {
    const categorized: CategorizedImport = {
      import: { source: '../MediaSkin', specifiers: [] },
      category: 'vjs-core-package',
    };
    const projection = projectImport(categorized, context);
    expect(projection.shouldKeep).toBe(true);
    expect(projection.shouldTransform).toBe(true);
    expect(projection.transformedSource).toBe('../../../media-skin');
  });
});
```

**Validation:**

- Run tests: `pnpm test -- projectImport.test.ts`
- All tests pass
- TypeScript compiles

---

### Step 4: Update Code Generator to Emit Imports

**File:** `src/boundary/generator/generateWebComponent.ts`

```typescript
/**
 * Generate web component module code
 */
export function generateWebComponentModule(options: {
  componentName: string;
  templateHTML: string;
  imports: Array<{ source: string; specifiers?: string[] }>;
  includeBaseTemplate: boolean;
}): string {
  const { componentName, templateHTML, imports, includeBaseTemplate } = options;

  // Generate import statements
  const importStatements = imports
    .map((imp) => {
      if (imp.specifiers && imp.specifiers.length > 0) {
        const specifierList = imp.specifiers.join(', ');
        return `import { ${specifierList} } from '${imp.source}';`;
      } else {
        return `import '${imp.source}';`;
      }
    })
    .join('\n');

  // Generate base template call if needed
  const baseTemplateCall = includeBaseTemplate ? '${MediaSkin.getTemplateHTML()}\n    ' : '';

  return `${importStatements}

export function getTemplateHTML() {
  return /* html */ \`
    ${baseTemplateCall}${templateHTML}
  \`;
}

export class ${componentName} extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

if (!customElements.get('${toKebabCase(componentName)}')) {
  customElements.define('${toKebabCase(componentName)}', ${componentName});
}
`;
}
```

**Integration Test:** `test/integration/import-generation.test.ts`

```typescript
import { describe, expect, it } from 'vitest';

import { generateWebComponentModule } from '../../src/boundary/generator/generateWebComponent.js';

describe('Import Generation', () => {
  it('generates imports at top of module', () => {
    const code = generateWebComponentModule({
      componentName: 'MediaSkinDefault',
      templateHTML: '<style></style><media-container></media-container>',
      imports: [
        { source: '../../../media-skin', specifiers: ['MediaSkin'] },
        { source: '../../../components/media-play-button' },
        { source: '@vjs-10/html-icons' },
      ],
      includeBaseTemplate: true,
    });

    expect(code).toContain("import { MediaSkin } from '../../../media-skin';");
    expect(code).toContain("import '../../../components/media-play-button';");
    expect(code).toContain("import '@vjs-10/html-icons';");
  });

  it('includes base template when requested', () => {
    const code = generateWebComponentModule({
      componentName: 'MediaSkinDefault',
      templateHTML: '<style></style>',
      imports: [{ source: '../../../media-skin', specifiers: ['MediaSkin'] }],
      includeBaseTemplate: true,
    });

    expect(code).toContain('${MediaSkin.getTemplateHTML()}');
  });

  it('omits base template when not requested', () => {
    const code = generateWebComponentModule({
      componentName: 'MediaSkinDefault',
      templateHTML: '<style></style>',
      imports: [],
      includeBaseTemplate: false,
    });

    expect(code).not.toContain('${MediaSkin.getTemplateHTML()}');
  });
});
```

**Validation:**

- Run tests: `pnpm test -- import-generation.test.ts`
- All tests pass
- Generated code looks correct

---

### Step 5: Wire Up Pipeline to Use PathContext

**File:** `src/pipelines/compileSkin.ts` (or wherever the main pipeline is)

```typescript
export async function compileSkin(options: {
  inputPath: string;
  outputPath: string;
  // ... other options
}): Promise<string> {
  const { inputPath, outputPath } = options;

  // Create path context
  const pathContext: PathContext = {
    inputPath,
    outputPath,
  };

  // ... existing pipeline code ...

  // When projecting imports, pass context
  const projectedImports = categorizedImports.map((imp) => projectImport(imp, pathContext));

  // Filter to only imports we should keep
  const importsToGenerate = projectedImports
    .filter((proj) => proj.shouldKeep)
    .map((proj) => ({
      source: proj.transformedSource || proj.originalSource,
      specifiers: proj.specifiers,
    }));

  // Generate code with imports
  const code = generateWebComponentModule({
    componentName,
    templateHTML,
    imports: importsToGenerate,
    includeBaseTemplate: true,
  });

  return code;
}
```

**Validation:**

- Run E2E compilation test: `pnpm test -- compile-for-e2e.test.ts`
- Check generated output has correct imports
- TypeScript compiles

---

### Step 6: E2E Validation (4 Levels)

**Level 1: Syntactic Validation**

```bash
# TypeScript compilation
npx tsc --noEmit test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js

# Should pass with zero errors
```

**Level 2: Output Comparison**

```bash
# Compare imports to v1
diff \
  <(grep "^import" packages/html/html/src/skins/compiled/inline/media-skin-default.ts | sort) \
  <(grep "^import" test/e2e/equivalence/fixtures/compiled/MediaSkinDefault.browser.js | sort)

# Should be identical (or very close)
```

**Level 3: Browser Validation**

```bash
# Load WC demo
open test/e2e/equivalence/demos/wc-demo.html

# Check browser console:
# - Zero errors
# - Custom element registered
# - MediaSkin imported successfully
```

**Level 4: Playwright Tests**

```bash
# Run E2E tests
pnpm test:e2e

# Should RUN (may have assertion failures, but no timeouts)
# Target: At least some tests pass, no infrastructure errors
```

---

## html/html Package Changes

### Export MediaSkin (Optional)

**Current State:** MediaSkin is NOT exported from main package index

**Options:**

**Option A: No changes needed (RECOMMENDED)**

- MediaSkin is already exported from its own module: `src/media-skin.ts`
- Compiled skins use relative imports: `import { MediaSkin } from '../../../media-skin'`
- This works because they're in the same package
- No changes needed to package.json or index.ts

**Option B: Export from main index (NOT RECOMMENDED)**

- Add to `src/index.ts`: `export { MediaSkin } from './media-skin.js';`
- Makes MediaSkin part of public API
- Not needed since compiled skins use relative imports

**Decision: Option A (no changes)**

**Rationale:**

- Compiled skins are internal to html/html package
- They don't need MediaSkin in public API
- Relative imports work fine within package
- Keeps API surface area smaller

---

## Timeline and Validation

### Estimated Time: 4-6 hours

**Breakdown:**

- Step 1 (PathContext type): 15 min
- Step 2 (Path calculation): 1.5 hours (includes 20+ unit tests)
- Step 3 (projectImport update): 1 hour
- Step 4 (Code generator): 1 hour
- Step 5 (Pipeline wiring): 30 min
- Step 6 (E2E validation): 1 hour
- Total: ~5.5 hours

### Success Criteria

**Must Have:**

- ✅ All existing tests still pass (122/136 minimum)
- ✅ New tests pass (path calculation, import projection)
- ✅ TypeScript compiles with zero errors
- ✅ Generated imports match v1 quality
- ✅ WC demo loads with zero console errors
- ✅ Playwright tests RUN (no timeouts)

**Nice to Have:**

- ✅ Some Playwright tests PASS (not just run)
- ✅ Import paths are optimal (shortest possible)
- ✅ Documentation updated

---

## Risks and Mitigations

### Risk 1: Path calculation edge cases

**Mitigation:** 20+ unit tests covering:

- Same directory
- Parent directory
- Sibling directory
- Deep nesting
- Different file extensions

### Risk 2: Breaking existing tests

**Mitigation:**

- Run full test suite after each step
- Keep existing fixtures unchanged
- Add new fixtures for import generation tests

### Risk 3: E2E tests still fail

**Mitigation:**

- Phase 1 goal is to make tests RUN (not necessarily pass)
- Assertion failures are expected (CSS issues, etc.)
- Success = no timeouts, no import errors

---

## Next Steps

1. **Implement Steps 1-5** (TDD approach)
2. **Run Level 1-3 validation** after each step
3. **Run Level 4 validation** after Step 5 complete
4. **Update documentation** (E2E_CAPABILITIES.md, KNOWN_LIMITATIONS.md)
5. **Commit** with comprehensive message
6. **Plan Phase 2** (package mapping) if needed

---

## Questions Answered

1. **Do Phase 1 only?** YES - Relative paths only, package mapping is Phase 2
2. **Study v1 first?** YES - Already have v1 output as reference
3. **Include base template?** YES - Part of import generation work (tightly coupled)
4. **Update html/html package?** NO - MediaSkin already importable via relative paths
