import { createElement } from 'react';

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

export const Player: React.FC<PlayerProps> = () => {
  return createElement('div', { children: 'React Native Player - Coming Soon' });
};

export * from '@vjs-10/react-native-icons';
export * from '@vjs-10/react-native-media-elements';
