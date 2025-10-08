/**
 * Main pipeline for compiling skin components
 */

import type { CompileSkinConfig } from '../types.js';
import { parseSource } from '../core/parser/parseSource.js';
import { extractJSX, extractComponentName } from '../core/parser/extractJSX.js';
import { extractImports } from '../core/parser/extractImports.js';
import { transformImports } from '../core/transformer/transformImports.js';
import { transformJSX } from '../core/transformer/transformJSX.js';
import { generateTemplate } from '../core/generator/generateTemplate.js';
import { generateModule } from '../core/generator/generateModule.js';

/**
 * Result of skin compilation
 */
export interface CompileSkinResult {
  code: string;
  componentName: string;
  tagName: string;
}

/**
 * Compile a skin component from React to web component
 *
 * Phase 1: Basic JSX + Import transformation (no CSS yet)
 *
 * Pipeline:
 * 1. Parse skin source to AST
 * 2. Extract JSX, imports, component name
 * 3. Transform imports (React → web component)
 * 4. Transform JSX (element names, className → class, {children} → <slot>)
 * 5. Generate HTML template string
 * 6. Generate complete web component module
 *
 * @param config - Compilation configuration
 * @returns Compilation result with generated code
 */
export function compileSkin(config: CompileSkinConfig): CompileSkinResult {
  const { skinSource, paths } = config;

  // Phase 1: Parse
  const ast = parseSource(skinSource);
  const jsx = extractJSX(ast);
  const imports = extractImports(ast);
  const componentName = extractComponentName(ast);

  // Validate extraction
  if (!jsx) {
    throw new Error('Failed to extract JSX from skin component');
  }
  if (!componentName) {
    throw new Error('Failed to extract component name from skin');
  }

  // Phase 2: Transform
  const transformedImports = transformImports(imports, paths);
  const transformedJSX = transformJSX(jsx);

  // Phase 3: Generate
  const templateHTML = generateTemplate(transformedJSX);
  const code = generateModule({
    componentName,
    imports: transformedImports,
    templateHTML,
    // No CSS in Phase 1
    css: undefined,
  });

  // Generate tag name for validation
  const tagName = componentNameToTagName(componentName);

  return {
    code,
    componentName,
    tagName,
  };
}

/**
 * Convert component class name to web component tag name
 *
 * @param componentName - Component class name
 * @returns Web component tag name
 */
function componentNameToTagName(componentName: string): string {
  return (
    componentName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
  );
}
