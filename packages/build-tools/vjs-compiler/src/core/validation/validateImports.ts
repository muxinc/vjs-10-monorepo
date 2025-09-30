/**
 * Import Validation (Core Layer - Pure Functions)
 *
 * Validates that generated imports match discovered package exports.
 * This catches mismatches between what we generate and what actually exists.
 *
 * Following architectural principles:
 * - Pure functions (no I/O)
 * - Takes discovered data as input
 * - Returns validation results as data
 * - Used in pipeline after transformation, before code generation
 */

import type { PackageExportMap, ValidationResult } from '../../types.js';
import type { TransformedImport } from '../transformer/transformImports.js';

/**
 * Validate that generated imports match discovered package exports (Phase 2.2)
 *
 * This is PURE CODE - takes data, performs validation, returns results.
 * No I/O, no side effects.
 *
 * Validates ALL imports against ALL discovered packages.
 *
 * @param imports - Generated imports (from transformImports)
 * @param packageExports - Map of discovered package structures (from boundary)
 * @returns Validation result with errors/warnings
 */
export function validateGeneratedImportsMulti(
  imports: TransformedImport[],
  packageExports: Map<string, PackageExportMap>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const imp of imports) {
    // Extract package name from import path
    const packageName = extractPackageName(imp.path);

    // Look up discovered exports for this package
    const exportMap = packageExports.get(packageName);

    if (!exportMap) {
      // Package not discovered - skip validation (might be external package)
      continue;
    }

    // Validate based on import type
    if (imp.type === 'named') {
      validateNamedImport(imp, exportMap, errors, warnings);
    } else if (imp.type === 'side-effect') {
      validateSideEffectImport(imp, exportMap, errors, warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

/**
 * Validate that generated imports match discovered package exports (Phase 2.1 - DEPRECATED)
 *
 * This is PURE CODE - takes data, performs validation, returns results.
 * No I/O, no side effects.
 *
 * @deprecated Use validateGeneratedImportsMulti for Phase 2.2
 * @param imports - Generated imports (from transformImports)
 * @param targetPackageExports - Discovered package structure (from boundary)
 * @returns Validation result with errors/warnings
 */
export function validateGeneratedImports(
  imports: TransformedImport[],
  targetPackageExports: PackageExportMap
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const imp of imports) {
    // Skip validation for non-target-package imports
    // Must check exact package match or subpath (not just prefix!)
    // e.g., '@vjs-10/html-icons' should NOT match '@vjs-10/html'
    const isTargetPackage =
      imp.path === targetPackageExports.packageName || imp.path.startsWith(`${targetPackageExports.packageName}/`);

    if (!isTargetPackage) {
      continue;
    }

    // Validate based on import type
    if (imp.type === 'named') {
      validateNamedImport(imp, targetPackageExports, errors, warnings);
    } else if (imp.type === 'side-effect') {
      validateSideEffectImport(imp, targetPackageExports, errors, warnings);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

/**
 * Validate a named import (e.g., import { MediaSkin } from '@vjs-10/html')
 */
function validateNamedImport(
  imp: TransformedImport,
  exportMap: PackageExportMap,
  errors: string[],
  warnings: string[]
): void {
  // Extract subpath from import path
  const subpath = extractSubpath(imp.path, exportMap.packageName);

  if (subpath === '.') {
    // Import from main package
    // If we have discovered named exports, validate against them
    if (exportMap.namedExports && imp.specifiers) {
      for (const specifier of imp.specifiers) {
        if (!exportMap.namedExports.includes(specifier)) {
          errors.push(
            `Named import '${specifier}' from '${imp.path}' not found in package exports. ` +
              `Available: ${exportMap.namedExports.join(', ')}`
          );
        }
      }
    } else if (!exportMap.namedExports) {
      // We don't have discovered exports, can't validate
      warnings.push(`Cannot validate named import from '${imp.path}' - named exports not discovered`);
    }
  } else {
    // Import from subpath
    if (!exportMap.subpathExports.has(subpath)) {
      errors.push(
        `Named import from '${imp.path}' (subpath: ${subpath}) does not match any package export. ` +
          `Available subpaths: ${Array.from(exportMap.subpathExports.keys()).join(', ')}`
      );
    }
  }
}

/**
 * Validate a side-effect import (e.g., import '@vjs-10/html/components/media-play-button')
 */
function validateSideEffectImport(
  imp: TransformedImport,
  exportMap: PackageExportMap,
  errors: string[],
  _warnings: string[]
): void {
  // Extract subpath from import path
  const subpath = extractSubpath(imp.path, exportMap.packageName);

  if (subpath === '.') {
    // Side-effect import from main package - always valid
    return;
  }

  // Check if subpath exists
  // For wildcard exports, we need special handling
  if (exportMap.componentExportStrategy === 'wildcard-subpath') {
    // Check if subpath matches wildcard pattern
    // For example: "./components/*" matches "./components/media-play-button"
    const wildcardPatterns = Array.from(exportMap.subpathExports.keys()).filter((key) => key.includes('*'));

    let matchesWildcard = false;
    for (const pattern of wildcardPatterns) {
      if (matchesWildcardPattern(subpath, pattern)) {
        matchesWildcard = true;
        break;
      }
    }

    if (!matchesWildcard && !exportMap.subpathExports.has(subpath)) {
      errors.push(
        `Side-effect import '${imp.path}' (subpath: ${subpath}) does not match any package export. ` +
          `Available: ${Array.from(exportMap.subpathExports.keys()).join(', ')}`
      );
    }
  } else {
    // Exact subpath must exist
    if (!exportMap.subpathExports.has(subpath)) {
      errors.push(
        `Side-effect import '${imp.path}' (subpath: ${subpath}) does not match any package export. ` +
          `Available: ${Array.from(exportMap.subpathExports.keys()).join(', ')}`
      );
    }
  }
}

/**
 * Extract subpath from full import path
 *
 * Examples:
 * - '@vjs-10/html' → '.'
 * - '@vjs-10/html/components/media-play-button' → './components/media-play-button'
 */
function extractSubpath(importPath: string, packageName: string): string {
  if (importPath === packageName) {
    return '.';
  }

  const suffix = importPath.substring(packageName.length);
  return `.${suffix}`;
}

/**
 * Check if a subpath matches a wildcard pattern
 *
 * Examples:
 * - matchesWildcardPattern('./components/foo', './components/*') → true
 * - matchesWildcardPattern('./other/foo', './components/*') → false
 */
function matchesWildcardPattern(subpath: string, pattern: string): boolean {
  const patternPrefix = pattern.substring(0, pattern.indexOf('*'));
  return subpath.startsWith(patternPrefix);
}

/**
 * Extract package name from import path (Phase 2.2)
 *
 * Examples:
 * - '@vjs-10/html' → '@vjs-10/html'
 * - '@vjs-10/html/components/media-play-button' → '@vjs-10/html'
 * - '@vjs-10/html-icons' → '@vjs-10/html-icons'
 * - '@vjs-10/html-icons/media-play-icon' → '@vjs-10/html-icons'
 * - 'react' → 'react'
 * - './relative-path' → './relative-path' (not a package)
 */
function extractPackageName(importPath: string): string {
  // Handle relative paths
  if (importPath.startsWith('.')) {
    return importPath;
  }

  // Handle scoped packages (@scope/name)
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    if (parts.length >= 2) {
      // Return scope + package name: '@scope/name'
      return `${parts[0]}/${parts[1]}`;
    }
    return importPath;
  }

  // Handle non-scoped packages
  const firstSlash = importPath.indexOf('/');
  if (firstSlash === -1) {
    return importPath;
  }
  return importPath.substring(0, firstSlash);
}
