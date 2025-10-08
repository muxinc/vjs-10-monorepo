/**
 * Main pipeline for compiling skin components
 */

import type { CompileSkinConfig } from '../types.js';
import { parseSource } from '../core/parser/parseSource.js';
import { extractJSX, extractComponentName } from '../core/parser/extractJSX.js';
import { extractImports } from '../core/parser/extractImports.js';
import { extractStyles } from '../core/parser/extractStyles.js';
import { buildUsageGraph } from '../core/analysis/buildUsageGraph.js';
import { categorizeUsageGraph } from '../core/analysis/categorizeUsageGraph.js';
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
 * Phase 2: JSX + Import + CSS transformation with usage analysis
 *
 * Pipeline (following "Identify, Then Transform" architecture):
 * 1. Phase 0: Parse - Parse skin source and styles source to AST
 * 2. Phase 1: Identification - Extract JSX, imports, component name, styles
 * 3. Phase 2: Categorization - Analyze usage and categorize imports/styles
 * 4. Phase 3: Projection - Transform based on categories
 * 5. Phase 4: Generation - Generate HTML template and module
 *
 * @param config - Compilation configuration
 * @returns Compilation result with generated code
 */
export async function compileSkin(config: CompileSkinConfig): Promise<CompileSkinResult> {
  const { skinSource, stylesSource, paths } = config;

  // Phase 0: Parse
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

  // Phase 1: Identification - Build usage graph
  const usageGraph = buildUsageGraph(skinAST, imports);

  // Phase 2: Categorization - Categorize imports and styles
  const categorizedGraph = categorizeUsageGraph(usageGraph, imports, paths);

  // Phase 3: Projection - Transform imports and JSX
  const transformedImports = transformImports(imports, paths);
  const transformedJSX = transformJSX(jsx, categorizedGraph.styleKeys);

  // Phase 3: Projection - Process CSS (if styles provided)
  let css: string | undefined;
  if (stylesSource) {
    const stylesAST = parseSource(stylesSource);
    const styles = extractStyles(stylesAST);

    if (styles) {
      const cssResult = await transformStyles(styles, categorizedGraph.styleKeys);
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
