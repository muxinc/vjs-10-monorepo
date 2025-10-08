/**
 * Path transformation utilities for calculating import paths
 */

import * as path from 'path';
import type { PathContext } from '../../types.js';

/**
 * Calculate relative import path from output to target component
 *
 * @param importPath - Original import path (e.g. '../../components/PlayButton')
 * @param pathContext - Path context with source/output locations
 * @returns Transformed import path relative to output
 */
export function calculateImportPath(importPath: string, pathContext: PathContext): string {
  // 1. Resolve import relative to source file
  const resolvedSource = path.resolve(path.dirname(pathContext.skinPath), importPath);

  // 2. Check if this is a VJS component (within source package)
  const isVJSComponent = resolvedSource.startsWith(pathContext.sourcePackage.rootPath);

  if (!isVJSComponent) {
    // External package - preserve as-is for now
    // TODO: Phase 15 will handle external package transformation
    return importPath;
  }

  // 3. Get path relative to source package root
  const relativeToPackage = path.relative(pathContext.sourcePackage.rootPath, resolvedSource);

  // 4. Transform filename (PlayButton.tsx → media-play-button.ts)
  const targetFilename = transformComponentFilename(relativeToPackage);

  // 5. Resolve in target package
  const targetAbsolute = path.join(pathContext.targetPackage.rootPath, targetFilename);

  // 6. Calculate relative from output
  const relativeFromOutput = path.relative(path.dirname(pathContext.outputPath), targetAbsolute);

  // 7. Ensure Unix-style path separators
  return relativeFromOutput.split(path.sep).join('/');
}

/**
 * Transform component filename to web component filename
 *
 * Examples:
 * - components/PlayButton.tsx → components/media-play-button.ts
 * - components/TimeRange.tsx → components/media-time-range.ts
 *
 * @param filename - Relative filename from package root
 * @returns Transformed filename
 */
function transformComponentFilename(filename: string): string {
  // Get directory and base name
  const dir = path.dirname(filename);
  const base = path.basename(filename, path.extname(filename));

  // Transform component name to kebab-case
  const kebabName = toKebabCase(base);

  // Add 'media-' prefix if not already present
  const prefixedName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

  // Change extension to .ts
  return path.join(dir, `${prefixedName}.ts`);
}

/**
 * Convert PascalCase/camelCase to kebab-case
 *
 * Examples:
 * - PlayButton → play-button
 * - MediaContainer → media-container
 * - HTMLElement → html-element
 *
 * @param str - String to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  return (
    str
      // Insert hyphen before uppercase letters (except at start)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Handle consecutive uppercase letters (HTMLElement → html-element)
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      // Convert to lowercase
      .toLowerCase()
  );
}

/**
 * Check if import path is a relative path
 *
 * @param importPath - Import path
 * @returns True if relative path
 */
export function isRelativePath(importPath: string): boolean {
  return importPath.startsWith('./') || importPath.startsWith('../');
}

/**
 * Check if import path is a VJS package
 *
 * @param importPath - Import path
 * @returns True if VJS package
 */
export function isVJSPackage(importPath: string): boolean {
  return importPath.startsWith('@vjs-10/');
}
