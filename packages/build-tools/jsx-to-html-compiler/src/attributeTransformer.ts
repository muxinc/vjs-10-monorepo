import * as t from '@babel/types';
import type { AttributeTransformer } from './types.js';

/**
 * Default placeholder attribute transformer
 *
 * Behavior:
 * - String literals: Pass through unchanged
 * - JSX expressions: Convert to empty string
 * - Boolean attributes: Return empty string (presence indicates true)
 * - Null/undefined: Return null (omit attribute)
 *
 * This is a placeholder that will eventually be replaced with actual
 * CSS processing logic (Tailwind, CSS Modules, etc.)
 */
export const defaultAttributeTransformer: AttributeTransformer = (
  _attrName: string,
  attrValue: t.JSXAttribute['value']
): string | null => {
  // Boolean attribute (e.g., <button disabled>)
  if (!attrValue) {
    return '';
  }

  // String literal (e.g., class="foo")
  if (t.isStringLiteral(attrValue)) {
    return attrValue.value;
  }

  // JSX expression (e.g., class={styles.Container})
  // For now, convert all expressions to empty string
  // Later, this will be replaced with CSS processing
  if (t.isJSXExpressionContainer(attrValue)) {
    return '';
  }

  // JSX element as attribute value (rare case)
  if (t.isJSXElement(attrValue)) {
    return null;
  }

  return null;
};
