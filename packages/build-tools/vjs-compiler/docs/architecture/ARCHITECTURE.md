# VJS Framework Compiler Architecture

**Last Updated:** 2025-10-15
**Status:** Living Document

This document describes the architectural principles, transformation pipeline, and design decisions for the VJS Framework Compiler.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Transformation Pipeline](#transformation-pipeline)
4. [Module Relationships & Usage Analysis](#module-relationships--usage-analysis)
5. [Configuration Philosophy](#configuration-philosophy)
6. [Import Transformation](#import-transformation)
7. [CSS Transformation](#css-transformation)
8. [Component Transformation](#component-transformation)
9. [Output Quality Requirements](#output-quality-requirements)
10. [VJS-Specific Conventions](#vjs-specific-conventions)
11. [Future Extensions](#future-extensions)

---

## Overview

### Purpose

The VJS Framework Compiler transforms **VJS skins** written in one framework/styling paradigm into equivalent implementations for different target frameworks and styling strategies.

**Primary Transformation:**
- **Input:** React + TSX + Tailwind CSS v4 (defined in TypeScript)
- **Output:** Web Components + Inline Vanilla CSS

### Problems Solved

1. **Framework Portability:** Single skin definition works across React, Web Components, and (future) other frameworks
2. **Styling Flexibility:** Multiple CSS strategies (inline, CSS modules, Tailwind CDN) from single source
3. **Developer Experience:** Modern ergonomic tooling (React + Tailwind) while generating optimized output
4. **Maintenance:** Single source of truth for skin designs, compiled to multiple targets

### Non-Goals (For Now)

- **Not** a general-purpose framework compiler (VJS-specific assumptions are acceptable)
- **Not** compiling primitive components (only skins initially, though architecture supports future extension)
- **Not** runtime transformation (compile-time only)

---

## Core Architectural Principles

### 1. Separation of Concerns

**Principle:** Separate file I/O, discovery, configuration, and pure transformation logic.

```
┌─────────────────┐
│  Boundary Layer │  File I/O, discovery, CLI
│  (impure)       │  Produces configuration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Configuration  │  Pure data structures
│  (pure data)    │  All context needed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Core Transform │  Pure functions
│  (pure logic)   │  Source string → Output string
└─────────────────┘
```

**Rationale:**
- Core transformation logic works with strings and configuration objects
- Works with hypothetical file paths (not require actual files)
- Enables testing without filesystem access
- Clear boundary for where assumptions are made

### 2. Push Assumptions to the Boundaries

**Principle:** Avoid baking assumptions deep in transformation logic. Discover/configure at boundaries and pass as data.

**Example:** Don't check `if (packageName.startsWith('@vjs-10/'))` deep in the transformer. Instead, discover this fact early and pass it as `isVJSPackage: boolean` in configuration.

### 3. Functional Over Declarative

**Principle:** Use predicates (functions that answer questions) and projections (functions that transform) rather than large declarative data structures.

**Rationale:**
- More flexible and composable
- Easier to inject custom behavior
- Avoids building expensive registries upfront
- Supports inference rather than explicit enumeration

### 4. Identify, Then Transform

**Principle:** Clearly separate identification/categorization from transformation.

**Pipeline:**
1. **Identify:** What imports/elements exist? (no decisions about meaning)
2. **Categorize:** What type is each import/element? (business logic)
3. **Project:** How should each category be transformed? (transformation rules)

### 5. VJS-Specific But Extensible

**Principle:** Design around VJS conventions, but make those conventions explicit and overridable.

**Rationale:**
- We're not building a general-purpose compiler
- VJS-specific assumptions are acceptable (and beneficial for simplicity)
- But those assumptions should be documented and swappable

---

## Transformation Pipeline

> **Context:** This section describes the transformation pipeline for **skin modules with React + Tailwind input**. The pipeline adapts based on configuration (module type, input/output contexts).

### High-Level Flow (React → Web Component)

```
Input Source Code (string)
    ↓
Parse to AST (Babel)
    ↓
┌─→ Phase 1: Usage Analysis
│   ├─→ Extract all imports
│   ├─→ Scan JSX elements for component usage
│   ├─→ Scan className attributes for style usage
│   ├─→ Build usage graph (what's used where and how)
│   └─→ Identify module exports (default export = skin component)
│
├─→ Phase 2: Categorization (using usage graph + context)
│   ├─→ Categorize imports by usage type
│   │   ├─→ Component (used in JSX element)
│   │   ├─→ Style import (used in className)
│   │   └─→ Other/Unknown
│   ├─→ Determine if components are VJS components
│   │   ├─→ Check package scope (@vjs-10/*)
│   │   └─→ Check source package context + relative path
│   └─→ Categorize style keys by relationship to components
│       ├─→ Component Selector Identifier (exact match)
│       ├─→ Component Type Selector (suffix pattern)
│       ├─→ Nested Component Selector (compound component)
│       └─→ Generic Selector (no component match)
│
└─→ Phase 3: Transformation (using categorization results)
    ├─→ Transform Imports
    │   ├─→ Project component imports to target framework
    │   ├─→ Transform import style (named → side-effect for WC)
    │   └─→ Omit style imports (CSS will be inlined)
    │
    ├─→ Transform CSS (via CSS Modules intermediary)
    │   ├─→ Extract style keys and Tailwind utilities
    │   ├─→ Generate intermediary CSS Modules file
    │   ├─→ Process through PostCSS + Tailwind compiler
    │   ├─→ Transform compiled CSS:
    │   │   ├─→ Replace CSS Module scoped selectors with semantic selectors
    │   │   ├─→ Preserve expanded CSS properties
    │   │   └─→ Apply modern CSS transformations
    │   └─→ Generate final CSS in target format
    │
    └─→ Transform Component Tree
        ├─→ Transform JSX elements to target framework
        ├─→ Transform className values based on categorization
        └─→ Generate target markup/code
    ↓
Generate Output AST/Code
    ↓
Output Source Code (string)
```

### Transformation Axes

The compiler operates on two independent axes:

1. **Framework Axis:** React → Web Component → (future: Vue, etc.)
2. **CSS Axis:** Tailwind (TS) → Inline CSS → CSS Modules → (future: Tailwind CDN, etc.)

These form a matrix of possible transformations:
- React + CSS Modules
- React + Inline CSS
- Web Component + Inline CSS
- Web Component + Tailwind CDN

---

## Module Relationships & Usage Analysis

### Overview

Rather than relying solely on naming conventions or file paths, the compiler **analyzes usage patterns** within the module to infer intent and relationships. This provides more accurate categorization and enables smarter transformations.

### Key Relationships

The compiler analyzes relationships between these module elements:

1. **Imports** - What is being imported
2. **Exports** - What the module exposes (especially the default export for skins)
3. **JSX Usage** - How imports are used in JSX elements
4. **className Usage** - How imports are used in className attributes
5. **Style Key Naming** - How style keys relate to component names

### Inference Chain

```
Import Declaration
    ↓
Usage in JSX Element Name → Identifies as Component
    ↓
Component Name + Style Key Match → Identifies Selector Type
    ↓
Selector Type → Determines Output CSS Strategy
    ↓
Package Context + Usage → Determines Import Transformation
```

### 1. Identifying Components via JSX Usage

**Principle:** An import is a component if it's used as a JSX element name.

#### Simple Components

```tsx
import { PlayButton } from '../../components/PlayButton';

// Usage identifies it as a component:
<PlayButton className={styles.Button}>{/* ... */}</PlayButton>
```

**Inference:** `PlayButton` is a component because it appears as `<PlayButton>`.

#### Compound Components

```tsx
import { TimeRange } from '../../components/TimeRange';

// Usage identifies namespace members as components:
<TimeRange.Root className={styles.RangeRoot}>
  <TimeRange.Track className={styles.RangeTrack}>
    <TimeRange.Progress />
  </TimeRange.Track>
</TimeRange.Root>
```

**Inference:**
- `TimeRange` is a namespace containing components
- `TimeRange.Root`, `TimeRange.Track`, `TimeRange.Progress` are all components
- All members accessed via dot notation in JSX are compound components

### 2. Identifying VJS Components

**Principle:** A component is a VJS component if:

1. It's identified as a component (via JSX usage), AND
2. Either:
   - Imported from `@vjs-10/*` scoped package, OR
   - Imported via relative path AND source module is physically/logically in a `@vjs-10/*` package

#### Example: Package Scoped

```tsx
// Source: packages/react/react/src/skins/default/MediaSkinDefault.tsx
// (in @vjs-10/react package)

import { PlayIcon } from '@vjs-10/react-icons';

<PlayIcon />
```

**Inference:**
1. `PlayIcon` used in JSX → is a component
2. Imported from `@vjs-10/react-icons` → is VJS component
3. Package is platform-specific (`react-icons`) → needs transformation to target platform

#### Example: Relative Import

```tsx
// Source: packages/react/react/src/skins/default/MediaSkinDefault.tsx
// (in @vjs-10/react package)

import { PlayButton } from '../../components/PlayButton';

<PlayButton className={styles.Button} />
```

**Inference:**
1. `PlayButton` used in JSX → is a component
2. Imported via relative path `../../components/PlayButton`
3. Source module is in `@vjs-10/react` package (known from upstream)
4. Relative path resolves within same package → is VJS component in same package

### 3. Identifying Style Imports via className Usage

**Principle:** An import provides styles if it's used in `className` attributes as member access.

```tsx
import styles from './styles';

<PlayButton className={`${styles.PlayButton} ${styles.Button}`}>
  <PlayIcon className={styles.Icon} />
</PlayButton>
```

**Inference:**
1. `styles` used in `className` attributes → is a style import
2. `styles.PlayButton`, `styles.Button`, `styles.Icon` are style keys
3. Style import will be omitted in web component output (CSS inlined instead)

### 4. Categorizing Style Keys via Naming Analysis

**Principle:** The relationship between a style key name and JSX component names determines the CSS selector type.

#### Component Selector Identifier

**Pattern:** Style key exactly matches a component name (case-sensitive)

```tsx
import { PlayButton } from '../../components/PlayButton';
import styles from './styles';

<PlayButton className={styles.PlayButton} />
```

**Analysis:**
- Style key: `PlayButton`
- Component name: `PlayButton`
- Match: ✅ Exact match
- Category: **Component Selector Identifier**

**CSS Output Strategy** (Web Component + Inline CSS):

```css
/* Use element selector */
media-play-button {
  /* styles for PlayButton */
}
```

#### Component Type Selector

**Pattern:** Style key is a suffix of a component name, representing a reusable "type" or "role"

Common suffixes: `Button`, `Icon`, `Container`, `Controls`, `Display`, `Root`, `Track`, `Thumb`, etc.

```tsx
import { PlayButton } from '../../components/PlayButton';
import { FullscreenButton } from '../../components/FullscreenButton';
import styles from './styles';

<PlayButton className={`${styles.PlayButton} ${styles.Button}`} />
<FullscreenButton className={`${styles.FullscreenButton} ${styles.Button}`} />
```

**Analysis:**
- Style key: `Button`
- Used by: `PlayButton`, `FullscreenButton`
- Pattern: Common suffix
- Category: **Component Type Selector**

**CSS Output Strategy:**

```css
/* Use class selector */
.button {
  /* shared button styles */
}
```

#### Nested Component Selector

**Pattern:** Style key matches a compound component's full path

```tsx
import { TimeRange } from '../../components/TimeRange';
import styles from './styles';

<TimeRange.Root className={styles.RangeRoot}>
  <TimeRange.Track className={styles.RangeTrack} />
</TimeRange.Root>
```

**Analysis:**
- Style key: `RangeRoot`
- Component: `TimeRange.Root`
- Pattern: `{ParentName}{ChildName}` (e.g., `Range` + `Root`)
- Category: **Nested Component Selector**

**CSS Output Strategy:**

```css
/* Use element selector for compound component */
media-time-range-root {
  /* styles */
}
```

#### Generic Selector

**Pattern:** Style key doesn't match any component name pattern

```tsx
import styles from './styles';

<div className={styles.Controls}>
  <span className={styles.TimeDisplay}>00:00</span>
</div>
```

**Analysis:**
- Style keys: `Controls`, `TimeDisplay`
- No matching component imports
- Category: **Generic Selector**

**CSS Output Strategy:**

```css
/* Use class selector */
.controls {
  /* styles */
}

.time-display {
  /* styles */
}
```

### 5. Edge Cases & Refinements

#### Dynamically Determined className

```tsx
const buttonClass = isActive ? styles.ActiveButton : styles.Button;
<PlayButton className={buttonClass} />;
```

**Analysis:**
- `styles` used in conditional expression
- Still identifiable as style import
- Both `ActiveButton` and `Button` are style keys

**Limitation:** Complex runtime expressions may not be fully analyzable at compile time.

#### Spread Props

```tsx
const buttonProps = { className: styles.Button, disabled: true };
<PlayButton {...buttonProps} />;
```

**Analysis:**
- `styles.Button` used in object property
- May require more sophisticated data flow analysis
- Consider documenting as "best effort" pattern

#### Mixed Import Usage

```tsx
import { PlayButton } from '../../components/PlayButton';

// Used as component
<PlayButton />;

// Also used in logic (rare)
const buttonType = PlayButton.displayName;
```

**Analysis:**
- Primary usage: JSX element → component
- Secondary usage: property access → keep as named import in output?

**Decision:** For web components, primary usage (JSX) takes precedence. Non-JSX usage may need manual handling or may be unsupported.

### 6. Complete Analysis Example

```tsx
// Source: packages/react/react/src/skins/default/MediaSkinDefault.tsx
// Package: @vjs-10/react (known from upstream)
// Target: packages/html/html/src/skins/compiled/inline/media-skin-default.ts

import { PlayIcon } from '@vjs-10/react-icons';
import { PlayButton } from '../../components/PlayButton';
import styles from './styles';

export default function MediaSkinDefault({ children, className }) {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={`${styles.PlayButton} ${styles.Button}`}>
          <PlayIcon className={styles.Icon} />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
```

#### Analysis Results

| Import           | Usage                        | Category                     | Transformation                                   |
|------------------|------------------------------|------------------------------|--------------------------------------------------|
| `PlayButton`     | JSX element `<PlayButton>`   | VJS component (same package) | Transform to side-effect import with target path |
| `PlayIcon`       | JSX element `<PlayIcon>`     | VJS component (external pkg) | Transform package name to target platform        |
| `styles`         | Member access in `className` | Style definitions            | Omit import, inline CSS in template              |
| `MediaContainer` | JSX element (inferred)       | VJS component (same package) | Transform to side-effect import with target path |

#### Style Key Analysis

| Style Key        | Component Reference | Category                      | Output Selector         |
|------------------|---------------------|-------------------------------|-------------------------|
| `MediaContainer` | `<MediaContainer>`  | Component Selector Identifier | `media-container { }`   |
| `Controls`       | `<div>`             | Generic Selector              | `.controls { }`         |
| `PlayButton`     | `<PlayButton>`      | Component Selector Identifier | `media-play-button { }` |
| `Button`         | `<PlayButton>`      | Component Type Selector       | `.button { }`           |
| `Icon`           | `<PlayIcon>`        | Component Type Selector       | `.icon { }`             |

#### Output

```ts
// Transformed imports
import '../../../components/media-container';
import '../../../components/media-play-button';
import '@vjs-10/html-icons';

// styles import omitted

export function getTemplateHTML() {
  return /* html */ `
    <style>
      /* Component Selector Identifiers → element selectors */
      media-container {
        /* styles.MediaContainer rules */
      }

      media-play-button {
        /* styles.PlayButton rules */
      }

      /* Generic & Type Selectors → class selectors */
      .controls {
        /* styles.Controls rules */
      }

      .button {
        /* styles.Button rules */
      }

      .icon {
        /* styles.Icon rules */
      }
    </style>

    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="controls">
        <media-play-button class="button">
          <media-play-icon class="icon"></media-play-icon>
        </media-play-button>
      </div>
    </media-container>
  `;
}
```

---

## Configuration Philosophy

### Hierarchical Configuration System

The compiler uses a **hierarchical configuration system** where high-level decisions determine which transformation pipelines and rules get activated.

#### Configuration Hierarchy

```
┌─────────────────────────────────────┐
│  Level 1: Module Type               │  What kind of module?
│  - skin | component | utility       │  (Determines available transformations)
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Level 2: Input Context              │  What's the source format?
│  - Framework: react | vue | ...     │  (Determines parsing strategy)
│  - CSS Type: tailwind-v4 | css | .. │  (Determines style extraction)
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Level 3: Output Context             │  What's the target format?
│  - Framework: web-component | react  │  (Determines code generation)
│  - CSS Strategy: inline | modules    │  (Determines CSS output)
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Level 4: Transformation Rules      │  How to transform?
│  - Import transformation rules       │  (Determined by above levels)
│  - CSS transformation rules          │  (Specific to context)
│  - Component transformation rules    │  (Framework-specific)
└─────────────────────────────────────┘
```

#### Current Configuration

```typescript
const CURRENT_CONFIG = {
  // Level 1: Module Type
  moduleType: 'skin',

  // Level 2: Input Context
  input: {
    framework: 'react',
    cssType: 'tailwind-v4',
  },

  // Level 3: Output Context
  output: {
    framework: 'web-component',
    cssStrategy: 'inline-vanilla', // Legible CSS via CSS Modules intermediary
  },
};
```

This configuration determines:
- Which imports to look for (React components, Tailwind styles)
- How to parse the module (React/JSX, TypeScript)
- What usage patterns to analyze (JSX elements, className attributes)
- Which transformation rules to apply (React → Web Component, Tailwind → Vanilla CSS)
- What output structure to generate (template function, inline styles with semantic selectors)

### What Should Be Configurable?

#### Required Configuration

1. **Output Target:**
   - Framework: `react | web-component | vue | svelte`
   - CSS Strategy: `inline-vanilla | inline-tailwind-utilities | css-modules | tailwind-cdn`
   - Output Location: Path to output file (or hypothetical location)

#### Optional Configuration (Can Be Inferred)

2. **Input Context:**
   - Module Type: `skin | component | utility` (infer from structure)
   - Input Framework: `react | vue | ...` (infer from imports/syntax)
   - Input CSS Type: `tailwind-v4 | css | ...` (infer from style imports)

3. **Package Context:**
   - Source package information (discover from filesystem)
   - Target package information (derive from output location)

4. **Custom Rules:**
   - Override default categorization/projection behavior
   - Custom transformation plugins

#### Multiple Output Targets

The compiler should support generating multiple outputs from a single source:

```typescript
const config = {
  input: {
    file: 'src/skins/default/MediaSkinDefault.tsx',
  },
  outputs: [
    {
      framework: 'web-component',
      cssStrategy: 'inline',
      path: 'dist/skins/compiled/inline/media-skin-default.ts',
    },
    {
      framework: 'web-component',
      cssStrategy: 'css-modules',
      path: 'dist/skins/compiled/css-modules/media-skin-default.ts',
    },
  ],
};
```

### Configuration Precedence

```
Explicit Config > Discovery > Convention > Defaults
```

**Example:**
1. If user provides component mapping explicitly → use it
2. Else if can discover from filesystem → use discovery
3. Else if matches convention (e.g., `@vjs-10/*` pattern) → use convention
4. Else use default behavior

---

## Import Transformation

### Phases of Import Handling

#### Phase 1: Identification

Extract and parse import statements from source AST. No business logic—just structural analysis.

**Questions Answered:**
- Where are the import statements?
- What is the import path?
- What is the import style? (named, default, namespace, side-effect, type-only)

#### Phase 2: Categorization (Usage-Driven)

Classify each import based on **how it's used** in the module, combined with package context.

**Categorization Strategy:**
1. Analyze usage in JSX elements → identifies components
2. Analyze usage in className attributes → identifies style imports
3. Check package scope and source context → determines VJS relationship
4. Match style keys to component names → determines selector type

**Categories:**
- VJS component (same package) - _identified by JSX usage + relative path + source package_
- VJS component (external package) - _identified by JSX usage + @vjs-10/* package_
- VJS icon package - _identified by JSX usage + *-icons package pattern_
- VJS core package (media-store, core) - _platform-agnostic dependencies_
- Framework-specific (react, react-dom) - _eliminated for web components_
- Style import - _identified by className member access usage_
- External package (non-VJS) - _preserved as-is_

#### Phase 3: Projection

Transform each categorized import to target framework equivalent.

**Transformations:**
- Path rewriting (package names, relative paths, accounting for naming conventions)
- Import style changes (named → side-effect for web components)
- Import elimination (framework imports, style imports, type-only imports)
- Compound component expansion (TimeRange → multiple individual imports)

### Import Categories & Rules

#### VJS Component (Same Package)

**Example:** `import { PlayButton } from '../../components/PlayButton'`

**Detection:**
- Relative import path
- Resolves to file within same package as source
- Path includes `/components/` directory

**React → Web Component:**
- **Path:** Recalculate relative path to target component location
  - Source component: `PlayButton.tsx` → Target: `media-play-button.ts`
- **Style:** Named/Default import → Side-effect import
- **Example:** `import '../../../components/media-play-button'`

#### VJS Icon Package

**Example:** `import { PlayIcon } from '@vjs-10/react-icons'`

**Detection:**
- Package name matches `@vjs-10/*-icons` pattern

**React → Web Component:**
- **Path:** Transform package name: `react-icons` → `html-icons`
- **Style:** Named imports → Side-effect import
- **Example:** `import '@vjs-10/html-icons'`

#### VJS Core Package

**Example:** `import { timeRangeStateDefinition } from '@vjs-10/media-store'`

**Detection:**
- Package name is `@vjs-10/core`, `@vjs-10/media-store`, or `@vjs-10/media`
- Platform-agnostic packages

**React → Web Component:**
- **Path:** Preserve (no change)
- **Style:** Preserve (no change)

#### Framework-Specific Import

**Example:** `import type { PropsWithChildren } from 'react'`

**Detection:**
- Package name is `react`, `react-dom`, `react/jsx-runtime`, etc.

**React → Web Component:**
- **Action:** Remove import entirely

#### Style Import

**Example:** `import styles from './styles'`

**Detection:**
- Imports file named `styles` or `*.css`
- In skin directory

**React → Web Component:**
- **Action:** Remove import, CSS extracted and inlined

### Naming Conventions

#### React

- **Components:** PascalCase files (`PlayButton.tsx`)
- **Imports:** Named exports matching filename
- **Element names:** JSX with PascalCase (`<PlayButton />`)

#### Web Components

- **Components:** kebab-case with `media-` prefix (`media-play-button.ts`)
- **Imports:** Side-effect only (no names)
- **Element names:** kebab-case custom elements (`<media-play-button>`)

#### Transformation

```
PlayButton       →  media-play-button
TimeRange        →  media-time-range
FullscreenButton →  media-fullscreen-button
```

**Algorithm:** PascalCase → kebab-case, prepend `media-`

---

## CSS Transformation

### Input: Tailwind CSS v4 (TypeScript, For Skins)

**Characteristics:**
- Utility classes as strings
- Grouped by semantic purpose (not by CSS properties)
- Supports all Tailwind features:
  - Arbitrary values: `w-[200px]`
  - Arbitrary variants: `[&:hover]:opacity-100`
  - Container queries: `@container/root`
  - Group modifiers: `group-hover/button:scale-110`
  - Data attribute selectors: `[&[data-paused]]:opacity-0`
  - Custom variants (via comments): `reduced-transparency:bg-black/70`

### Output: Vanilla CSS (Legible, Semantic)

**Goals:**
1. **Human-readable:** Clear, understandable CSS
2. **Terse:** Minimize redundancy while maintaining clarity
3. **Correct:** Semantically equivalent to Tailwind output
4. **Progressive:** Use modern CSS features with appropriate fallbacks

### Transformation Strategy: CSS Modules as Intermediary

**For the current target** (`inline-vanilla` with legible output), the transformation uses **CSS Modules as an intermediary format:**

```
Tailwind Utilities (TypeScript)
    ↓
CSS Modules (PostCSS processing)
    ↓
Vanilla CSS (semantic selectors, expanded properties)
```

**Why CSS Modules?**

1. **PostCSS Integration:** CSS Modules allows using custom PostCSS plugins to process Tailwind utilities
2. **Semantic Mapping:** Maps style keys to scoped class names that we can then transform to semantic selectors
3. **Existing Tooling:** Leverages mature CSS Modules + PostCSS + Tailwind toolchain
4. **Human-Readable Output:** Enables expansion of utilities into explicit CSS properties

**Process:**

1. Extract style keys and Tailwind utility strings from `styles.ts`
2. Generate CSS Modules file with those utilities
3. Process through PostCSS + Tailwind compiler to expand utilities
4. Transform generated CSS by:
   - Replacing CSS Module scoped class names with semantic selectors (based on usage analysis)
   - Preserving expanded CSS properties
   - Applying any additional transformations (modern CSS features, terse property names, etc.)

**Example Flow:**

```typescript
// Input: styles.ts
const styles = {
  PlayButton: cn('p-2 rounded-full', '[&[data-paused]_.play-icon]:opacity-100'),
};
```

```css
/* Intermediary: Generated CSS Modules input */
.PlayButton {
  @apply p-2 rounded-full;
  @apply [&[data-paused]_.play-icon]:opacity-100;
}
```

```css
/* After PostCSS + Tailwind processing */
.PlayButton_abc123 {
  padding: 0.5rem;
  border-radius: 9999px;
}

.PlayButton_abc123[data-paused] .play-icon {
  opacity: 1;
}
```

```css
/* Final: Transform to semantic selector */
media-play-button {
  padding: 0.5rem;
  border-radius: calc(infinity * 1px);
}

media-play-button[data-paused] .play-icon {
  opacity: 100%;
}
```

**Benefits:**
- Leverages Tailwind's own compiler for accurate utility expansion
- Produces human-readable output with explicit properties
- Allows further transformation/optimization of generated CSS
- Clear separation between compilation phases

**Important Caveat: CSS Modules as Final Output**

This approach uses CSS Modules as an **intermediary processing step** only. CSS Modules with `@apply` are **NOT suitable as a final output format** due to two categories of limitations:

1. **Build-Time Errors:** Named groups (`group/root`), named containers (`@container/root`), and custom utilities cannot be used with `@apply` - they cause literal compilation errors.

2. **Class Name Dependencies:** Arbitrary child selectors like `[&_.icon]:opacity-0` compile successfully but require exact class names on child elements, creating tight coupling between CSS and JSX that defeats the purpose of CSS modules.

The frosted skin uses both categories extensively, making CSS modules impractical as a final output format. Instead, we use CSS Modules only as an intermediary to leverage Tailwind's compiler, then transform the output to semantic selectors with inline styles.

**See:** `validation-tests/CSS-MODULE-APPLY-FINDINGS.md` for complete investigation and examples.

### Transformation Rules

#### Utility Class Expansion

Tailwind utilities → CSS properties:

```
// Input
'p-2 rounded-full cursor-pointer'

// Output
.button {
  padding: 0.5rem;
  border-radius: calc(infinity * 1px);
  cursor: pointer;
}
```

#### Pseudo-Classes & States

```
// Input
'hover:bg-white/10 focus-visible:outline-2'

// Output
@media (hover: hover) {
  .button:hover {
    background-color: color-mix(in srgb, #ffffff 10%, transparent);
  }
}

.button:focus-visible {
  outline-width: 2px;
}
```

**Note:** Hover states wrapped in `@media (hover: hover)` to respect user preferences

#### Data Attributes

```
// Input (in styles)
'[&[data-paused]]:opacity-0'

// Output
.button[data-paused] {
  opacity: 0%;
}
```

### CSS Quality Requirements

1. **Deduplication:** Identical rules should not be repeated
2. **Ordering:** Media queries should be properly nested/ordered
3. **Optimization:** Combine compatible selectors where possible
4. **Readability:** Logical grouping, consistent formatting
5. **Correctness:** No invalid CSS (e.g., `translate: x-px`)

---

## Component Transformation

### React → Web Component

#### Component Structure

```tsx
// Input: React Functional Component
export default function MediaSkinDefault({ children, className }) {
  return (
    <MediaContainer className={`${styles.Container} ${className}`}>
      {children}
      <div className={styles.Controls}>{/* content */}</div>
    </MediaContainer>
  );
}

// Output: Web Component Class
export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export function getTemplateHTML() {
  return /* html */ `
    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="controls">
        <!-- content -->
      </div>
    </media-container>
  `;
}
```

#### Element Transformation

**Components** → **Custom Elements:**
```tsx
<PlayButton />  →  <media-play-button></media-play-button>
```

**HTML Elements** → **HTML Elements** (preserved):
```tsx
<div />  →  <div></div>
```

#### Props/Attributes

**className** → **class:**
```tsx
className={styles.Button}  →  class="button"
```

**data-\*** → **Preserved:**
```tsx
data-testid="controls"  →  data-testid="controls"
```

**Boolean props** → **Boolean attributes:**
```tsx
disabled={true}  →  disabled
```

**camelCase props** → **kebab-case attributes:**
```tsx
sideOffset={8}  →  side-offset="8"
```

#### Children

**Direct children** → **Slot:**

```tsx
// Input
<MediaContainer>
  {children}
</MediaContainer>

// Output
<media-container>
  <slot name="media" slot="media"></slot>
</media-container>
```

---

## Output Quality Requirements

### CSS Quality

1. **Human-Readable:**
   - Clear property names
   - Logical grouping of rules
   - Consistent formatting and indentation

2. **Correct:**
   - No invalid CSS syntax
   - No malformed selectors
   - Valid property values
   - Proper unit handling

3. **Optimized:**
   - No duplicate rules
   - Appropriate use of shorthand vs. longhand properties
   - Efficient selector specificity

4. **Progressive:**
   - Feature queries for modern CSS (`@supports`)
   - Media queries for user preferences
   - Appropriate fallbacks

5. **Terse:**
   - Remove unnecessary vendor prefixes (unless needed)
   - Consolidate compatible rules
   - Use modern CSS features (e.g., `color-mix()`, `calc(infinity * 1px)`)

### Code Quality

1. **Idiomatic:**
   - Output should look hand-written, not generated
   - Follow target framework conventions
   - Use modern JavaScript features

2. **Type-Safe:**
   - Preserve TypeScript types where applicable
   - Generate .d.ts files for TypeScript projects

3. **Well-Formatted:**
   - Consistent indentation
   - Readable structure
   - Appropriate comments

### Correctness

1. **Visual Equivalence:** Compiled output should look identical to source
2. **Functional Equivalence:** Behavior should be identical
3. **No Regressions:** Compilation should not introduce bugs

---

## VJS-Specific Conventions

### Package Structure

```
packages/
├── core/
│   ├── core/              (@vjs-10/core)
│   ├── media/             (@vjs-10/media)
│   └── media-store/       (@vjs-10/media-store)
├── react/
│   ├── react/             (@vjs-10/react)
│   ├── react-icons/       (@vjs-10/react-icons)
│   └── react-media-store/ (@vjs-10/react-media-store)
└── html/
    ├── html/              (@vjs-10/html)
    ├── html-icons/        (@vjs-10/html-icons)
    └── html-media-store/  (@vjs-10/html-media-store)
```

**Pattern:** `packages/{platform}/{package-name}/`

### Component Locations

**Standard:** `src/components/` within each package

**React:** `packages/react/react/src/components/*.tsx`
**HTML:** `packages/html/html/src/components/*.ts`

### Skin Locations

**React:** `packages/react/react/src/skins/{skin-name}/`
**HTML:** `packages/html/html/src/skins/{skin-name}.ts`

**Compiled Output:** `packages/{platform}/{package}/src/skins/compiled/{strategy}/{skin-name}.*`

### Component Naming

**React Components:**
- Files: PascalCase (e.g., `PlayButton.tsx`)
- Exports: Named, matching filename
- Usage: `<PlayButton />`

**Web Components:**
- Files: kebab-case with `media-` prefix (e.g., `media-play-button.ts`)
- Element registration: kebab-case with `media-` prefix
- Usage: `<media-play-button></media-play-button>`

### Data Attributes

VJS components use data attributes for state:

- `data-paused` - Play/pause state
- `data-fullscreen` - Fullscreen state
- `data-volume-level="high|medium|low|off"` - Volume state
- `data-orientation="horizontal|vertical"` - Orientation

These are preserved across all framework transformations.

---

## Future Extensions

### Beyond Skins: Composed Components

**Current:** Compiler handles skins (compositions of primitives)

**Future:** Support compiling custom composed components

**Challenges:**
- Components may use hooks directly
- May include custom logic
- May have complex state management

### Additional CSS Strategies

1. **Tailwind CDN:** Output Tailwind classes with CDN script tag
2. **CSS-in-JS:** Generate styled-components or emotion code
3. **Scoped CSS:** Shadow DOM with scoped styles
4. **CSS Variables:** Extract common values to CSS custom properties

### Additional Framework Targets

1. **Vue:** Compile to Vue SFC
2. **Svelte:** Compile to Svelte components
3. **Solid:** Compile to Solid components
4. **Lit:** Use Lit for web components instead of vanilla

### Optimization Passes

1. **Tree Shaking:** Remove unused CSS rules
2. **Minification:** Compress output for production
3. **Critical CSS:** Extract above-the-fold styles
4. **Lazy Loading:** Split skins into separately loadable chunks

### Developer Experience

1. **Source Maps:** Map compiled output back to original source
2. **Watch Mode:** Recompile on file changes
3. **Error Messages:** Clear, actionable error reporting
4. **Warnings:** Flag potential issues (unused classes, invalid patterns)

---

## References

- **Current status:** `docs/CURRENT_STATUS.md`
- **Iteration process:** `docs/ITERATION_PROCESS.md`
- **Known limitations:** `docs/CURRENT_STATUS.md (Known Limitations section)`
- **E2E testing guide:** `docs/testing/E2E_GUIDE.md`
- **Tailwind support status:** `docs/tailwind/SUPPORT_STATUS.md`

---

## Appendix: Complete Example Transformation

### Input: React + Tailwind

**MediaSkinSimple.tsx**:

```tsx
import type { PropsWithChildren } from 'react';

import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';

import { PlayButton } from '../../components/PlayButton';

import styles from './styles';

export default function MediaSkinSimple({ children }: PropsWithChildren) {
  return (
    <MediaContainer className={styles.Container}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={styles.Button}>
          <PlayIcon className={styles.PlayIcon} />
          <PauseIcon className={styles.PauseIcon} />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
```

**styles.ts**:

```ts
const styles = {
  Container: 'relative rounded-xl overflow-clip',
  Controls: 'absolute bottom-4 inset-x-4 flex gap-2',
  Button: 'p-2 rounded-full hover:bg-white/10',
  PlayIcon: 'opacity-0 [&[data-paused]]:opacity-100',
  PauseIcon: 'opacity-100 [&[data-paused]]:opacity-0',
};
```

### Output: Web Component + Inline CSS

**media-skin-simple.ts**:

```ts
import { MediaSkin } from '../../../media-skin';

import '../../../components/media-play-button';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    <style>
      media-container {
        position: relative;
        border-radius: 0.75rem;
        overflow: clip;
      }

      .controls {
        position: absolute;
        bottom: 1rem;
        inset-inline: 1rem;
        display: flex;
        gap: 0.5rem;
      }

      .button {
        padding: 0.5rem;
        border-radius: calc(infinity * 1px);
      }

      @media (hover: hover) {
        .button:hover {
          background-color: color-mix(in srgb, #ffffff 10%, transparent);
        }
      }

      media-play-button media-play-icon {
        opacity: 0%;
      }

      media-play-button[data-paused] media-play-icon {
        opacity: 100%;
      }

      media-play-button media-pause-icon {
        opacity: 100%;
      }

      media-play-button[data-paused] media-pause-icon {
        opacity: 0%;
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

export class MediaSkinSimple extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

if (!customElements.get('media-skin-simple')) {
  customElements.define('media-skin-simple', MediaSkinSimple);
}
```

---

## Version History

- **2025-10-15:** Consolidated from ARCHITECTURE.md and compiler-architecture.md, added edge cases and complete example
- **2025-10-07:** Original compiler-architecture.md created
