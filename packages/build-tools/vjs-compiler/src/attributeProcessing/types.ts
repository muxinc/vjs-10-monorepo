import type { NodePath } from '@babel/traverse';

import type * as t from '@babel/types';

/**
 * Context provided to attribute processors containing the JSX attribute
 * and information about its parent element
 */
export interface AttributeContext {
  /**
   * The complete JSX attribute node (name + value)
   */
  attribute: t.JSXAttribute;

  /**
   * The original JSX element name (before transformation)
   * Examples: "PlayButton", "div", "TimeRange.Root"
   */
  elementName: string;

  /**
   * The transformed HTML element name (after toCustomElementName)
   * Examples: "media-play-button", "div", "media-time-range-root"
   */
  htmlElementName: string;

  /**
   * Optional: Babel path for advanced traversal
   * Allows access to parent nodes and scope if needed
   */
  path?: NodePath<t.JSXAttribute>;
}

/**
 * Result of processing an attribute
 */
export interface AttributeTransformResult {
  /**
   * The transformed HTML attribute name
   * Examples: "class", "aria-label", "show-remaining"
   */
  name: string;

  /**
   * The transformed attribute value
   * - string: Attribute with value (e.g., class="foo")
   * - null: Boolean attribute (e.g., disabled)
   */
  value: string | null;
}

/**
 * Processor that transforms JSX attributes to HTML attributes
 *
 * Processors handle both name and value transformation, with full
 * context about the parent element. This allows for:
 * - Element-specific attribute rules
 * - CSS transformation based on element type
 * - Access to parent context via Babel path
 */
export interface AttributeProcessor {
  /**
   * Transform the attribute name (e.g., className → class)
   *
   * @param context - Full context about the attribute and its parent element
   * @returns The transformed HTML attribute name, or null to omit the attribute
   */
  transformName: (context: AttributeContext) => string | null;

  /**
   * Transform the attribute value (e.g., JSX expression → CSS string)
   *
   * @param context - Full context about the attribute and its parent element
   * @returns The transformed value, or null to omit the attribute
   */
  transformValue: (context: AttributeContext) => string | null;
}
