/**
 * Pattern transformation types
 */

import type * as BabelTypes from '@babel/types';

type JSXChild = BabelTypes.JSXElement | BabelTypes.JSXFragment | BabelTypes.JSXText | BabelTypes.JSXExpressionContainer | BabelTypes.JSXSpreadChild;

/**
 * Detected Tooltip/Popover pattern
 */
export interface TooltipPopoverPattern {
  type: 'tooltip' | 'popover';
  rootElement: BabelTypes.JSXElement;
  rootProps: Record<string, any>;
  triggerElement: BabelTypes.JSXElement | null;
  positionerProps: Record<string, any>;
  popupProps: Record<string, any>;
  popupContent: JSXChild[];
}

/**
 * Transformation result for patterns
 */
export interface PatternTransformResult {
  /** Transformed elements (trigger + tooltip/popover) */
  elements: string[];
  /** Extracted classNames */
  classNames: Set<string>;
}
