import type { AttributeContext, AttributeProcessorPipeline } from './attributeProcessing/index.js';
import type { SerializeOptions } from './types.js';

import babelGenerate from '@babel/generator';
import * as t from '@babel/types';

import { createDefaultPipeline } from './attributeProcessing/index.js';

/**
 * Serializes a JSX AST to an HTML string
 */
export function serializeToHTML(jsxElement: t.JSXElement, options: SerializeOptions = {}): string {
  const { indent = 0, indentSize = 2, attributePipeline, stylesObject, componentMap } = options;

  const pipeline = attributePipeline ?? createDefaultPipeline();

  return serializeJSXElement(jsxElement, indent, indentSize, pipeline, stylesObject, componentMap);
}

function serializeJSXElement(
  element: t.JSXElement,
  indent: number,
  indentSize: number,
  pipeline: AttributeProcessorPipeline,
  stylesObject?: Record<string, string> | null,
  componentMap?: Record<string, string>,
): string {
  const openingElement = element.openingElement;
  const children = element.children;

  const indentStr = ' '.repeat(indent);
  const childIndentStr = ' '.repeat(indent + indentSize);

  // Get element names for attribute context
  const elementName = getElementName(openingElement.name);
  const htmlElementName = elementName; // Already transformed by transformer.ts

  // Serialize opening tag
  let html = `${indentStr}<${htmlElementName}`;

  // Serialize attributes
  for (const attr of openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      html += serializeAttribute(attr, elementName, htmlElementName, pipeline, stylesObject, componentMap);
    }
    else if (t.isJSXSpreadAttribute(attr)) {
      // Skip spread attributes for now
      // In the future, we might want to handle these differently
    }
  }

  // Check if element has children
  const hasChildren = children.length > 0;
  const hasSignificantChildren = children.some(
    child =>
      t.isJSXElement(child) || t.isJSXExpressionContainer(child) || (t.isJSXText(child) && child.value.trim() !== ''),
  );

  if (!hasChildren || !hasSignificantChildren) {
    // Self-closing or empty element
    html += `></${getElementName(openingElement.name)}>`;
  }
  else {
    html += '>';

    // Serialize children
    let hasComplexChildren = false;
    const serializedChildren: string[] = [];

    for (const child of children) {
      if (t.isJSXElement(child)) {
        hasComplexChildren = true;
        serializedChildren.push(serializeJSXElement(child, indent + indentSize, indentSize, pipeline, stylesObject, componentMap));
      }
      else if (t.isJSXText(child)) {
        const text = child.value.trim();
        if (text) {
          serializedChildren.push(`${childIndentStr}${text}`);
        }
      }
      else if (t.isJSXExpressionContainer(child)) {
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
    }
    else {
      // Inline text content
      html += serializedChildren.join('').trim();
      html += `</${getElementName(openingElement.name)}>`;
    }
  }

  return html;
}

function serializeAttribute(
  attr: t.JSXAttribute,
  elementName: string,
  htmlElementName: string,
  pipeline: AttributeProcessorPipeline,
  stylesObject?: Record<string, string> | null,
  componentMap?: Record<string, string>,
): string {
  const context: AttributeContext = {
    attribute: attr,
    elementName,
    htmlElementName,
    ...(stylesObject !== undefined && { stylesObject }),
    ...(componentMap !== undefined && { componentMap }),
  };

  const result = pipeline.process(context);

  // If pipeline returns null, omit the attribute
  if (result === null) {
    return '';
  }

  // If value is null, it's a boolean attribute
  // Exception: 'class' attribute should never be boolean, omit if no value
  if (result.value === null) {
    if (result.name === 'class') {
      return ''; // Omit empty class attribute
    }
    return ` ${result.name}`;
  }

  // If value is an empty string for 'class' attribute, omit it
  // (Other attributes may have semantic meaning with empty string values)
  if (result.value === '' && result.name === 'class') {
    return '';
  }

  // Otherwise, serialize as name="value"
  return ` ${result.name}="${result.value}"`;
}

function getElementName(name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }

  if (t.isJSXNamespacedName(name)) {
    return `${name.namespace.name}:${name.name.name}`;
  }

  // This shouldn't happen after transformation, but handle it
  return 'unknown';
}
