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
 * Result of compiling a skin to HTML
 */
export interface CompileSkinResult {
  /**
   * Generated HTML/Web Component module code
   */
  code: string;

  /**
   * Map of imported component names to their web component element names
   * Used for CSS transformation: class selectors → element selectors
   * Example: { PlayButton: 'media-play-button', PlayIcon: 'media-play-icon' }
   */
  componentMap: Record<string, string>;
}

/**
 * Compile a React skin component to an HTML/Web Component skin module
 *
 * This orchestrates the entire compilation pipeline:
 * 1. Parse React skin (extract JSX, imports, styles, component name)
 * 2. Build component map from imports
 * 3. Transform imports (React → HTML)
 * 4. Transform JSX (element names, {children} → <slot>)
 * 5. Process attributes (with AttributeProcessorPipeline)
 * 6. Process styles (can be async for Tailwind compilation)
 * 7. Generate complete TypeScript module
 *
 * @param source - React/TSX source code for the skin
 * @param options - Compilation options
 * @returns Compilation result with code and component map, or null if parsing fails
 */
export async function compileSkinToHTML(source: string, options: CompileSkinOptions = {}): Promise<CompileSkinResult | null> {
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

  // 2. Build component map from imports
  // All imported components (not from 'react' or style files) map to their web component names
  const componentMap: Record<string, string> = {};
  for (const imp of parsed.imports) {
    // Skip React imports and style imports
    if (imp.source === 'react' || imp.source.includes('/styles') || imp.source.includes('.css')) {
      continue;
    }

    // Add all named imports as components
    for (const specifier of imp.specifiers) {
      const elementName = toKebabCase(specifier);
      // Add media- prefix if not already present
      const webComponentName = elementName.startsWith('media-') ? elementName : `media-${elementName}`;
      componentMap[specifier] = webComponentName;
    }
  }

  // 3. Transform imports
  const htmlImports = transformImports(parsed.imports, importMappings);

  // 4. Transform JSX AST
  const transformedJsx = transformJSXToHTML(parsed.jsx);

  // 5. Serialize to HTML (with attribute processing)
  const html = serializeToHTML(transformedJsx, serializeOptions);

  // 6. Process styles (await in case it's async)
  const styles = await styleProcessor({
    stylesNode: parsed.stylesNode ?? null,
    componentName: parsed.componentName,
    componentMap,
  });

  // 7. Generate the complete module
  const code = generateSkinModule({
    imports: htmlImports,
    html,
    styles,
    className: parsed.componentName,
    elementName: toKebabCase(parsed.componentName),
  });

  return {
    code,
    componentMap,
  };
}
