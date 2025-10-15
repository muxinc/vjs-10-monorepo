/**
 * Main pipeline for compiling skin components
 */

import type { CompileSkinConfig } from '../types.js';

import { discoverMultiplePackages } from '../boundary/packageDiscovery.js';
import { buildUsageGraph } from '../core/analysis/buildUsageGraph.js';
import { categorizeUsageGraph } from '../core/analysis/categorizeUsageGraph.js';
import { transformStyles } from '../core/css/transformStyles.js';
import { generateModule } from '../core/generator/generateModule.js';
import { generateTemplate } from '../core/generator/generateTemplate.js';
import { extractImports } from '../core/parser/extractImports.js';
import { extractComponentName, extractJSX } from '../core/parser/extractJSX.js';
import { extractStyles } from '../core/parser/extractStyles.js';
import { parseSource } from '../core/parser/parseSource.js';
import { transformImports } from '../core/transformer/transformImports.js';
import { transformJSX } from '../core/transformer/transformJSX.js';
import { validateGeneratedImports, validateGeneratedImportsMulti } from '../core/validation/validateImports.js';

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
 * Phase 2.2: JSX + Import + CSS transformation with multi-package discovery
 *
 * Pipeline (following "Identify, Then Transform" architecture):
 * 0. Phase 0: Discovery (Boundary) - Discover ALL package exports (if package mode)
 * 1. Phase 1: Parse - Parse skin source and styles source to AST
 * 2. Phase 2: Identification - Extract JSX, imports, component name, styles
 * 3. Phase 3: Categorization - Analyze usage and categorize imports/styles
 * 4. Phase 4: Projection - Transform based on categories & discovered exports
 * 5. Phase 4.5: Validation - Validate ALL imports match discovered exports
 * 6. Phase 5: Generation - Generate HTML template and module
 *
 * @param config - Compilation configuration
 * @returns Compilation result with generated code
 */
export async function compileSkin(config: CompileSkinConfig): Promise<CompileSkinResult> {
  const { skinSource, stylesSource, paths, output } = config;

  // Phase 0: Discovery (BOUNDARY - only if package mode AND we have package paths)
  // Phase 2.2: Discover ALL packages that will be referenced
  const needsDiscovery =
    output.importMode === 'package' && !paths.packageExports && paths.targetPackage?.rootPath;

  if (needsDiscovery) {
    try {
      // Build map of all packages to discover
      const packagesToDiscover = new Map<string, string>();

      // Always discover target package
      packagesToDiscover.set(paths.targetPackage!.name, paths.targetPackage!.rootPath);

      // Discover all packages from package mappings
      if (paths.packageMappings) {
        for (const [_sourcePackage, targetPackage] of Object.entries(paths.packageMappings)) {
          // Skip if already in map (e.g., target package)
          if (packagesToDiscover.has(targetPackage)) {
            continue;
          }

          // Look up package root path
          // For now, we need to infer the path from the package name
          // This is a limitation - ideally packageMappings would include paths

          // Special case for known packages (temporary workaround)
          if (targetPackage === '@vjs-10/html-icons') {
            // Assume icons package is sibling to html package
            // path/to/html/html → path/to/html/html-icons
            const htmlPackageDir = paths.targetPackage!.rootPath;
            const parentDir = htmlPackageDir.substring(0, htmlPackageDir.lastIndexOf('/'));
            const iconsPath = `${parentDir}/html-icons`;
            packagesToDiscover.set(targetPackage, iconsPath);
          }
        }
      }

      // Discover all packages in parallel
      paths.packageExports = await discoverMultiplePackages(packagesToDiscover);

      // Phase 2.1 backward compatibility: set targetPackageExports
      if (paths.targetPackage) {
        const targetExports = paths.packageExports.get(paths.targetPackage.name);
        if (targetExports) {
          paths.targetPackageExports = targetExports;
        }
      }
    } catch (error) {
      // Non-fatal: continue without discovery (will use legacy behavior)
      console.warn(
        `Warning: Could not discover package exports: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

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

  // Phase 4: Projection - Transform imports and JSX
  const transformedImports = transformImports(imports, paths, output);
  const transformedJSX = transformJSX(
    jsx,
    categorizedGraph.styleKeys,
    output.selectorStrategy ? { selectorStrategy: output.selectorStrategy } : undefined
  );

  // Phase 4.5: Validation - Validate ALL imports match discovered exports
  if (output.importMode === 'package') {
    let validation: { valid: boolean; errors: string[]; warnings?: string[] };

    // Phase 2.2: Use multi-package validation if available
    if (paths.packageExports && paths.packageExports.size > 0) {
      validation = validateGeneratedImportsMulti(transformedImports, paths.packageExports);
    }
    // Phase 2.1 backward compatibility: fall back to single-package validation
    else if (paths.targetPackageExports) {
      validation = validateGeneratedImports(transformedImports, paths.targetPackageExports);
    } else {
      // No discovery available - skip validation
      validation = { valid: true, errors: [] };
    }

    if (!validation.valid) {
      throw new Error(`Import validation failed:\n${validation.errors.join('\n')}`);
    }

    // Log warnings if any
    if (validation.warnings && validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
    }
  }

  // Phase 4: Projection - Process CSS (if styles provided)
  let css: string | undefined;
  if (stylesSource) {
    const stylesAST = parseSource(stylesSource);
    const styles = extractStyles(stylesAST);

    if (styles) {
      const cssResult = await transformStyles(
        styles,
        categorizedGraph.styleKeys,
        output.selectorStrategy ? { selectorStrategy: output.selectorStrategy } : undefined
      );
      css = cssResult.css;
    }
  }

  // Phase 5: Generation - Generate HTML template and module
  const templateHTML = generateTemplate(transformedJSX);
  const code = generateModule({
    componentName,
    imports: transformedImports,
    templateHTML,
    css,
    includeBaseTemplate: true, // Include MediaSkin.getTemplateHTML()
    output, // Pass output context for import mode
    paths, // Pass paths context for package name
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
  return componentName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
