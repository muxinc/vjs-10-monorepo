/**
 * JSX to HTML Web Component Transformer
 *
 * Transforms React JSX to HTML web component markup:
 * - <PlayButton> → <media-play-button>
 * - <TimeSlider.Root> → <media-time-slider-root>
 * - className → class
 * - {children} → <slot name="media" slot="media"></slot>
 */

import type * as BabelTypes from '@babel/types';
import type {
  TransformConfig,
  TransformResult,
} from './types';

const DEFAULT_CONFIG: Required<TransformConfig> = {
  elementPrefix: 'media-',
  builtInElements: new Set([
    'div',
    'span',
    'button',
    'a',
    'img',
    'video',
    'audio',
    'ul',
    'ol',
    'li',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'label',
    'input',
    'textarea',
    'select',
    'option',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'svg',
    'path',
    'circle',
    'rect',
    'line',
    'polyline',
    'polygon',
  ]),
};

/**
 * Transform JSX element to HTML string
 */
export function transformJSX(
  element: BabelTypes.JSXElement,
  t: typeof BabelTypes,
  config: TransformConfig = {},
): TransformResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const classNames = new Set<string>();

  const html = transformElement(element, t, cfg, classNames);

  return { html, classNames };
}

/**
 * Transform a single JSX element
 */
function transformElement(
  element: BabelTypes.JSXElement,
  t: typeof BabelTypes,
  config: Required<TransformConfig>,
  classNames: Set<string>,
): string {
  const elementName = getElementName(element.openingElement.name, t, config);
  const attributes = transformAttributes(element.openingElement.attributes, t, classNames);
  const children = transformChildren(element.children, t, config, classNames);

  // Self-closing elements
  if (element.openingElement.selfClosing && children.trim() === '') {
    return `<${elementName}${attributes}></${elementName}>`;
  }

  return `<${elementName}${attributes}>${children}</${elementName}>`;
}

/**
 * Get element name, transforming custom elements to web component names
 */
function getElementName(
  name: BabelTypes.JSXIdentifier | BabelTypes.JSXMemberExpression | BabelTypes.JSXNamespacedName,
  t: typeof BabelTypes,
  config: Required<TransformConfig>,
): string {
  if (t.isJSXIdentifier(name)) {
    const elementName = name.name;

    // Built-in elements pass through unchanged
    if (config.builtInElements.has(elementName.toLowerCase())) {
      return elementName.toLowerCase();
    }

    // Custom elements: PascalCase → kebab-case with prefix
    const kebab = pascalToKebab(elementName);
    // Don't double-prefix if already has prefix
    if (kebab.startsWith(config.elementPrefix.replace(/-$/, ''))) {
      return kebab;
    }
    return config.elementPrefix + kebab;
  }

  if (t.isJSXMemberExpression(name)) {
    // Flatten member expressions: TimeSlider.Root → TimeSliderRoot
    const flattened = flattenMemberExpression(name, t);
    return config.elementPrefix + pascalToKebab(flattened);
  }

  // Fallback
  return 'unknown';
}

/**
 * Flatten JSX member expression to single name
 * TimeSlider.Root → TimeSliderRoot
 */
function flattenMemberExpression(
  expr: BabelTypes.JSXMemberExpression,
  t: typeof BabelTypes,
): string {
  const parts: string[] = [];

  function collect(node: BabelTypes.JSXIdentifier | BabelTypes.JSXMemberExpression | BabelTypes.JSXNamespacedName) {
    if (t.isJSXIdentifier(node)) {
      parts.unshift(node.name);
    } else if (t.isJSXMemberExpression(node)) {
      collect(node.property);
      collect(node.object);
    }
  }

  collect(expr);
  return parts.join('');
}

/**
 * Convert PascalCase to kebab-case
 */
