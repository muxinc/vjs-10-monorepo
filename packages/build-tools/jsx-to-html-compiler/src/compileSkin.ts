import { parseReactSkin, generateSkinModule } from './skinGeneration/index.js';
import { transformImports, defaultImportMappings } from './importTransforming/index.js';
import { transformJSXToHTML } from './transformer.js';
import { serializeToHTML } from './serializer.js';
import { placeholderStyleProcessor, type StyleProcessor } from './styleProcessing/index.js';
import { toKebabCase } from './utils/naming.js';
import type { ImportMappingConfig } from './importTransforming/types.js';
import type { SerializeOptions } from './types.js';

/**
 * Options for compiling a React skin to HTML
 */
export interface CompileSkinOptions {
  /**
   * Import mapping configuration
   * Defaults to defaultImportMappings if not provided
   */
  importMappings?: ImportMappingConfig;

  /**
   * Style processor function
   * Defaults to placeholderStyleProcessor (returns empty string)
   */
  styleProcessor?: StyleProcessor;

  /**
   * Serialization options (indent, attributePipeline, etc.)
   */
  serializeOptions?: SerializeOptions;
}

/**
 * Compile a React skin component to an HTML/Web Component skin module
 *
 * This orchestrates the entire compilation pipeline:
 * 1. Parse React skin (extract JSX, imports, styles, component name)
 * 2. Transform imports (React → HTML)
 * 3. Transform JSX (element names, {children} → <slot>)
 * 4. Process attributes (with AttributeProcessorPipeline)
 * 5. Process styles (placeholder for now)
 * 6. Generate complete TypeScript module
 *
 * @param source - React/TSX source code for the skin
 * @param options - Compilation options
 * @returns Complete HTML/Web Component skin module as a string, or null if parsing fails
 */
export function compileSkinToHTML(
  source: string,
  options: CompileSkinOptions = {}
): string | null {
  const {
    importMappings = defaultImportMappings,
    styleProcessor = placeholderStyleProcessor,
    serializeOptions = {},
  } = options;

  // 1. Parse the React skin
  const skinData = parseReactSkin(source);
  if (!skinData) {
    return null;
  }

  // 2. Transform imports
  const htmlImports = transformImports(skinData.imports, importMappings);

  // 3. Transform JSX AST
  const transformedJsx = transformJSXToHTML(skinData.jsx);

  // 4. Serialize to HTML (with attribute processing)
  const html = serializeToHTML(transformedJsx, serializeOptions);

  // 5. Process styles
  const styles = styleProcessor({
    stylesNode: skinData.stylesNode,
    componentName: skinData.componentName,
  });

  // 6. Generate the complete module
  return generateSkinModule({
    imports: htmlImports,
    html,
    styles,
    className: skinData.componentName,
    elementName: toKebabCase(skinData.componentName),
  });
}
