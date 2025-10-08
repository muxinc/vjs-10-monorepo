/**
 * Transform JSX from React to web component HTML
 */

import * as t from '@babel/types';
import { toKebabCase } from './transformPaths.js';

/**
 * Transform JSX element to web component HTML
 *
 * Transformations:
 * - Element names: PlayButton → media-play-button
 * - Attributes: className → class
 * - Children: {children} → <slot name="media" slot="media"></slot>
 * - Self-closing → explicit closing tags
 *
 * @param jsx - JSX element
 * @returns Transformed JSX (modified in place)
 */
export function transformJSX(jsx: t.JSXElement): t.JSXElement {
  // Transform opening element
  transformJSXElementName(jsx.openingElement);

  // Transform closing element (if not self-closing)
  if (jsx.closingElement) {
    transformJSXElementName(jsx.closingElement);
  }

  // Transform attributes
  transformJSXAttributes(jsx.openingElement);

  // Transform children
  transformJSXChildren(jsx);

  // Ensure not self-closing (web components need explicit close tags)
  jsx.openingElement.selfClosing = false;

  // Recursively transform child JSX elements
  for (const child of jsx.children) {
    if (t.isJSXElement(child)) {
      transformJSX(child);
    }
  }

  return jsx;
}

/**
 * Transform JSX element name
 *
 * - Component names → web component names (PlayButton → media-play-button)
 * - Built-in elements → preserve (div, span, etc.)
 *
 * @param element - JSX opening or closing element
 */
function transformJSXElementName(element: t.JSXOpeningElement | t.JSXClosingElement): void {
  const name = element.name;

  // Handle simple identifiers (PlayButton, div, etc.)
  if (t.isJSXIdentifier(name)) {
    // Check if it's a component (starts with uppercase)
    if (name.name[0] === name.name[0].toUpperCase()) {
      // Transform to web component name
      const kebabName = toKebabCase(name.name);
      const webComponentName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;
      name.name = webComponentName;
    }
    // Built-in elements (div, span) - no transformation needed
  }
  // TODO: Handle member expressions (TimeRange.Root) in Phase 12
}

/**
 * Transform JSX attributes
 *
 * - className → class
 * - className={styles.Container} → class="container" (kebab-case)
 * - camelCase → kebab-case (for web components)
 *
 * @param opening - JSX opening element
 */
function transformJSXAttributes(opening: t.JSXOpeningElement): void {
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr)) continue;

    const name = attr.name;
    if (!t.isJSXIdentifier(name)) continue;

    // className → class
    if (name.name === 'className') {
      name.name = 'class';

      // Transform className value
      // Phase 1: Convert {styles.Container} → "container" (kebab-case)
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;

        // Handle styles.Container pattern
        if (t.isMemberExpression(expr) && t.isIdentifier(expr.object) && expr.object.name === 'styles') {
          if (t.isIdentifier(expr.property)) {
            // Convert Container → container
            const className = toKebabCase(expr.property.name);
            attr.value = t.stringLiteral(className);
          }
        }
      }
    }
    // TODO: Transform other camelCase attributes to kebab-case if needed
  }
}

/**
 * Transform JSX children
 *
 * Special case: Replace {children} with <slot>
 *
 * @param jsx - JSX element
 */
function transformJSXChildren(jsx: t.JSXElement): void {
  const newChildren: Array<t.JSXElement | t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXFragment> = [];

  for (const child of jsx.children) {
    // Check for {children} expression
    if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;

      // {children} → <slot>
      if (t.isIdentifier(expr) && expr.name === 'children') {
        // Create <slot name="media" slot="media"></slot>
        const slotElement = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier('slot'), [
            t.jsxAttribute(t.jsxIdentifier('name'), t.stringLiteral('media')),
            t.jsxAttribute(t.jsxIdentifier('slot'), t.stringLiteral('media')),
          ]),
          t.jsxClosingElement(t.jsxIdentifier('slot')),
          [],
          false
        );
        newChildren.push(slotElement);
        continue;
      }
    }

    // Preserve other children
    newChildren.push(child);
  }

  jsx.children = newChildren;
}
