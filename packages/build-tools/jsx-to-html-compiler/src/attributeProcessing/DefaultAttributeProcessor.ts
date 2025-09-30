import * as t from '@babel/types';
import { toAttributeName } from '../utils/naming.js';
import type { AttributeProcessor, AttributeContext } from './types.js';

/**
 * Helper to extract attribute name from JSXAttribute node
 */
function getAttributeName(attr: t.JSXAttribute): string {
  if (t.isJSXIdentifier(attr.name)) {
    return attr.name.name;
  }
  if (t.isJSXNamespacedName(attr.name)) {
    return `${attr.name.namespace.name}:${attr.name.name.name}`;
  }
  return '';
}

/**
 * Default attribute processor that implements standard JSX to HTML transformations
 *
 * Name transformations:
 * - className → class
 * - camelCase → kebab-case
 * - aria-*, data-* → unchanged
 *
 * Value transformations:
 * - String literals → pass through unchanged
 * - JSX expressions → empty string (placeholder for future CSS processing)
 * - Boolean attributes → null (attribute presence indicates true)
 * - JSX elements → omit attribute entirely
 */
export class DefaultAttributeProcessor implements AttributeProcessor {
  transformName(context: AttributeContext): string | null {
    const jsxName = getAttributeName(context.attribute);
    return toAttributeName(jsxName);
  }

  transformValue(context: AttributeContext): string | null {
    const value = context.attribute.value;

    // Boolean attribute (e.g., <button disabled>)
    if (!value) {
      return null;
    }

    // String literal (e.g., class="foo")
    if (t.isStringLiteral(value)) {
      return value.value;
    }

    // JSX expression (e.g., class={styles.Container})
    // For now, convert all expressions to empty string
    // This will be replaced with CSS processing in the future
    if (t.isJSXExpressionContainer(value)) {
      return null;
    }

    // JSX element as attribute value (rare case)
    if (t.isJSXElement(value)) {
      return null;
    }

    return null;
  }
}
