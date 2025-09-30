import * as t from '@babel/types';
import babelGenerate from '@babel/generator';
import type { SerializeOptions, AttributeTransformer } from './types.js';
import { defaultAttributeTransformer } from './attributeTransformer.js';

/**
 * Serializes a JSX AST to an HTML string
 */
export function serializeToHTML(
  jsxElement: t.JSXElement,
  options: SerializeOptions = {}
): string {
  const {
    indent = 0,
    indentSize = 2,
    attributeTransformer = defaultAttributeTransformer,
  } = options;
  return serializeJSXElement(jsxElement, indent, indentSize, attributeTransformer);
}

function serializeJSXElement(
  element: t.JSXElement,
  indent: number,
  indentSize: number,
  attributeTransformer: AttributeTransformer
): string {
  const openingElement = element.openingElement;
  const children = element.children;

  const indentStr = ' '.repeat(indent);
  const childIndentStr = ' '.repeat(indent + indentSize);

  // Serialize opening tag
  let html = `${indentStr}<${getElementName(openingElement.name)}`;

  // Serialize attributes
  for (const attr of openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      html += serializeAttribute(attr, attributeTransformer);
    } else if (t.isJSXSpreadAttribute(attr)) {
      // Skip spread attributes for now
      // In the future, we might want to handle these differently
    }
  }

  // Check if element has children
  const hasChildren = children.length > 0;
  const hasSignificantChildren = children.some(
    (child) =>
      t.isJSXElement(child) ||
      t.isJSXExpressionContainer(child) ||
      (t.isJSXText(child) && child.value.trim() !== '')
  );

  if (!hasChildren || !hasSignificantChildren) {
    // Self-closing or empty element
    html += `></${getElementName(openingElement.name)}>`;
  } else {
    html += '>';

    // Serialize children
    let hasComplexChildren = false;
    const serializedChildren: string[] = [];

    for (const child of children) {
      if (t.isJSXElement(child)) {
        hasComplexChildren = true;
        serializedChildren.push(
          serializeJSXElement(child, indent + indentSize, indentSize, attributeTransformer)
        );
      } else if (t.isJSXText(child)) {
        const text = child.value.trim();
        if (text) {
          serializedChildren.push(`${childIndentStr}${text}`);
        }
      } else if (t.isJSXExpressionContainer(child)) {
        // Skip JSX comments: {/* comment */}
        if (t.isJSXEmptyExpression(child.expression)) {
          continue;
        }
        // This shouldn't happen after transformation, but handle it just in case
        const generated = babelGenerate as any;
        const exprCode = (generated.default || generated)(child.expression).code;
        serializedChildren.push(`${childIndentStr}{${exprCode}}`);
      }
    }

    if (hasComplexChildren) {
      html += '\n';
      html += serializedChildren.join('\n');
      html += '\n';
      html += `${indentStr}</${getElementName(openingElement.name)}>`;
    } else {
      // Inline text content
      html += serializedChildren.join('').trim();
      html += `</${getElementName(openingElement.name)}>`;
    }
  }

  return html;
}

function serializeAttribute(
  attr: t.JSXAttribute,
  attributeTransformer: AttributeTransformer
): string {
  const name = t.isJSXIdentifier(attr.name)
    ? attr.name.name
    : t.isJSXNamespacedName(attr.name)
      ? `${attr.name.namespace.name}:${attr.name.name.name}`
      : '';

  // Use the attribute transformer to get the value
  const transformedValue = attributeTransformer(name, attr.value);

  // If transformer returns null, omit the attribute
  if (transformedValue === null) {
    return '';
  }

  // If transformer returns empty string, it's a boolean attribute
  if (transformedValue === '') {
    return ` ${name}`;
  }

  // Otherwise, serialize as name="value"
  return ` ${name}="${transformedValue}"`;
}

function getElementName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName
): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }

  if (t.isJSXNamespacedName(name)) {
    return `${name.namespace.name}:${name.name.name}`;
  }

  // This shouldn't happen after transformation, but handle it
  return 'unknown';
}
