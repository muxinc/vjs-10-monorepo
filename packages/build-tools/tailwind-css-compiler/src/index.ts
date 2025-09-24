// Main exports for the package
export { TailwindCSSCompiler } from './compiler.js';
export { ASTParser } from './ast-parser.js';

// New pure functional API
export { compileFromString, compileFromUsages } from './core-compiler.js';
export {
  createFileWriterCallback,
  createConsoleOutputCallback,
  createCustomFileWriterCallback,
  createCompositeCallback
} from './side-effects.js';

// Legacy PostCSS plugins (for advanced usage)
export { semanticCSSGenerator } from './semantic-css-generator.js';
export { semanticTransform } from './semantic-transform.js';

// Enhanced class parsing functions
export { enhanceClassUsage, enhanceClassUsages, parseEnhancedClassString } from './class-parser.js';

// Official Tailwind parsing exports
export { parseCandidate, createSimplifiedDesignSystem } from './tailwind-ast/index.js';

// Type exports
export type {
  ClassUsage,
  EnhancedClassUsage,
  SemanticMapping,
  CompilerConfig,
  ParsedFile,
  ContainerQuery,
  ArbitraryValue
} from './types.js';

// New types
export type {
  CompilationOutput,
  CoreCompilerOptions
} from './core-compiler.js';
export type { OutputCallback } from './side-effects.js';

// Legacy types
export type { SemanticCSSGeneratorOptions } from './semantic-css-generator.js';
export type { SemanticTransformOptions } from './semantic-transform.js';