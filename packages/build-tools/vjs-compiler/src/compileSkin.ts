import type { ImportMappingConfig } from './importTransforming/types.js';
import type { StyleProcessor } from './styleProcessing/index.js';
import type { SerializeOptions } from './types.js';

import { defaultImportMappings, transformImports } from './importTransforming/index.js';
import { parseReactSource, SKIN_CONFIG } from './parsing/index.js';
import { serializeToHTML } from './serializer.js';
import { generateSkinModule } from './skinGeneration/index.js';
import { placeholderStyleProcessor } from './styleProcessing/index.js';
import { transformJSXToHTML } from './transformer.js';
import { toKebabCase } from './utils/naming.js';

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
export function compileSkinToHTML(source: string, options: CompileSkinOptions = {}): string | null {
  const {
    importMappings = defaultImportMappings,
    styleProcessor = placeholderStyleProcessor,
    serializeOptions = {},
  } = options;

  // 1. Parse the React skin
  const parsed = parseReactSource(source, SKIN_CONFIG);
  if (!parsed.jsx || !parsed.componentName || !parsed.imports) {
    return null;
  }

  // 2. Transform imports
  const htmlImports = transformImports(parsed.imports, importMappings);

  // 3. Transform JSX AST
  const transformedJsx = transformJSXToHTML(parsed.jsx);

  // 4. Serialize to HTML (with attribute processing)
  const html = serializeToHTML(transformedJsx, serializeOptions);

  // 5. Process styles
  const styles = styleProcessor({
    stylesNode: parsed.stylesNode ?? null,
    componentName: parsed.componentName,
  });

  // 6. Generate the complete module
  return generateSkinModule({
    imports: htmlImports,
    html,
    styles,
    className: parsed.componentName,
    elementName: toKebabCase(parsed.componentName),
  });
}
