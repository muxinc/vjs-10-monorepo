/**
 * Analyze JSX usage to identify which imports are used as components
 *
 * Architectural Principle: Identify, Then Transform
 * This is Phase 1: Identification - scan AST to find usage patterns
 */

import type { ImportUsage } from '../../types.js';

import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Analyze JSX usage in the AST
 *
 * Scans the AST to find:
 * 1. Simple components: <PlayButton>
 * 2. Compound components: <TimeRange.Root>
 *
 * @param ast - Babel AST to analyze
 * @param importNames - List of imported identifiers to track
 * @returns Usage information for each import
 */
export function analyzeJSXUsage(ast: t.File, importNames: string[]): ImportUsage[] {
  const usageMap = new Map<string, ImportUsage>();

  // Initialize usage map for all imports
  for (const name of importNames) {
    usageMap.set(name, {
      name,
      usageType: 'unknown',
      jsxElements: [],
      members: [],
    });
  }

  // Traverse AST to find JSX element usage
  traverse(ast, {
    JSXElement(path) {
      const openingElement = path.node.openingElement;
      const nameNode = openingElement.name;

      // Simple component: <PlayButton>
      if (t.isJSXIdentifier(nameNode)) {
        const componentName = nameNode.name;
        const usage = usageMap.get(componentName);

        if (usage) {
          usage.usageType = 'jsx-element';
          usage.jsxElements?.push(path.node);
        }
      }

      // Compound component: <TimeRange.Root>
      else if (t.isJSXMemberExpression(nameNode)) {
        const { namespace, member } = extractMemberExpression(nameNode);

        if (namespace) {
          const usage = usageMap.get(namespace);

          if (usage) {
            usage.usageType = 'compound-member';
            usage.jsxElements?.push(path.node);

            // Track member names
            if (!usage.members) {
              usage.members = [];
            }
            if (!usage.members.includes(member)) {
              usage.members.push(member);
            }
          }
        }
      }
    },
  });

  // Return array of usage information
  return Array.from(usageMap.values());
}

/**
 * Extract namespace and member from JSX member expression
 *
 * @param node - JSX member expression node
 * @returns Namespace and member names
 */
function extractMemberExpression(node: t.JSXMemberExpression): {
  namespace: string | null;
  member: string;
} {
  let member = '';
  let current: t.JSXMemberExpression | t.JSXIdentifier = node;

  // Build member path from right to left: TimeRange.Root.Track → ['Track', 'Root']
  const parts: string[] = [];

  while (t.isJSXMemberExpression(current)) {
    if (t.isJSXIdentifier(current.property)) {
      parts.unshift(current.property.name);
    }
    current = current.object as t.JSXMemberExpression | t.JSXIdentifier;
  }

  // Get namespace (leftmost identifier)
  const namespace = t.isJSXIdentifier(current) ? current.name : null;

  // Get member (join all parts): Root.Track
  member = parts.join('.');

  return { namespace, member };
}
