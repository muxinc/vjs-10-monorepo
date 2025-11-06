import type { Middleware, MiddlewareState, Rect } from '../types';

export interface ShiftOptions {
  boundary?: HTMLElement;
  padding?: number;
}

function getRectRelativeToOffsetParent(element: Element, offsetParent: Element | null): Rect {
  const rect = element.getBoundingClientRect();
  const offsetRect = offsetParent?.getBoundingClientRect() ?? { x: 0, y: 0 };
  return {
    x: rect.x - offsetRect.x,
    y: rect.y - offsetRect.y,
    width: rect.width,
    height: rect.height,
  };
}

function getBoundaryRect(boundary: HTMLElement | undefined, floating: HTMLElement): Rect {
  if (boundary) {
    return getRectRelativeToOffsetParent(boundary, floating.offsetParent);
  }

  // Use viewport as boundary
  const offsetParent = floating.offsetParent;
  const offsetRect = offsetParent?.getBoundingClientRect() ?? { x: 0, y: 0 };

  return {
    x: -offsetRect.x,
    y: -offsetRect.y,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function shift(options: ShiftOptions = {}): Middleware {
  const { boundary, padding = 0 } = options;

  return {
    name: 'shift',
    fn: (state: MiddlewareState) => {
      const { x, y, elements, rects } = state;
      const { floating } = elements;

      const boundaryRect = getBoundaryRect(boundary, floating);

      // Apply padding to boundary
      const paddedBoundary = {
        x: boundaryRect.x + padding,
        y: boundaryRect.y + padding,
        width: boundaryRect.width - padding * 2,
        height: boundaryRect.height - padding * 2,
      };

      // Calculate floating element bounds at current position
      const floatingLeft = x;
      const floatingTop = y;
      const floatingRight = x + rects.floating.width;
      const floatingBottom = y + rects.floating.height;

      // Calculate boundary bounds
      const boundaryLeft = paddedBoundary.x;
      const boundaryTop = paddedBoundary.y;
      const boundaryRight = paddedBoundary.x + paddedBoundary.width;
      const boundaryBottom = paddedBoundary.y + paddedBoundary.height;

      // Calculate how much to shift
      let newX = x;
      let newY = y;
      let xShifted = false;
      let yShifted = false;

      // Shift horizontally if needed
      if (floatingLeft < boundaryLeft) {
        newX = boundaryLeft;
        xShifted = true;
      } else if (floatingRight > boundaryRight) {
        newX = boundaryRight - rects.floating.width;
        xShifted = true;
      }

      // Shift vertically if needed
      if (floatingTop < boundaryTop) {
        newY = boundaryTop;
        yShifted = true;
      } else if (floatingBottom > boundaryBottom) {
        newY = boundaryBottom - rects.floating.height;
        yShifted = true;
      }

      return {
        x: newX,
        y: newY,
        data: {
          x: newX - x,
          y: newY - y,
          enabled: {
            x: xShifted,
            y: yShifted,
          },
        },
      };
    },
  };
}
