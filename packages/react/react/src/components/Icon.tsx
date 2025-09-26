import type { FC, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, SVGProps } from 'react';

import { createElement, forwardRef } from 'react';

export interface IconProps extends PropsWithoutRef<SVGProps<SVGSVGElement>>, RefAttributes<SVGElement | SVGSVGElement> {
  /**
   * The horizontal (width) and vertical (height) length of the underlying `<svg>` element.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height}
   */
  size?: number;
  part?: string;
  /** @internal */
  paths?: string;
}

export interface IconComponent extends FC<IconProps> {}

const Icon: IconComponent = /* #__PURE__*/ forwardRef((props, ref) => {
  const { width, height, size = 24, paths, ...restProps } = props;
  return createElement('svg', {
    viewBox: '0 0 32 32',
    ...restProps,
    width: width ?? size,
    height: height ?? size,
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
    xmlns: 'http://www.w3.org/2000/svg',
    ref,
    dangerouslySetInnerHTML: { __html: paths },
  });
});

Icon.displayName = 'VjsIcon';

export { Icon };
