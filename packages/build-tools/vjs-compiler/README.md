# Video.js Compiler

A multi-target compiler for Video.js 10 components. Transforms React/JSX to various output formats using a configurable pipeline architecture.

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Comprehensive architecture documentation covering the pipeline system, transformation flow, and key design patterns
- **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)** - Known limitations, unresolved Tailwind tokens, and incomplete functionality

## Features

### Compilation Pipelines

The compiler uses a **pipeline-based architecture** where different combinations of input type, output format, and CSS strategy determine the compilation behavior:

#### Available Pipelines

1. **`skin-web-component-inline`**: React Skin → HTML Web Component (Inline CSS)
   - Input: React skin component with CSS imports
   - Output: Single TypeScript file with web component class and inline `<style>` tag
   - CSS Strategy: Discovers and merges all imported CSS files

2. **`skin-react-css-modules`**: React Skin (Tailwind) → React Skin (CSS Modules)
   - Input: React skin component with Tailwind classes + styles.ts export
   - Output: React component (.tsx) + CSS Module file (.module.css) + TypeScript definitions (.d.ts)
   - CSS Strategy:
     - Transforms style imports to CSS Module imports
     - Compiles Tailwind utility classes to vanilla CSS
     - Resolves CSS variables and custom variants
     - Generates TypeScript definitions for type-safe imports

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
- **Dependency Discovery**: Automatically finds and processes CSS imports
- **HTML5 Validation**: Built-in validation for custom elements and output HTML
- **Output Validation**: ESLint and Prettier validation for generated code

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### CLI

#### Compile Command (Single File)

```bash
# Compile a React skin to web component with inline CSS
vjs-compiler compile src/MediaSkin.tsx \
  --type skin \
  --format web-component \
  --css inline \
  --out-dir dist

# Compile to React with CSS Modules
vjs-compiler compile src/MediaSkin.tsx \
  --type skin \
  --format react \
  --css css-modules \
  --out-dir dist
```

#### Build Command (Config File)

```bash
# Build using config file
vjs-compiler build --config vjs.config.js

# Default config file name is vjs.config.js
vjs-compiler build
```

#### Config File Format

```javascript
// vjs.config.js
export default {
  // What type of input?
  inputType: 'skin', // or 'component'

  // Input file(s)
  input: 'src/skins/MediaSkinDefault.tsx',
  // or multiple files:
  // input: ['src/skins/Skin1.tsx', 'src/skins/Skin2.tsx'],

  // Output directory
  outDir: 'dist/skins',

  // What output format?
  outputFormat: 'web-component', // or 'react'

  // How to handle CSS?
  cssStrategy: 'inline', // or 'css-modules', 'tailwind', 'vanilla'

  // Optional: additional options
  options: {
    indent: 0,
    indentSize: 2,
    importMappings: {
      '@vjs-10/react-icons': '@vjs-10/html-icons',
      '@vjs-10/react': '@vjs-10/html'
    }
  }
}
```

### Programmatic API

#### Using Pipelines (Recommended)

```typescript
import { getPipeline, type CompilerConfig } from '@vjs-10/vjs-compiler';

const config: CompilerConfig = {
  inputType: 'skin',
  input: 'src/MediaSkin.tsx',
  outDir: 'dist',
  outputFormat: 'web-component',
  cssStrategy: 'inline'
};

const pipeline = getPipeline(config);
const result = pipeline.compile('/absolute/path/to/MediaSkin.tsx', config);

// result.files contains generated files
for (const file of result.files) {
  console.log(file.path); // 'media-skin.ts'
  console.log(file.content); // Generated code
  console.log(file.type); // 'ts' | 'tsx' | 'css'
}
```

#### Dependency Discovery

```typescript
import { discoverDependencies } from '@vjs-10/vjs-compiler';

const deps = discoverDependencies('/path/to/MediaSkin.tsx');

console.log(deps.css); // ['/path/to/styles.module.css', '/path/to/theme.css']
console.log(deps.components); // ['/path/to/components/PlayButton.tsx']
```

#### Legacy API (Still Supported)

##### React → HTML Web Components

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

##### React + Tailwind → React + CSS Modules

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

##### Tailwind CSS to CSS Modules

```typescript
import { compileTailwindToCSS } from '@vjs-10/vjs-compiler';

const stylesObject = {
  Button: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
  Container: 'max-w-7xl mx-auto p-4'
};

const result = await compileTailwindToCSS({
  stylesObject,
  warnings: true
});

console.log(result.css);
// Output: Vanilla CSS with resolved Tailwind utilities
// .Button { padding-left: 1rem; padding-right: 1rem; ... }
// .Container { max-width: 80rem; margin-left: auto; ... }

console.log(result.dts);
// Output: TypeScript definitions
// declare const styles: { readonly Button: string; ... };

console.log(result.warnings);
// Output: Array of unresolved token warnings (if any)
```

