/**
 * Build unified usage graph from JSX and className analysis
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 1: Identification - combine usage patterns into unified graph
 */

import type * as t from '@babel/types';
import type { UsageGraph, ImportDeclaration } from '../../types.js';
import { analyzeJSXUsage } from './analyzeJSXUsage.js';
import { analyzeClassNameUsage } from './analyzeClassNameUsage.js';

/**
 * Build a unified usage graph for a module
 *
 * Combines JSX usage and className usage analysis to create a complete
 * picture of how imports are used in the module.
 *
 * @param ast - Babel AST to analyze
 * @param imports - Extracted import declarations
 * @returns Unified usage graph
 */
export function buildUsageGraph(ast: t.File, imports: ImportDeclaration[]): UsageGraph {
  // Get all import names to track
  const importNames = new Set<string>();

  for (const imp of imports) {
    // Add default import
    if (imp.defaultImport) {
      importNames.add(imp.defaultImport);
    }

    // Add named imports
    for (const spec of imp.specifiers) {
      importNames.add(spec);
    }
  }

  const importNameArray = Array.from(importNames);

  // Analyze JSX usage (components)
  const jsxUsage = analyzeJSXUsage(ast, importNameArray);

  // Analyze className usage (styles)
  const classNameResult = analyzeClassNameUsage(ast, importNameArray);

  // Merge usage information
  // Priority: className-access > compound-member > jsx-element > unknown
  const mergedUsage = new Map(jsxUsage.map((u) => [u.name, u]));

  for (const classNameUsage of classNameResult.imports) {
    const existing = mergedUsage.get(classNameUsage.name);

    // If already marked as className-access, keep it
    // If already marked as jsx-element or compound-member, but this is className-access, upgrade it
    if (classNameUsage.usageType === 'className-access') {
      if (existing) {
        existing.usageType = 'className-access';
      } else {
        mergedUsage.set(classNameUsage.name, classNameUsage);
      }
    }
  }

  return {
    imports: Array.from(mergedUsage.values()),
    styleKeys: classNameResult.styleKeys,
  };
}
