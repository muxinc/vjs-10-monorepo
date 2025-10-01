import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';
import type { ParseConfig, ParsedReactSource, ImportInfo } from './types.js';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Unified parser for React source code with configurable extraction
 *
 * @param source - React/TSX source code
 * @param config - Configuration specifying what to extract
 * @returns Parsed source with extracted data based on config
 */
export function parseReactSource(
  source: string,
  config: ParseConfig = {}
): ParsedReactSource {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const result: ParsedReactSource = { ast };

  // Initialize extraction state based on config
  let jsxElement: t.JSXElement | null = null;
  let componentName: string | null = null;
  const imports: ImportInfo[] = [];
  let stylesNode: t.Node | null = null;
  let stylesIdentifierName: string | null = null;

  // Single traversal - conditionally extract based on config
  traverse(ast, {
    // Extract imports if requested
    ImportDeclaration(path: any) {
      if (config.extractImports || config.extractStyles) {
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

        if (config.extractImports) {
          imports.push({ source, specifiers, isDefault });
        }

        // Track styles import
        if (
          config.extractStyles &&
          (source.includes('styles') ||
            source.endsWith('.css') ||
            source.endsWith('.module.css'))
        ) {
          const defaultSpec = path.node.specifiers.find((s: any) =>
            t.isImportDefaultSpecifier(s)
          );
          if (defaultSpec) {
            stylesIdentifierName = defaultSpec.local.name;
          }
        }
      }
    },

    // Extract component name and/or JSX from default exports
    ExportDefaultDeclaration(path: any) {
      const declaration = path.node.declaration;

      // export default function ComponentName() { ... }
      if (t.isFunctionDeclaration(declaration) && declaration.id) {
        if (config.extractComponentName) {
          componentName = declaration.id.name;
        }
        if (config.extractJSX) {
          jsxElement = extractJSXFromFunction(declaration);
        }
      }
      // export default ComponentName (identifier reference)
      else if (t.isIdentifier(declaration)) {
        if (config.extractComponentName) {
          componentName = declaration.name;
        }
        if (config.extractJSX) {
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
      }
      // export default () => { ... } or export default function() { ... }
      else if (
        t.isArrowFunctionExpression(declaration) ||
        t.isFunctionExpression(declaration)
      ) {
        if (config.extractComponentName) {
          componentName = 'AnonymousSkin';
        }
        if (config.extractJSX) {
          jsxElement = extractJSXFromFunction(declaration);
        }
      }
    },

    // Extract component name and/or JSX from named exports
    ExportNamedDeclaration(path: any) {
      if (
        (config.extractComponentName || config.extractJSX) &&
        !componentName &&
        path.node.declaration
      ) {
        const declaration = path.node.declaration;

        if (t.isVariableDeclaration(declaration)) {
          for (const declarator of declaration.declarations) {
            if (
              t.isIdentifier(declarator.id) &&
              (t.isArrowFunctionExpression(declarator.init) ||
                t.isFunctionExpression(declarator.init))
            ) {
              if (config.extractComponentName) {
                componentName = declarator.id.name;
              }
              if (config.extractJSX) {
                jsxElement = extractJSXFromFunction(declarator.init);
              }
              break;
            }
          }
        } else if (
          t.isFunctionDeclaration(declaration) &&
          declaration.id
        ) {
          if (config.extractComponentName) {
            componentName = declaration.id.name;
          }
          if (config.extractJSX) {
            jsxElement = extractJSXFromFunction(declaration);
          }
        }
      }
    },

    // Extract JSX from arrow function expressions (for simple components)
    ArrowFunctionExpression(path: any) {
      if (config.extractJSX && !jsxElement) {
        const body = path.node.body;

        // Implicit return with JSX expression: (props) => <JSX />
        if (t.isJSXElement(body)) {
          jsxElement = body;
          path.stop();
        }
        // Block statement with explicit return: (props) => { return <JSX /> }
        else if (t.isBlockStatement(body)) {
          const returnStatement = body.body.find((stmt: any) =>
            t.isReturnStatement(stmt)
          );
          if (returnStatement && t.isReturnStatement(returnStatement)) {
            const argument = returnStatement.argument;
            if (argument && t.isJSXElement(argument)) {
              jsxElement = argument;
              path.stop();
            }
          }
        }
      }
    },

    // Extract JSX from function declarations (for simple components)
    FunctionDeclaration(path: any) {
      if (config.extractJSX && !jsxElement && !componentName) {
        const body = path.node.body;
        const returnStatement = body.body.find((stmt: any) =>
          t.isReturnStatement(stmt)
        );
        if (returnStatement && t.isReturnStatement(returnStatement)) {
          const argument = returnStatement.argument;
          if (argument && t.isJSXElement(argument)) {
            jsxElement = argument;
            path.stop();
          }
        }
      }
    },

    // Track styles object if defined inline
    VariableDeclarator(path: any) {
      if (
        config.extractStyles &&
        stylesIdentifierName &&
        t.isIdentifier(path.node.id) &&
        path.node.id.name === stylesIdentifierName
      ) {
        stylesNode = path.node.init;
      }
    },
  });

  // Populate result based on config
  if (config.extractJSX && jsxElement) {
    result.jsx = jsxElement;
  }
  if (config.extractComponentName && componentName) {
    result.componentName = componentName;
  }
  if (config.extractImports) {
    result.imports = imports;
  }
  if (config.extractStyles) {
    result.stylesNode = stylesNode;
    result.stylesIdentifier = stylesIdentifierName;
  }

  return result;
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
