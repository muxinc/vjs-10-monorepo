/**
 * JSX/TSX Parser using Babel
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface ParsedComponent {
  /** Component function name */
  name: string;
  /** JSX return element */
  jsxElement: t.JSXElement | null;
  /** Source code */
  source: string;
}

/**
 * Parse JSX/TSX source code and extract component
 */
export function parseComponent(source: string): ParsedComponent {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let componentName = 'UnknownComponent';
  let jsxElement: t.JSXElement | null = null;

  // Find the default export function and its JSX return
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      if (t.isFunctionDeclaration(declaration) && declaration.id) { // Function declaration
        componentName = declaration.id.name;
        jsxElement = findJSXReturn(declaration.body);
      } else if (t.isArrowFunctionExpression(declaration) || t.isFunctionExpression(declaration)) { // Arrow function / function expression
        // Try to find name from variable declarator if assigned
        const parentPath = path.parentPath;
        if (parentPath && parentPath.isVariableDeclarator()) {
          const id = parentPath.node.id;
          if (t.isIdentifier(id)) {
            componentName = id.name;
          }
        }

        // Extract JSX from body
        if (t.isBlockStatement(declaration.body)) {
          jsxElement = findJSXReturn(declaration.body);
        } else if (t.isJSXElement(declaration.body)) {
          // Direct JSX return
          jsxElement = declaration.body;
        }
      }
    },

    // Also check for named exports in case no default
    FunctionDeclaration(path) {
      if (!jsxElement && path.node.id) {
        componentName = path.node.id.name;
        const foundJSX = findJSXReturn(path.node.body);
        if (foundJSX) {
          jsxElement = foundJSX;
        }
      }
    },
  });

  return {
    name: componentName,
    jsxElement,
    source,
  };
}

/**
 * Find JSX element in return statement
 * Simple recursive search without traverse
 */
function findJSXReturn(body: t.BlockStatement): t.JSXElement | null {
  for (const statement of body.body) {
    if (t.isReturnStatement(statement) && statement.argument) {
      if (t.isJSXElement(statement.argument)) {
        return statement.argument;
      }
    }
  }
  return null;
}

/**
 * Extract component name from file path
 * MediaSkinMinimal.tsx → MediaSkinMinimal
 */
export function getComponentNameFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return fileName.replace(/\.(tsx?|jsx?)$/, '');
}
