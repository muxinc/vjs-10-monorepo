import * as React from 'react';
import type { IconProps } from './types';
export const VolumeLowIcon = ({
  color = 'currentColor',
  ...props
}: IconProps) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
    <path
      fill={color}
      d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"
    />
  </svg>
);
export default VolumeLowIcon;
