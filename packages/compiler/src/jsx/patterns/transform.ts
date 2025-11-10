/**
 * Pattern Transformation
 *
 * Transforms Tooltip/Popover patterns from React nested structure to HTML flat structure
 */

import type * as BabelTypes from '@babel/types';
import type { PatternTransformResult, TooltipPopoverPattern } from './types';

/**
 * Transform Tooltip/Popover pattern to HTML flat structure
 */
export function transformPattern(
  pattern: TooltipPopoverPattern,
  t: typeof BabelTypes,
  transformElement: (element: BabelTypes.JSXElement) => { html: string; classNames: Set<string> },
): PatternTransformResult {
  const classNames = new Set<string>();

  // Generate unique ID for linking
  const id = generateId(pattern);

  // Transform trigger element
  const triggerHtml = pattern.triggerElement
    ? transformTrigger(pattern.triggerElement, id, pattern.type, transformElement, classNames)
    : '';

  // Transform tooltip/popover element
  const tooltipHtml = transformTooltipPopover(pattern, id, t, transformElement, classNames);

  return {
    elements: [triggerHtml, tooltipHtml],
    classNames,
  };
}

/**
 * Generate unique ID for tooltip/popover
 * Pattern: {trigger-type}-{tooltip|popover}
 */
function generateId(pattern: TooltipPopoverPattern): string {
  if (!pattern.triggerElement) {
    // Fallback if no trigger
    return `${pattern.type}-${Date.now()}`;
  }

  const name = pattern.triggerElement.openingElement.name;

  // Get element name for ID
  let elementName = 'element';

  if ('name' in name && typeof name.name === 'string') {
    // Simple identifier: PlayButton
    elementName = name.name;
  } else if ('object' in name && 'property' in name) {
    // Member expression: TimeSlider.Root
    if ('name' in name.object && 'name' in name.property) {
      const obj = name.object.name as string;
      const prop = name.property.name as string;
      elementName = prop === 'Root' ? obj : `${obj}${prop}`;
    }
  }

  // Convert to kebab-case
  const kebab = elementName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  return `${kebab}-${pattern.type}`;
}

/**
 * Transform trigger element with commandfor attribute
 */
function transformTrigger(
  triggerElement: BabelTypes.JSXElement,
  id: string,
  type: 'tooltip' | 'popover',
  transformElement: (element: BabelTypes.JSXElement) => { html: string; classNames: Set<string> },
  classNames: Set<string>,
): string {
  // Transform the trigger element normally
  const result = transformElement(triggerElement);

  // Merge classNames
  result.classNames.forEach(cls => classNames.add(cls));

  // Add commandfor attribute to the HTML
  // Note: We need to inject this into the opening tag
  const html = result.html;

  // Find the first > in the opening tag
  const firstCloseIndex = html.indexOf('>');

  if (firstCloseIndex === -1) {
    return html;
  }

  // Check if it's self-closing
  if (html[firstCloseIndex - 1] === '/') {
    // Insert before />
    const commandforAttr = type === 'popover'
      ? ` commandfor="${id}" command="toggle-popover"`
      : ` commandfor="${id}"`;
    return html.slice(0, firstCloseIndex - 1) + commandforAttr + html.slice(firstCloseIndex - 1);
  }

  // Insert before >
  const commandforAttr = type === 'popover'
    ? ` commandfor="${id}" command="toggle-popover"`
    : ` commandfor="${id}"`;
  return html.slice(0, firstCloseIndex) + commandforAttr + html.slice(firstCloseIndex);
}

/**
 * Transform tooltip/popover element with merged attributes
 */
function transformTooltipPopover(
  pattern: TooltipPopoverPattern,
  id: string,
  t: typeof BabelTypes,
  transformElement: (element: BabelTypes.JSXElement) => { html: string; classNames: Set<string> },
  classNames: Set<string>,
): string {
  const elementName = `media-${pattern.type}`;

  // Merge all attributes
  const attributes: Record<string, string> = {
    id,
    popover: 'manual',
  };

  // From Root props
  if (pattern.rootProps.delay !== undefined) {
    attributes.delay = String(pattern.rootProps.delay);
  }
  if (pattern.rootProps.closeDelay !== undefined) {
    attributes['close-delay'] = String(pattern.rootProps.closeDelay);
  }
  if (pattern.rootProps.trackCursorAxis) {
    attributes['track-cursor-axis'] = String(pattern.rootProps.trackCursorAxis);
  }
  if (pattern.rootProps.openOnHover) {
    attributes['open-on-hover'] = '';
  }

  // From Positioner props
  if (pattern.positionerProps.side) {
    attributes.side = String(pattern.positionerProps.side);
  }
  if (pattern.positionerProps.sideOffset !== undefined) {
    attributes['side-offset'] = String(pattern.positionerProps.sideOffset);
  }
  if (pattern.positionerProps.collisionPadding !== undefined) {
    attributes['collision-padding'] = String(pattern.positionerProps.collisionPadding);
  }

  // From Popup props - handle className
  let classAttr = '';
  if (pattern.popupProps.className) {
    const classValue = pattern.popupProps.className;

    if (typeof classValue === 'object' && 'type' in classValue && t.isJSXExpressionContainer(classValue)) { // If it's an expression container (template literal, etc.) - use t for type checking
      // For now, just note that we have a className
      // TODO: Resolve template literals and expressions
      classNames.add('popup'); // Placeholder
    } else if (typeof classValue === 'string') { // If it's a string literal
      classAttr = classValue;
      classValue.split(/\s+/).forEach(cls => classNames.add(cls));
    }
  }

  if (classAttr) {
    attributes.class = classAttr;
  }

  // Transform content children
  const contentHtml = pattern.popupContent
    .map((child) => {
      if (t.isJSXElement(child as any)) {
        const result = transformElement(child as BabelTypes.JSXElement);
        result.classNames.forEach(cls => classNames.add(cls));
        return result.html;
      }
      if (t.isJSXText(child as any)) {
        return (child as BabelTypes.JSXText).value.trim();
      }
      return '';
    })
    .filter(Boolean)
    .join('');

  // Build attribute string
  const attrString = Object.entries(attributes)
    .map(([key, value]) => {
      if (value === '') {
        return key; // Boolean attribute
      }
      return `${key}="${value}"`;
    })
    .join(' ');

  return `<${elementName} ${attrString}>${contentHtml}</${elementName}>`;
}
