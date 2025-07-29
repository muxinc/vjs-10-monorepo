import React from 'react';
import { getIcon } from '@vjs-10/icons';
import Svg, { Path, SvgProps } from 'react-native-svg';

export interface IconProps extends Omit<SvgProps, 'viewBox'> {
  name: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  ...props
}) => {
  const icon = getIcon(name);
  
  if (!icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={color}
      {...props}
    >
      {icon.paths.map((path, index) => (
        <Path key={index} d={path} fill={color} />
      ))}
    </Svg>
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