##### Complete Skin Compilation

```typescript
import { compileSkinToHTML } from '@vjs-10/vjs-compiler';

const source = `
  import styles from './styles.css';
  export const MediaSkin = () => (
    <MediaContainer className={styles.wrapper}>
      {children}
    </MediaContainer>
  );
`;

const module = compileSkinToHTML(source);
// Returns complete TypeScript module with web component class
```

### Advanced API

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

## CSS Compilation

### CSS Class Name Conventions

The compiler follows specific naming conventions when generating CSS and HTML output:

#### PascalCase to kebab-case Conversion

- **Styling classes** (non-component classes) are converted from PascalCase to kebab-case
- **Component classes** are filtered out and become element selectors instead

**Example:**

```typescript
// styles.ts
const styles = {
  Button: 'px-4 py-2 rounded',      // Component class
  IconButton: 'grid place-items',   // Styling class
};

// Input JSX
<PlayButton className={`${styles.Button} ${styles.IconButton}`}>
```

**Output CSS:**
```css
media-play-button { padding-left: 1rem; padding-right: 1rem; border-radius: 0.25rem; }
.icon-button { display: grid; place-items: center; }
```

**Output HTML:**
```html
<media-play-button class="icon-button">
```

#### Class Name Resolution

The compiler uses a **component map** to determine which classes should become element selectors vs. class attributes:

1. **Component classes** (e.g., `Button`, `PlayButton`) → element selectors (e.g., `media-play-button`)
2. **Styling classes** (e.g., `IconButton`) → kebab-case class attributes (e.g., `icon-button`)

The compiler includes **fuzzy matching** for component names (case-insensitive), so `FullScreenButton` and `FullscreenButton` are treated as the same component.

### Tailwind to CSS Modules Pipeline

The `skin-react-css-modules` pipeline transforms React components using Tailwind utility classes to vanilla CSS Modules. This process involves:

1. **Source Discovery**: Looks for a `styles.ts` file in the same directory as the skin component
2. **Tailwind Compilation**: Processes Tailwind utility strings through PostCSS + Tailwind v4
3. **CSS Generation**: Converts utility classes to vanilla CSS with proper scoping
4. **Variable Resolution**: Resolves CSS variables (`var(--tw-*)`) to their concrete values
5. **Optimization**: Deduplicates rules, simplifies selectors, and cleans up values

#### Required File Structure

```
src/skins/default/
├── MediaSkinDefault.tsx    # React component
└── styles.ts               # Tailwind utility exports
```

#### styles.ts Format

```typescript
// styles.ts
export default {
  Button: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition',
  Container: 'max-w-7xl mx-auto p-4',
  Title: 'text-2xl font-bold text-gray-900'
};
```

#### Output Files

The compilation generates three files:

1. **Component.tsx** - React component with CSS Module imports
   ```typescript
   import styles from './Component.module.css';
   export const Button = () => <button className={styles.Button}>Click</button>;
   ```

2. **Component.module.css** - Vanilla CSS with scoped class names
   ```css
   .Button {
     padding-left: 1rem;
     padding-right: 1rem;
     padding-top: 0.5rem;
     padding-bottom: 0.5rem;
     background-color: rgb(59 130 246);
     color: rgb(255 255 255);
     border-radius: 0.25rem;
     transition-property: all;
   }
   ```

3. **Component.module.css.d.ts** - TypeScript definitions
   ```typescript
   declare const styles: {
     readonly Button: string;
     readonly Container: string;
     readonly Title: string;
   };
   export default styles;
   ```

#### Custom Variants and Theme

The compiler includes embedded Tailwind v4 theme configuration with custom variants:

- **Custom Variants**:
  - `hocus:` - Combines hover and focus-visible states
  - `group-hocus:` - Group variant of hocus
  - `peer-hocus:` - Peer variant of hocus
  - `reduced-transparency:` - For `prefers-reduced-transparency` media query
  - `contrast-more:` - For `prefers-contrast: more` media query

- **Theme Variables**:
  - `--font-sans` - Custom font stack definition

**Note**: Currently, theme and custom variants are embedded in the compiler. Future versions will support auto-discovery from project CSS files.

#### Unresolved Tokens

Some Tailwind utilities may not be resolved automatically and will be reported as warnings:

- Complex arbitrary values (e.g., `@7xl/root:text-[0.9375rem]`)
- Custom utilities not defined in the theme
- Certain pseudo-class/state combinations

