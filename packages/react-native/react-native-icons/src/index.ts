import type { FC } from 'react';

import { createElement } from 'react';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export const Icon: FC<IconProps> = () => {
  return createElement('div', { children: 'React Native Icon - Coming Soon' });
};

// Placeholder icon components
export const PlayIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Play Icon - Coming Soon' });

export const PauseIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Pause Icon - Coming Soon' });

export const StopIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Stop Icon - Coming Soon' });

export const VolumeUpIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Volume Up Icon - Coming Soon' });

export const VolumeOffIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Volume Off Icon - Coming Soon' });

export const FullscreenIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Fullscreen Icon - Coming Soon' });

export const ExitFullscreenIcon: FC<Omit<IconProps, 'name'>> = () =>
  createElement('div', { children: 'Exit Fullscreen Icon - Coming Soon' });
