import * as React from 'react';

// Placeholder exports for React Native Icons package
// These will be implemented in a future step

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Placeholder component - will be implemented later
export const Icon: React.FC<IconProps> = () => {
  return React.createElement('div', { children: 'React Native Icon - Coming Soon' });
};

// Placeholder icon components
export const PlayIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Play Icon - Coming Soon' })
);

export const PauseIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Pause Icon - Coming Soon' })
);

export const StopIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Stop Icon - Coming Soon' })
);

export const VolumeUpIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Volume Up Icon - Coming Soon' })
);

export const VolumeOffIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Volume Off Icon - Coming Soon' })
);

export const FullscreenIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Fullscreen Icon - Coming Soon' })
);

export const ExitFullscreenIcon: React.FC<Omit<IconProps, 'name'>> = () => (
  React.createElement('div', { children: 'Exit Fullscreen Icon - Coming Soon' })
);