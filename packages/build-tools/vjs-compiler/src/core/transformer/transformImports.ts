/**
 * Transform imports from React to web component format
 */

import type { ComponentExportStrategy, ImportDeclaration, OutputContext, PathContext } from '../../types.js';

import * as path from 'node:path';

import { calculateRelativePath } from '../projection/calculateRelativePath.js';
import { calculateImportPath, isRelativePath, isVJSPackage, toKebabCase } from './transformPaths.js';

/**
 * Transformed import information
 */
export interface TransformedImport {
  type: 'side-effect' | 'named' | 'default';
  path: string;
  specifiers?: string[];
}

/**
 * Transform import declarations from React to web component format
 *
 * Rules:
 * - React imports → eliminated
 * - Type-only imports → eliminated
 * - Styles imports → eliminated (CSS will be inlined)
 * - VJS component imports → side-effect imports with transformed paths
 * - External VJS packages → preserve (Phase 15 will transform package names)
 *
 * Import Mode:
 * - 'relative': Generate relative file paths (Phase 1, monorepo builds)
 * - 'package': Generate package imports (Phase 2, npm publishing)
 *
 * @param imports - Array of import declarations
 * @param pathContext - Path context for import resolution
 * @param outputContext - Output configuration (includes importMode)
 * @returns Array of transformed imports
 */
export function transformImports(
  imports: ImportDeclaration[],
  pathContext: PathContext,
  outputContext: OutputContext
): TransformedImport[] {
  const importMode = outputContext.importMode || 'relative'; // Default to Phase 1 behavior
  const transformed: TransformedImport[] = [];

  for (const imp of imports) {
    // Skip React framework imports
    if (imp.source === 'react' || imp.source.startsWith('react/')) {
      continue;
    }

    // Skip type-only imports
    if (imp.isTypeOnly) {
      continue;
    }

    // Skip styles imports
    if (imp.source.includes('/styles') || imp.source.endsWith('/styles')) {
      continue;
    }

    // Transform VJS component imports
    if (isRelativePath(imp.source)) {
      // Relative import - check if this is MediaSkin base class
      const isMediaSkinImport = imp.specifiers.includes('MediaSkin');

      if (isMediaSkinImport && importMode === 'package') {
        // Phase 2: Package import for MediaSkin
        // import { MediaSkin } from '../MediaSkin' → import { MediaSkin } from '@vjs-10/html'
        if (!pathContext.targetPackage) {
          throw new Error('targetPackage is required for package import mode with relative MediaSkin import');
        }
        transformed.push({
          type: 'named',
          path: pathContext.targetPackage.name,
          specifiers: ['MediaSkin'],
        });
      } else {
        // Phase 1: Relative path
        const newPath = calculateImportPath(imp.source, pathContext);

        if (isMediaSkinImport) {
          // Named import for MediaSkin
          transformed.push({
            type: 'named',
            path: newPath,
            specifiers: ['MediaSkin'],
          });
        } else {
          // Side-effect import for components
          transformed.push({
            type: 'side-effect',
            path: newPath,
          });
        }
      }
    } else if (isVJSPackage(imp.source)) {
      // VJS package import - transform based on import mode
      if (importMode === 'package') {
        // Phase 2: Package imports
        // import { MediaContainer, PlayButton } from '@vjs-10/react'
        // → import '@vjs-10/html/components/media-container'
        // → import '@vjs-10/html/components/media-play-button'
        // import { PlayIcon } from '@vjs-10/react-icons'
        // → import '@vjs-10/html-icons/media-play-icon'
        for (const specifier of imp.specifiers) {
          const packagePath = calculatePackageImportPath(specifier, pathContext, imp.source);
          transformed.push({
            type: 'side-effect',
            path: packagePath,
          });
        }
      } else {
        // Phase 1: Relative paths
        // import { MediaContainer, PlayButton } from '@vjs-10/react'
        // → import '../../../components/media-container'
        // → import '../../../components/media-play-button'
        // import { PlayIcon } from '@vjs-10/react-icons'
        // → import '../../../html-icons/src/media-play-icon'
        for (const specifier of imp.specifiers) {
          const componentPath = calculateComponentImportPath(specifier, pathContext, imp.source);
          transformed.push({
            type: 'side-effect',
            path: componentPath,
          });
        }
      }
    } else {
      // External non-VJS package - preserve for now
      transformed.push({
        type: 'side-effect',
        path: imp.source,
      });
    }
  }

  // Deduplicate side-effect imports (important for named-from-main strategy)
  // When multiple components come from same package, we only need one import
  return deduplicateImports(transformed);
}

