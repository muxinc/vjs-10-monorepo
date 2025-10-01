// Export main compilation functions
export { compileJSXToHTML, compileJSXToHTMLFromParsed } from './transforms/index.js';

// Export utilities for advanced usage
export { transformJSXToHTML } from './transformer.js';
export { serializeToHTML } from './serializer.js';
export * from './utils/naming.js';
export type { CompileOptions, SerializeOptions } from './types.js';

// Export parsing utilities
export {
  parseReactSource,
  JSX_ONLY_CONFIG,
  SKIN_CONFIG,
  type ImportInfo,
  type ParseConfig,
  type ParsedReactSource,
} from './parsing/index.js';

// Export attribute processing architecture
export {
  AttributeProcessorPipeline,
  DefaultAttributeProcessor,
  createDefaultPipeline,
  type AttributeContext,
  type AttributeProcessor,
  type AttributeTransformResult,
} from './attributeProcessing/index.js';

// Export skin compilation
export { compileSkinToHTML, type CompileSkinOptions } from './compileSkin.js';
export {
  generateSkinModule,
  type SkinMetadata,
  type SkinModuleData,
} from './skinGeneration/index.js';
export {
  transformImports,
  defaultImportMappings,
  type ImportMappingConfig,
} from './importTransforming/index.js';
export {
  placeholderStyleProcessor,
  type StyleProcessor,
  type StyleContext,
} from './styleProcessing/index.js';
