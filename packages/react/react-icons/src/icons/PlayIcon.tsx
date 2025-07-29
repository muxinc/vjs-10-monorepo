import * as React from 'react';
import type { IconProps } from './types';
export const PlayIcon = ({ color = 'currentColor', ...props }: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
    <path
      fill={color}
      d="m6 21 15-9L6 3v18Z"
    />
  </svg>
);
export default PlayIcon;
