import { parseReactComponent } from './parser.js';
import { transformJSXToHTML } from './transformer.js';
import { serializeToHTML } from './serializer.js';
import type { CompileOptions } from './types.js';

/**
 * Compiles React JSX component source code to HTML string
 *
 * @param sourceCode - The React component source code
 * @param options - Compilation options
 * @returns The HTML string representation
 */
export function compileJSXToHTML(
  sourceCode: string,
  options: CompileOptions = {}
): string | null {
  // Step 1: Parse the React component and extract JSX
  const jsxElement = parseReactComponent(sourceCode);

  if (!jsxElement) {
    return null;
  }

  // Step 2: Transform JSX to HTML-compatible structure
  const transformedJSX = transformJSXToHTML(jsxElement);

  // Step 3: Serialize to HTML string
  const html = serializeToHTML(transformedJSX, options);

  return html;
}

// Export utilities for advanced usage
export { parseReactComponent } from './parser.js';
export { transformJSXToHTML } from './transformer.js';
export { serializeToHTML } from './serializer.js';
export * from './utils/naming.js';
export type { CompileOptions, SerializeOptions } from './types.js';

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
  parseReactSkin,
  generateSkinModule,
  type ImportInfo,
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
