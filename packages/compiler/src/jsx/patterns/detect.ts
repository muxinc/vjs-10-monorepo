/**
 * Pattern Detection
 *
 * Detects Tooltip and Popover compound component patterns
 */

import type * as BabelTypes from '@babel/types';
import type { TooltipPopoverPattern } from './types';

type JSXChild = BabelTypes.JSXElement | BabelTypes.JSXFragment | BabelTypes.JSXText | BabelTypes.JSXExpressionContainer | BabelTypes.JSXSpreadChild;

/**
 * Check if element is a Tooltip.Root or Popover.Root
 */
export function isTooltipOrPopoverRoot(
  element: BabelTypes.JSXElement,
  t: typeof BabelTypes,
): 'tooltip' | 'popover' | null {
  const name = element.openingElement.name;

  if (!t.isJSXMemberExpression(name)) {
    return null;
  }

  if (!t.isJSXIdentifier(name.object) || !t.isJSXIdentifier(name.property)) {
    return null;
  }

  const object = name.object.name;
  const property = name.property.name;

  if (property !== 'Root') {
    return null;
  }

  if (object === 'Tooltip') {
    return 'tooltip';
  }

  if (object === 'Popover') {
    return 'popover';
  }

  return null;
}

/**
 * Extract props from JSX element as key-value object
 */
export function extractProps(
  element: BabelTypes.JSXElement,
  t: typeof BabelTypes,
): Record<string, any> {
  const props: Record<string, any> = {};

  for (const attr of element.openingElement.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) {
      continue;
    }

    const name = attr.name.name;
    const value = attr.value;

    // No value = boolean true
    if (value === null) {
      props[name] = true;
      continue;
    }

    // String literal
    if (t.isStringLiteral(value)) {
      props[name] = value.value;
      continue;
    }

    // Expression container
    if (t.isJSXExpressionContainer(value)) {
      const expr = value.expression;

      if (t.isNumericLiteral(expr)) {
        props[name] = expr.value;
      } else if (t.isBooleanLiteral(expr)) {
        props[name] = expr.value;
      } else if (t.isStringLiteral(expr)) {
        props[name] = expr.value;
      } else if (t.isIdentifier(expr) || t.isMemberExpression(expr)) {
        // Store as reference (we'll handle className specially)
        props[name] = value;
      }
    }
  }

  return props;
}

/**
 * Find child element by member expression name
 * e.g., find Tooltip.Trigger in children
 */
export function findChildByName(
  children: JSXChild[],
  objectName: string,
  propertyName: string,
  t: typeof BabelTypes,
): BabelTypes.JSXElement | null {
  for (const child of children) {
    if (!t.isJSXElement(child)) {
      continue;
    }

    const name = child.openingElement.name;

    if (t.isJSXMemberExpression(name)) {
      if (
        t.isJSXIdentifier(name.object)
        && t.isJSXIdentifier(name.property)
        && name.object.name === objectName
        && name.property.name === propertyName
      ) {
        return child;
      }
    }
  }

  return null;
}

/**
 * Detect and extract Tooltip/Popover pattern
 */
export function detectPattern(
  element: BabelTypes.JSXElement,
  t: typeof BabelTypes,
): TooltipPopoverPattern | null {
  const type = isTooltipOrPopoverRoot(element, t);

  if (!type) {
    return null;
  }

  const objectName = type === 'tooltip' ? 'Tooltip' : 'Popover';

  // Extract Root props
  const rootProps = extractProps(element, t);

  // Find Trigger
  const triggerNode = findChildByName(element.children, objectName, 'Trigger', t);
  const triggerElement = triggerNode ? getFirstChildElement(triggerNode.children, t) : null;

  // Find Portal → Positioner → Popup
  const portalNode = findChildByName(element.children, objectName, 'Portal', t);
  const positionerNode = portalNode
    ? findChildByName(portalNode.children, objectName, 'Positioner', t)
    : null;
  const positionerProps = positionerNode ? extractProps(positionerNode, t) : {};

  const popupNode = positionerNode
    ? findChildByName(positionerNode.children, objectName, 'Popup', t)
    : null;
  const popupProps = popupNode ? extractProps(popupNode, t) : {};
  const popupContent = popupNode ? popupNode.children : [];

  return {
    type,
    rootElement: element,
    rootProps,
    triggerElement,
    positionerProps,
    popupProps,
    popupContent,
  };
}

/**
 * Get first JSX element from children
 */
function getFirstChildElement(
  children: JSXChild[],
  t: typeof BabelTypes,
): BabelTypes.JSXElement | null {
  for (const child of children) {
    if (t.isJSXElement(child)) {
      return child;
    }
  }
  return null;
}
