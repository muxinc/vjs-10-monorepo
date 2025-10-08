/**
 * Extract styles object from styles.ts source
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { StylesObject } from '../../types.js';

/**
 * Extract styles object from styles.ts source
 *
 * Looks for patterns like:
 * - const styles = { key: 'value' }
 * - export default { key: 'value' }
 * - const styles = { key: cn('value') }
 *
 * @param ast - Babel AST of styles.ts
 * @returns Styles object or null if not found
 */
export function extractStyles(ast: t.File): StylesObject | null {
  let stylesObject: StylesObject | null = null;

  traverse(ast, {
    // Look for: export default styles
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      // export default { key: 'value' }
      if (t.isObjectExpression(declaration)) {
        stylesObject = extractStylesFromObjectExpression(declaration);
      }
      // export default styles (identifier)
      else if (t.isIdentifier(declaration)) {
        // Find the variable declaration
        const binding = path.scope.getBinding(declaration.name);
        if (binding?.path.isVariableDeclarator()) {
          const init = (binding.path.node as t.VariableDeclarator).init;
          if (t.isObjectExpression(init)) {
            stylesObject = extractStylesFromObjectExpression(init);
          }
        }
      }

      path.stop();
    },

    // Look for: const styles = { ... }
    VariableDeclarator(path) {
      if (stylesObject) return; // Already found

      const node = path.node;
      if (t.isIdentifier(node.id) && node.id.name === 'styles' && t.isObjectExpression(node.init)) {
        stylesObject = extractStylesFromObjectExpression(node.init);
      }
    },
  });

  return stylesObject;
}

/**
 * Extract key-value pairs from object expression
 */
function extractStylesFromObjectExpression(obj: t.ObjectExpression): StylesObject {
  const styles: StylesObject = {};

  for (const prop of obj.properties) {
    // Skip spread properties
    if (!t.isObjectProperty(prop)) continue;

    // Get key name
    let key: string | null = null;
    if (t.isIdentifier(prop.key)) {
      key = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      key = prop.key.value;
    }

    if (!key) continue;

    // Get value (string literal or call expression like cn('...'))
    const value = extractStyleValue(prop.value);
    if (value) {
      styles[key] = value;
    }
  }

  return styles;
}

/**
 * Extract style value from various node types
 *
 * Handles:
 * - String literals: 'p-2 rounded'
 * - Template literals: `p-2 rounded`
 * - Call expressions: cn('p-2', 'rounded')
 */
function extractStyleValue(node: t.Node): string | null {
  // String literal: 'p-2 rounded'
  if (t.isStringLiteral(node)) {
    return node.value;
  }

  // Template literal: `p-2 rounded` (no interpolation)
  if (t.isTemplateLiteral(node)) {
    if (node.expressions.length === 0 && node.quasis.length === 1) {
      const quasi = node.quasis[0];
      return quasi?.value.cooked ?? quasi?.value.raw ?? null;
    }
    // For now, skip template literals with interpolation
    return null;
  }

  // Call expression: cn('p-2', 'rounded')
  if (t.isCallExpression(node)) {
    return extractStyleValueFromCallExpression(node);
  }

  return null;
}

/**
 * Extract style value from call expression (e.g. cn(...))
 *
 * The cn() helper is commonly used to merge multiple class strings.
 * We'll extract and join all string arguments.
 */
function extractStyleValueFromCallExpression(call: t.CallExpression): string | null {
  const values: string[] = [];

  for (const arg of call.arguments) {
    // Skip spread arguments
    if (t.isSpreadElement(arg)) continue;

    const value = extractStyleValue(arg);
    if (value) {
      values.push(value);
    }
  }

  return values.length > 0 ? values.join(' ') : null;
}
