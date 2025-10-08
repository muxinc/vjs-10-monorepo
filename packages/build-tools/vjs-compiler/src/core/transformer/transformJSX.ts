/**
 * Transform JSX from React to web component HTML
 */

import * as t from '@babel/types';
import type { StyleKeyUsage } from '../../types.js';
import { projectStyleSelector } from '../projection/projectStyleSelector.js';
import { toKebabCase } from './transformPaths.js';

/**
 * Transform JSX element to web component HTML
 *
 * Transformations:
 * - Element names: PlayButton → media-play-button
 * - Attributes: className → class (or remove if Component Selector ID)
 * - Children: {children} → <slot name="media" slot="media"></slot>
 * - Self-closing → explicit closing tags
 *
 * @param jsx - JSX element
 * @param categorizedStyleKeys - Categorized style keys for projection
 * @returns Transformed JSX (modified in place)
 */
export function transformJSX(
  jsx: t.JSXElement,
  categorizedStyleKeys?: StyleKeyUsage[]
): t.JSXElement {
  // Transform opening element
  transformJSXElementName(jsx.openingElement);

  // Transform closing element (if not self-closing)
  if (jsx.closingElement) {
    transformJSXElementName(jsx.closingElement);
  }

  // Transform attributes (with style key categorization)
  transformJSXAttributes(jsx.openingElement, categorizedStyleKeys);

  // Transform children
  transformJSXChildren(jsx);

  // Ensure not self-closing (web components need explicit close tags)
  jsx.openingElement.selfClosing = false;

  // Recursively transform child JSX elements
  for (const child of jsx.children) {
    if (t.isJSXElement(child)) {
      transformJSX(child, categorizedStyleKeys);
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
    const firstChar = name.name[0];
    // Check if it's a component (starts with uppercase)
    if (firstChar && firstChar === firstChar.toUpperCase()) {
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
 * - className → class (or remove if Component Selector ID)
 * - className={styles.Container} → class="container" (kebab-case, if needed)
 * - camelCase → kebab-case (for web components)
 *
 * @param opening - JSX opening element
 * @param categorizedStyleKeys - Categorized style keys for projection
 */
function transformJSXAttributes(
  opening: t.JSXOpeningElement,
  categorizedStyleKeys?: StyleKeyUsage[]
): void {
  // Build map of style keys to their projection
  const styleKeyMap = new Map<string, StyleKeyUsage>();
  if (categorizedStyleKeys) {
    for (const styleKey of categorizedStyleKeys) {
      styleKeyMap.set(styleKey.key, styleKey);
    }
  }

  // Track attributes to remove
  const attributesToRemove: number[] = [];

  for (let i = 0; i < opening.attributes.length; i++) {
    const attr = opening.attributes[i];
    if (!attr || !t.isJSXAttribute(attr)) continue;

    const name = attr.name;
    if (!t.isJSXIdentifier(name)) continue;

    // className → class (or remove)
    if (name.name === 'className') {
      // Transform className value
      // Phase 3: Use categorization to determine if class attribute is needed
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;

        // Handle styles.Container pattern
        if (t.isMemberExpression(expr) && t.isIdentifier(expr.object) && expr.object.name === 'styles') {
          if (t.isIdentifier(expr.property)) {
            const styleKey = styleKeyMap.get(expr.property.name);

            if (styleKey) {
              const projection = projectStyleSelector(styleKey);

              if (!projection.needsClassAttribute) {
                // Component Selector ID - remove class attribute
                attributesToRemove.push(i);
                continue;
              }

              // Type/Generic Selector - keep class attribute with projected className
              if (projection.className) {
                attr.value = t.stringLiteral(projection.className);
                name.name = 'class';
              }
            } else {
              // No categorization found - fallback to kebab-case
              const className = toKebabCase(expr.property.name);
              attr.value = t.stringLiteral(className);
              name.name = 'class';
            }
          }
        } else {
          // Not a styles.X pattern - just rename to class
          name.name = 'class';
        }
      } else {
        // Static className - just rename to class
        name.name = 'class';
      }
    }
    // TODO: Transform other camelCase attributes to kebab-case if needed
  }

  // Remove attributes that don't need class
  for (let i = attributesToRemove.length - 1; i >= 0; i--) {
    const index = attributesToRemove[i];
    if (index !== undefined) {
      opening.attributes.splice(index, 1);
    }
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
