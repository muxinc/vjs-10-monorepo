/**
 * Extract styles object from Babel AST node
 * Converts AST ObjectExpression to plain JavaScript object
 */

import * as t from '@babel/types';

/**
 * Extract a styles object from a Babel AST node
 *
 * @param node - AST node (typically from stylesNode in ParsedReactSource)
 * @returns Plain object mapping style keys to Tailwind class strings, or null if extraction fails
 *
 * @example
 * // Input AST represents:
 * // { Button: 'flex px-4', Icon: 'w-6 h-6' }
 * // Output:
 * // { Button: 'flex px-4', Icon: 'w-6 h-6' }
 */
export function extractStylesObject(node: t.Node | null): Record<string, string> | null {
  if (!node) {
    return null;
  }

  // Handle direct object expression
  if (t.isObjectExpression(node)) {
    return extractFromObjectExpression(node);
  }

  // Handle variable declaration: const styles = { ... }
  if (t.isVariableDeclarator(node) && node.init) {
    return extractStylesObject(node.init);
  }

  // Handle call expression with object argument: Object.freeze({ ... })
  if (t.isCallExpression(node) && node.arguments.length > 0) {
    return extractStylesObject(node.arguments[0] as t.Node);
  }

  // Handle 'as const' assertion: { ... } as const
  if (t.isTSAsExpression(node)) {
    return extractStylesObject(node.expression);
  }

  // Handle type assertion: <const>{ ... }
  if (t.isTSTypeAssertion(node)) {
    return extractStylesObject(node.expression);
  }

  return null;
}

/**
 * Extract key-value pairs from an ObjectExpression
 */
function extractFromObjectExpression(node: t.ObjectExpression): Record<string, string> | null {
  const result: Record<string, string> = {};

  for (const prop of node.properties) {
    // Skip spread elements
    if (!t.isObjectProperty(prop)) {
      continue;
    }

    // Get the key name
    let key: string | null = null;
    if (t.isIdentifier(prop.key)) {
      key = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      key = prop.key.value;
    }

    if (!key) {
      continue;
    }

    // Get the value
    let value: string | null = null;
    if (t.isStringLiteral(prop.value)) {
      value = prop.value.value;
    } else if (t.isTemplateLiteral(prop.value)) {
      // Handle template literals: `flex px-4`
      value = extractFromTemplateLiteral(prop.value);
    } else if (t.isCallExpression(prop.value)) {
      // Handle function calls like cn('flex', 'px-4')
      value = extractFromCallExpression(prop.value);
    }

    if (value !== null) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract string value from a template literal
 * For simple cases with no interpolation
 */
function extractFromTemplateLiteral(node: t.TemplateLiteral): string | null {
  // Only handle simple template literals without expressions
  if (node.expressions.length === 0 && node.quasis.length === 1) {
    return node.quasis[0]?.value.raw ?? null;
  }

  // For complex template literals, concatenate all parts
  // This handles cases like `${'flex'} px-4`
  let result = '';
  for (let i = 0; i < node.quasis.length; i++) {
    result += node.quasis[i]?.value.raw ?? '';
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      if (expr && t.isStringLiteral(expr)) {
        result += expr.value;
      } else {
        // Can't statically extract dynamic expressions
        return null;
      }
    }
  }
  return result;
}

/**
 * Extract string value from a function call expression
 * Handles utility functions like cn('flex', 'px-4') or clsx(...)
 */
function extractFromCallExpression(node: t.CallExpression): string | null {
  // Collect all string arguments
  const parts: string[] = [];

  for (const arg of node.arguments) {
    if (t.isStringLiteral(arg)) {
      parts.push(arg.value);
    } else if (t.isTemplateLiteral(arg)) {
      const value = extractFromTemplateLiteral(arg);
      if (value) {
        parts.push(value);
      }
    }
    // Skip non-string arguments (conditionals, objects, etc.)
  }

  return parts.length > 0 ? parts.join(' ') : null;
}
