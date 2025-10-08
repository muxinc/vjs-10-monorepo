/**
 * Analyze className usage to identify style imports and style key usage
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 1: Identification - scan AST to find usage patterns
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ImportUsage, StyleKeyUsage } from '../../types.js';

/**
 * Result of className usage analysis
 */
export interface ClassNameUsageResult {
  /** Import usage for style imports */
  imports: ImportUsage[];
  /** Style key usage information */
  styleKeys: StyleKeyUsage[];
}

/**
 * Analyze className usage in the AST
 *
 * Scans the AST to find:
 * 1. Style imports: imports used in className attributes
 * 2. Style keys: keys accessed from style imports
 * 3. Which components each style key is applied to
 *
 * @param ast - Babel AST to analyze
 * @param importNames - List of imported identifiers to track
 * @returns className usage information
 */
export function analyzeClassNameUsage(
  ast: t.File,
  importNames: string[]
): ClassNameUsageResult {
  const usageMap = new Map<string, ImportUsage>();
  const styleKeyMap = new Map<string, Set<string>>(); // key → Set<componentNames>

  // Initialize usage map for all imports
  for (const name of importNames) {
    usageMap.set(name, {
      name,
      usageType: 'unknown',
    });
  }

  // Traverse AST to find className attribute usage
  traverse(ast, {
    JSXAttribute(path) {
      // Only process className attributes
      if (!t.isJSXIdentifier(path.node.name) || path.node.name.name !== 'className') {
        return;
      }

      const value = path.node.value;
      if (!value) return;

      // Get the component name this className is applied to
      const componentName = getComponentName(path);

      // Extract style key references from className value
      if (t.isJSXExpressionContainer(value)) {
        extractStyleKeyReferences(value.expression, usageMap, styleKeyMap, componentName);
      } else if (t.isStringLiteral(value)) {
        // String literal className (not using styles object, skip)
        return;
      }
    },
  });

  // Convert styleKeyMap to StyleKeyUsage array
  const styleKeys: StyleKeyUsage[] = [];
  for (const [key, componentsSet] of styleKeyMap.entries()) {
    styleKeys.push({
      key,
      usedOn: Array.from(componentsSet),
    });
  }

  return {
    imports: Array.from(usageMap.values()),
    styleKeys,
  };
}

/**
 * Get the component name that a JSX attribute belongs to
 */
function getComponentName(path: t.NodePath<t.JSXAttribute>): string | null {
  const openingElement = path.parentPath?.node;
  if (!t.isJSXOpeningElement(openingElement)) {
    return null;
  }

  const nameNode = openingElement.name;

  // Simple component: <PlayButton>
  if (t.isJSXIdentifier(nameNode)) {
    return nameNode.name;
  }

  // Compound component: <TimeRange.Root>
  if (t.isJSXMemberExpression(nameNode)) {
    // Build full path: TimeRange.Root
    const parts: string[] = [];
    let current: t.JSXMemberExpression | t.JSXIdentifier = nameNode;

    while (t.isJSXMemberExpression(current)) {
      if (t.isJSXIdentifier(current.property)) {
        parts.unshift(current.property.name);
      }
      current = current.object as t.JSXMemberExpression | t.JSXIdentifier;
    }

    if (t.isJSXIdentifier(current)) {
      parts.unshift(current.name);
    }

    return parts.join('.');
  }

  return null;
}

/**
 * Extract style key references from an expression
 *
 * Handles:
 * - Simple member access: styles.Button
 * - Template literals: `${styles.Button} ${styles.Icon}`
 * - Conditional expressions: isActive ? styles.Active : styles.Inactive
 */
function extractStyleKeyReferences(
  expr: t.Expression | t.JSXEmptyExpression,
  usageMap: Map<string, ImportUsage>,
  styleKeyMap: Map<string, Set<string>>,
  componentName: string | null
): void {
  // Member expression: styles.Button
  if (t.isMemberExpression(expr)) {
    if (t.isIdentifier(expr.object) && t.isIdentifier(expr.property)) {
      const importName = expr.object.name;
      const styleKey = expr.property.name;

      // Mark this import as used for className
      const usage = usageMap.get(importName);
      if (usage) {
        usage.usageType = 'className-access';
      }

      // Track which components this style key is applied to
      if (componentName) {
        if (!styleKeyMap.has(styleKey)) {
          styleKeyMap.set(styleKey, new Set());
        }
        styleKeyMap.get(styleKey)!.add(componentName);
      }
    }
  }

  // Template literal: `${styles.Button} ${styles.Icon}`
  else if (t.isTemplateLiteral(expr)) {
    for (const expression of expr.expressions) {
      if (t.isExpression(expression)) {
        extractStyleKeyReferences(expression, usageMap, styleKeyMap, componentName);
      }
    }
  }

  // Conditional: isActive ? styles.Active : styles.Inactive
  else if (t.isConditionalExpression(expr)) {
    extractStyleKeyReferences(expr.consequent, usageMap, styleKeyMap, componentName);
    extractStyleKeyReferences(expr.alternate, usageMap, styleKeyMap, componentName);
  }

  // Logical expression: showIcon && styles.Icon
  else if (t.isLogicalExpression(expr)) {
    extractStyleKeyReferences(expr.left, usageMap, styleKeyMap, componentName);
    extractStyleKeyReferences(expr.right, usageMap, styleKeyMap, componentName);
  }
}