function pascalToKebab(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Transform JSX attributes to HTML attributes
 */
function transformAttributes(
  attributes: Array<BabelTypes.JSXAttribute | BabelTypes.JSXSpreadAttribute>,
  t: typeof BabelTypes,
  classNames: Set<string>,
): string {
  const attrs: string[] = [];

  for (const attr of attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      // Skip spread attributes for now
      continue;
    }

    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const name = attr.name.name;
      const value = attr.value;

      // Handle className → class
      if (name === 'className') {
        if (value && (t.isStringLiteral(value) || t.isJSXExpressionContainer(value))) {
          const classValue = extractClassName(value, t, classNames);
          if (classValue) {
            attrs.push(`class="${classValue}"`);
          }
        }
        continue;
      }

      // Convert camelCase to kebab-case
      const attrName = camelToKebab(name);

      // No value (boolean attribute)
      if (value === null) {
        attrs.push(attrName);
        continue;
      }

      // String literal
      if (t.isStringLiteral(value)) {
        attrs.push(`${attrName}="${value.value}"`);
        continue;
      }

      // Expression container
      if (t.isJSXExpressionContainer(value)) {
        const exprValue = extractExpressionValue(value.expression, t);
        if (exprValue !== null) {
          attrs.push(`${attrName}="${exprValue}"`);
        }
        continue;
      }
    }
  }

  return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

/**
 * Extract className value and add to classNames set
 */
function extractClassName(
  value: BabelTypes.StringLiteral | BabelTypes.JSXExpressionContainer | null,
  t: typeof BabelTypes,
  classNames: Set<string>,
): string | null {
  if (value === null) return null;

  if (t.isStringLiteral(value)) {
    const classes = value.value.split(/\s+/).filter(Boolean);
    classes.forEach(cls => classNames.add(cls));
    return value.value;
  }

  if (t.isJSXExpressionContainer(value)) {
    // For now, just extract identifiers and member expressions
    // TODO: Handle template literals, conditionals, etc.
    const expr = value.expression;

    if (t.isIdentifier(expr)) {
      // This would be a styles reference, but we don't resolve it yet
      // Just use the identifier name as a class
      const className = camelToKebab(expr.name);
      classNames.add(className);
      return className;
    }

    if (t.isMemberExpression(expr)) {
      // styles.Button → button
      if (t.isIdentifier(expr.property)) {
        const className = camelToKebab(expr.property.name);
        classNames.add(className);
        return className;
      }
    }
  }

  return null;
}

/**
 * Extract value from expression for attribute
 */
function extractExpressionValue(
  expr: BabelTypes.Expression | BabelTypes.JSXEmptyExpression,
  t: typeof BabelTypes,
): string | null {
  if (t.isNumericLiteral(expr)) {
    return String(expr.value);
  }

  if (t.isBooleanLiteral(expr)) {
    return String(expr.value);
  }

  if (t.isStringLiteral(expr)) {
    return expr.value;
  }

  if (t.isNullLiteral(expr)) {
    return null;
  }

  // For other expressions, we can't easily resolve at compile time
  return null;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Transform children nodes
 */
function transformChildren(
  children: Array<BabelTypes.JSXElement | BabelTypes.JSXFragment | BabelTypes.JSXText | BabelTypes.JSXExpressionContainer | BabelTypes.JSXSpreadChild>,
  t: typeof BabelTypes,
  config: Required<TransformConfig>,
  classNames: Set<string>,
): string {
  const transformed: string[] = [];

  for (const child of children) {
    if (t.isJSXElement(child)) {
      transformed.push(transformElement(child, t, config, classNames));
    } else if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        transformed.push(text);
      }
    } else if (t.isJSXExpressionContainer(child)) {
      // Handle {children} → <slot>
      if (t.isIdentifier(child.expression) && child.expression.name === 'children') {
        transformed.push('<slot name="media" slot="media"></slot>');
      }
      // TODO: Handle other expressions
    }
    // Skip JSXFragment, JSXSpreadChild for now
  }

  return transformed.join('');
}
