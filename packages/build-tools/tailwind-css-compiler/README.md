# @vjs-10/tailwind-css-compiler

A Tailwind CSS to semantic CSS compiler designed for VJS-10 components. Converts Tailwind utility classes into semantic CSS selectors that work with both vanilla CSS and CSS modules.

## Overview

This compiler analyzes TypeScript/JSX files, extracts Tailwind className usage, and generates semantic CSS output that can be used in web components or React applications without requiring Tailwind at runtime.

### Key Features

- 🎯 **AST-based parsing** - Analyzes TypeScript/JSX files to extract className usage
- 🏗️ **Dual output formats** - Generates both vanilla CSS and CSS modules
- 🧩 **Semantic selectors** - Converts utility classes to meaningful component selectors
- ⚡ **ESM-native** - Built with modern JavaScript modules
- 🔧 **CLI + Library** - Use as command-line tool or programmatic API

## CLI Usage

### Installation in Monorepo

The package is already installed as part of the workspace. Use it via pnpm:

```bash
# From the monorepo root
pnpm --filter @vjs-10/tailwind-css-compiler run build
```

### CLI Commands

```bash
# Basic usage (uses default configuration)
node packages/build-tools/tailwind-css-compiler/dist/cli.js

# Show help
node packages/build-tools/tailwind-css-compiler/dist/cli.js --help

# Custom output directory
node packages/build-tools/tailwind-css-compiler/dist/cli.js --output ./build/css

# Custom source patterns
node packages/build-tools/tailwind-css-compiler/dist/cli.js --sources "src/**/*.tsx,src/**/*.ts"

# Skip vanilla CSS generation
node packages/build-tools/tailwind-css-compiler/dist/cli.js --no-vanilla

# Skip CSS modules generation
node packages/build-tools/tailwind-css-compiler/dist/cli.js --no-modules

# Use custom Tailwind config
node packages/build-tools/tailwind-css-compiler/dist/cli.js --tailwind-config ./tailwind.config.js

# Use configuration file
node packages/build-tools/tailwind-css-compiler/dist/cli.js --config ./compiler.config.js
```

### Configuration File

Create a `compiler.config.js` file:

```javascript
module.exports = {
  sources: [
    'packages/react/**/*.tsx',
    'packages/react/**/*.ts',
    'examples/**/*.tsx',
    'examples/**/*.ts'
  ],
  outputDir: './dist/css',
  generateVanilla: true,
  generateModules: true,
  tailwindConfigPath: './tailwind.config.js'
};
```

## Library Usage

### Basic Example

```typescript
import { TailwindCSSCompiler } from '@vjs-10/tailwind-css-compiler';

const compiler = new TailwindCSSCompiler({
  sources: ['src/**/*.tsx'],
  outputDir: './dist/css',
  generateVanilla: true,
  generateModules: true
});

await compiler.compile();
```

### Advanced Usage

```typescript
import {
  TailwindCSSCompiler,
  ASTParser,
  semanticCSSGenerator,
  type CompilerConfig,
  type ClassUsage
} from '@vjs-10/tailwind-css-compiler';

// Custom configuration
const config: CompilerConfig = {
  sources: ['packages/**/*.tsx'],
  outputDir: './build/styles',
  generateVanilla: true,
  generateModules: false,
  tailwindConfigPath: './custom-tailwind.config.js'
};

// Initialize and run compiler
const compiler = new TailwindCSSCompiler(config);
await compiler.compile();

// Or use individual components
const parser = new ASTParser();
const parsedFiles = await parser.parseFiles(['src/Button.tsx']);

console.log('Found usages:', parsedFiles[0].usages);
```

### Working with PostCSS Plugins

The compiler exposes PostCSS plugins that can be used in custom build processes:

```typescript
import postcss from 'postcss';
import { semanticCSSGenerator, semanticTransform } from '@vjs-10/tailwind-css-compiler';

const result = await postcss([
  semanticCSSGenerator({
    usages: extractedUsages,
    generateVanilla: true,
    generateModules: true
  }),
  semanticTransform({
    componentMappings: {
      'PlayButton': 'play-button'
    },
    isModule: false
  })
]).process(css, { from: undefined });
```

