// Main exports for the package
export { TailwindCSSCompiler } from './compiler.js';
export { ASTParser } from './ast-parser.js';
export { semanticCSSGenerator } from './semantic-css-generator.js';
export { semanticTransform } from './semantic-transform.js';
export { multiFormatOutput } from './multi-format-output.js';

// Type exports
export type {
  ClassUsage,
  SemanticMapping,
  CompilerConfig,
  ParsedFile
} from './types.js';

export type { SemanticCSSGeneratorOptions } from './semantic-css-generator.js';
export type { SemanticTransformOptions } from './semantic-transform.js';
export type { MultiFormatOutputOptions } from './multi-format-output.js';