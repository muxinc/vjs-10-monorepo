import React from 'react';
import { getIcon, IconDefinition } from '@vjs-10/icons';

export interface IconProps {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = '1em',
  color = 'currentColor',
  className,
  style,
  ...props
}) => {
  const icon = getIcon(name);
  
  if (!icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      viewBox={icon.viewBox}
      width={sizeValue}
      height={sizeValue}
      fill={color}
      className={className}
      style={style}
      {...props}
    >
      {icon.paths.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
};

export const PlayIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="play" {...props} />
);

export const PauseIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="pause" {...props} />
);

export const StopIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="stop" {...props} />
);

export const VolumeUpIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="volumeUp" {...props} />
);

export const VolumeOffIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="volumeOff" {...props} />
);

export const FullscreenIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="fullscreen" {...props} />
);

export const ExitFullscreenIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="exitFullscreen" {...props} />
);

export { getIcon, getAllIcons, createSVGString } from '@vjs-10/icons';