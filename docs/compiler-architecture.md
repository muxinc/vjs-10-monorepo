# VJS Framework Compiler Architecture

> **Status**: Living Document
> **Last Updated**: 2025-10-07
> **Purpose**: Define the architectural principles, rules, and conventions for the VJS framework compiler

---

## Table of Contents

1. [Scope & Goals](#scope--goals)
2. [Core Architectural Principles](#core-architectural-principles)
3. [Transformation Pipeline Overview](#transformation-pipeline-overview)
4. [Module Relationships & Usage Analysis](#module-relationships--usage-analysis)
5. [Input Specification](#input-specification)
6. [Output Specification](#output-specification)
7. [Import Transformation](#import-transformation)
8. [Component Detection & Resolution](#component-detection--resolution)
9. [CSS Transformation](#css-transformation)
10. [Framework Transformation](#framework-transformation)
11. [Configuration Philosophy](#configuration-philosophy)
12. [VJS-Specific Conventions](#vjs-specific-conventions)
13. [Output Quality Requirements](#output-quality-requirements)
14. [Future Extensions](#future-extensions)

---

## Scope & Goals

### What This Compiler Does

The VJS Framework Compiler transforms **VJS skins** written in one framework/styling paradigm into equivalent implementations for different target frameworks and styling strategies.

**Current Primary Transformation:**
- **Input**: React + TSX + Tailwind CSS v4 (defined in TypeScript)
- **Output**: Web Components + Inline Vanilla CSS

### Problems Solved

1. **Framework Portability**: Allow a single skin definition to work across React, Web Components, and (future) other frameworks
2. **Styling Flexibility**: Support multiple CSS strategies (inline, CSS modules, Tailwind CDN) from a single source
3. **Developer Experience**: Write skins using modern, ergonomic tooling (React + Tailwind) while generating optimized output for any target
4. **Maintenance**: Single source of truth for skin designs, compiled to multiple targets

### Non-Goals (For Now)

- **Not** a general-purpose framework compiler (VJS-specific assumptions are acceptable)
- **Not** compiling primitive components (only skins initially, though architecture should support future extension)
- **Not** runtime transformation (compile-time only)

---

## Core Architectural Principles

### 1. Separation of Concerns

**Principle**: Separate file I/O, discovery, configuration, and pure transformation logic.

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

**Rationale**:
- Core transformation logic should work with strings and configuration objects
- Should work with hypothetical file paths (not require actual files)
- Enables testing without filesystem access
- Clear boundary for where assumptions are made

### 2. Push Assumptions to the Boundaries

**Principle**: Avoid baking assumptions deep in transformation logic. Instead, discover/configure at boundaries and pass as data.

**Example**: Don't check `if (packageName.startsWith('@vjs-10/'))` deep in the transformer. Instead, discover this fact early and pass it as `isVJSPackage: boolean` in configuration.

### 3. Functional Over Declarative

**Principle**: Use predicates (functions that answer questions) and projections (functions that transform) rather than large declarative data structures.

**Rationale**:
- More flexible and composable
- Easier to inject custom behavior
- Avoids building expensive registries upfront
- Supports inference rather than explicit enumeration

### 4. Identify, Then Transform

**Principle**: Clearly separate identification/categorization from transformation.

**Pipeline**:
1. **Identify**: What imports/elements exist? (no decisions about meaning)
2. **Categorize**: What type is each import/element? (business logic)
3. **Project**: How should each category be transformed? (transformation rules)

### 5. VJS-Specific But Extensible

**Principle**: Design around VJS conventions, but make those conventions explicit and overridable.

**Rationale**:
- We're not building a general-purpose compiler
- VJS-specific assumptions are acceptable (and beneficial for simplicity)
- But those assumptions should be documented and swappable

---

## Transformation Pipeline Overview

> **Context**: This section describes the transformation pipeline. The **specific phases and their behavior are determined by the [Hierarchical Configuration](#hierarchical-configuration-system)** (module type, input/output contexts). The pipeline shown here applies to the current focus: **skin modules with React + Tailwind input**.

### Pipeline Composition

The transformation pipeline is **not fixed**—it adapts based on configuration:

- **Module Type** determines which phases are needed (skins need style transformation, utilities may not)
- **Input Framework** determines parsing strategy (React/JSX vs Vue SFC vs other)
- **Input CSS Type** determines style extraction (Tailwind utilities vs CSS modules vs inline styles)
- **Output Framework** determines code generation (web components vs React vs other)
- **Output CSS Strategy** determines CSS output format (inline vs modules vs CDN)

### High-Level Flow (For Skins: React → Web Component)

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
    │   ├─→ Transform import style (named → side-effect for web components)
    │   └─→ Omit style imports (CSS will be inlined)
    │
    ├─→ Transform CSS (via CSS Modules intermediary)
    │   ├─→ Extract style keys and Tailwind utilities from style definitions
    │   ├─→ Generate intermediary CSS Modules file with utilities
    │   ├─→ Process through PostCSS + Tailwind compiler (expand utilities)
    │   ├─→ Transform compiled CSS:
    │   │   ├─→ Replace CSS Module scoped selectors with semantic selectors
    │   │   │   ├─→ Element selectors for Component Selector Identifiers
    │   │   │   └─→ Class selectors for Type/Generic selectors
    │   │   ├─→ Preserve expanded CSS properties
    │   │   └─→ Apply additional transformations (terse syntax, modern CSS)
    │   └─→ Generate final CSS in target format (inline, external, etc.)
    │
    └─→ Transform Component Tree
        ├─→ Transform JSX elements to target framework
        │   ├─→ Simple components: <PlayButton> → <media-play-button>
        │   └─→ Compound components: <TimeRange.Root> → <media-time-range-root>
        ├─→ Transform className values based on selector categorization
        │   ├─→ Component Selector Identifiers → omit (styled via element selector)
        │   └─→ Type/Generic selectors → convert to class names
        └─→ Generate target markup/code

    ↓
Generate Output AST/Code
    ↓
Output Source Code (string)
```

### Transformation Axes

The compiler operates on two independent axes:

1. **Framework Axis**: React → Web Component → (future: Vue, etc.)
2. **CSS Axis**: Tailwind (TS) → Inline CSS → CSS Modules → (future: Tailwind CDN, etc.)

These form a matrix of possible transformations:
- React + CSS Modules
- React + Inline CSS
- Web Component + Inline CSS
- Web Component + Tailwind CDN
- etc.

Each combination has its own set of transformation rules.

---

## Module Relationships & Usage Analysis

### Overview

Rather than relying solely on naming conventions or file paths, the compiler should **analyze usage patterns** within the module to infer intent and relationships. This provides more accurate categorization and enables smarter transformations.

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

---

### 1. Identifying Components via JSX Usage

**Principle**: An import is a component if it's used as a JSX element name.

#### Simple Components

```tsx
import { PlayButton } from '../../components/PlayButton';

// Usage identifies it as a component:
<PlayButton className={styles.Button}>
  {/* ... */}
</PlayButton>
```

**Inference**: `PlayButton` is a component because it appears as `<PlayButton>`.

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

**Inference**:
- `TimeRange` is a namespace containing components
- `TimeRange.Root`, `TimeRange.Track`, `TimeRange.Progress` are all components
- All members accessed via dot notation in JSX are compound components

---

### 2. Identifying VJS Components

**Principle**: A component is a VJS component if:
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

**Inference**:
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

**Inference**:
1. `PlayButton` used in JSX → is a component
2. Imported via relative path `../../components/PlayButton`
3. Source module is in `@vjs-10/react` package (known from upstream)
4. Relative path resolves within same package → is VJS component in same package

---

### 3. Identifying Style Imports via className Usage

**Principle**: An import provides styles if it's used in `className` attributes as member access.

```tsx
import styles from './styles';

<PlayButton className={`${styles.PlayButton} ${styles.Button}`}>
  <PlayIcon className={styles.Icon} />
</PlayButton>
```

**Inference**:
1. `styles` used in `className` attributes → is a style import
2. `styles.PlayButton`, `styles.Button`, `styles.Icon` are style keys
3. Style import will be omitted in web component output (CSS inlined instead)

**Anti-pattern** (not a style import):
```tsx
import { config } from './config';

<PlayButton data-config={config.playbackRate} />
```

This doesn't use member access in `className`, so `config` is not a style import.

---

### 4. Categorizing Style Keys via Naming Analysis

**Principle**: The relationship between a style key name and JSX component names determines the CSS selector type.

#### Component Selector Identifier

**Pattern**: Style key exactly matches a component name (case-sensitive)

```tsx
import { PlayButton } from '../../components/PlayButton';
import styles from './styles';

<PlayButton className={styles.PlayButton} />
```

**Analysis**:
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

**Rationale**: The style is specific to this component instance, so target the custom element directly.

#### Component Type Selector

**Pattern**: Style key is a suffix of a component name, representing a reusable "type" or "role"

Common suffixes: `Button`, `Icon`, `Container`, `Controls`, `Display`, `Root`, `Track`, `Thumb`, etc.

```tsx
import { PlayButton } from '../../components/PlayButton';
import { FullscreenButton } from '../../components/FullscreenButton';
import styles from './styles';

<PlayButton className={`${styles.PlayButton} ${styles.Button}`} />
<FullscreenButton className={`${styles.FullscreenButton} ${styles.Button}`} />
```

**Analysis**:
- Style key: `Button`
- Used by: `PlayButton`, `FullscreenButton`
- Pattern: Common suffix
- Category: **Component Type Selector**

**CSS Output Strategy** (Web Component + Inline CSS):
```css
/* Use class selector */
.button {
  /* shared button styles */
}
```

**Rationale**: The style applies to multiple components, so use a reusable class.

#### Nested Component Selector

**Pattern**: Style key matches a compound component's full path

```tsx
import { TimeRange } from '../../components/TimeRange';
import styles from './styles';

<TimeRange.Root className={styles.RangeRoot}>
  <TimeRange.Track className={styles.RangeTrack} />
</TimeRange.Root>
```

**Analysis**:
- Style key: `RangeRoot`
- Component: `TimeRange.Root`
- Pattern: `{ParentName}{ChildName}` (e.g., `Range` + `Root`)
- Category: **Nested Component Selector**

**CSS Output Strategy** (Web Component + Inline CSS):
```css
/* Use element selector for compound component */
media-time-range-root {
  /* styles */
}
```

#### Generic Selector

**Pattern**: Style key doesn't match any component name pattern

```tsx
import styles from './styles';

<div className={styles.Controls}>
  <span className={styles.TimeDisplay}>00:00</span>
</div>
```

**Analysis**:
- Style keys: `Controls`, `TimeDisplay`
- No matching component imports
- Category: **Generic Selector**

**CSS Output Strategy** (Web Component + Inline CSS):
```css
/* Use class selector */
.controls {
  /* styles */
}

.time-display {
  /* styles */
}
```

**Rationale**: Applied to plain HTML elements or arbitrary groupings.

---

### 5. Determining Import Transformation Strategy

Once we've categorized imports via usage analysis, we can determine how to transform them.

#### Example: Complete Analysis

```tsx
// Source: packages/react/react/src/skins/default/MediaSkinDefault.tsx
// Package: @vjs-10/react (known from upstream)
// Target: packages/html/html/src/skins/compiled/inline/media-skin-default.ts

import { PlayButton } from '../../components/PlayButton';
import { PlayIcon } from '@vjs-10/react-icons';
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

| Import | Usage | Category | Transformation |
|--------|-------|----------|----------------|
| `PlayButton` | JSX element `<PlayButton>` | VJS component (same package) | Transform to side-effect import with target path |
| `PlayIcon` | JSX element `<PlayIcon>` | VJS component (external package) | Transform package name to target platform |
| `styles` | Member access in `className` | Style definitions | Omit import, inline CSS in template |
| `MediaContainer` | JSX element `<MediaContainer>` | VJS component (same package, inferred from JSX) | Transform to side-effect import with target path |

#### Style Key Analysis

| Style Key | Component Reference | Category | Output Selector |
|-----------|---------------------|----------|-----------------|
| `MediaContainer` | `<MediaContainer>` | Component Selector Identifier | `media-container { }` |
| `Controls` | `<div>` | Generic Selector | `.controls { }` |
| `PlayButton` | `<PlayButton>` | Component Selector Identifier | `media-play-button { }` |
| `Button` | `<PlayButton>` | Component Type Selector | `.button { }` |
| `Icon` | `<PlayIcon>` | Component Type Selector | `.icon { }` |

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

### 6. Handling Compound Components

Compound components require special handling in both identification and transformation.

#### Identification

```tsx
import { TimeRange } from '../../components/TimeRange';

<TimeRange.Root>
  <TimeRange.Track>
    <TimeRange.Progress />
  </TimeRange.Track>
</TimeRange.Root>
```

**Analysis**:
1. `TimeRange` is imported (but not directly used as element)
2. `TimeRange.Root`, `TimeRange.Track`, `TimeRange.Progress` are JSX elements
3. All accessed via member expression (`.`)
4. Inference: `TimeRange` is a namespace component with sub-components

#### Import Transformation

**React**:
```tsx
import { TimeRange } from '../../components/TimeRange';
// Single import, namespace access
```

**Web Component**:
```ts
// Need to import all used sub-components
import '../../../components/media-time-range-root';
import '../../../components/media-time-range-track';
import '../../../components/media-time-range-progress';
```

**Transformation Logic**:
1. Track all member accesses of imported identifier in JSX
2. For each unique member (`Root`, `Track`, `Progress`):
   - Generate element name: `media-time-range-{member-kebab}`
   - Generate import statement for that specific component

#### Element Transformation

```tsx
// React
<TimeRange.Root>
  <TimeRange.Track />
</TimeRange.Root>

// Web Component
<media-time-range-root>
  <media-time-range-track></media-time-range-track>
</media-time-range-root>
```

**Naming Convention**: `{namespace-kebab}-{member-kebab}`

---

### 7. Edge Cases & Refinements

#### Dynamically Determined className

```tsx
const buttonClass = isActive ? styles.ActiveButton : styles.Button;
<PlayButton className={buttonClass} />
```

**Analysis**:
- `styles` used in conditional expression
- Still identifiable as style import
- Both `ActiveButton` and `Button` are style keys

**Limitation**: Complex runtime expressions may not be fully analyzable at compile time.

#### Spread Props

```tsx
const buttonProps = { className: styles.Button, disabled: true };
<PlayButton {...buttonProps} />
```

**Analysis**:
- `styles.Button` used in object property
- May require more sophisticated data flow analysis
- Consider documenting as "best effort" pattern

#### Mixed Import Usage

```tsx
import { PlayButton } from '../../components/PlayButton';

// Used as component
<PlayButton />

// Also used in logic (rare)
const buttonType = PlayButton.displayName;
```

**Analysis**:
- Primary usage: JSX element → component
- Secondary usage: property access → keep as named import in output?

**Decision**: For web components, primary usage (JSX) takes precedence. Non-JSX usage may need manual handling or may be unsupported.

---

### Summary: Analysis Pipeline

For each import in the source module:

1. **Extract Usage Locations**
   - Where is this identifier referenced in the AST?

2. **Categorize Usage Type**
   - JSX Element Name → Component
   - className Member Access → Style Import
   - Other → Unknown/External

3. **Apply Context**
   - Source package (from upstream)
   - Import path resolution
   - Target package/location

4. **Determine VJS Relationship**
   - Is this a VJS component?
   - If so, same package or external?
   - What's the target equivalent?

5. **Analyze Style Key Relationships** (if style import)
   - Match style keys to component names
   - Categorize each key (Component Selector, Type Selector, Generic)
   - Determine output CSS selector strategy

6. **Project to Target**
   - Transform import path/package
   - Transform import style (named → side-effect for web components)
   - Generate appropriate CSS selectors based on categorization

This usage-driven analysis makes the compiler more intelligent and reduces reliance on brittle naming conventions.

---

## Input Specification

> **Configuration Context**: This section describes input assumptions for the **current configuration**: `moduleType: skin`, `framework: react`, `cssType: tailwind-v4`. Different module types or input frameworks would have different specifications.

### Source Language (For Skins)

**Framework**: React + TSX
- Standard React functional components
- JSX syntax
- TypeScript types

**Styling**: Tailwind CSS v4 defined in TypeScript
- Utilities defined as TypeScript string values
- Exported as typed object with semantic keys
- Co-located in `styles.ts` file
- Composed via utility function (e.g., `cn()`)

### Example Input Structure (Skin)

```tsx
// MediaSkinDefault.tsx
import { PlayButton } from '../../components/PlayButton';
import { PlayIcon } from '@vjs-10/react-icons';
import styles from './styles';

export default function MediaSkinDefault({ children, className }) {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={styles.Button}>
          <PlayIcon className={styles.Icon} />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
```

```ts
// styles.ts
const styles = {
  MediaContainer: cn(
    'relative @container/root group/root',
    'rounded-xl overflow-clip'
  ),
  Controls: cn(
    'absolute bottom-3 inset-x-3',
    'flex items-center gap-2'
  ),
  Button: cn(
    'p-2 rounded-full cursor-pointer',
    'hover:bg-white/10 focus-visible:outline-2'
  ),
  Icon: cn('shrink-0 transition-opacity')
};
```

### Assumptions About Input

1. **Skin Structure**:
   - Single default export (function component)
   - Accepts `{ children, className }` props
   - Wraps content in `MediaContainer`
   - Composes VJS primitive components

2. **Import Patterns**:
   - VJS components via relative paths OR `@vjs-10/*` packages
   - Icons from `@vjs-10/react-icons`
   - Styles from co-located file

3. **Style Contract**:
   - Styles imported as default export
   - Keys are semantic identifiers (not tied to specific class names)
   - Values are Tailwind utility strings

---

## Output Specification

> **Configuration Context**: This section describes output format for the **current configuration**: `moduleType: skin`, `framework: web-component`, `cssStrategy: inline-vanilla`. Different output frameworks or CSS strategies would have different specifications.

### Target: Web Components + Inline CSS (For Skins)

**Framework**: Web Components (Custom Elements)
- Custom element classes extending HTMLElement
- Template function returning HTML string
- Side-effect imports for component registration

**Styling**: Inline Vanilla CSS
- `<style>` tag embedded in template
- Human-readable CSS rules
- Terse but clear property names
- No utility class references in markup

### Example Output Structure

```ts
// media-skin-default.ts
import { MediaSkin } from '../../../media-skin';
import '../../../components/media-play-button';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    <style>
      media-container {
        position: relative;
        container-type: inline-size;
        container-name: root;
        border-radius: 0.75rem;
        overflow: clip;
      }

      .controls {
        position: absolute;
        bottom: 0.75rem;
        inset-inline: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .button {
        padding: 0.5rem;
        border-radius: calc(infinity * 1px);
        cursor: pointer;
      }

      @media (hover: hover) {
        .button:hover {
          background-color: color-mix(in srgb, #ffffff 10%, transparent);
        }
      }

      .button:focus-visible {
        outline-width: 2px;
        outline-offset: 2px;
        outline-color: rgb(59 130 246);
      }

      .icon {
        flex-shrink: 0;
        transition-property: opacity;
        transition-timing-function: ease;
        transition-duration: 300ms;
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

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

if (!customElements.get('media-skin-default')) {
  customElements.define('media-skin-default', MediaSkinDefault);
}
```

### Output Characteristics

1. **Import Style**: Side-effect only (components self-register)
2. **Template**: HTML string with embedded styles
3. **Class Names**: Simple, semantic kebab-case
4. **CSS**: Expanded properties, media queries, progressive enhancement
5. **Registration**: Conditional custom element definition

---

## Import Transformation

> **Configuration Context**: This section describes import transformation for the **current configuration**: `moduleType: skin`, `input.framework: react` → `output.framework: web-component`. Component transformations or different framework combinations would have different import rules.

### Phases of Import Handling

> **Note**: This section describes import transformation in detail. See [Module Relationships & Usage Analysis](#module-relationships--usage-analysis) for the usage-driven approach that determines how imports are categorized.

#### Phase 1: Identification
Extract and parse import statements from source AST. No business logic—just structural analysis.

**Questions Answered**:
- Where are the import statements?
- What is the import path?
- What is the import style? (named, default, namespace, side-effect, type-only)

#### Phase 2: Categorization (Usage-Driven)
Classify each import based on **how it's used** in the module, combined with package context.

**Categorization Strategy**:
1. Analyze usage in JSX elements → identifies components
2. Analyze usage in className attributes → identifies style imports
3. Check package scope and source context → determines VJS relationship
4. Match style keys to component names → determines selector type

**Categories**:
- VJS component (same package) - *identified by JSX usage + relative path + source package*
- VJS component (external package) - *identified by JSX usage + @vjs-10/* package*
- VJS icon package - *identified by JSX usage + *-icons package pattern*
- VJS core package (media-store, core) - *platform-agnostic dependencies*
- Framework-specific (react, react-dom) - *eliminated for web components*
- Style import - *identified by className member access usage*
- External package (non-VJS) - *preserved as-is*

**Context Required**:
- Source file location (physical or logical)
- Source package information (from upstream discovery)
- Import resolution (what file/package does this import reference?)
- **Usage analysis** (where and how the import is referenced in the code)

#### Phase 3: Projection
Transform each categorized import to target framework equivalent.

**Transformations**:
- Path rewriting (package names, relative paths, accounting for naming conventions)
- Import style changes (named → side-effect for web components)
- Import elimination (framework imports, style imports, type-only imports)
- Compound component expansion (TimeRange → multiple individual imports)

### Import Categories & Rules

#### VJS Component (Same Package)

**Example**: `import { PlayButton } from '../../components/PlayButton'`

**Detection**:
- Relative import path
- Resolves to file within same package as source
- Path includes `/components/` directory

**React → Web Component**:
- **Path**: Recalculate relative path to target component location
  - Source component: `PlayButton.tsx` → Target: `media-play-button.ts`
- **Style**: Named/Default import → Side-effect import
- **Example**: `import '../../../components/media-play-button'`

#### VJS Icon Package

**Example**: `import { PlayIcon } from '@vjs-10/react-icons'`

**Detection**:
- Package name matches `@vjs-10/*-icons` pattern

**React → Web Component**:
- **Path**: Transform package name: `react-icons` → `html-icons`
- **Style**: Named imports → Side-effect import
- **Example**: `import '@vjs-10/html-icons'`

**Rationale**: Icons are web components that self-register

#### VJS Core Package

**Example**: `import { timeRangeStateDefinition } from '@vjs-10/media-store'`

**Detection**:
- Package name is `@vjs-10/core`, `@vjs-10/media-store`, or `@vjs-10/media`
- Platform-agnostic packages

**React → Web Component**:
- **Path**: Preserve (no change)
- **Style**: Preserve (no change)

**Rationale**: Core packages work across all platforms

#### Framework-Specific Import

**Example**: `import type { PropsWithChildren } from 'react'`

**Detection**:
- Package name is `react`, `react-dom`, `react/jsx-runtime`, etc.

**React → Web Component**:
- **Path**: N/A (eliminated)
- **Style**: N/A (eliminated)
- **Action**: Remove import entirely

**Rationale**: Web components don't need React types/runtime

#### Style Import

**Example**: `import styles from './styles'`

**Detection**:
- Imports file named `styles` or `*.css`
- In skin directory

**React → Web Component**:
- **Path**: N/A (eliminated)
- **Style**: N/A (eliminated)
- **Action**: Remove import, CSS extracted and inlined

**Rationale**: Styles are transformed separately and embedded in template

### Import Path Resolution

**Key Principle**: Import paths must be recalculated when output location differs from source location.

#### Example Scenario

**Source**:
- File: `packages/react/react/src/skins/default/MediaSkinDefault.tsx`
- Import: `../../components/PlayButton`
- Resolves to: `packages/react/react/src/components/PlayButton.tsx`

**Target**:
- File: `packages/html/html/src/skins/compiled/inline/media-skin-default.ts`
- Should import: `../../../../../packages/html/html/src/components/media-play-button.ts`
- Simplified as: `../../../components/media-play-button`

**Calculation**:
1. Resolve source import to absolute path
2. Determine equivalent target file (accounting for naming conventions)
3. Calculate relative path from output file to target file

### Import Style Transformation

#### Type-Only Imports
```tsx
// Input
import type { PropsWithChildren } from 'react';

// Output
// (eliminated)
```

#### Named Imports → Side-Effect
```tsx
// Input
import { PlayButton, PauseButton } from '../../components';

// Output (web components)
import '../../../components/media-play-button';
import '../../../components/media-pause-button';
```

**Rationale**: Web components self-register when imported

#### Default Imports → Side-Effect
```tsx
// Input
import PlayButton from '../../components/PlayButton';

// Output (web components)
import '../../../components/media-play-button';
```

#### Namespace Imports
```tsx
// Input
import * as Icons from '@vjs-10/react-icons';

// Output
// (complex case - may need to trace usage and split into individual imports)
```

**Note**: Namespace imports are tricky for web components. May require usage analysis.

---

## Component Detection & Resolution

> **Configuration Context**: This section describes component detection and transformation for the **current configuration**: `moduleType: skin`, `input.framework: react` → `output.framework: web-component`. These conventions apply to skin transformations that reference VJS components.

> **Note**: This section describes component resolution conventions. See [Module Relationships & Usage Analysis](#module-relationships--usage-analysis) for the **usage-driven detection** approach that should be used in practice.

### Key Questions

For any given import, we need to answer:
1. Is this a component? → **Answer: Check if used as JSX element**
2. Is this a VJS component? → **Answer: Check usage + package context**
3. What is its name? → **Answer: Extract from import or JSX usage**
4. What is the equivalent in the target framework? → **Answer: Apply naming conventions**
5. Where is that target component located? → **Answer: Calculate from target structure**

### Detection Strategy (Usage-Driven)

#### Primary Detection: JSX Usage

**The definitive way to identify a component is to check if it's used as a JSX element name.**

```tsx
import { PlayButton } from '../../components/PlayButton';
import { config } from './config';

// PlayButton is a component (used in JSX)
<PlayButton />

// config is NOT a component (not used in JSX)
const value = config.someValue;
```

**This approach is more reliable than:**
- File path patterns (`/components/` directory)
- Naming conventions (PascalCase)
- Package scope alone (`@vjs-10/*`)

#### Secondary Check: Is VJS Component?

Once identified as a component (via JSX usage), determine if it's a VJS component:

1. **External VJS package**:
   - Import path starts with `@vjs-10/`
   - Package is platform-specific (react-*, html-*, react-native-*)
   - Package is not a core utility (media-store, core, media)
   - **AND** used in JSX

2. **Same-package relative import**:
   - Import is relative
   - Resolves within source package
   - Source package is a VJS package (from upstream context)
   - **AND** used in JSX

**Fallback (Convention-Based)**: If usage analysis is unavailable, can use path patterns (`/components/` directory) as heuristic.

#### Projection: Component Name

Extract the normalized component name:

- **From file path**: Extract filename, remove extension
  - `PlayButton.tsx` → `PlayButton`
  - `media-play-button.ts` → `PlayButton` (normalize by removing `media-` prefix and converting to PascalCase)

- **From import specifier**: Use imported name
  - `import { PlayButton }` → `PlayButton`

#### Projection: Target Component Path

Given a component name and target context:

1. **Target filename**: Apply naming convention
   - React: `{ComponentName}.tsx`
   - Web Component: `media-{kebab-case-name}.ts`

2. **Target directory**: Apply platform structure
   - Typically: `src/components/{filename}`

3. **Relative path**: Calculate from output file location to target component location

### Naming Conventions

#### React
- **Components**: PascalCase files (`PlayButton.tsx`)
- **Imports**: Named exports matching filename
- **Element names**: JSX with PascalCase (`<PlayButton />`)

#### Web Components
- **Components**: kebab-case with `media-` prefix (`media-play-button.ts`)
- **Imports**: Side-effect only (no names)
- **Element names**: kebab-case custom elements (`<media-play-button>`)

#### Transformation

```
PlayButton      →  media-play-button
TimeRange       →  media-time-range
FullscreenButton → media-fullscreen-button
```

**Algorithm**: PascalCase → kebab-case, prepend `media-`

### Namespace Components

Some components have sub-components accessed via namespace:

```tsx
// Input (React)
<TimeRange.Root>
  <TimeRange.Track>
    <TimeRange.Progress />
  </TimeRange.Track>
</TimeRange.Root>

// Output (Web Component)
<media-time-range-root>
  <media-time-range-track>
    <media-time-range-progress></media-time-range-progress>
  </media-time-range-track>
</media-time-range-root>
```

**Transformation**: `{Parent}.{Child}` → `media-{parent}-{child}`

### Package Mapping

When transforming package names:

```
@vjs-10/react-icons         → @vjs-10/html-icons
@vjs-10/react-media-store   → @vjs-10/html-media-store
@vjs-10/react               → @vjs-10/html
```

**Pattern**: Replace platform prefix while preserving suffix

**Special cases**:
- Core packages (`@vjs-10/core`, `@vjs-10/media-store`) remain unchanged (platform-agnostic)

---

## CSS Transformation

> **Configuration Context**: This section describes CSS transformation for the **current configuration**: `moduleType: skin`, `input.cssType: tailwind-v4` → `output.cssStrategy: inline-vanilla`. Component transformations may preserve CSS Modules, and other output strategies (CDN, external stylesheets) would have different transformation rules.

### Input: Tailwind CSS v4 (TypeScript, For Skins)

**Characteristics**:
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

**Goals**:
1. **Human-readable**: Clear, understandable CSS
2. **Terse**: Minimize redundancy while maintaining clarity
3. **Correct**: Semantically equivalent to Tailwind output
4. **Progressive**: Use modern CSS features with appropriate fallbacks

### Transformation Strategy: CSS Modules as Intermediary

**For the current target** (`inline-vanilla` with legible output), the transformation uses **CSS Modules as an intermediary format**:

```
Tailwind Utilities (TypeScript)
    ↓
CSS Modules (PostCSS processing)
    ↓
Vanilla CSS (semantic selectors, expanded properties)
```

**Why CSS Modules?**

1. **PostCSS Integration**: CSS Modules allows using custom PostCSS plugins to process Tailwind utilities
2. **Semantic Mapping**: Maps style keys to scoped class names that we can then transform to semantic selectors
3. **Existing Tooling**: Leverages mature CSS Modules + PostCSS + Tailwind toolchain
4. **Human-Readable Output**: Enables expansion of utilities into explicit CSS properties

**Process**:
1. Extract style keys and Tailwind utility strings from `styles.ts`
2. Generate CSS Modules file with those utilities
3. Process through PostCSS + Tailwind compiler to expand utilities
4. Transform generated CSS by:
   - Replacing CSS Module scoped class names with semantic selectors (based on usage analysis)
   - Preserving expanded CSS properties
   - Applying any additional transformations (modern CSS features, terse property names, etc.)

**Example Flow**:

```typescript
// Input: styles.ts
const styles = {
  PlayButton: cn(
    'p-2 rounded-full',
    '[&[data-paused]_.play-icon]:opacity-100'
  ),
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

**Benefits**:
- Leverages Tailwind's own compiler for accurate utility expansion
- Produces human-readable output with explicit properties
- Allows further transformation/optimization of generated CSS
- Clear separation between compilation phases

**Tradeoffs**:
- Additional transformation step adds complexity
- Requires managing intermediary CSS Modules files
- Dependent on PostCSS + Tailwind toolchain

---

### Alternative Strategy: Direct Tailwind Compilation (Future)

> **Configuration Context**: This is a **future alternative** for `output.cssStrategy: inline-tailwind-utilities`. Not currently implemented, but architecture should support it.

For scenarios where legible CSS is not a priority, an alternative approach would skip CSS Modules and use Tailwind's standard compiler directly:

```
Tailwind Utilities (TypeScript)
    ↓
Tailwind Compiler (standard output)
    ↓
Vanilla CSS (utility classes preserved in markup)
```

**Key Differences**:

1. **Markup Changes**: Style key references would be preserved as `class` attributes with utility strings:
   ```tsx
   // Input
   <PlayButton className={styles.PlayButton}>

   // Output (CSS Modules approach)
   <media-play-button></media-play-button>

   // Output (Direct Tailwind approach)
   <media-play-button class="p-2 rounded-full [&[data-paused]_.play-icon]:opacity-100">
   ```

2. **CSS Output**: Large, comprehensive utility-based stylesheet (similar to standard Tailwind output)
   ```css
   .p-2 { padding: 0.5rem; }
   .rounded-full { border-radius: 9999px; }
   .\[\&\[data-paused\]_\.play-icon\]\:opacity-100[data-paused] .play-icon { opacity: 1; }
   /* ...hundreds more utilities... */
   ```

3. **Module Definition Impact**: Compiler would need to:
   - Preserve style imports rather than eliminating them
   - Transform `className={styles.Key}` → `class="${inlineUtilityString}"`
   - Evaluate compile-time expressions to resolve utility strings
   - Bundle all used utilities into a single stylesheet

**Benefits**:
- Simpler transformation (no CSS Modules intermediary)
- Uses Tailwind compiler as-is
- May produce smaller total bundle if many utilities are reused

**Tradeoffs**:
- Much larger CSS output (every utility included)
- Less human-readable CSS
- Class names in markup become verbose and cryptic
- Requires different module transformation logic

**When This Would Be Useful**:
- Rapid prototyping (don't care about CSS readability)
- Development builds (faster compilation)
- Cases where Tailwind JIT CDN could be used instead of inlining

**Architectural Considerations**:

This alternative approach affects multiple transformation phases:

1. **Import Transformation**: Style imports would NOT be eliminated (or would be transformed to inline strings)
2. **JSX Transformation**: `className` attribute values need compile-time evaluation and inlining
3. **CSS Generation**: Use standard Tailwind compiler, collect all utilities, inline as single `<style>` block
4. **Module Structure**: Different output structure (utilities in markup vs semantic CSS)

The hierarchical configuration system should support this via:
```typescript
const ALTERNATIVE_CONFIG = {
  moduleType: 'skin',
  input: {
    framework: 'react',
    cssType: 'tailwind-v4',
  },
  output: {
    framework: 'web-component',
    cssStrategy: 'inline-tailwind-utilities', // ← Different strategy
  },
};
```

This would activate different transformation rules throughout the pipeline.

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

**Note**: Hover states wrapped in `@media (hover: hover)` to respect user preferences

#### Data Attributes

```
// Input (in styles)
'[&[data-paused]]:opacity-0'

// Output
.button[data-paused] {
  opacity: 0%;
}
```

#### Group Modifiers

```
// Input
'group-hover/button:scale-110'

// Output
.button:hover .icon {
  scale: 110% 110%;
}
```

**Note**: Requires understanding of component hierarchy and group naming

#### Container Queries

```
// Input
'@container/root'

// Output
.container {
  container-type: inline-size;
  container-name: root;
}
```

#### Arbitrary Variants (Complex Selectors)

```
// Input
'[&_.icon]:opacity-0'

// Output
.button .icon {
  opacity: 0%;
}
```

#### Custom Variants

```
// Input (with comment directive)
'reduced-transparency:bg-black/70'
/* @custom-variant reduced-transparency @media (prefers-reduced-transparency: reduce); */

// Output
@media (prefers-reduced-transparency: reduce) {
  .controls {
    background-color: color-mix(in srgb, #000000 70%, transparent);
  }
}
```

### Selector Generation

> **Note**: See [Module Relationships & Usage Analysis](#module-relationships--usage-analysis) for the intelligent selector categorization approach based on style key relationships to components.

**Key Decision**: How to generate CSS selectors from style keys

**Usage-Driven Approach**: The compiler analyzes the relationship between style keys and component names to determine the appropriate selector type:

1. **Component Selector Identifier** (exact match: `styles.PlayButton` on `<PlayButton>`)
   → Element selector: `media-play-button { }`

2. **Component Type Selector** (suffix pattern: `styles.Button` on multiple button components)
   → Class selector: `.button { }`

3. **Nested Component Selector** (compound: `styles.RangeRoot` on `<TimeRange.Root>`)
   → Element selector: `media-time-range-root { }`

4. **Generic Selector** (no component match: `styles.Controls` on `<div>`)
   → Class selector: `.controls { }`

**Example**:
```tsx
// Input
import { PlayButton } from './components';
import styles from './styles';

<PlayButton className={`${styles.PlayButton} ${styles.Button}`} />

// Analysis:
// - styles.PlayButton matches component name → Component Selector Identifier
// - styles.Button is a suffix pattern → Component Type Selector

// Output
media-play-button {
  /* PlayButton-specific styles */
}

.button {
  /* Reusable button type styles */
}
```

**Advantages**:
- Semantic selectors that match intent
- More efficient CSS (element selectors for unique components, classes for shared styles)
- Better readability and maintainability

### CSS Quality Requirements

1. **Deduplication**: Identical rules should not be repeated
2. **Ordering**: Media queries should be properly nested/ordered
3. **Optimization**: Combine compatible selectors where possible
4. **Readability**: Logical grouping, consistent formatting
5. **Correctness**: No invalid CSS (e.g., `translate: x-px`)

### CSS Generation Issues to Avoid

From observed output, avoid:
- Duplicate rules
- Malformed selectors (escaped brackets in class names)
- Invalid property values
- Inconsistent units (0s vs 150ms)
- Missing progressive enhancement wrappers

---

## Framework Transformation

### React → Web Component

#### Component Structure

```tsx
// Input: React Functional Component
export default function MediaSkinDefault({ children, className }) {
  return (
    <MediaContainer className={`${styles.Container} ${className}`}>
      {children}
      <div className={styles.Controls}>
        {/* content */}
      </div>
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

### Framework Transformation: React → Web Components (For Skins)

> **Configuration Context**: This section describes JSX transformation for the **current configuration**: `moduleType: skin`, `input.framework: react` → `output.framework: web-component`. Component transformations have additional complexity (hooks, state management), and other framework combinations would have different transformation rules.

#### Element Transformation

**Components** → **Custom Elements**:
```tsx
<PlayButton />  →  <media-play-button></media-play-button>
```

**HTML Elements** → **HTML Elements** (preserved):
```tsx
<div />  →  <div></div>
```

#### Props/Attributes

**className** → **class**:
```tsx
className={styles.Button}  →  class="button"
```

**data-*** → **Preserved**:
```tsx
data-testid="controls"  →  data-testid="controls"
```

**Boolean props** → **Boolean attributes**:
```tsx
disabled={true}  →  disabled
```

**Numeric props** → **String attributes**:
```tsx
delay={200}  →  delay="200"
```

**camelCase props** → **kebab-case attributes**:
```tsx
sideOffset={8}  →  side-offset="8"
```

#### Children

**Direct children** → **Slot**:
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

**Note**: The specific slot naming is VJS-specific convention

#### Expressions

**Template literals** → **Static strings**:
```tsx
// Input
className={`${styles.Button} ${styles.Icon}`}

// Output
class="button icon"
```

**Note**: Expressions must be evaluable at compile-time (no runtime dynamic values)

---

## Configuration Philosophy

### Hierarchical Configuration System

The compiler uses a **hierarchical configuration system** where high-level decisions determine which transformation pipelines and rules get activated. This creates a "waterfall" of configuration where each level informs the next.

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

#### Current Hard-Coded Configuration

**For Initial Implementation:**

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

This configuration **determines**:
- Which imports to look for (React components, Tailwind styles)
- How to parse the module (React/JSX, TypeScript)
- What usage patterns to analyze (JSX elements, className attributes)
- Which transformation rules to apply (React → Web Component, Tailwind → Vanilla CSS via CSS Modules)
- What output structure to generate (template function, inline styles with semantic selectors)

**CSS Strategy Details**:
- `inline-vanilla`: Use CSS Modules as intermediary to produce legible, semantic CSS with expanded properties
- `inline-tailwind-utilities` (future): Use Tailwind compiler directly, preserve utility classes in markup

#### Future: Inferrable Configuration

**Eventually, these can be discovered from source analysis:**

```typescript
// Analyze source code to infer configuration
function inferConfiguration(sourceCode: string): CompilerConfig {
  const ast = parse(sourceCode);

  // Infer module type
  const moduleType = inferModuleType(ast);
  // - Has default export that's a function → likely skin or component
  // - Function returns JSX with MediaContainer → skin
  // - Function returns JSX with primitives only → component

  // Infer input framework
  const inputFramework = inferFramework(ast);
  // - Imports from 'react' → react
  // - Uses JSX syntax → react (or similar)
  // - Imports from 'vue' → vue

  // Infer CSS type
  const cssType = inferCSSType(ast);
  // - Imports file with Tailwind utilities → tailwind-v4
  // - Imports *.module.css → css-modules
  // - Uses styled-components → css-in-js

  return { moduleType, input: { framework: inputFramework, cssType }, ... };
}
```

**Benefits of Inference**:
- No manual configuration required for common cases
- Compiler adapts to source structure
- Can validate that source matches expected patterns

**Limitations**:
- Ambiguous cases may need explicit configuration
- Complex hybrid approaches may not be auto-detectable

### What Should Be Configurable?

#### Required Configuration

1. **Output Target**:
   - Framework: `react | web-component | vue | svelte`
   - CSS Strategy: `inline-vanilla | inline-tailwind-utilities | css-modules | tailwind-cdn`
   - Output Location: Path to output file (or hypothetical location)

**CSS Strategy Options**:
- `inline-vanilla`: Legible CSS via CSS Modules intermediary (current focus)
  - Uses PostCSS + Tailwind to expand utilities
  - Produces semantic selectors with explicit properties
  - Requires CSS Modules transformation phase
- `inline-tailwind-utilities`: Preserve utility classes (future)
  - Uses Tailwind compiler directly
  - Utilities remain in markup as class attributes
  - Larger CSS output but simpler transformation
- `css-modules`: External CSS Modules file
- `tailwind-cdn`: Reference Tailwind CDN (utilities in markup)

#### Optional Configuration (Can Be Inferred)

2. **Input Context**:
   - Module Type: `skin | component | utility` (infer from structure)
   - Input Framework: `react | vue | ...` (infer from imports/syntax)
   - Input CSS Type: `tailwind-v4 | css | ...` (infer from style imports)

3. **Package Context**:
   - Source package information (discover from filesystem)
   - Target package information (derive from output location)

4. **Custom Rules**:
   - Override default categorization/projection behavior
   - Custom transformation plugins

#### Multiple Output Targets

**Important**: The compiler should support generating multiple outputs from a single source:

```typescript
const config = {
  input: {
    // Source is auto-detected or specified
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
    {
      framework: 'react',
      cssStrategy: 'inline',
      path: 'dist/skins/compiled/react-inline/MediaSkinDefault.tsx',
    },
  ],
};
```

**Use Case**: Generate all supported permutations for testing or distribution.

### Module Type Determines Transformation Concerns

Different module types have different transformation requirements and concerns:

#### Skins (Current Focus)

**Characteristics**:
- Composition layer (uses primitives, doesn't define them)
- No direct media store hooks (state managed by primitives)
- Standard props interface: `{ children, className }`
- Always wraps content in `MediaContainer`
- Style-heavy (lots of Tailwind/CSS transformation)

**Transformation Concerns**:
- Import transformation (component imports)
- Style transformation (Tailwind → target CSS)
- JSX → target markup
- Slot handling for `children`
- Class name transformation based on selector categorization

**Simpler Because**:
- No custom logic to preserve
- No hooks to transform
- No complex state management
- Predictable structure

#### Components (Future)

**Characteristics**:
- Primitive definitions (not just composition)
- May use media store hooks directly
- Custom props beyond `{ children, className }`
- May have lifecycle logic
- Internal state management

**Transformation Concerns**:
- Hook transformation (`useMediaStore` → target equivalent)
- Event handler transformation
- State management transformation
- Ref handling
- Props interface transformation
- Lifecycle methods

**More Complex Because**:
- Custom logic must be preserved or transformed
- Framework-specific APIs (hooks, lifecycle)
- May not have direct equivalents in target framework
- Requires understanding of control flow

#### Utilities (Future)

**Characteristics**:
- Pure functions or helpers
- No JSX/component structure
- May have framework-specific dependencies

**Transformation Concerns**:
- Function signature preservation
- Dependency transformation
- May not need transformation at all (if framework-agnostic)

---

### Module Type Detection Heuristics

```typescript
function inferModuleType(ast: Program): 'skin' | 'component' | 'utility' {
  const defaultExport = findDefaultExport(ast);

  if (!defaultExport || !isFunctionComponent(defaultExport)) {
    return 'utility'; // No JSX component export
  }

  const jsxReturn = findJSXReturn(defaultExport);

  if (!jsxReturn) {
    return 'utility'; // Function but no JSX
  }

  // Check if wraps in MediaContainer (skin pattern)
  const hasMediaContainer = findJSXElement(jsxReturn, 'MediaContainer');
  if (hasMediaContainer) {
    return 'skin';
  }

  // Check if uses media store hooks (component pattern)
  const usesMediaHooks = findHookUsage(defaultExport, 'useMediaStore', 'useMediaSelector');
  if (usesMediaHooks) {
    return 'component';
  }

  // Check props signature
  const props = getFunctionParams(defaultExport)[0];
  const hasStandardSkinProps = hasProperties(props, ['children', 'className']) &&
                                propertyCount(props) === 2;

  return hasStandardSkinProps ? 'skin' : 'component';
}
```

### What Should Be Inferred?

1. **Component Detection**: Based on **JSX usage analysis** (primary) and file structure (fallback)
2. **Import Categories**: Based on **how imports are used** (className, JSX elements) plus package context
3. **Style Imports**: Based on **className member access patterns**
4. **Selector Types**: Based on **style key relationships to component names**
5. **Naming Transformations**: Based on target framework conventions
6. **File Structure**: Based on VJS monorepo conventions

### What Should Be Discovered at Boundaries?

1. **Package Root**: Walk directory tree to find package.json
2. **Package Name**: Read from package.json
3. **Monorepo Structure**: Detect from directory layout
4. **Component Locations**: Based on standard `src/components/` directory

### Configuration Precedence

```
Explicit Config > Discovery > Convention > Defaults
```

**Example**:
1. If user provides component mapping explicitly → use it
2. Else if can discover from filesystem → use discovery
3. Else if matches convention (e.g., `@vjs-10/*` pattern) → use convention
4. Else use default behavior

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

**Pattern**: `packages/{platform}/{package-name}/`

### Component Locations

**Standard**: `src/components/` within each package

**React**: `packages/react/react/src/components/*.tsx`
**HTML**: `packages/html/html/src/components/*.ts`

### Skin Locations

**React**: `packages/react/react/src/skins/{skin-name}/`
**HTML**: `packages/html/html/src/skins/{skin-name}.ts`

**Compiled Output**: `packages/{platform}/{package}/src/skins/compiled/{strategy}/{skin-name}.*`

### Component Naming

**React Components**:
- Files: PascalCase (e.g., `PlayButton.tsx`)
- Exports: Named, matching filename
- Usage: `<PlayButton />`

**Web Components**:
- Files: kebab-case with `media-` prefix (e.g., `media-play-button.ts`)
- Element registration: kebab-case with `media-` prefix
- Usage: `<media-play-button></media-play-button>`

### Icon Naming

**React**:
- Package: `@vjs-10/react-icons`
- Import: `import { PlayIcon } from '@vjs-10/react-icons'`
- Usage: `<PlayIcon />`

**Web Components**:
- Package: `@vjs-10/html-icons`
- Import: `import '@vjs-10/html-icons'` (side-effect)
- Usage: `<media-play-icon></media-play-icon>`

### Data Attributes

VJS components use data attributes for state:
- `data-paused` - Play/pause state
- `data-fullscreen` - Fullscreen state
- `data-volume-level="high|medium|low|off"` - Volume state
- `data-orientation="horizontal|vertical"` - Orientation

These are preserved across all framework transformations.

### Package Dependencies

**Core packages** have no VJS dependencies
**Platform packages** depend only on core packages
**Skins** depend on platform packages

This hierarchy must be preserved in transformed output.

---

## Output Quality Requirements

### CSS Quality

1. **Human-Readable**:
   - Clear property names
   - Logical grouping of rules
   - Consistent formatting and indentation

2. **Correct**:
   - No invalid CSS syntax
   - No malformed selectors
   - Valid property values
   - Proper unit handling

3. **Optimized**:
   - No duplicate rules
   - Appropriate use of shorthand vs. longhand properties
   - Efficient selector specificity

4. **Progressive**:
   - Feature queries for modern CSS (`@supports`)
   - Media queries for user preferences
   - Appropriate fallbacks

5. **Terse**:
   - Remove unnecessary vendor prefixes (unless needed)
   - Consolidate compatible rules
   - Use modern CSS features (e.g., `color-mix()`, `calc(infinity * 1px)`)

### Code Quality

1. **Idiomatic**:
   - Output should look hand-written, not generated
   - Follow target framework conventions
   - Use modern JavaScript features

2. **Type-Safe**:
   - Preserve TypeScript types where applicable
   - Generate .d.ts files for TypeScript projects

3. **Well-Formatted**:
   - Consistent indentation
   - Readable structure
   - Appropriate comments

### Correctness

1. **Visual Equivalence**: Compiled output should look identical to source
2. **Functional Equivalence**: Behavior should be identical
3. **No Regressions**: Compilation should not introduce bugs

---

## Future Extensions

### Beyond Skins: Composed Components

**Current**: Compiler handles skins (compositions of primitives)

**Future**: Support compiling custom composed components

**Example**:
```tsx
// Custom component using VJS primitives
export function CustomPlayer({ src }) {
  const [playing, setPlaying] = useState(false);

  return (
    <MediaProvider src={src}>
      <Video />
      <CustomControls>
        <PlayButton onClick={() => setPlaying(!playing)} />
        <CustomVolumeControl />
      </CustomControls>
    </MediaProvider>
  );
}
```

**Challenges**:
- Components may use hooks directly
- May include custom logic
- May have complex state management

**Approach**:
- Identify patterns that can be mechanically transformed
- Provide escape hatches for custom logic
- Consider a more sophisticated intermediate representation

### Additional CSS Strategies

1. **Tailwind CDN**: Output Tailwind classes with CDN script tag
2. **CSS-in-JS**: Generate styled-components or emotion code
3. **Scoped CSS**: Shadow DOM with scoped styles
4. **CSS Variables**: Extract common values to CSS custom properties

### Additional Framework Targets

1. **Vue**: Compile to Vue SFC
2. **Svelte**: Compile to Svelte components
3. **Solid**: Compile to Solid components
4. **Lit**: Use Lit for web components instead of vanilla

### Optimization Passes

1. **Tree Shaking**: Remove unused CSS rules
2. **Minification**: Compress output for production
3. **Critical CSS**: Extract above-the-fold styles
4. **Lazy Loading**: Split skins into separately loadable chunks

### Developer Experience

1. **Source Maps**: Map compiled output back to original source
2. **Watch Mode**: Recompile on file changes
3. **Error Messages**: Clear, actionable error reporting
4. **Warnings**: Flag potential issues (unused classes, invalid patterns)

---

## Appendix: Example Transformation

### Input: React + Tailwind

**MediaSkinSimple.tsx**:
```tsx
import type { PropsWithChildren } from 'react';
import { PlayButton } from '../../components/PlayButton';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
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

- **2025-10-07**: Initial architecture document
- **2025-10-07**: Add hierarchical configuration system and module type detection
