import type { ElementRects, PositionElements, Rect, Strategy } from './types';

export function getElementRects({ reference, floating, strategy }: PositionElements): ElementRects {
  return {
    reference: getRectRelativeToOffsetParent(reference, floating.offsetParent, strategy),
    floating: {
      x: 0,
      y: 0,
      width: floating.offsetWidth,
      height: floating.offsetHeight,
    },
  };
}

function getRectRelativeToOffsetParent(element: Element, offsetParent: Element | null, strategy: Strategy): Rect {
  const rect = element.getBoundingClientRect();

  // For fixed positioning, coordinates are relative to the viewport
  if (strategy === 'fixed') {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  // For absolute positioning, coordinates are relative to the offset parent
  // offsetParent returns null in the following situations:
  // - The element or any ancestor has the display property set to none.
  // - The element has the position property set to fixed (Firefox returns <body>).
  // - The element is <body> or <html>.
  const offsetRect = offsetParent?.getBoundingClientRect() ?? { x: 0, y: 0 };
  return {
    x: rect.x - offsetRect.x,
    y: rect.y - offsetRect.y,
    width: rect.width,
    height: rect.height,
  };
}
