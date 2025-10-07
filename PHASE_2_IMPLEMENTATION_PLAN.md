# Phase 2 Implementation Plan: Removing Workarounds & Fixing Missing CSS Rules

## Executive Summary

This document provides a comprehensive plan for completing Phase 2 of the skin compilation system. The goal is to remove temporary workarounds and fix missing CSS rules in web component compilation.

**Current State:**
- Volume button CSS rules are completely missing from compiled web components
- Source code uses incorrect naming (`VolumeButton` instead of `MuteButton`, `Slider*` instead of `Range*`)
- `DEFAULT_STYLE_MAPPINGS` workaround exists in compiler
- Complex Tailwind classes like `[&_.icon]:opacity-0` are marked "UNPARSEABLE CLASS" by Tailwind's parser, resulting in NO CSS generation

**Target State:**
- Clean source code with correct component naming
- No workarounds in compiler
- All CSS rules generated automatically, including complex data-attribute selectors
- Comprehensive test coverage

---

## The Core Problem Explained

### What Happens in React

Classes like `[&_.icon]:opacity-0` compile to vanilla CSS perfectly:
```css
.VolumeButton .icon { opacity: 0; }
```

This works in React because components use class selectors throughout (e.g., `<div className={styles.VolumeButton}>`).

### What Happens in Web Component Compilation

**Step 1: Tailwind Parsing** - The class `[&_.icon]:opacity-0` is detected as "UNPARSEABLE CLASS" by `class-parser.ts:48`

```typescript
console.log('UNPARSEABLE CLASS (adding as simple):', cls)
result.simpleClasses.push(cls)
```

**Step 2: Tailwind Compilation** - When Tailwind receives "icon" as a simple class, it generates nothing useful (just `.icon {}` with no properties)

**Step 3: CSS Transformation** - `cssModulesToVanillaCSS.ts` never receives the complex selector rules because Tailwind never generated them

**Result:** The CSS rules are completely missing from the compiled output. Fresh compilation shows NO rules for:
- `media-mute-button .icon { opacity: 0%; }`
- `media-mute-button[data-volume-level="high"] media-volume-high-icon { opacity: 100%; }`

---

## Priority 1: Source Code Cleanup

**Goal:** Rename style keys to match actual component names, eliminating need for DEFAULT_STYLE_MAPPINGS

**Duration:** 2-3 hours

### 1.1 Rename VolumeButton → MuteButton

**Files to Modify:**

1. `packages/react/react/src/skins/default/types.ts`
   ```typescript
   // BEFORE:
   readonly VolumeButton: string;

   // AFTER:
   readonly MuteButton: string;
   ```

2. `packages/react/react/src/skins/default/styles.ts`
   ```typescript
   // BEFORE:
   VolumeButton: cn(
     '[&_.icon]:opacity-0',
     // ...
   ),

   // AFTER:
   MuteButton: cn(
     '[&_.icon]:opacity-0',
     // ...
   ),
   ```

3. `packages/react/react/src/skins/default/MediaSkinDefault.tsx`
   ```tsx
   // BEFORE:
   <MediaMuteButton className={styles.VolumeButton}>

   // AFTER:
   <MediaMuteButton className={styles.MuteButton}>
   ```

4. **Repeat for toasted skin:**
   - `packages/react/react/src/skins/toasted/types.ts`
   - `packages/react/react/src/skins/toasted/styles.ts`
   - `packages/react/react/src/skins/toasted/MediaSkinToasted.tsx`

### 1.2 Rename Slider* → Range* Prefixes

**Rationale:** Components are named `MediaTimeRange`, `MediaVolumeRange`, not `MediaTimeSlider`

**Files to Modify (both default and toasted skins):**

1. **Type Definitions** (`types.ts`)
   ```typescript
   // BEFORE:
   readonly SliderRoot: string;
   readonly SliderTrack: string;
   readonly SliderProgress: string;
   readonly SliderPointer: string;
   readonly SliderThumb: string;

   // AFTER:
   readonly RangeRoot: string;
   readonly RangeTrack: string;
   readonly RangeProgress: string;
   readonly RangePointer: string;
   readonly RangeThumb: string;
   ```

