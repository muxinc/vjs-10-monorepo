// Export attribute processing architecture
export {
  type AttributeContext,
  type AttributeProcessor,
  AttributeProcessorPipeline,
  type AttributeTransformResult,
  createDefaultPipeline,
  DefaultAttributeProcessor,
} from './attributeProcessing/index.js';

// Export skin compilation
export { type CompileSkinOptions, type CompileSkinResult, compileSkinToHTML } from './compileSkin.js';

// Export configuration types
export type {
  CompilationFile,
  CompilationOutput,
  CompilerConfig,
  CompilerOptions,
  CSSModulesOptions,
  CSSStrategy,
  InputType,
  OutputFormat,
  TailwindOptions,
} from './config/index.js';

// Export dependency discovery
export { discoverDependencies, type FileDependencies, isCSSImport } from './dependencies/index.js';

export { defaultImportMappings, type ImportMappingConfig, transformImports } from './importTransforming/index.js';
// Export parsing utilities
export {
  type ImportInfo,
  JSX_ONLY_CONFIG,
  type ParseConfig,
  type ParsedReactSource,
  parseReactSource,
  SKIN_CONFIG,
} from './parsing/index.js';
// Export pipeline system
export { type CompilationPipeline, getAvailablePipelines, getPipeline } from './pipelines/index.js';
export { serializeToHTML } from './serializer.js';

export { generateSkinModule, type SkinMetadata, type SkinModuleData } from './skinGeneration/index.js';

export { placeholderStyleProcessor, type StyleContext, type StyleProcessor } from './styleProcessing/index.js';

// Export utilities for advanced usage
export { transformJSXToHTML } from './transformer.js';
// Export main compilation functions
export {
  compileJSXToHTML,
  compileJSXToHTMLFromParsed,
  type CompileReactToCSSModulesOptions,
  compileReactToReactWithCSSModules,
  REACT_TO_CSS_MODULES_CONFIG,
} from './transforms/index.js';
export type { CompileOptions, SerializeOptions } from './types.js';
export * from './utils/naming.js';
