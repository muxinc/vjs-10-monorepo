/**
 * Package Export Discovery (Boundary Layer)
 *
 * Following "Push Assumptions to Boundaries" principle:
 * - This module does I/O (reads package.json, analyzes exports)
 * - Results are returned as pure data structures (PackageExportMap)
 * - Transformers receive discovered data, remain pure (no I/O)
 *
 * Architecture: Phase 0 (Discovery)
 * - Identifies what packages actually export
 * - Runs before transformation phases
 * - Prevents generating invalid imports
 */

import type { ComponentExportStrategy, PackageExportMap } from '../types.js';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Discover what a package exports by reading its package.json
 *
 * This is BOUNDARY CODE - performs I/O to discover package structure.
 * Results are passed as data to pure transformers.
 *
 * @param packageRootPath - Absolute path to package root
 * @returns Discovered package export structure
 */
export async function discoverPackageExports(packageRootPath: string): Promise<PackageExportMap> {
  const packageJsonPath = join(packageRootPath, 'package.json');

  let packageJson: any;
  try {
    const content = await readFile(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to read package.json at ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const packageName = packageJson.name;
  if (!packageName) {
    throw new Error(`Package at ${packageRootPath} has no name in package.json`);
  }

  // Extract exports field
  const exports = packageJson.exports || {};

  // Build subpath exports map
  const subpathExports = new Map<string, string>();

  for (const [key, value] of Object.entries(exports)) {
    if (key === '.') continue; // Skip main export

    // Handle both string and object export formats
    const exportPath = typeof value === 'string' ? value : (value as any).default || (value as any).import;

    if (exportPath) {
      subpathExports.set(key, exportPath);
    }
  }

  // Determine component export strategy
  const componentExportStrategy = determineComponentExportStrategy(exports, subpathExports);

  // If named-from-main, we might want to discover what's exported
  // For now, we'll leave this as undefined and let the transformer handle it
  const namedExports =
    componentExportStrategy === 'named-from-main' ? await discoverNamedExports(packageRootPath) : undefined;

  return {
    packageName,
    mainExport: '.',
    subpathExports,
    componentExportStrategy,
    ...(namedExports ? { namedExports } : {}),
  };
}

/**
 * Determine how components are exported from a package
 *
 * Strategies:
 * 1. wildcard-subpath: Package has "./components/*" wildcard export
 * 2. subpath-per-component: Package has explicit "./components/foo" exports
 * 3. named-from-main: Components exported as named exports from main entry
 */
function determineComponentExportStrategy(
  exports: Record<string, any>,
  subpathExports: Map<string, string>
): ComponentExportStrategy {
  // Check for wildcard component export
  if (exports['./components/*']) {
    return 'wildcard-subpath';
  }

  // Check for explicit component subpath exports
  const hasComponentSubpaths = Array.from(subpathExports.keys()).some((key) => key.startsWith('./components/'));

  if (hasComponentSubpaths) {
    return 'subpath-per-component';
  }

  // Default: components exported from main package
  return 'named-from-main';
}

/**
 * Discover named exports from a package's main entry point
 *
 * This is a simplified implementation that reads the index file
 * In a production version, this could use TypeScript compiler API
 * or analyze the built output
 *
 * @param packageRootPath - Absolute path to package root
 * @returns Array of exported names (or undefined if cannot determine)
 */
async function discoverNamedExports(packageRootPath: string): Promise<string[] | undefined> {
  try {
    // Try to read src/index.ts or dist/index.js
    const possibleIndexPaths = [
      join(packageRootPath, 'src', 'index.ts'),
      join(packageRootPath, 'dist', 'index.js'),
      join(packageRootPath, 'src', 'index.js'),
    ];

    for (const indexPath of possibleIndexPaths) {
      try {
        const content = await readFile(indexPath, 'utf-8');

        // Simple regex to find named exports
        // Matches: export { Foo, Bar } or export function Foo() or export class Foo
        const namedExports = new Set<string>();

        // Match: export { Foo, Bar } from '...'
        const reExportMatches = content.matchAll(/export\s+\{\s*([^}]+)\s*\}/g);
        for (const match of reExportMatches) {
          const capture = match[1];
          if (capture) {
            const names = capture
              .split(',')
              .map((s) =>
                s
                  .trim()
                  .split(/\s+as\s+/)[0]
                  ?.trim()
              )
              .filter((n): n is string => !!n);
            names.forEach((name) => namedExports.add(name));
          }
        }

        // Match: export function Foo() or export class Foo
        const declarationMatches = content.matchAll(/export\s+(?:function|class)\s+(\w+)/g);
        for (const match of declarationMatches) {
          const name = match[1];
          if (name) {
            namedExports.add(name);
          }
        }

        if (namedExports.size > 0) {
          return Array.from(namedExports);
        }
      } catch {
        // Try next path
        continue;
      }
    }

    // Could not determine named exports
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Check if a subpath export exists in a package
 *
 * Helper function for transformers to validate generated imports
 *
 * @param exportMap - Discovered package exports
 * @param subpath - Subpath to check (e.g., "./components/media-play-button")
 * @returns true if subpath exists
 */
export function hasSubpathExport(exportMap: PackageExportMap, subpath: string): boolean {
  return exportMap.subpathExports.has(subpath);
}

/**
 * Get all available subpath exports for a package
 *
 * Helper for error messages
 *
 * @param exportMap - Discovered package exports
 * @returns Array of available subpaths
 */
export function getAvailableSubpaths(exportMap: PackageExportMap): string[] {
  return Array.from(exportMap.subpathExports.keys());
}

/**
 * Discover exports for multiple packages (Phase 2.2)
 *
 * Given a map of package names to root paths, discovers exports for all packages.
 * This allows validation and transformation to work with all referenced packages,
 * not just the target package.
 *
 * Architecture:
 * - Phase 0: Discovery (boundary layer)
 * - Discovers ALL packages that will be referenced in generated imports
 * - Results passed as Map to transformers and validators
 *
 * @param packages - Map of package names to root paths
 * @returns Map of package names to discovered exports
 *
 * @example
 * ```typescript
 * const packages = new Map([
 *   ['@vjs-10/html', '/path/to/html/package'],
 *   ['@vjs-10/html-icons', '/path/to/html-icons/package']
 * ]);
 * const exports = await discoverMultiplePackages(packages);
 * // exports.get('@vjs-10/html') => PackageExportMap
 * // exports.get('@vjs-10/html-icons') => PackageExportMap
 * ```
 */
export async function discoverMultiplePackages(packages: Map<string, string>): Promise<Map<string, PackageExportMap>> {
  const result = new Map<string, PackageExportMap>();

  // Discover each package in parallel
  const discoveries = Array.from(packages.entries()).map(async ([packageName, rootPath]) => {
    try {
      const exportMap = await discoverPackageExports(rootPath);
      return { packageName, exportMap };
    } catch (error) {
      console.warn(
        `Warning: Could not discover exports for ${packageName}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    }
  });

  const results = await Promise.all(discoveries);

  // Add successful discoveries to result map
  for (const discovery of results) {
    if (discovery) {
      result.set(discovery.packageName, discovery.exportMap);
    }
  }

  return result;
}
