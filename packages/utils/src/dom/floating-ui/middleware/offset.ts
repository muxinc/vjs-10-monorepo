import type { Middleware, Placement } from '../types';

function getSide(placement: Placement): string {
  return placement.split('-')[0] ?? '';
}

export function offset(offset: number): Middleware {
  return {
    name: 'offset',
    fn: (state) => {
      const { x, y, placement } = state;
      const side = getSide(placement);

      let newX = x;
      let newY = y;

      switch (side) {
        case 'top':
          newY = y - offset;
          break;
        case 'bottom':
          newY = y + offset;
          break;
        case 'left':
          newX = x - offset;
          break;
        case 'right':
          newX = x + offset;
          break;
      }

      return {
        x: newX,
        y: newY,
        data: {
          x: newX - x,
          y: newY - y,
          placement,
        },
      };
    },
  };
}
