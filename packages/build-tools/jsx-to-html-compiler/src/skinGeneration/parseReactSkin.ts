import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';
import type { SkinMetadata, ImportInfo } from './types.js';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Parse a React skin component and extract metadata
 *
 * Extracts:
 * - JSX return value
 * - Import statements
 * - Styles reference
 * - Component name
 *
 * @param source - React/TSX source code
 * @returns Skin metadata or null if no valid component found
 */
export function parseReactSkin(source: string): SkinMetadata | null {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let jsxElement: t.JSXElement | null = null;
  let componentName: string | null = null;
  const imports: ImportInfo[] = [];
  let stylesNode: t.Node | null = null;
  let stylesIdentifierName: string | null = null;

  traverse(ast, {
    // Collect imports
    ImportDeclaration(path: any) {
      const source = path.node.source.value;
      const specifiers: string[] = [];
      let isDefault = false;

      for (const spec of path.node.specifiers) {
        if (t.isImportDefaultSpecifier(spec)) {
          specifiers.push(spec.local.name);
          isDefault = true;
        } else if (t.isImportSpecifier(spec)) {
          const imported = t.isIdentifier(spec.imported)
            ? spec.imported.name
            : spec.imported.value;
          specifiers.push(imported);
        }
      }

      imports.push({ source, specifiers, isDefault });

      // Track styles import
      if (
        source.includes('styles') ||
        source.endsWith('.css') ||
        source.endsWith('.module.css')
      ) {
        const defaultSpec = path.node.specifiers.find((s: any) =>
          t.isImportDefaultSpecifier(s)
        );
        if (defaultSpec) {
          stylesIdentifierName = defaultSpec.local.name;
        }
      }
    },

    // Find the exported component
    ExportDefaultDeclaration(path: any) {
      const declaration = path.node.declaration;

      // export default function ComponentName() { ... }
      if (t.isFunctionDeclaration(declaration) && declaration.id) {
        componentName = declaration.id.name;
        jsxElement = extractJSXFromFunction(declaration);
      }
      // export default ComponentName (identifier reference)
      else if (t.isIdentifier(declaration)) {
        componentName = declaration.name;
        // Look for the function/variable with this name
        const binding = path.scope.getBinding(declaration.name);
        if (binding) {
          const bindingPath = binding.path;
          if (bindingPath.isFunctionDeclaration()) {
            jsxElement = extractJSXFromFunction(bindingPath.node);
          } else if (bindingPath.isVariableDeclarator()) {
            const init = bindingPath.node.init;
            if (
              t.isArrowFunctionExpression(init) ||
              t.isFunctionExpression(init)
            ) {
              jsxElement = extractJSXFromFunction(init);
            }
          }
        }
      }
      // export default () => { ... } or export default function() { ... }
      else if (
        t.isArrowFunctionExpression(declaration) ||
        t.isFunctionExpression(declaration)
      ) {
        // Use a default name if no name is found
        componentName = 'AnonymousSkin';
        jsxElement = extractJSXFromFunction(declaration);
      }
    },

    // export const ComponentName = () => { ... }
    ExportNamedDeclaration(path: any) {
      if (!componentName && path.node.declaration) {
        const declaration = path.node.declaration;

        if (t.isVariableDeclaration(declaration)) {
          for (const declarator of declaration.declarations) {
            if (
              t.isIdentifier(declarator.id) &&
              (t.isArrowFunctionExpression(declarator.init) ||
                t.isFunctionExpression(declarator.init))
            ) {
              componentName = declarator.id.name;
              jsxElement = extractJSXFromFunction(declarator.init);
              break;
            }
          }
        } else if (
          t.isFunctionDeclaration(declaration) &&
          declaration.id
        ) {
          componentName = declaration.id.name;
          jsxElement = extractJSXFromFunction(declaration);
        }
      }
    },

    // Track styles object if defined inline
    VariableDeclarator(path: any) {
      if (
        stylesIdentifierName &&
        t.isIdentifier(path.node.id) &&
        path.node.id.name === stylesIdentifierName
      ) {
        stylesNode = path.node.init;
      }
    },
  });

  if (!jsxElement || !componentName) {
    return null;
  }

  return {
    jsx: jsxElement,
    imports,
    stylesNode,
    componentName,
  };
}

/**
 * Extract JSX element from a function
 */
function extractJSXFromFunction(
  func:
    | t.FunctionDeclaration
    | t.FunctionExpression
    | t.ArrowFunctionExpression
): t.JSXElement | null {
  // Arrow function with implicit return: () => <div />
  if (t.isArrowFunctionExpression(func) && t.isJSXElement(func.body)) {
    return func.body;
  }

  // Function with block body
  if (t.isBlockStatement(func.body)) {
    for (const statement of func.body.body) {
      // return <div />
      if (
        t.isReturnStatement(statement) &&
        statement.argument &&
        t.isJSXElement(statement.argument)
      ) {
        return statement.argument;
      }

      // return (<div />)
      if (
        t.isReturnStatement(statement) &&
        statement.argument &&
        t.isJSXFragment(statement.argument)
      ) {
        // For now, we don't support fragments
        continue;
      }
    }
  }

  return null;
}
