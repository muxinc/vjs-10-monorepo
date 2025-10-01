# Video.js Compiler

A multi-target compiler for Video.js 10 components. Transforms React/JSX to various output formats including HTML web components, CSS Modules, and complete skin modules.

## Features

### Compilation Targets

- **React → HTML Web Components**: Transform JSX to custom element markup
- **React → HTML Skin Modules**: Generate complete web component skin modules
- **React + Tailwind → React + CSS Modules**: Migrate from Tailwind styles to CSS Modules

### Transformation Capabilities

- **Element Names**: `PlayButton` → `media-play-button`, `TimeRange.Root` → `media-time-range-root`
- **Built-in Elements**: Preserves `div`, `span`, etc.
- **Attribute Processing**: Unified pipeline with element context
  - `className` → `class`, `showRemaining` → `show-remaining`
  - Extensible via custom processors
  - CSS transformations (Tailwind, CSS Modules, etc.)
- **Children Replacement**: `{children}` → `<slot name="media" slot="media"></slot>`
- **Self-closing Tags**: Converts to explicit closing tags
- **JSX Comments**: Automatically removed from output
- **HTML5 Validation**: Built-in validation for custom elements and output HTML
- **Output Validation**: ESLint and Prettier validation for generated code

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### CLI

```bash
# Compile a React component to HTML
vjs-compiler path/to/Component.tsx

# With custom indentation
vjs-compiler path/to/Component.tsx --indent 4 --indent-size 2
```

### Programmatic API

#### React → HTML Web Components

```typescript
import { compileJSXToHTML } from '@vjs-10/vjs-compiler';

const source = `
  export const Component = () => (
    <MediaContainer>
      <PlayButton>
        <PlayIcon />
      </PlayButton>
    </MediaContainer>
  );
`;

const html = compileJSXToHTML(source);
console.log(html);
// Output:
// <media-container>
//   <media-play-button>
//     <media-play-icon></media-play-icon>
//   </media-play-button>
// </media-container>
```

#### React + Tailwind → React + CSS Modules

```typescript
import { compileReactToReactWithCSSModules } from '@vjs-10/vjs-compiler';

const source = `
  import styles from './styles';
  export const Button = () => <button className={styles.Button}>Click</button>;
`;

const output = compileReactToReactWithCSSModules(source);
console.log(output);
// Output:
// import styles from "./styles.module.css";
// export const Button = () => <button className={styles.Button}>Click</button>;
```

### Advanced API

#### Manual Pipeline Control

```typescript
import { parseReactComponent, serializeToHTML, transformJSXToHTML } from '@vjs-10/vjs-compiler';

// Step 1: Parse
const jsxElement = parseReactComponent(sourceCode);

// Step 2: Transform
const transformed = transformJSXToHTML(jsxElement);

// Step 3: Serialize
const html = serializeToHTML(transformed, { indent: 0, indentSize: 2 });
```

#### Custom Attribute Processing

```typescript
import type { AttributeContext, AttributeProcessor } from '@vjs-10/vjs-compiler';

import { AttributeProcessorPipeline, compileJSXToHTML, DefaultAttributeProcessor } from '@vjs-10/vjs-compiler';

// Create a custom processor for className attributes
class CustomClassProcessor implements AttributeProcessor {
  transformName(context: AttributeContext): string | null {
    return 'class';
  }

  transformValue(context: AttributeContext): string | null {
    // Custom CSS processing logic here
    // Access element context via context.elementName and context.htmlElementName
    const value = context.attribute.value;

    if (value?.type === 'StringLiteral') {
      return value.value;
    }

    // Process JSX expressions for CSS Modules, Tailwind, etc.
    return 'processed-classes';
  }
}

// Create and configure pipeline
const pipeline = new AttributeProcessorPipeline();
pipeline.register('className', new CustomClassProcessor());

// Use with compiler
const html = compileJSXToHTML(source, { attributePipeline: pipeline });
```

## Testing

This package uses [Vitest](https://vitest.dev/) for testing.

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

### Test Structure

- `test/naming.test.ts` - Tests for name conversion utilities
- `test/parser.test.ts` - Tests for JSX parsing from React components
- `test/transformer.test.ts` - Tests for JSX-to-HTML AST transformation
- `test/integration.test.ts` - End-to-end integration tests with HTML validation
- `test/validator.test.ts` - Tests for HTML5 validation and custom element names

### Why Vitest?

We chose Vitest over Jest because:

1. **Native ESM Support**: Works seamlessly with `"type": "module"`
2. **TypeScript Native**: No additional configuration needed
3. **Performance**: 10-20x faster than Jest in watch mode
4. **Jest-compatible API**: Easy migration and familiar syntax
5. **Consistency**: Already used in the monorepo

## Architecture

### Pipeline

```
React TSX Source
    ↓
[Parser] → Extract JSX from React component
    ↓
[Transformer] → Transform element names, {children} → <slot>
    ↓
[Serializer] → Process attributes + generate HTML string
    ↓
HTML Output
```

### Key Components

1. **Parser** (`src/parser.ts`) - Uses `@babel/parser` to extract JSX return values
2. **Transformer** (`src/transformer.ts`) - Transforms element names and special patterns
3. **Serializer** (`src/serializer.ts`) - Processes attributes and generates HTML
4. **Attribute Processing** (`src/attributeProcessing/`) - Unified attribute transformation pipeline
   - `AttributeContext` - Provides attribute + parent element context
   - `AttributeProcessor` - Interface for name/value transformation
   - `AttributeProcessorPipeline` - Orchestrates processors with registration
   - `DefaultAttributeProcessor` - Standard JSX → HTML transformations
5. **Naming Utilities** (`src/utils/naming.ts`) - Handles name conversions (PascalCase → kebab-case)
6. **Validation** (`test/utils/validator.ts`) - HTML5 validation using html-validate

## Transformation Rules

### Element Names

- Simple identifier: `PlayButton` → `media-play-button`
- Member expression: `TimeRange.Root` → `media-time-range-root`
- Built-in elements: `div` → `div` (unchanged)
- Always prepend `media-` prefix to custom components

### Attributes

Attributes are processed by the `AttributeProcessorPipeline` with full element context:

- **Name transformation**: `className` → `class`, camelCase → kebab-case (`showRemaining` → `show-remaining`)
- **Value transformation**:
  - String literals pass through unchanged
  - JSX expressions converted to empty string (placeholder for CSS processing)
  - Boolean attributes (e.g., `disabled`) have no value
- **Element context**: Processors have access to parent element name for context-aware rules
- **Extensible**: Register custom processors for specific attribute names (e.g., `className`, `style`)

### Special Cases

- `{children}` → `<slot name="media" slot="media"></slot>`
- Self-closing tags → Explicit closing tags
- JSX comments (`{/* ... */}`) → Removed

## Examples

### Input (React TSX)

```tsx
import { TimeRange } from '@vjs-10/react';

import * as React from 'react';

export const MediaSkin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MediaContainer className="wrapper">
      {children}
      <div className="controls">
        <TimeRange.Root>
          <TimeRange.Track>
            <TimeRange.Progress />
          </TimeRange.Track>
        </TimeRange.Root>
      </div>
    </MediaContainer>
  );
};
```

### Output (HTML)

```html
<media-container class="wrapper">
  <slot name="media" slot="media"></slot>
  <div class="controls">
    <media-time-range-root>
      <media-time-range-track>
        <media-time-range-progress></media-time-range-progress>
      </media-time-range-track>
    </media-time-range-root>
  </div>
</media-container>
```

## License

Apache-2.0
