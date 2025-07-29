import * as React from 'react';

// Placeholder exports for React Native package
// These will be implemented in a future step

export interface PlayerProps {
  source?: { uri: string };
  controls?: boolean;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  rate?: number;
  repeat?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  width?: number | string;
  height?: number;
  style?: any; // React Native ViewStyle
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onEnd?: () => void;
}

// Placeholder component - will be implemented later
export const Player: React.FC<PlayerProps> = () => {
  return React.createElement('div', { children: 'React Native Player - Coming Soon' });
};

// Re-export placeholder packages (will be available at runtime)
// @ts-ignore - Package imports for placeholder stubs
export * from '@vjs-10/react-native-icons';
// @ts-ignore - Package imports for placeholder stubs  
export * from '@vjs-10/react-native-media-elements';