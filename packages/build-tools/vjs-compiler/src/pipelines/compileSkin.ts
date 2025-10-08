/**
 * Main pipeline for compiling skin components
 */

import type { CompileSkinConfig } from '../types.js';
import { parseSource } from '../core/parser/parseSource.js';
import { extractJSX, extractComponentName } from '../core/parser/extractJSX.js';
import { extractImports } from '../core/parser/extractImports.js';
import { extractStyles } from '../core/parser/extractStyles.js';
import { transformImports } from '../core/transformer/transformImports.js';
import { transformJSX } from '../core/transformer/transformJSX.js';
import { transformStyles } from '../core/css/transformStyles.js';
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
 * Phase 2: JSX + Import + CSS transformation
 *
 * Pipeline:
 * 1. Parse skin source and styles source to AST
 * 2. Extract JSX, imports, component name, styles
 * 3. Transform imports (React → web component)
 * 4. Transform JSX (element names, className → class, {children} → <slot>)
 * 5. Transform styles (Tailwind → CSS via PostCSS)
 * 6. Generate HTML template string
 * 7. Generate complete web component module with inline CSS
 *
 * @param config - Compilation configuration
 * @returns Compilation result with generated code
 */
export async function compileSkin(config: CompileSkinConfig): Promise<CompileSkinResult> {
  const { skinSource, stylesSource, paths } = config;

  // Phase 1: Parse
  const skinAST = parseSource(skinSource);
  const jsx = extractJSX(skinAST);
  const imports = extractImports(skinAST);
  const componentName = extractComponentName(skinAST);

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

  // Phase 2: Process CSS (if styles provided)
  let css: string | undefined;
  if (stylesSource) {
    const stylesAST = parseSource(stylesSource);
    const styles = extractStyles(stylesAST);

    if (styles) {
      const cssResult = await transformStyles(styles);
      css = cssResult.css;
    }
  }

  // Phase 3: Generate
  const templateHTML = generateTemplate(transformedJSX);
  const code = generateModule({
    componentName,
    imports: transformedImports,
    templateHTML,
    css,
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
