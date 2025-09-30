/**
 * Calculate relative import paths for compiled output
 *
 * Architectural Principle: Pure Functions
 * All functions work with strings, no filesystem access
 */

import type { ImportCategory, PathContext } from '../../types.js';

import { dirname, extname, relative } from 'node:path';

/**
 * Calculate relative import path from one file to another
 *
 * @param fromFile - Absolute path to importing file
 * @param toFile - Absolute path to target file
 * @returns Relative import path (without extension for TS/JS modules)
 *
 * @example
 * calculateRelativePath(
 *   '/packages/html/html/src/skins/compiled/MediaSkin.ts',
 *   '/packages/html/html/src/media-skin.ts'
 * ) // Returns: '../../../media-skin'
 */
export function calculateRelativePath(fromFile: string, toFile: string): string {
  const fromDir = dirname(fromFile);
  let relativePath = relative(fromDir, toFile);

  // Handle same directory case - Node's relative() returns bare filename
  // ES modules require './' prefix for same-directory imports
  if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
    relativePath = `./${relativePath}`;
  }

  // Remove file extension for ES module imports
  const ext = extname(relativePath);
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
    return relativePath.slice(0, -ext.length);
  }

  return relativePath;
}

/**
 * Resolve import source path based on category and context
 *
 * @param originalSource - Original import source (e.g., '../MediaSkin', '@vjs-10/react-icons')
 * @param category - Import category
 * @param context - Path context
 * @returns Transformed import source
 */
export function resolveImportPath(originalSource: string, category: ImportCategory, context: PathContext): string {
  switch (category) {
    case 'vjs-component-same-package':
      return transformComponentImport(originalSource, context);

    case 'vjs-core-package':
      return transformCorePackageImport(originalSource, context);

    case 'vjs-icon-package':
      // Phase 2 will handle package mapping (e.g., react-icons -> html-icons)
      // For now, keep as-is
      return originalSource;

    case 'vjs-component-external':
      // External VJS components - keep as package imports for Phase 1
      return originalSource;

    case 'external-package':
      // External packages unchanged
      return originalSource;

    case 'framework-import':
      // Framework imports will be filtered out, but keep path unchanged
      return originalSource;

    case 'style-import':
      // Style imports will be filtered out, but keep path unchanged
      return originalSource;

    default:
      // Unknown category - keep as-is
      return originalSource;
  }
}

/**
 * Transform component import path
 * Handles: '../components/MediaPlayButton' -> '../../../components/media-play-button'
 */
function transformComponentImport(source: string, context: PathContext): string {
  const { outputPath, targetPackage } = context;

  // Extract component name from source
  // Examples:
  //   '../components/MediaPlayButton' -> 'MediaPlayButton'
  //   '../components/MediaTimeRange' -> 'MediaTimeRange'
  const componentMatch = source.match(/\/([A-Z][a-zA-Z0-9]+)$/);
  if (!componentMatch || !componentMatch[1]) {
    // Fallback: return as-is if we can't parse
    return source;
  }

  const componentName = componentMatch[1];

  // Convert PascalCase to kebab-case
  const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  // Calculate relative path from output to target package components directory
  const componentsDir = `${targetPackage.rootPath}/components`;
  const targetFile = `${componentsDir}/${kebabName}.ts`;

  return calculateRelativePath(outputPath, targetFile);
}

/**
 * Transform core package import path
 * Handles: '../MediaSkin' -> '../../../media-skin'
 *          '../MediaContainer' -> '../../../media-container'
 */
function transformCorePackageImport(source: string, context: PathContext): string {
  const { outputPath, targetPackage } = context;

  // Detect what we're importing
  if (source.includes('MediaSkin') || source.includes('media-skin')) {
    const targetFile = `${targetPackage.rootPath}/media-skin.ts`;
    return calculateRelativePath(outputPath, targetFile);
  }

  if (source.includes('MediaContainer') || source.includes('media-container')) {
    const targetFile = `${targetPackage.rootPath}/media-container.ts`;
    return calculateRelativePath(outputPath, targetFile);
  }

  // Fallback: return as-is
  return source;
}