2. **Styles** (`styles.ts`)
   - Rename all `Slider*` keys to `Range*`
   - Update class references: `group/slider` → `group/range`

3. **JSX Files**
   - Update all `className={styles.Slider*}` to `className={styles.Range*}`

**Testing:**
- Run `pnpm --filter @vjs-10/react run build`
- Verify TypeScript compilation passes
- Test React demo, verify sliders work

---

## Priority 2.1: Remove DEFAULT_STYLE_MAPPINGS

**Goal:** Simplify compiler by removing workaround mappings

**Duration:** 30 minutes

**File:** `packages/build-tools/vjs-compiler/src/cssProcessing/cssModulesToVanillaCSS.ts`

**Changes:**

1. **Delete lines 81-92** (DEFAULT_STYLE_MAPPINGS object)
2. **Delete lines 111-157** (all fallback mapping logic)
3. **Simplify transformSelector function:**

```typescript
function transformSelector(
  selector: string,
  componentMap: Record<string, string>,
  useDataAttributes: boolean
): string {
  const transformed = selectorParser((selectors) => {
    selectors.walk((node) => {
      if (node.type !== 'class') {
        return;
      }

      const className = node.value;
      const elementName = componentMap[className];

      if (elementName) {
        if (useDataAttributes) {
          const attributeNode = selectorParser.attribute({
            attribute: `data-${elementName}`,
            value: undefined,
            raws: {},
          });
          node.replaceWith(attributeNode);
        } else {
          const tagNode = selectorParser.tag({
            value: elementName,
          });
          node.replaceWith(tagNode);
        }
      } else {
        // Not a component - convert to kebab-case
        const kebabClassName = toKebabCase(className);
        node.value = kebabClassName;
      }
    });
  }).processSync(selector);

  return transformed;
}
```

**Why This Works:** After Priority 1, style keys match component names exactly:
- `MuteButton` style key → `MuteButton` in componentMap → `media-mute-button` element

**Testing:**
- Recompile both skins
- Verify no errors during compilation
- Check that element selectors are still correct

---

## Priority 2.2: Fix Missing CSS Rules

**Goal:** Generate CSS for unparseable Tailwind classes

**Duration:** 3-4 hours

### The Solution

Detect classes that Tailwind can't parse, parse them manually, and generate supplementary CSS.

### 2.2.1 Create Unparseable Class Detector

**New File:** `packages/build-tools/vjs-compiler/src/cssProcessing/detectUnparseableClasses.ts`

