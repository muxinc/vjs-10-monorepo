import * as React from 'react';

// Placeholder exports for React Native Media Elements package
// These will be implemented in a future step

export interface MediaElementProps {
  source?: { uri: string };
  controls?: boolean;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  rate?: number;
  repeat?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  onLoad?: (data: any) => void;
  onProgress?: (data: any) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  style?: any; // React Native ViewStyle
}

export interface MediaElementRef {
  currentTime: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readyState: number;
  networkState: number;
  
  play(): Promise<void>;
  pause(): void;
  load(): void;
  seek(time: number): void;
}

// Placeholder component - will be implemented later
export const VideoElement = React.forwardRef<MediaElementRef, MediaElementProps>(
  (_, __) => {
    return React.createElement('div', { children: 'React Native VideoElement - Coming Soon' });
  }
);

VideoElement.displayName = 'VideoElement';