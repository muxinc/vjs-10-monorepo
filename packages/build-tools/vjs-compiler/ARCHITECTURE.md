# VJS Compiler Architecture

This document provides a comprehensive overview of the Video.js Compiler architecture, including the pipeline system, transformation flow, and key architectural patterns.

## Table of Contents

1. [Overview](#overview)
2. [Pipeline System](#pipeline-system)
3. [Core Compilation Flow](#core-compilation-flow)
4. [Attribute Processing Architecture](#attribute-processing-architecture)
5. [CSS Transformation Pipeline](#css-transformation-pipeline)
6. [Component Map and Filtering](#component-map-and-filtering)
7. [Naming Conventions](#naming-conventions)
8. [Style Context Threading](#style-context-threading)

## Overview

The VJS Compiler is a multi-target transpiler that transforms React/JSX components into various output formats (web components, React with CSS Modules, etc.). It uses a **config-driven pipeline architecture** where the combination of input type, output format, and CSS strategy determines the compilation behavior.

### Key Design Principles

1. **Pipeline Composability**: Complex transformations are built by composing simpler transformation functions
2. **In-memory Processing**: Intermediate formats stay in memory to avoid I/O overhead
3. **Context Threading**: Compilation context (component maps, styles, etc.) flows through the entire pipeline
4. **Extensibility**: New pipelines and processors can be registered without modifying core code

## Pipeline System

### Pipeline Selection

Pipelines are selected based on the compiler configuration:

```
Config: { inputType, outputFormat, cssStrategy }
         ↓
    [getPipeline]
         ↓
    Selected Pipeline
```

### Available Pipelines

#### 1. `skin-web-component-inline`

- **Input**: React skin with CSS imports
- **Output**: Web component with inline `<style>` tag
- **Process**: Discovers CSS files → Merges CSS → Generates web component module

#### 2. `skin-react-css-modules`

- **Input**: React skin with Tailwind classes (styles.ts)
- **Output**: React component + CSS Module + TypeScript definitions
- **Process**: Tailwind → CSS Modules transformation

#### 3. `skin-web-component-tailwind`

- **Input**: React skin with Tailwind classes (styles.ts)
- **Output**: Web component with inline vanilla CSS
- **Process**: Composes two transformations:
  1. Tailwind → CSS Modules
  2. CSS Modules → Vanilla CSS (with element selector transformation)

### Pipeline Interface

```typescript
interface CompilationPipeline {
  id: string;
  name: string;
  compile: (entryFile: string, config: CompilerConfig) => Promise<CompilationOutput>;
}
```

Each pipeline is responsible for:

- Reading and parsing input files
- Orchestrating transformations
- Generating output file(s) with correct paths and types

## Core Compilation Flow

The core React → HTML transformation follows this flow:

```
React TSX Source
    ↓
[Parser] parseReactSource()
    ↓
JSX AST (Babel Node)
    ↓
[Transformer] transformJSXForHTML()
    ↓
Transformed JSX AST
    ↓
[Serializer] serializeToHTML()
    ↓
HTML String
```

### 1. Parser (`src/parsing/`)

**Responsibility**: Extract JSX from React component functions

**Process**:

1. Parse source with `@babel/parser`
2. Walk AST to find function component
3. Extract return statement JSX
4. Discover style imports and component dependencies

**Key Functions**:

- `parseReactSource(source, config)` - Main entry point
- Returns: `{ ast, jsxRoot, imports, stylesNode, stylesIdentifier }`

### 2. Transformer (`src/transformer.ts`)

**Responsibility**: Transform JSX AST for target output format

**Transformations**:

- Element names: `PlayButton` → `media-play-button`
- Member expressions: `TimeRange.Root` → `media-time-range-root`
- Special patterns: `{children}` → `<slot name="media" slot="media"></slot>`
- Self-closing tags → Explicit closing tags

**Key Functions**:

- `transformJSXForHTML(jsxElement, options)` - Main transformation
- `transformJSXElementName(name)` - Element name conversion
- Returns: Transformed JSX AST + component map

### 3. Serializer (`src/serializer.ts`)

**Responsibility**: Convert JSX AST to HTML string

**Process**:

1. Serialize opening tag with element name
2. Process attributes through attribute pipeline
3. Recursively serialize children
4. Format output with proper indentation

**Special Handling**:

- Empty class attributes are removed
- JSX comments are stripped
- Boolean attributes handled correctly

**Key Functions**:

- `serializeToHTML(jsxElement, options)` - Main entry point
- `serializeAttribute(attr, context)` - Attribute processing

## Attribute Processing Architecture

The compiler uses a **unified attribute processing pipeline** that provides element context to all attribute transformations.

### AttributeContext

Every attribute processor receives context about both the attribute and its parent element:

```typescript
interface AttributeContext {
  attribute: JSXAttribute; // The attribute being processed
  elementName: string; // Original JSX element name (e.g., "PlayButton")
  htmlElementName: string; // Transformed element name (e.g., "media-play-button")
  stylesObject?: Record<string, string>; // Styles map (for CSS processing)
  componentMap?: Record<string, string>; // Component map (for class filtering)
}
```

### AttributeProcessor Interface

```typescript
interface AttributeProcessor {
  transformName: (context: AttributeContext) => string | null;
  transformValue: (context: AttributeContext) => string | null;
}
```

**Return values**:

- `null` name → Omit attribute entirely
- `null` value → Boolean attribute (or omit for `class`)
- Empty string value → Empty attribute (or omit for `class`)

### Built-in Processors

#### DefaultAttributeProcessor

- Handles standard JSX → HTML transformations
- `className` → `class`
- camelCase → kebab-case (`showRemaining` → `show-remaining`)
- String literals pass through
- JSX expressions → empty string (placeholder)

#### ClassAttributeProcessor

- Extends DefaultAttributeProcessor
- Resolves `className` expressions to actual class strings
- Filters component classes using component map
- Converts styling classes to kebab-case
- Includes fuzzy matching for component names

### Pipeline Registration

```typescript
const pipeline = new AttributeProcessorPipeline();
pipeline.register('className', new ClassAttributeProcessor());
pipeline.register('style', new StyleAttributeProcessor());

// Use with serializer
serializeToHTML(jsx, { attributePipeline: pipeline });
```

## CSS Transformation Pipeline

The compiler supports multiple CSS transformation strategies that can be composed together.

### Transformation Strategies

```
Tailwind Utilities → CSS Modules → Vanilla CSS
     (Stage 1)         (Stage 2)     (Stage 3)
```

### Stage 1: Tailwind → CSS Modules

**Location**: `src/cssProcessing/tailwindToCSSModules.ts`

**Enhanced Processing (3-Phase Approach)**:

The Tailwind compilation now uses a sophisticated 3-phase approach to handle both simple and complex Tailwind utilities:

#### Phase 1: Parse and Categorize Classes

Uses custom Tailwind AST parsing (`src/tailwind-ast/`) to categorize classes:

- **Simple Classes**: Standard utilities that can use `@apply` (e.g., `flex`, `px-4`, `hover:bg-blue-600`)
- **Container Declarations**: Container definitions (e.g., `@container/root`)
- **Container Queries**: Container-based responsive utilities (e.g., `@7xl/root:text-lg`)
- **Arbitrary Values**: Custom value utilities (e.g., `font-[510]`, `text-[0.8125rem]`)

**Implementation**: `src/cssProcessing/class-parser.ts` - `enhanceClassString()`

#### Phase 2: Process Simple Classes

1. Build raw HTML content with simple Tailwind classes only
2. Process through PostCSS + Tailwind v4
3. Collect matching rules from Tailwind output
4. Build rule index for quick lookup

#### Phase 3: Generate CSS

For each style key:

1. Add simple classes via rule index (rescoped from utility to key)
2. Inject container declarations as CSS properties
3. Inject arbitrary values as direct CSS properties
4. Generate container query `@container` rules with breakpoints
5. Flatten nested CSS with postcss-nested
6. Resolve CSS variables (--tw-\*)
7. Optimize and format output

**Key Innovation**: Complex utilities (container queries, arbitrary values) bypass Tailwind processing and are directly injected as CSS, ensuring they always resolve correctly.

**Input Examples**:

```typescript
{
  // Simple utilities
  Button: 'px-4 py-2 bg-blue-500 hover:bg-blue-600',

  // Container declarations + arbitrary values
  MediaContainer: '@container/root font-[510] text-[0.8125rem]',

  // Container queries
  ResponsiveText: '@7xl/root:text-[0.9375rem]'
}
```

**Output CSS**:

```css
/* Simple utilities */
.Button {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background-color: rgb(59 130 246);
}
.Button:hover {
  background-color: rgb(37 99 235);
}

/* Container declarations + arbitrary values */
.MediaContainer {
  container-type: inline-size;
  container-name: root;
  font-weight: 510;
  font-size: 0.8125rem;
}

/* Container queries */
@container root (min-width: 80rem) {
  .ResponsiveText {
    font-size: 0.9375rem;
  }
}
```

**Key Functions**:

- `compileTailwindToCSS(config)` - Main entry point
- `collectRuleIndex(root)` - Build class → rules mapping
- `resolveTailwindVariables(root)` - Resolve --tw-\* variables

### Stage 2: CSS Modules → Vanilla CSS

**Location**: `src/cssProcessing/cssModulesToVanillaCSS.ts`

**Process**:

1. Parse CSS with PostCSS
2. Walk all rules and transform selectors
3. For each class selector:
   - If component class → Transform to element selector
   - If styling class → Convert to kebab-case
4. Format and return CSS

**Component Map**:

```typescript
{
  'PlayButton': 'media-play-button',
  'TimeRangeRoot': 'media-time-range-root'
}
```

**Transformation Examples**:

```css
/* Input CSS Modules */
.PlayButton {
  color: blue;
}
.IconButton {
  display: grid;
}

/* Output Vanilla CSS */
media-play-button {
  color: blue;
}
.icon-button {
  display: grid;
}
```

**Key Functions**:

- `cssModulesToVanillaCSS(options)` - Main entry point
- `transformSelector(selector, componentMap)` - Selector transformation

### Nested Selector Handling

Tailwind v4 generates nested CSS with `&` selectors. The compiler flattens these in two places:

1. **After Tailwind compilation**: Using postcss-nested
2. **Before vanilla CSS transformation**: Additional flattening in pipelines

**Example**:

```css
/* Tailwind output (nested) */
.Button {
  color: blue;
  &:hover {
    color: red;
  }
}

/* After flattening */
.Button {
  color: blue;
}
.Button:hover {
  color: red;
}
```

### CSS Variable Resolution

The compiler resolves Tailwind CSS variables to concrete values:

```css
/* Before resolution */
.Button {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000);
}

/* After resolution */
.Button {
  box-shadow:
    0 0 #0000,
    0 0 #0000;
}
```

Default values for `--tw-*` variables are hard-coded in `tailwindToCSSModules.ts`.

## Component Map and Filtering

The **component map** is central to the transformation process. It maps JSX component names to their HTML element names.

### Component Map Creation

**Location**: `src/transformer.ts` - `transformJSXForHTML()`

During JSX transformation, the compiler builds a map of all component elements:

```typescript
// Built during transformation
const componentMap = {
  MediaContainer: 'media-container',
  PlayButton: 'media-play-button',
  'TimeRange.Root': 'media-time-range-root',
};
```

### Component Class Detection

**Location**: `src/attributeProcessing/ClassAttributeProcessor.ts`

When resolving className expressions, the compiler checks if a class name matches a component:

```typescript
// Exact match
if (componentMap[className]) {
  return null; // Filter out - this class becomes an element selector
}

// Fuzzy match (case-insensitive)
const normalizedClassName = className.toLowerCase();
for (const componentName of Object.keys(componentMap)) {
  if (componentName.toLowerCase() === normalizedClassName) {
    return null; // Filter out
  }
}

// Not a component - convert to kebab-case
return toKebabCase(className);
```

### Fuzzy Matching

The compiler includes **case-insensitive fuzzy matching** to handle common naming inconsistencies:

- `FullScreenButton` matches `FullscreenButton`
- `PlayButton` matches `playButton` or `PLAYBUTTON`

This prevents component classes from leaking into class attributes when there are casing discrepancies.

## Naming Conventions

### Element Name Transformation

**Rules**:

1. Built-in elements (div, span, etc.) → unchanged
2. PascalCase components → kebab-case with `media-` prefix
3. Member expressions flatten: `TimeRange.Root` → `time-range-root`

**Examples**:

- `PlayButton` → `media-play-button`
- `TimeRange.Root` → `media-time-range-root`
- `div` → `div`

**Location**: `src/utils/naming.ts` - `transformElementName()`

### Class Name Transformation

**Rules**:

1. Component classes → Filtered (become element selectors)
2. Styling classes → Convert PascalCase to kebab-case
3. String literal classes → Pass through unchanged

**Examples**:

- `styles.PlayButton` (component) → filtered
- `styles.IconButton` (styling) → `icon-button`
- `"custom-class"` (string literal) → `custom-class`

**Location**:

- `src/attributeProcessing/ClassAttributeProcessor.ts` - Detection and filtering
- `src/utils/naming.ts` - `toKebabCase()` conversion

## Style Context Threading

The compiler threads style-related context through the entire compilation pipeline to enable CSS transformations at the right stage.

### Context Flow

```
Parser
  ↓ (discovers styles import)
StyleProcessor Registration
  ↓ (async function)
Transformer
  ↓ (builds component map)
StyleProcessor Execution
  ↓ (receives component map + styles object)
CSS Transformations
  ↓ (Tailwind → CSS Modules → Vanilla CSS)
Serializer
  ↓ (uses processed CSS + component map)
HTML Output
```

### StyleProcessorContext

```typescript
interface StyleProcessorContext {
  stylesNode: Node; // AST node for styles import/definition
  stylesIdentifier: string; // Variable name (e.g., 'styles')
  componentMap: Record<string, string>; // Component → element mapping
}
```

### Injection Points

**compileSkin.ts**: Main entry point that accepts a styleProcessor:

```typescript
export async function compileSkinToHTML(
  source: string,
  options?: {
    styleProcessor?: (context: StyleProcessorContext) => Promise<string>;
    // ...
  }
): Promise<SkinModuleOutput>;
```

**Pipeline usage**:

```typescript
const result = await compileSkinToHTML(source, {
  styleProcessor: async (context) => {
    // Extract styles object from AST
    const stylesObject = extractStylesObject(context.stylesNode);

    // Transform Tailwind → CSS Modules
    const cssModules = await compileTailwindToCSS({ stylesObject });

    // Transform CSS Modules → Vanilla CSS using component map
    const vanillaCSS = cssModulesToVanillaCSS({
      css: cssModules.css,
      componentMap: context.componentMap,
    });

    return vanillaCSS;
  },
});
```

This architecture allows pipelines to inject custom CSS processing logic while still benefiting from the core transformation infrastructure.

## Extension Points

### Adding New Pipelines

1. Implement the `CompilationPipeline` interface
2. Register with `registerPipeline(pipeline)`
3. Pipeline will be auto-selected based on config match

### Adding New Attribute Processors

1. Implement the `AttributeProcessor` interface
2. Register with `pipeline.register(attributeName, processor)`
3. Processor receives full element context

### Adding New CSS Transformations

1. Create transformation function with signature: `(css: string, context: any) => string`
2. Compose with existing transformations in pipeline
3. Thread necessary context through StyleProcessorContext

## Performance Considerations

### In-memory Processing

All intermediate transformations stay in memory:

- No temporary files written to disk
- Reduces I/O overhead
- Faster compilation for large projects

### AST Reuse

The parser returns both the full AST and extracted JSX:

- Full AST can be used for dependency analysis
- Extracted JSX is ready for transformation
- Avoids re-parsing for multi-stage pipelines

### CSS Module Caching

The compiler could benefit from caching Tailwind compilation results:

- Hash the styles object
- Cache compiled CSS by hash
- Skip Tailwind processing for cache hits
- **Not yet implemented**

## Future Improvements

### Auto-discover Theme Configuration

Currently, theme variables and custom variants are embedded in the compiler code. Future versions should:

- Scan project for `tailwind.config.js` or CSS `@theme` blocks
- Auto-discover custom variants from `@custom-variant` rules
- Load theme configuration dynamically

### Enhanced Nested Selector Handling

Some CSS output contains orphaned `&` selectors that need better handling:

- Improve flattening logic
- Associate orphaned selectors with proper parents
- Add validation for invalid CSS output

### Parallel Pipeline Execution

For projects with multiple skins/components:

- Compile files in parallel
- Use worker threads for CPU-intensive work (PostCSS)
- Share Tailwind context across compilations

### Source Maps

Generate source maps for debugging:

- Track transformations from React source to output
- Map CSS rules back to Tailwind utilities
- Enable better debugging experience
