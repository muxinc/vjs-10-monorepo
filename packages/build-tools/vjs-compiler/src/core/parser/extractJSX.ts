/**
 * Extract JSX element from React component function
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Extract JSX from default export function component
 *
 * Looks for patterns like:
 * - export default function Component() { return <JSX /> }
 * - export default function Component() { return (<JSX />) }
 * - export default (props) => <JSX />
 * - export default (props) => (<JSX />)
 *
 * @param ast - Babel AST
 * @returns JSX element or null if not found
 */
export function extractJSX(ast: t.File): t.JSXElement | null {
  let jsxElement: t.JSXElement | null = null;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      // Handle function declarations: export default function Component() { ... }
      if (t.isFunctionDeclaration(declaration)) {
        jsxElement = extractJSXFromFunction(declaration);
      }
      // Handle arrow functions: export default () => <JSX />
      else if (t.isArrowFunctionExpression(declaration)) {
        jsxElement = extractJSXFromArrowFunction(declaration);
      }
      // Handle identifiers: export default Component (where Component is defined elsewhere)
      else if (t.isIdentifier(declaration)) {
        // Find the function/arrow function with this name
        const binding = path.scope.getBinding(declaration.name);
        if (binding?.path.isFunctionDeclaration()) {
          jsxElement = extractJSXFromFunction(binding.path.node as t.FunctionDeclaration);
        } else if (binding?.path.isVariableDeclarator()) {
          const init = (binding.path.node as t.VariableDeclarator).init;
          if (t.isArrowFunctionExpression(init)) {
            jsxElement = extractJSXFromArrowFunction(init);
          } else if (t.isFunctionExpression(init)) {
            jsxElement = extractJSXFromFunction(init);
          }
        }
      }

      // Stop traversal once we find the default export
      path.stop();
    },
  });

  return jsxElement;
}

/**
 * Extract JSX from function declaration or expression
 */
function extractJSXFromFunction(
  func: t.FunctionDeclaration | t.FunctionExpression
): t.JSXElement | null {
  const body = func.body;

  // Look for return statement in function body
  if (t.isBlockStatement(body)) {
    for (const statement of body.body) {
      if (t.isReturnStatement(statement) && statement.argument) {
        return extractJSXFromExpression(statement.argument);
      }
    }
  }

  return null;
}

/**
 * Extract JSX from arrow function expression
 */
function extractJSXFromArrowFunction(func: t.ArrowFunctionExpression): t.JSXElement | null {
  const body = func.body;

  // Arrow function with block: () => { return <JSX /> }
  if (t.isBlockStatement(body)) {
    for (const statement of body.body) {
      if (t.isReturnStatement(statement) && statement.argument) {
        return extractJSXFromExpression(statement.argument);
      }
    }
  }
  // Arrow function with expression: () => <JSX />
  else {
    return extractJSXFromExpression(body);
  }

  return null;
}

/**
 * Extract JSX element from expression (handles parens, etc.)
 */
function extractJSXFromExpression(expr: t.Expression): t.JSXElement | null {
  // Direct JSX element
  if (t.isJSXElement(expr)) {
    return expr;
  }

  // Parenthesized expression: (<JSX />)
  if (t.isParenthesizedExpression(expr)) {
    return extractJSXFromExpression(expr.expression);
  }

  // JSX fragment: <><JSX /></>
  // For now, we'll skip fragments, but could handle in future
  if (t.isJSXFragment(expr)) {
    // Could extract first child element if needed
    return null;
  }

  return null;
}

/**
 * Extract component name from default export
 *
 * @param ast - Babel AST
 * @returns Component name or null if not found
 */
export function extractComponentName(ast: t.File): string | null {
  let componentName: string | null = null;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      // export default function ComponentName() { ... }
      if (t.isFunctionDeclaration(declaration) && declaration.id) {
        componentName = declaration.id.name;
      }
      // export default ComponentName (identifier)
      else if (t.isIdentifier(declaration)) {
        componentName = declaration.name;
      }
      // For arrow functions assigned to const, find the variable name
      else if (t.isArrowFunctionExpression(declaration) || t.isFunctionExpression(declaration)) {
        // Look for: const ComponentName = () => ...
        // This is harder to track, so we'll skip for now
        // Might need to look at parent scope
      }

      path.stop();
    },
  });

  return componentName;
}
