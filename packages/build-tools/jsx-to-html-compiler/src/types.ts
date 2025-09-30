import * as t from '@babel/types';

/**
 * Function that transforms JSX attribute values to HTML attribute values
 *
 * @param attrName - The name of the attribute (e.g., "class", "aria-label")
 * @param attrValue - The JSX attribute value (can be string literal, expression, etc.)
 * @returns The transformed attribute value as a string, or null to omit the attribute
 */
export type AttributeTransformer = (
  attrName: string,
  attrValue: t.JSXAttribute['value']
) => string | null;

export interface CompileOptions {
  indent?: number;
  indentSize?: number;
  attributeTransformer?: AttributeTransformer;
}

export interface SerializeOptions {
  indent?: number;
  indentSize?: number;
  attributeTransformer?: AttributeTransformer;
}