These warnings indicate tokens that may need manual CSS definitions.

## Architecture

### Pipeline System

```
Config (inputType + outputFormat + cssStrategy)
    ↓
[Pipeline Selector] → Choose compilation strategy
    ↓
[Dependency Discovery] → Find CSS/component imports
    ↓
[Pipeline Execution] → Transform source code
    ↓
[Output Generation] → Generate one or more files
```

### Core Pipeline

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

1. **Config System** (`src/config/`) - Defines compilation configuration types
2. **Dependency Discovery** (`src/dependencies/`) - Analyzes imports to find related files
3. **Pipeline Registry** (`src/pipelines/`) - Manages available compilation strategies
4. **Parser** (`src/parsing/`) - Uses `@babel/parser` to extract JSX return values
5. **Transformer** (`src/transformer.ts`) - Transforms element names and special patterns
6. **Serializer** (`src/serializer.ts`) - Processes attributes and generates HTML
7. **Attribute Processing** (`src/attributeProcessing/`) - Unified attribute transformation pipeline
   - `AttributeContext` - Provides attribute + parent element context
   - `AttributeProcessor` - Interface for name/value transformation
   - `AttributeProcessorPipeline` - Orchestrates processors with registration
   - `DefaultAttributeProcessor` - Standard JSX → HTML transformations
8. **Import Transforming** (`src/importTransforming/`) - Maps React imports to HTML imports
9. **CSS Processing** (`src/cssProcessing/`) - Tailwind to CSS Modules compilation
   - Uses PostCSS with Tailwind v4 plugin
   - Resolves CSS variables and custom variants
   - Generates vanilla CSS and TypeScript definitions
   - Custom formatting and optimization
10. **Style Processing** (`src/styleProcessing/`) - Style extraction and processing interface
11. **Skin Generation** (`src/skinGeneration/`) - Generates complete TypeScript modules
12. **Naming Utilities** (`src/utils/naming.ts`) - Handles name conversions (PascalCase → kebab-case)

## Testing

This package uses [Vitest](https://vitest.dev/) for testing.

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test importTransforming
```

### Test Structure

- `test/naming.test.ts` - Name conversion utilities
- `test/parser.test.ts` - JSX parsing from React components
- `test/transformer.test.ts` - JSX-to-HTML AST transformation
- `test/importTransforming.test.ts` - Import transformation and dependency injection
- `test/skinGeneration.test.ts` - Skin module generation
- `test/validator.test.ts` - HTML5 validation
- `test/outputValidation.test.ts` - ESLint/Prettier validation
- `test/reactToCSSModules.test.ts` - React to CSS Modules transformation
- `test/integration.test.ts` - End-to-end integration tests

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

### Output (HTML Web Component)

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

## Extending the Compiler

### Adding New Pipelines

```typescript
import { registerPipeline, type CompilationPipeline } from '@vjs-10/vjs-compiler';

const myCustomPipeline: CompilationPipeline = {
  id: 'component-vue-scoped',
  name: 'React Component → Vue (Scoped CSS)',

  compile(entryFile, config) {
    // Your compilation logic here
    return {
      files: [
        { path: 'Component.vue', content: '...', type: 'vue' }
      ]
    };
  }
};

registerPipeline(myCustomPipeline);
```

## Troubleshooting

### Empty class Attributes

The compiler automatically removes empty `class` attributes from HTML output. If all classes for an element are filtered (e.g., component classes that become element selectors), the `class` attribute will be omitted entirely.

### Component Naming Consistency

For best results, use consistent naming between your JSX component names and style object keys:

**Good:**
```typescript
// Component: FullscreenButton
// Style key: FullscreenButton
const styles = { FullscreenButton: '...' };
<FullscreenButton className={styles.FullscreenButton} />
```

**Also works (fuzzy matching):**
```typescript
// Component: FullscreenButton
// Style key: FullScreenButton (different casing)
const styles = { FullScreenButton: '...' };  // Still works due to case-insensitive matching
<FullscreenButton className={styles.FullScreenButton} />
```

However, consistent naming is recommended to avoid confusion.

### Unresolved Tailwind Tokens

Some Tailwind utilities may not compile automatically and will appear as warnings:

- Container query utilities (e.g., `@7xl/root:text-[0.9375rem]`)
- Complex arbitrary attribute selectors (e.g., `[&[data-orientation="horizontal"]]:h-5`)
- Custom utility classes not in the default theme
- Custom variants (e.g., `hocus:`, `group-hover/button:`)

See `KNOWN_ISSUES.md` for a comprehensive list of known limitations.

## License

Apache-2.0