## Input/Output Examples

### Input Component

```tsx
// src/PlayButton.tsx
export function PlayButton() {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Play
    </button>
  );
}
```

### Generated Vanilla CSS

```css
/* dist/css/vanilla.css */
play-button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

### Generated CSS Modules

```css
/* dist/css/modules.css */
.PlayButton {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

## API Reference

### TailwindCSSCompiler

Main compiler class for processing source files.

```typescript
class TailwindCSSCompiler {
  constructor(config: CompilerConfig)
  async compile(): Promise<void>
}
```

### CompilerConfig

Configuration interface for the compiler.

```typescript
interface CompilerConfig {
  /** Glob patterns for source files */
  sources: string[];
  /** Output directory for generated CSS */
  outputDir: string;
  /** Generate vanilla CSS selectors */
  generateVanilla?: boolean;
  /** Generate CSS modules */
  generateModules?: boolean;
  /** Path to Tailwind config file */
  tailwindConfigPath?: string;
}
```

### ASTParser

Parses TypeScript/JSX files to extract className usage.

```typescript
class ASTParser {
  async parseFiles(patterns: string[]): Promise<ParsedFile[]>
  parseFile(filePath: string): ClassUsage[]
}
```

### ClassUsage

Represents a className usage found in source code.

```typescript
interface ClassUsage {
  file: string;           // Source file path
  component: string;      // Component name (e.g., "PlayButton")
  element: string;        // Element type (e.g., "button")
  classes: string[];      // Tailwind classes found
  line: number;           // Line number in source
  column: number;         // Column number in source
  componentType: 'library' | 'native' | 'unknown';
}
```

## Development

### Building

```bash
# Build the package
pnpm --filter @vjs-10/tailwind-css-compiler run build

# Build with watch mode
pnpm --filter @vjs-10/tailwind-css-compiler run dev

# Clean build artifacts
pnpm --filter @vjs-10/tailwind-css-compiler run clean
```

### Testing

```bash
# Run tests
pnpm --filter @vjs-10/tailwind-css-compiler run test

# Run tests with coverage
pnpm --filter @vjs-10/tailwind-css-compiler run test:coverage

# Run tests in watch mode
pnpm --filter @vjs-10/tailwind-css-compiler run test:watch
```

## Architecture

The compiler follows a multi-stage pipeline:

1. **AST Parsing** - Analyzes TypeScript/JSX files using Babel parser
2. **Usage Extraction** - Identifies className usage and component context
3. **Semantic Generation** - Creates semantic selectors from utility classes
4. **CSS Processing** - Uses PostCSS with Tailwind to generate final CSS
5. **Multi-format Output** - Writes both vanilla and module CSS formats

## Integration with VJS-10

This compiler is specifically designed for the VJS-10 monorepo:

- **Component Analysis** - Understands VJS-10 component patterns
- **Semantic Mapping** - Maps components to semantic selectors (e.g., `PlayButton` → `play-button`)
- **Build Integration** - Integrates with monorepo build processes
- **Type Safety** - Provides TypeScript definitions for all APIs

## Troubleshooting

### Common Issues

**No className usages found**
- Check that source patterns match your files
- Verify TypeScript/JSX syntax is valid
- Ensure className attributes are using string literals

**CSS not generating**
- Check output directory permissions
- Verify Tailwind config path is correct
- Ensure Tailwind classes are valid

**Type errors**
- Make sure to import types with `type` keyword
- Check that all required dependencies are installed
- Verify TypeScript configuration is correct

### Debug Output

The compiler provides verbose logging during execution:

```bash
🚀 Starting Tailwind CSS compilation...
📄 Parsed 15 files
🎯 Found 42 className usages
🎨 Generating vanilla CSS...
📦 Generating CSS modules...
✅ Compilation complete!
```

## License

Apache-2.0