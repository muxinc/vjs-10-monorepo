/* Adapted from floating-ui - The MIT License - Floating UI contributors */

import type {
  ComputePositionConfig,
  ComputePositionReturn,
  ElementRects,
  FloatingElement,
  Middleware,
  MiddlewareData,
  Placement,
  Point,
  ReferenceElement,
} from './types';

import * as defaultPlatform from './platform';

export async function computePosition(
  reference: ReferenceElement,
  floating: FloatingElement,
  config: ComputePositionConfig,
): Promise<ComputePositionReturn> {
  const { placement = 'bottom', strategy = 'absolute', middleware = [], platform = defaultPlatform } = config;

  const validMiddleware = middleware.filter(Boolean) as Middleware[];

  // Removed RTL check.

  let rects = await platform.getElementRects({ reference, floating, strategy });
  let { x, y } = computeCoordsFromPlacement(rects, placement);
  let statefulPlacement = placement;
  let middlewareData: MiddlewareData = {};
  let resetCount = 0;

  for (let i = 0; i < validMiddleware.length; i++) {
    const { name, fn } = validMiddleware[i] as Middleware;

    const {
      x: nextX,
      y: nextY,
      data,
      reset,
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform,
      elements: { reference, floating },
    });

    x = nextX ?? x;
    y = nextY ?? y;

    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data,
      },
    };

    if (reset && resetCount <= 50) {
      resetCount++;

      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }

        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({ reference, floating, strategy }) : reset.rects;
        }

        ({ x, y } = computeCoordsFromPlacement(rects, statefulPlacement));
      }

      i = -1;
    }
  }

  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData,
  };
}

function computeCoordsFromPlacement({ reference, floating }: ElementRects, placement: Placement): Point {
  const alignmentAxis = getSideAxis(placement) === 'x' ? 'y' : 'x';
  const alignLength = alignmentAxis === 'y' ? 'height' : 'width';
  const side = getSide(placement);

  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;

  let coords;
  switch (side) {
    case 'top':
      coords = { x: commonX, y: reference.y - floating.height };
      break;
    case 'bottom':
      coords = { x: commonX, y: reference.y + reference.height };
      break;
    case 'right':
      coords = { x: reference.x + reference.width, y: commonY };
      break;
    case 'left':
      coords = { x: reference.x - floating.width, y: commonY };
      break;
    default:
      coords = { x: reference.x, y: reference.y };
  }

  switch (placement.split('-')[1]) {
    case 'start':
      coords[alignmentAxis] -= commonAlign;
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign;
      break;
  }

  return coords;
}

function getSide(placement: Placement): Placement | undefined {
  return placement.split('-')[0] as Placement | undefined;
}

function getSideAxis(placement: Placement): 'x' | 'y' {
  return ['top', 'bottom'].includes(getSide(placement) ?? '') ? 'y' : 'x';
}