```typescript
import type { EnhancedClassUsage } from './types.js';

export interface UnparseableClass {
  originalClass: string;
  category: 'descendant-selector' | 'data-attribute-selector' | 'other';
  pattern?: {
    baseSelector?: string;           // e.g., "&"
    dataAttribute?: string;          // e.g., "data-volume-level"
    dataValue?: string;              // e.g., "high"
    targetClass?: string;            // e.g., "volume-high-icon" or "icon"
    property?: string;               // e.g., "opacity"
    value?: string;                  // e.g., "100%"
  };
}

/**
 * Detect classes that Tailwind v4 cannot parse
 */
export function detectUnparseableClasses(
  stylesObject: Record<string, string>
): Map<string, UnparseableClass[]> {
  const unparseableByKey = new Map<string, UnparseableClass[]>();

  for (const [key, classString] of Object.entries(stylesObject)) {
    const classes = classString.split(/\s+/).filter(Boolean);
    const unparseable: UnparseableClass[] = [];

    for (const cls of classes) {
      // Pattern 1: Data attribute selectors with value
      // [&[data-volume-level="high"]_.volume-high-icon]:opacity-100
      const dataAttrMatch = cls.match(
        /^\[&\[data-([^=]+)="([^"]+)"\]_\.([^\]]+)\]:([^-]+)-(.+)$/
      );

      if (dataAttrMatch) {
        unparseable.push({
          originalClass: cls,
          category: 'data-attribute-selector',
          pattern: {
            baseSelector: '&',
            dataAttribute: `data-${dataAttrMatch[1]}`,
            dataValue: dataAttrMatch[2],
            targetClass: dataAttrMatch[3],
            property: mapTailwindPropertyToCSS(dataAttrMatch[4]),
            value: mapTailwindValueToCSS(dataAttrMatch[4], dataAttrMatch[5]),
          },
        });
        continue;
      }

      // Pattern 2: Simple descendant selector
      // [&_.icon]:opacity-0
      const simpleDescendantMatch = cls.match(
        /^\[&_\.([^\]]+)\]:([^-]+)-(.+)$/
      );

      if (simpleDescendantMatch) {
        unparseable.push({
          originalClass: cls,
          category: 'descendant-selector',
          pattern: {
            baseSelector: '&',
            targetClass: simpleDescendantMatch[1],
            property: mapTailwindPropertyToCSS(simpleDescendantMatch[2]),
            value: mapTailwindValueToCSS(simpleDescendantMatch[2], simpleDescendantMatch[3]),
          },
        });
        continue;
      }
    }

    if (unparseable.length > 0) {
      unparseableByKey.set(key, unparseable);
    }
  }

  return unparseableByKey;
}

function mapTailwindPropertyToCSS(utility: string): string {
  const map: Record<string, string> = {
    'opacity': 'opacity',
    'color': 'color',
    'bg': 'background-color',
    'translate': 'translate',
    'scale': 'scale',
  };
  return map[utility] || utility;
}

function mapTailwindValueToCSS(utility: string, value: string): string {
  if (value === '0') return utility === 'opacity' ? '0%' : '0';
  if (value === '100') return utility === 'opacity' ? '100%' : '100%';
  if (value === '50') return utility === 'opacity' ? '50%' : '50%';
  return value;
}
```

### 2.2.2 Generate Supplementary CSS

**New File:** `packages/build-tools/vjs-compiler/src/cssProcessing/generateSupplementaryCSS.ts`

```typescript
import postcss from 'postcss';
import type { UnparseableClass } from './detectUnparseableClasses.js';
import { toKebabCase, toPascalCase } from '../utils/naming.js';

/**
 * Generate plain CSS for unparseable Tailwind classes
 */
export function generateSupplementaryCSS(
  unparseableByKey: Map<string, UnparseableClass[]>,
  componentMap: Record<string, string>
): string {
  const root = postcss.root();

  for (const [styleKey, unparseables] of unparseableByKey) {
    const baseElement = componentMap[styleKey];

    if (!baseElement) {
      console.warn(`Warning: No component mapping for style key "${styleKey}"`);
      continue;
    }

    for (const unparseable of unparseables) {
      const { pattern } = unparseable;
      if (!pattern) continue;

      const { dataAttribute, dataValue, targetClass, property, value } = pattern;

      let selector: string;

      if (dataAttribute && dataValue && targetClass) {
        // Pattern: media-mute-button[data-volume-level="high"] media-volume-high-icon
        const targetElement = componentMap[toPascalCase(targetClass)];
        if (!targetElement) {
          console.warn(`Warning: No component mapping for target class "${targetClass}"`);
          continue;
        }
        selector = `${baseElement}[${dataAttribute}="${dataValue}"] ${targetElement}`;
      } else if (targetClass) {
        // Pattern: media-mute-button .icon
        const targetElement = componentMap[toPascalCase(targetClass)];
        if (targetElement) {
          selector = `${baseElement} ${targetElement}`;
        } else {
          // It's a utility class like "icon", not a component
          selector = `${baseElement} .${toKebabCase(targetClass)}`;
        }
      } else {
        continue;
      }

      if (property && value) {
        const rule = postcss.rule({ selector });
        rule.append(postcss.decl({ prop: property, value }));
        root.append(rule);
      }
    }
  }

  return root.toString();
}
```