/**
 * Deduplicate imports by path
 *
 * For named-from-main strategy, multiple components generate the same import path
 * Example: MediaContainer and PlayButton both → '@vjs-10/html'
 * We only need: import '@vjs-10/html' once
 */
function deduplicateImports(imports: TransformedImport[]): TransformedImport[] {
  const seen = new Map<string, TransformedImport>();

  for (const imp of imports) {
    const key = `${imp.type}:${imp.path}:${imp.specifiers?.join(',')}`;

    if (!seen.has(key)) {
      seen.set(key, imp);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate import path for a component from a VJS package
 *
 * Example: MediaContainer → ../../../components/media-container
 * Example: PlayIcon from @vjs-10/react-icons → ../../../html-icons/src/media-play-icon
 *
 * @param componentName - Component name (e.g. MediaContainer, PlayButton, PlayIcon)
 * @param pathContext - Path context for import resolution
 * @param packageSource - Source package name (e.g. @vjs-10/react, @vjs-10/react-icons)
 * @returns Relative import path from output to target component
 */
function calculateComponentImportPath(componentName: string, pathContext: PathContext, packageSource: string): string {
  // Relative imports require targetPackage context
  if (!pathContext.targetPackage?.rootPath) {
    throw new Error(
      `Cannot calculate relative import path without targetPackage.rootPath. ` +
        `Use importMode: 'package' for external compilation.`
    );
  }

  // Convert component name to kebab-case
  const kebabName = toKebabCase(componentName);
  const webComponentName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  // Determine target directory based on package type
  let targetAbsolute: string;

  if (isIconPackage(packageSource)) {
    // Icon packages: @vjs-10/react-icons → html-icons/src
    // Assumes monorepo structure: packages/html/html-icons/src/
    // Get the parent directory of targetPackage (packages/html)
    const htmlPackagesDir = path.dirname(pathContext.targetPackage.rootPath);
    const iconsPackageRoot = path.join(htmlPackagesDir, 'html-icons');
    targetAbsolute = path.join(iconsPackageRoot, 'src', webComponentName);
  } else {
    // Regular components: in components/ directory
    targetAbsolute = path.join(pathContext.targetPackage.rootPath, 'components', webComponentName);
  }

  // Use calculateRelativePath to get proper relative path without extension
  return calculateRelativePath(pathContext.outputPath, targetAbsolute);
}

/**
 * Check if a package is an icon package
 */
function isIconPackage(packageSource: string): boolean {
  return packageSource.startsWith('@vjs-10/') && packageSource.endsWith('-icons');
}

/**
 * Get default export strategy for known VJS packages
 * Used when no package discovery is available
 *
 * @param packageName - Package name
 * @returns Default export strategy
 */
function getDefaultExportStrategy(packageName: string): ComponentExportStrategy {
  // VJS html and react packages use named-from-main
  if (packageName === '@vjs-10/html' || packageName === '@vjs-10/react') {
    return 'named-from-main';
  }

  // Icon packages use wildcard-subpath
  if (packageName.includes('-icons')) {
    return 'wildcard-subpath';
  }

  // Default to named-from-main
  return 'named-from-main';
}

/**
 * Calculate package import path for Phase 2 (npm package imports)
 *
 * Phase 2.1: Uses discovered package exports (if available)
 * - If no discovery provided, falls back to default strategy for known packages
 * - If discovery shows components exported from main, import from main package
 * - If discovery shows subpath exports, use appropriate subpath
 *
 * Example: PlayIcon from @vjs-10/react-icons → @vjs-10/html-icons/media-play-icon
 * Example: MediaContainer from @vjs-10/react → @vjs-10/html (if named-from-main)
 *
 * @param componentName - Component name (e.g. MediaContainer, PlayButton, PlayIcon)
 * @param pathContext - Path context for package mapping and discovered exports
 * @param packageSource - Source package name (e.g. @vjs-10/react, @vjs-10/react-icons)
 * @returns Package import path
 */
function calculatePackageImportPath(componentName: string, pathContext: PathContext, packageSource: string): string {
  // Convert component name to kebab-case
  const kebabName = toKebabCase(componentName);
  const webComponentName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  // Get target package from mapping
  const packageMappings = pathContext.packageMappings || getDefaultPackageMappings();
  const targetPackage = packageMappings[packageSource];

  if (!targetPackage) {
    throw new Error(`No package mapping found for ${packageSource}`);
  }

  // Phase 2.2: Look up package exports from multi-package discovery
  let exportMap = pathContext.packageExports?.get(targetPackage);

  // Phase 2.1 backward compatibility: fall back to targetPackageExports
  if (!exportMap && pathContext.targetPackage && targetPackage === pathContext.targetPackage.name) {
    exportMap = pathContext.targetPackageExports;
  }

  if (!exportMap) {
    // Fallback: No discovery provided, use default strategy for known packages
    const defaultStrategy = getDefaultExportStrategy(targetPackage);

    if (defaultStrategy === 'named-from-main') {
      // Components exported from main package - import main package
      return targetPackage;
    }

    // For other strategies, fall back to legacy behavior
    return generateLegacyPackageImport(targetPackage, packageSource, webComponentName);
  }

  // Transform based on DISCOVERED strategy
  switch (exportMap.componentExportStrategy) {
    case 'named-from-main': {
      // Components exported as named exports from main package
      // For web components, we need side-effect imports to trigger registration
      // Import from main package (the component file will self-register)
      return targetPackage;
    }

    case 'wildcard-subpath': {
      // Package has "./components/*" or similar wildcard
      // Generate appropriate subpath
      if (isIconPackage(packageSource)) {
        return `${targetPackage}/${webComponentName}`;
      } else {
        return `${targetPackage}/components/${webComponentName}`;
      }
    }

    case 'subpath-per-component': {
      // Package has explicit subpath exports
      // Check if the specific subpath exists
      const subpath = isIconPackage(packageSource) ? `./${webComponentName}` : `./components/${webComponentName}`;

      if (exportMap.subpathExports.has(subpath)) {
        // Use the subpath
        return `${targetPackage}${subpath.substring(1)}`; // Remove leading '.'
      }

      // Subpath doesn't exist - this will be caught by validation
      // Generate the expected path anyway (validation will error)
      return isIconPackage(packageSource)
        ? `${targetPackage}/${webComponentName}`
        : `${targetPackage}/components/${webComponentName}`;
    }

    default:
      throw new Error(`Unknown component export strategy: ${exportMap.componentExportStrategy}`);
  }
}

/**
 * Generate legacy package import (pre-discovery behavior)
 *
 * Used as fallback when no package discovery is available
 */
function generateLegacyPackageImport(targetPackage: string, packageSource: string, webComponentName: string): string {
  if (isIconPackage(packageSource)) {
    return `${targetPackage}/${webComponentName}`;
  } else {
    return `${targetPackage}/components/${webComponentName}`;
  }
}

/**
 * Get default package mappings for VJS ecosystem
 */
function getDefaultPackageMappings(): Record<string, string> {
  return {
    '@vjs-10/react': '@vjs-10/html',
    '@vjs-10/react-icons': '@vjs-10/html-icons',
    '@vjs-10/react-media-store': '@vjs-10/html-media-store',
    '@vjs-10/react-media-elements': '@vjs-10/html-media-elements',
  };
}

/**
 * Generate import statements from transformed imports
 *
 * @param imports - Array of transformed imports
 * @returns Import statements as string
 */
export function generateImportStatements(imports: TransformedImport[]): string {
  const statements: string[] = [];

  for (const imp of imports) {
    if (imp.type === 'side-effect') {
      statements.push(`import '${imp.path}';`);
    } else if (imp.type === 'named' && imp.specifiers) {
      statements.push(`import { ${imp.specifiers.join(', ')} } from '${imp.path}';`);
    } else if (imp.type === 'default') {
      // Not used in Phase 1, but included for completeness
      statements.push(`import ${imp.specifiers?.[0]} from '${imp.path}';`);
    }
  }

  return statements.join('\n');
}
