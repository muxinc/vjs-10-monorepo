import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';
import { toCustomElementName, toAttributeName } from './utils/naming.js';

const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Transforms a JSX AST to match HTML custom element patterns
 */
export function transformJSXToHTML(jsxElement: t.JSXElement): t.JSXElement {
  // Clone the JSX element to avoid mutating the original
  const cloned = t.cloneNode(jsxElement, true, true);

  // Traverse and transform all JSX nodes
  traverse(
    t.file(t.program([t.expressionStatement(cloned)])),
    {
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const closingElement = path.node.closingElement;

        // Transform the opening element name
        transformElementName(openingElement.name);

        // Transform the closing element name if it exists
        if (closingElement) {
          transformElementName(closingElement.name);
        }

        // Transform attributes
        openingElement.attributes.forEach((attr) => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            const newName = toAttributeName(attr.name.name);
            attr.name.name = newName;
          }
        });

        // Convert self-closing to explicit closing
        if (openingElement.selfClosing) {
          openingElement.selfClosing = false;
          if (!closingElement) {
            path.node.closingElement = t.jsxClosingElement(
              t.cloneNode(openingElement.name)
            );
          }
        }
      },

      JSXExpressionContainer(path) {
        // Replace {children} with <slot name="media" slot="media"></slot>
        if (
          t.isIdentifier(path.node.expression) &&
          path.node.expression.name === 'children'
        ) {
          const slotElement = t.jsxElement(
            t.jsxOpeningElement(
              t.jsxIdentifier('slot'),
              [
                t.jsxAttribute(
                  t.jsxIdentifier('name'),
                  t.stringLiteral('media')
                ),
                t.jsxAttribute(
                  t.jsxIdentifier('slot'),
                  t.stringLiteral('media')
                ),
              ],
              false
            ),
            t.jsxClosingElement(t.jsxIdentifier('slot')),
            [],
            false
          );

          path.replaceWith(slotElement);
        }
      },
    },
    undefined,
    {} as any
  );

  return cloned;
}

/**
 * Transforms a JSX element name (identifier or member expression)
 * to the corresponding HTML custom element name
 */
function transformElementName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
): void {
  if (t.isJSXIdentifier(name)) {
    // Simple identifier: PlayButton → media-play-button
    const htmlName = toCustomElementName(name.name);
    name.name = htmlName;
  } else if (t.isJSXMemberExpression(name)) {
    // Member expression: TimeRange.Root → media-time-range-root
    const fullName = getFullMemberExpressionName(name);
    const htmlName = toCustomElementName(fullName);

    // Replace the member expression with a simple identifier
    Object.assign(name, t.jsxIdentifier(htmlName));
  }
  // JSXNamespacedName is not typically used in React, so we ignore it
}

/**
 * Converts a JSXMemberExpression to a dotted string
 * Example: TimeRange.Root → "TimeRange.Root"
 */
function getFullMemberExpressionName(expr: t.JSXMemberExpression): string {
  const parts: string[] = [];

  function traverse(node: t.JSXMemberExpression | t.JSXIdentifier): void {
    if (t.isJSXIdentifier(node)) {
      parts.unshift(node.name);
    } else if (t.isJSXMemberExpression(node)) {
      parts.push(node.property.name);
      traverse(node.object);
    }
  }

  traverse(expr);
  return parts.join('.');
}
