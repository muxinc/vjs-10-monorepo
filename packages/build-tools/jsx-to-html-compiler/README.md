# JSX to HTML Compiler

A compiler that transforms React JSX components to HTML strings for use in web component templates.

## Features

- **Simple Components**: `PlayButton` → `media-play-button`
- **Compound Components**: `TimeRange.Root` → `media-time-range-root`
- **Built-in Elements**: Preserves `div`, `span`, etc.
- **Attribute Conversion**: `className` → `class`, `showRemaining` → `show-remaining`
- **Children Replacement**: `{children}` → `<slot name="media" slot="media"></slot>`
- **Self-closing Tags**: Converts to explicit closing tags
- **JSX Comments**: Automatically removed from output
- **Expression Preservation**: Keeps JSX expressions like `{styles.Container}`

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### CLI

```bash
# Compile a React component to HTML
node dist/cli.js path/to/Component.tsx

# With custom indentation
node dist/cli.js path/to/Component.tsx --indent 4 --indent-size 2
```

### Programmatic API

```typescript
import { compileJSXToHTML } from '@vjs-10/jsx-to-html-compiler';

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

### Advanced API

```typescript
import {
  parseReactComponent,
  transformJSXToHTML,
  serializeToHTML,
} from '@vjs-10/jsx-to-html-compiler';

// Step 1: Parse
const jsxElement = parseReactComponent(sourceCode);

// Step 2: Transform
const transformed = transformJSXToHTML(jsxElement);

// Step 3: Serialize
const html = serializeToHTML(transformed, { indent: 0, indentSize: 2 });
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
- `test/integration.test.ts` - End-to-end integration tests

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
[Transformer] → Transform JSX AST to HTML-compatible structure
    ↓
[Serializer] → Generate HTML string
    ↓
HTML Output
```

### Key Components

1. **Parser** (`src/parser.ts`) - Uses `@babel/parser` to extract JSX return values
2. **Transformer** (`src/transformer.ts`) - Traverses and transforms JSX AST nodes
3. **Serializer** (`src/serializer.ts`) - Converts transformed AST to HTML string
4. **Naming Utilities** (`src/utils/naming.ts`) - Handles all name conversions

## Transformation Rules

### Element Names

- Simple identifier: `PlayButton` → `media-play-button`
- Member expression: `TimeRange.Root` → `media-time-range-root`
- Built-in elements: `div` → `div` (unchanged)
- Always prepend `media-` prefix to custom components

### Attributes

- `className` → `class`
- camelCase → kebab-case (`showRemaining` → `show-remaining`)
- Preserve JSX expressions (`{styles.Container}`)

### Special Cases

- `{children}` → `<slot name="media" slot="media"></slot>`
- Self-closing tags → Explicit closing tags
- JSX comments (`{/* ... */}`) → Removed

## Examples

### Input (React TSX)

```tsx
import * as React from 'react';
import { TimeRange } from '@vjs-10/react';

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