### 2.2.3 Integrate into Pipeline

**File:** `packages/build-tools/vjs-compiler/src/pipelines/skinToWebComponentInlineTailwind.ts`

**Add imports after line 10:**
```typescript
import { detectUnparseableClasses } from '../cssProcessing/detectUnparseableClasses.js';
import { generateSupplementaryCSS } from '../cssProcessing/generateSupplementaryCSS.js';
```

**Replace lines 152-157 with:**
```typescript
// 5. Transform CSS Modules → Vanilla CSS using component map
const vanillaCSS = cssModulesToVanillaCSS({
  css: flattenedCSS,
  componentMap: context.componentMap,
});

// 6. Detect and generate CSS for unparseable Tailwind classes
const unparseableClasses = detectUnparseableClasses(stylesObject);
const supplementaryCSS = generateSupplementaryCSS(
  unparseableClasses,
  context.componentMap
);

// 7. Combine vanilla CSS with supplementary CSS
const combinedCSS = supplementaryCSS
  ? `${vanillaCSS}\n${supplementaryCSS}`
  : vanillaCSS;

return combinedCSS;
```

**Testing:**
- Compile both skins
- Verify volume button CSS rules are now present
- Check browser - icons should toggle correctly
- Remove manual CSS additions from existing compiled files

---

## Priority 3: Configuration System

**Goal:** Make naming transformations configurable

**Duration:** 2-3 hours

### 3.1 Create Compiler Config Interface

**File:** `packages/build-tools/vjs-compiler/src/config/index.ts`

Add to existing CompilerConfig:

```typescript
export interface NamingConfig {
  /**
   * Custom style key → component name mappings
   * Example: { 'CustomButton': 'special-button' }
   */
  styleToComponentMappings?: Record<string, string>;

  /**
   * Component name prefix (default: 'media-')
   */
  componentPrefix?: string;

  /**
   * Strategy for unknown style keys
   * - 'pascalToKebab': Convert PascalCase → kebab-case (default)
   * - 'identity': Use as-is
   * - 'error': Throw error
   */
  unknownKeyStrategy?: 'pascalToKebab' | 'identity' | 'error';
}

export interface CompilerConfig {
  // ... existing fields ...
  naming?: NamingConfig;
}
```

### 3.2 Documentation

**New File:** `packages/build-tools/vjs-compiler/docs/naming-conventions.md`

```markdown
# Naming Conventions

## Component Naming Rules

1. **Style Keys** use PascalCase: `MuteButton`, `RangeRoot`
2. **Component Names** use kebab-case with `media-` prefix: `media-mute-button`, `media-range-root`
3. **Element Selector Transform**: `MuteButton` → `media-mute-button`

## Transformation Rules

### Built-in Transformations
- PascalCase → kebab-case
- Add `media-` prefix for all media components
- Icon suffixes preserved: `PlayIcon` → `media-play-icon`

### Custom Mappings
Use compiler config to override:

\`\`\`typescript
{
  naming: {
    styleToComponentMappings: {
      'CustomButton': 'my-special-button'
    }
  }
}
\`\`\`

## Style Key Requirements

### DO ✓
- Match component names: `MuteButton` for `MediaMuteButton`
- Use consistent prefixes: `Range*` for range components
- Use descriptive names: `FullscreenButton` not `FSButton`

### DON'T ✗
- Use inconsistent casing: `volumeButton` (camelCase)
- Add unnecessary prefixes: `MediaMuteButton` (redundant)
- Use abbreviations: `VolBtn` instead of `VolumeButton`
```

---

## Priority 4: Testing

**Goal:** Prevent regressions and validate all transformations work

**Duration:** 4-5 hours

### 4.1 Unit Tests

