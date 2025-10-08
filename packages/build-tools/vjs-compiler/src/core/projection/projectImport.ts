/**
 * Project imports based on their category
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 3: Projection - transform imports based on categorization
 *
 * Architectural Principle: Functional Over Declarative
 * Uses projection functions to answer "how should this be transformed?"
 */

import type { CategorizedImport } from '../../types.js';

/**
 * Projection result for an import
 */
export interface ImportProjection {
  /** Whether to keep this import in the output */
  shouldKeep: boolean;
  /** Whether to transform this import (e.g., change path) */
  shouldTransform: boolean;
  /** New import source if transforming */
  transformedSource?: string;
  /** Reason for keeping/removing (for debugging) */
  reason: string;
}

/**
 * Project an import based on its category
 *
 * @param categorizedImport - Categorized import to project
 * @returns Projection describing how to handle this import
 */
export function projectImport(categorizedImport: CategorizedImport): ImportProjection {
  const { category, import: importDecl } = categorizedImport;

  // Use category-specific projection functions
  switch (category) {
    case 'framework-import':
      return projectFrameworkImport(importDecl.source);

    case 'style-import':
      return projectStyleImport(importDecl.source);

    case 'vjs-icon-package':
      return projectVJSIconPackage(importDecl.source);

    case 'vjs-core-package':
      return projectVJSCorePackage(importDecl.source);

    case 'vjs-component-same-package':
      return projectVJSComponentSamePackage(importDecl.source);

    case 'vjs-component-external':
      return projectVJSComponentExternal(importDecl.source);

    case 'external-package':
      return projectExternalPackage(importDecl.source);

    default:
      // Exhaustiveness check
      const _exhaustive: never = category;
      return {
        shouldKeep: false,
        shouldTransform: false,
        reason: `Unknown category: ${_exhaustive}`,
      };
  }
}

/**
 * Projection: Framework imports (React, Vue, etc.)
 * Decision: Remove for web components (not needed)
 */
function projectFrameworkImport(source: string): ImportProjection {
  return {
    shouldKeep: false,
    shouldTransform: false,
    reason: `Framework import '${source}' not needed in web component output`,
  };
}

/**
 * Projection: Style imports (CSS modules, etc.)
 * Decision: Remove (styles are inlined via CSS processing)
 */
function projectStyleImport(source: string): ImportProjection {
  return {
    shouldKeep: false,
    shouldTransform: false,
    reason: `Style import '${source}' handled by CSS processing`,
  };
}

/**
 * Projection: VJS icon packages
 * Decision: Keep and transform to target package path
 */
function projectVJSIconPackage(source: string): ImportProjection {
  // TODO: Transform path based on target package structure
  // For now, keep as-is
  return {
    shouldKeep: true,
    shouldTransform: false,
    reason: `Icon package '${source}' needed in web component`,
  };
}

/**
 * Projection: VJS core packages (media-store, etc.)
 * Decision: Keep and transform to target package path
 */
function projectVJSCorePackage(source: string): ImportProjection {
  // TODO: Transform path based on target package structure
  // For now, keep as-is
  return {
    shouldKeep: true,
    shouldTransform: false,
    reason: `Core package '${source}' needed in web component`,
  };
}

/**
 * Projection: VJS components from same package
 * Decision: Keep and transform to target package path
 */
function projectVJSComponentSamePackage(source: string): ImportProjection {
  // TODO: Transform relative path to target package structure
  // For now, keep as-is
  return {
    shouldKeep: true,
    shouldTransform: false,
    reason: `Same-package component '${source}' needed in web component`,
  };
}

/**
 * Projection: VJS components from external package
 * Decision: Keep and transform to target package path
 */
function projectVJSComponentExternal(source: string): ImportProjection {
  // TODO: Transform package path to target package structure
  // For now, keep as-is
  return {
    shouldKeep: true,
    shouldTransform: false,
    reason: `External VJS component '${source}' needed in web component`,
  };
}

/**
 * Projection: External packages (lodash, etc.)
 * Decision: Keep as-is
 */
function projectExternalPackage(source: string): ImportProjection {
  return {
    shouldKeep: true,
    shouldTransform: false,
    reason: `External package '${source}' kept as-is`,
  };
}
