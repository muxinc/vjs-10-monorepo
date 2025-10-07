import type { ImportMappingConfig } from './importTransforming/types.js';
import type { StyleProcessor } from './styleProcessing/index.js';
import type { SerializeOptions } from './types.js';

import * as t from '@babel/types';

import { defaultImportMappings, transformImports } from './importTransforming/index.js';
import { parseReactSource, SKIN_CONFIG } from './parsing/index.js';
import { serializeToHTML } from './serializer.js';
import { generateSkinModule } from './skinGeneration/index.js';
import { extractStylesObject, placeholderStyleProcessor } from './styleProcessing/index.js';
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
 * 3. Extract styles object from AST (for className resolution)
 * 4. Transform imports (React → HTML)
 * 5. Transform JSX (element names, {children} → <slot>)
 * 6. Serialize to HTML (with AttributeProcessorPipeline and styles context)
 * 7. Process styles (can be async for Tailwind compilation)
 * 8. Generate complete TypeScript module
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

      // Add both PascalCase (for React) and kebab-case (for Tailwind CSS) keys
      // This allows CSS transformation to work whether classes are PascalCase or kebab-case
      componentMap[specifier] = webComponentName; // PascalCase: PlayIcon → media-play-icon
      componentMap[elementName] = webComponentName; // kebab-case: play-icon → media-play-icon
    }
  }

  // 2b. Extract compound component parts from JSX (e.g., TimeRange.Root, TimeRange.Track)
  extractCompoundComponents(parsed.jsx, componentMap);

  // 3. Extract styles object from AST (before transformation)
  // This enables className expression resolution during serialization
  let stylesObject: Record<string, string> | null = null;
  if (parsed.stylesNode) {
    stylesObject = extractStylesObject(parsed.stylesNode);
  }

  // 4. Transform imports
  const htmlImports = transformImports(parsed.imports, importMappings);

  // 5. Transform JSX AST
  const transformedJsx = transformJSXToHTML(parsed.jsx);

  // 6. Serialize to HTML (with attribute processing and styles context)
  const html = serializeToHTML(transformedJsx, {
    ...serializeOptions,
    stylesObject,
    componentMap,
  });

  // 7. Process styles (await in case it's async)
  const styles = await styleProcessor({
    stylesNode: parsed.stylesNode ?? null,
    componentName: parsed.componentName,
    componentMap,
  });

  // 8. Generate the complete module
  // Append '-compiled' suffix to element name to avoid conflicts with hand-written skins
  const baseElementName = toKebabCase(parsed.componentName);
  const elementName = `${baseElementName}-compiled`;

  const code = generateSkinModule({
    imports: htmlImports,
    html,
    styles,
    className: parsed.componentName,
    elementName,
  });

  return {
    code,
    componentMap,
  };
}

/**
 * Extract compound component parts from JSX and add them to componentMap
 * Detects member expressions like TimeRange.Root, VolumeRange.Track, etc.
 * and adds entries like: { TimeRangeRoot: 'media-time-range-root', TimeRangeTrack: 'media-time-range-track' }
 */
function extractCompoundComponents(jsx: t.Node, componentMap: Record<string, string>): void {
  const visit = (node: t.Node | null | undefined) => {
    if (!node) return;

    if (t.isJSXElement(node)) {
      const openingElement = node.openingElement;

      // Check if this is a member expression (e.g., TimeRange.Root)
      if (t.isJSXMemberExpression(openingElement.name)) {
        const memberExpr = openingElement.name;

        // Get the object name (e.g., "TimeRange")
        let objectName = '';
        if (t.isJSXIdentifier(memberExpr.object)) {
          objectName = memberExpr.object.name;
        }

        // Get the property name (e.g., "Root")
        const propertyName = t.isJSXIdentifier(memberExpr.property) ? memberExpr.property.name : '';

        if (objectName && propertyName) {
          // Create the compound key: TimeRangeRoot
          const compoundKey = `${objectName}${propertyName}`;

          // Create the element name: media-time-range-root
          const objectKebab = toKebabCase(objectName);
          const propertyKebab = toKebabCase(propertyName);
          const elementName = objectKebab.startsWith('media-')
            ? `${objectKebab}-${propertyKebab}`
            : `media-${objectKebab}-${propertyKebab}`;

          componentMap[compoundKey] = elementName;
        }
      }

      // Visit children
      if (node.children) {
        for (const child of node.children) {
          visit(child as t.Node);
        }
      }
    } else if (t.isJSXFragment(node)) {
      for (const child of node.children) {
        visit(child as t.Node);
      }
    }
  };

  visit(jsx);
}
