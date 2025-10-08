/**
 * Categorize entire usage graph with imports and style keys
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 2: Categorization - classify all elements based on usage
 */

import type {
  UsageGraph,
  ImportDeclaration,
  CategorizedImport,
  StyleKeyUsage,
  PathContext,
} from '../../types.js';
import { categorizeImport } from './categorizeImport.js';
import { categorizeStyleKey } from './categorizeStyleKey.js';

/**
 * Categorized usage graph with all elements classified
 */
export interface CategorizedUsageGraph {
  /** Categorized imports */
  imports: CategorizedImport[];
  /** Categorized style keys */
  styleKeys: StyleKeyUsage[];
  /** Component names extracted from JSX usage */
  componentNames: string[];
}

/**
 * Categorize the entire usage graph
 *
 * @param usageGraph - Usage graph from analysis
 * @param imports - Original import declarations
 * @param paths - Path context for categorization
 * @returns Categorized usage graph
 */
export function categorizeUsageGraph(
  usageGraph: UsageGraph,
  imports: ImportDeclaration[],
  paths: PathContext
): CategorizedUsageGraph {
  // Extract component names from JSX usage
  const componentNames: string[] = [];
  for (const usage of usageGraph.imports) {
    if (usage.usageType === 'jsx-element') {
      componentNames.push(usage.name);
    } else if (usage.usageType === 'compound-member') {
      // Add compound components: TimeRange.Root, TimeRange.Track
      if (usage.members) {
        for (const member of usage.members) {
          componentNames.push(`${usage.name}.${member}`);
        }
      }
    }
  }

  // Categorize imports
  const categorizedImports: CategorizedImport[] = [];
  for (const importDecl of imports) {
    // Find usage for this import (check default import and specifiers)
    let usage = null;

    if (importDecl.defaultImport) {
      usage = usageGraph.imports.find((u) => u.name === importDecl.defaultImport);
    }

    if (!usage && importDecl.specifiers.length > 0) {
      // For named imports, find any usage
      for (const spec of importDecl.specifiers) {
        usage = usageGraph.imports.find((u) => u.name === spec);
        if (usage) break;
      }
    }

    if (usage) {
      const category = categorizeImport(importDecl, usage, paths);
      categorizedImports.push({
        import: importDecl,
        category,
        usage,
      });
    }
  }

  // Categorize style keys
  const categorizedStyleKeys: StyleKeyUsage[] = usageGraph.styleKeys.map((styleKey) => ({
    ...styleKey,
    category: categorizeStyleKey(styleKey, componentNames),
  }));

  return {
    imports: categorizedImports,
    styleKeys: categorizedStyleKeys,
    componentNames,
  };
}
