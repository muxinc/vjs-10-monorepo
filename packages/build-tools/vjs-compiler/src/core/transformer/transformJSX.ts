/**
 * Transform JSX from React to web component HTML
 */

import type { StyleKeyUsage } from '../../types.js';

import * as t from '@babel/types';

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
export function transformJSX(jsx: t.JSXElement, categorizedStyleKeys?: StyleKeyUsage[]): t.JSXElement {
  // Transform opening element
  transformJSXElementName(jsx.openingElement);

  // Transform closing element (or create it if self-closing)
  if (jsx.closingElement) {
    transformJSXElementName(jsx.closingElement);
  } else if (jsx.openingElement.selfClosing) {
    // Create closing element for self-closing tags (web components need explicit close tags)
    jsx.closingElement = t.jsxClosingElement(t.cloneNode(jsx.openingElement.name));
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
 * - Compound components → web component names (TimeRange.Root → media-time-range-root)
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
  // Handle member expressions (TimeRange.Root → media-time-range-root)
  else if (t.isJSXMemberExpression(name)) {
    const fullName = flattenMemberExpression(name);
    const kebabName = toKebabCase(fullName);
    const webComponentName = kebabName.startsWith('media-') ? kebabName : `media-${kebabName}`;

    // Replace member expression with identifier
    element.name = t.jsxIdentifier(webComponentName);
  }
}

/**
 * Flatten JSX member expression to a single string
 *
 * Examples:
 * - TimeRange.Root → TimeRangeRoot
 * - TimeRange.Root.Track → TimeRangeRootTrack
 *
 * @param node - JSX member expression
 * @returns Flattened string
 */
function flattenMemberExpression(node: t.JSXMemberExpression): string {
  const parts: string[] = [];
  let current: t.JSXMemberExpression | t.JSXIdentifier = node;

  // Traverse from right to left collecting parts
  while (t.isJSXMemberExpression(current)) {
    if (t.isJSXIdentifier(current.property)) {
      parts.unshift(current.property.name);
    }
    current = current.object as t.JSXMemberExpression | t.JSXIdentifier;
  }

  // Add leftmost identifier (namespace)
  if (t.isJSXIdentifier(current)) {
    parts.unshift(current.name);
  }

  // Join all parts: TimeRange + Root → TimeRangeRoot
  return parts.join('');
}

/**
 * Transform JSX attributes
 *
 * - className → class (or remove if Component Selector ID)
 * - className={styles.Container} → class="container" (kebab-case, if needed)
 * - className={`${styles.A} ${styles.B}`} → class="a b" (resolve template literals)
 * - camelCase → kebab-case (for web components)
 *
 * @param opening - JSX opening element
 * @param categorizedStyleKeys - Categorized style keys for projection
 */
function transformJSXAttributes(opening: t.JSXOpeningElement, categorizedStyleKeys?: StyleKeyUsage[]): void {
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
      if (t.isJSXExpressionContainer(attr.value)) {
        const expr = attr.value.expression;

        // Resolve className expression to static string
        const resolved = resolveClassNameExpression(expr, styleKeyMap);

        if (resolved === null) {
          // Could not resolve or all classes were component selectors (filtered out)
          attributesToRemove.push(i);
          continue;
        }

        // Set resolved class names
        attr.value = t.stringLiteral(resolved);
        name.name = 'class';
      } else if (t.isStringLiteral(attr.value)) {
        // Static className - just rename to class
        name.name = 'class';
      } else {
        // Other value types - just rename to class
        name.name = 'class';
      }
    }
    // Handle other attributes with expression values
    else if (t.isJSXExpressionContainer(attr.value)) {
      const expr = attr.value.expression;

      // Convert simple literal expressions to string literals
      // Examples: delay={200} → delay="200", disabled={true} → disabled="true"
      if (t.isNumericLiteral(expr)) {
        attr.value = t.stringLiteral(String(expr.value));
      } else if (t.isBooleanLiteral(expr)) {
        attr.value = t.stringLiteral(String(expr.value));
      } else if (t.isStringLiteral(expr)) {
        // Already a string literal, just unwrap from expression container
        attr.value = expr;
      }
      // For complex expressions (identifiers, member expressions, etc.), leave as-is
      // These might be dynamic values that need runtime evaluation
    }
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
 * Resolve className expression to static string
 *
 * Handles:
 * - Member expressions: styles.Button → "button"
 * - Template literals: `${styles.A} ${styles.B}` → "a b"
 * - String literals: "static-class" → "static-class"
 * - Filters out Component Selector IDs (they become element selectors)
 *
 * @param expr - Expression to resolve
 * @param styleKeyMap - Map of style keys to their categorization
 * @returns Resolved class names (space-separated) or null if empty/unresolvable
 */
function resolveClassNameExpression(
  expr: t.Expression | t.JSXEmptyExpression,
  styleKeyMap: Map<string, StyleKeyUsage>
): string | null {
  if (t.isJSXEmptyExpression(expr)) {
    return null;
  }

  // Handle member expressions: styles.Button
  if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
    const propertyName = expr.property.name;

    // Check if this is styles.SomeKey
    if (t.isIdentifier(expr.object) && expr.object.name === 'styles') {
      const styleKey = styleKeyMap.get(propertyName);

      if (styleKey) {
        const projection = projectStyleSelector(styleKey);

        if (!projection.needsClassAttribute) {
          // Component Selector ID - filter out (becomes element selector)
          return null;
        }

        // Type/Generic Selector - return projected className
        if (projection.className) {
          return projection.className;
        }
      } else {
        // No categorization found - fallback to kebab-case
        return toKebabCase(propertyName);
      }
    }
  }

  // Handle template literals: `${styles.Button} ${styles.IconButton}`
  if (t.isTemplateLiteral(expr)) {
    const parts: string[] = [];

    for (let i = 0; i < expr.quasis.length; i++) {
      const quasi = expr.quasis[i];
      const quasiValue = quasi?.value.cooked || quasi?.value.raw || '';

      // Add static text (trimmed and split by whitespace)
      const staticParts = quasiValue.trim().split(/\s+/).filter(Boolean);
      parts.push(...staticParts);

      // Add expression value if present
      if (i < expr.expressions.length) {
        const exprValue = resolveClassNameExpression(expr.expressions[i] as t.Expression, styleKeyMap);
        if (exprValue) {
          parts.push(exprValue);
        }
      }
    }

    return parts.length > 0 ? parts.join(' ') : null;
  }

  // Handle string literals
  if (t.isStringLiteral(expr)) {
    return expr.value;
  }

  // Handle conditional expressions: condition ? styles.A : styles.B
  // Take consequent branch (simplification for static compilation)
  if (t.isConditionalExpression(expr)) {
    return resolveClassNameExpression(expr.consequent, styleKeyMap);
  }

  // Handle logical expressions: condition && styles.Class
  if (t.isLogicalExpression(expr)) {
    // Try right side first (usual pattern: condition && styles.Class)
    const right = resolveClassNameExpression(expr.right, styleKeyMap);
    if (right) return right;

    // Fallback to left side
    return resolveClassNameExpression(expr.left, styleKeyMap);
  }

  // Unresolvable expression
  return null;
}

/**
 * Transform JSX children
 *
 * Special cases:
 * - Replace {children} with <slot>
 * - Remove JSX comments and empty expressions
 *
 * @param jsx - JSX element
 */
function transformJSXChildren(jsx: t.JSXElement): void {
  const newChildren: Array<t.JSXElement | t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXFragment> = [];

  for (const child of jsx.children) {
    // Check for expression containers
    if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression;

      // Skip JSX comments (JSXEmptyExpression)
      if (t.isJSXEmptyExpression(expr)) {
        continue;
      }

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
