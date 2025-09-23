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

// Type exports
export type {
  ClassUsage,
  SemanticMapping,
  CompilerConfig,
  ParsedFile
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