**New File:** `packages/build-tools/vjs-compiler/src/cssProcessing/__tests__/detectUnparseableClasses.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { detectUnparseableClasses } from '../detectUnparseableClasses.js';

describe('detectUnparseableClasses', () => {
  it('detects simple descendant selectors', () => {
    const styles = {
      MuteButton: '[&_.icon]:opacity-0',
    };

    const unparseable = detectUnparseableClasses(styles);
    expect(unparseable.size).toBe(1);

    const detected = unparseable.get('MuteButton')![0];
    expect(detected.category).toBe('descendant-selector');
    expect(detected.pattern?.targetClass).toBe('icon');
    expect(detected.pattern?.property).toBe('opacity');
    expect(detected.pattern?.value).toBe('0%');
  });

  it('detects data-attribute selectors with values', () => {
    const styles = {
      MuteButton: '[&[data-volume-level="high"]_.volume-high-icon]:opacity-100',
    };

    const unparseable = detectUnparseableClasses(styles);
    const detected = unparseable.get('MuteButton')![0];

    expect(detected.category).toBe('data-attribute-selector');
    expect(detected.pattern?.dataAttribute).toBe('data-volume-level');
    expect(detected.pattern?.dataValue).toBe('high');
    expect(detected.pattern?.targetClass).toBe('volume-high-icon');
  });
});
```

### 4.2 Integration Tests

**New File:** `packages/build-tools/vjs-compiler/src/__tests__/e2e/compilation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

describe('Skin Compilation E2E', () => {
  it('generates volume button CSS rules', () => {
    execSync(
      `./dist/cli.js compile ../../react/react/src/skins/default/MediaSkinDefault.tsx --type skin --format web-component --css tailwind --out-dir /tmp/vjs-test`,
      { cwd: __dirname + '/../../../' }
    );

    const content = readFileSync('/tmp/vjs-test/media-skin-default.ts', 'utf-8');

    expect(content).toContain('media-mute-button .icon');
    expect(content).toContain('opacity: 0%');
    expect(content).toContain('media-mute-button[data-volume-level="high"]');
    expect(content).toContain('media-volume-high-icon');
  });
});
```

---

## Implementation Sequence

### Phase 2.1: Clean Foundation (2-3 hours)
1. Rename VolumeButton → MuteButton (all files)
2. Rename Slider* → Range* (all files)
3. Test React demos
4. Remove DEFAULT_STYLE_MAPPINGS
5. Verify compilation still works

### Phase 2.2: Fix Missing CSS (3-4 hours)
1. Create detectUnparseableClasses.ts
2. Create generateSupplementaryCSS.ts
3. Integrate into pipeline
4. Test compilation and browser demos
5. Remove manual CSS additions from compiled files

### Phase 2.3: Testing (4-5 hours)
1. Create unit tests
2. Create integration tests
3. Create E2E compilation tests
4. Verify all tests pass

### Phase 2.4: Configuration (2-3 hours)
1. Add NamingConfig interface
2. Update cssModulesToVanillaCSS
3. Write documentation
4. Add configuration tests

---

## Success Metrics

### Code Quality
- ✓ Zero hardcoded workarounds in compiler
- ✓ All style keys match component names
- ✓ Test coverage >80%

### Functionality
- ✓ All icons visible and toggle correctly
- ✓ All CSS rules generated automatically
- ✓ No manual CSS additions needed

### Performance
- ✓ Compilation time <5s for both skins
- ✓ Generated CSS size unchanged (±5%)

---

## References

### Key Files
- `packages/build-tools/vjs-compiler/src/pipelines/skinToWebComponentInlineTailwind.ts` - Main pipeline
- `packages/build-tools/vjs-compiler/src/cssProcessing/cssModulesToVanillaCSS.ts` - Selector transformation
- `packages/build-tools/vjs-compiler/src/cssProcessing/class-parser.ts` - Tailwind class parsing (line 48: UNPARSEABLE detection)
- `packages/build-tools/vjs-compiler/src/cssProcessing/tailwindToCSSModules.ts` - Tailwind compilation

### Tailwind v4 Limitations
- Cannot parse `[&>*]` selectors (generates malformed CSS)
- Cannot parse `[&[data-attr="value"]_target]` complex combinators
- Marks these as "UNPARSEABLE CLASS" and treats them as simple classes
