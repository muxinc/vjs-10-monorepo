/**
 * Categorize imports based on usage and package context
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 2: Categorization - classify imports based on usage patterns
 *
 * Architectural Principle: Functional Over Declarative
 * Uses predicate functions to answer questions about imports
 */

import type {
  ImportDeclaration,
  ImportUsage,
  ImportCategory,
  PathContext,
} from '../../types.js';

/**
 * Categorize an import based on its usage and package context
 *
 * @param importDecl - Import declaration to categorize
 * @param usage - Usage information from analysis
 * @param paths - Path context for package resolution
 * @returns Import category
 */
export function categorizeImport(
  importDecl: ImportDeclaration,
  usage: ImportUsage,
  paths: PathContext
): ImportCategory {
  const { source } = importDecl;

  // Framework imports (React, react-dom, etc.)
  if (isFrameworkImport(source)) {
    return 'framework-import';
  }

  // Style imports (used in className)
  if (usage.usageType === 'className-access') {
    return 'style-import';
  }

  // VJS icon packages (@vjs-10/*-icons)
  if (isVJSIconPackage(source)) {
    return 'vjs-icon-package';
  }

  // VJS core packages (platform-agnostic)
  if (isVJSCorePackage(source)) {
    return 'vjs-core-package';
  }

  // Not used as component, treat as external
  if (usage.usageType === 'unknown') {
    return 'external-package';
  }

  // VJS component packages (@vjs-10/*)
  if (isVJSPackage(source)) {
    return 'vjs-component-external';
  }

  // Relative imports - check if same package
  if (isRelativeImport(source)) {
    // If source package and resolved path are in same package, it's same-package
    // For now, assume relative imports in a VJS package are same-package components
    if (isVJSPackage(paths.sourcePackage.name)) {
      return 'vjs-component-same-package';
    }
  }

  // Default to external package
  return 'external-package';
}

/**
 * Predicate: Is this a framework import?
 */
function isFrameworkImport(source: string): boolean {
  return (
    source === 'react' ||
    source === 'react-dom' ||
    source.startsWith('react/') ||
    source === 'vue' ||
    source === 'svelte'
  );
}

/**
 * Predicate: Is this a VJS icon package?
 */
function isVJSIconPackage(source: string): boolean {
  return source.startsWith('@vjs-10/') && source.endsWith('-icons');
}

/**
 * Predicate: Is this a VJS core package (platform-agnostic)?
 */
function isVJSCorePackage(source: string): boolean {
  const corePackages = [
    '@vjs-10/core',
    '@vjs-10/media',
    '@vjs-10/media-store',
  ];
  return corePackages.includes(source);
}

/**
 * Predicate: Is this a VJS package?
 */
function isVJSPackage(source: string): boolean {
  return source.startsWith('@vjs-10/');
}

/**
 * Predicate: Is this a relative import?
 */
function isRelativeImport(source: string): boolean {
  return source.startsWith('./') || source.startsWith('../');
}
