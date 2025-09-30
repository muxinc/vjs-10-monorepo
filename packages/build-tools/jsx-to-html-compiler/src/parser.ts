import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Parses a React component file and extracts the JSX return value
 * from the component's function body
 */
export function parseReactComponent(sourceCode: string): t.JSXElement | null {
  // Parse the source code with TypeScript and JSX support
  const ast = parse(sourceCode, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let jsxElement: t.JSXElement | null = null;

  // Traverse the AST to find the JSX return value
  traverse(ast, {
    // Look for arrow function component exports
    // e.g., export const Component: React.FC<Props> = (props) => { return <JSX /> }
    ArrowFunctionExpression(path) {
      const body = path.node.body;

      // Case 1: Implicit return with JSX expression
      // (props) => <JSX />
      if (t.isJSXElement(body) || t.isJSXFragment(body)) {
        if (t.isJSXElement(body)) {
          jsxElement = body;
          path.stop();
        }
        return;
      }

      // Case 2: Block statement with explicit return
      // (props) => { return <JSX /> }
      if (t.isBlockStatement(body)) {
        const returnStatement = body.body.find((stmt) =>
          t.isReturnStatement(stmt)
        );
        if (returnStatement && t.isReturnStatement(returnStatement)) {
          const argument = returnStatement.argument;
          if (argument && (t.isJSXElement(argument) || t.isJSXFragment(argument))) {
            if (t.isJSXElement(argument)) {
              jsxElement = argument;
              path.stop();
            }
          }
        }
      }
    },

    // Also look for regular function declarations/expressions
    // function Component(props) { return <JSX /> }
    FunctionDeclaration(path) {
      const body = path.node.body;
      const returnStatement = body.body.find((stmt) =>
        t.isReturnStatement(stmt)
      );
      if (returnStatement && t.isReturnStatement(returnStatement)) {
        const argument = returnStatement.argument;
        if (argument && (t.isJSXElement(argument) || t.isJSXFragment(argument))) {
          if (t.isJSXElement(argument)) {
            jsxElement = argument;
            path.stop();
          }
        }
      }
    },
  });

  return jsxElement;
}
