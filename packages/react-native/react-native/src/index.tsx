import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';

export * from '@vjs-10/react-native-icons';
export * from '@vjs-10/react-native-media-elements';

import { VideoElement, MediaElementRef } from '@vjs-10/react-native-media-elements';
import { PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon } from '@vjs-10/react-native-icons';
import { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';

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
  style?: ViewStyle;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onEnd?: () => void;
}

class ReactNativeMediaStateOwner implements MediaStateOwner {
  private elementRef: React.RefObject<MediaElementRef>;
  private store: MediaStore;

  constructor(elementRef: React.RefObject<MediaElementRef>, store: MediaStore) {
    this.elementRef = elementRef;
    this.store = store;
  }

  getState(): MediaState {
    const element = this.elementRef.current;
    if (!element) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true,
        volume: 1,
        muted: false,
      };
    }

    return {
      currentTime: element.currentTime,
      duration: element.duration,
      paused: element.paused,
      volume: element.volume,
      muted: element.muted,
    };
  }

  setState(state: Partial<MediaState>): void {
    const element = this.elementRef.current;
    if (!element) return;

    if (state.currentTime !== undefined && state.currentTime !== element.currentTime) {
      element.seek(state.currentTime);
    }
  }
}

const PlayerControls: React.FC<{
  elementRef: React.RefObject<MediaElementRef>;
  paused: boolean;
  muted: boolean;
  onPlayPause: () => void;
  onVolumeToggle: () => void;
  onProgressPress: (progress: number) => void;
}> = ({ elementRef, paused, muted, onPlayPause, onVolumeToggle, onProgressPress }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const interval = setInterval(() => {
      setCurrentTime(element.currentTime);
      setDuration(element.duration);
    }, 100);

    return () => clearInterval(interval);
  }, [elementRef]);

  const progressPercentage = duration ? (currentTime / duration) : 0;
  const screenWidth = Dimensions.get('window').width;
  const progressWidth = screenWidth - 120; // Account for buttons and padding

  const handleProgressPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progress = locationX / progressWidth;
    onProgressPress(progress);
  };

  return (
    <View style={styles.controlBar}>
      <TouchableOpacity onPress={onPlayPause} style={styles.controlButton}>
        {paused ? (
          <PlayIcon size={24} color="#ffffff" />
        ) : (
          <PauseIcon size={24} color="#ffffff" />
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleProgressPress} style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: progressWidth }]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage * 100}%` }
            ]} 
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onVolumeToggle} style={styles.controlButton}>
        {muted ? (
          <VolumeOffIcon size={24} color="#ffffff" />
        ) : (
          <VolumeUpIcon size={24} color="#ffffff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export const Player: React.FC<PlayerProps> = ({
  source,
  controls = true,
  paused: initialPaused = true,
  muted: initialMuted = false,
  volume = 1.0,
  rate = 1.0,
  repeat = false,
  resizeMode = 'contain',
  width = '100%',
  height = 300,
  style,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  onVolumeChange,
  onEnd,
}) => {
  const elementRef = useRef<MediaElementRef>(null);
  const storeRef = useRef(new MediaStore());
  const [paused, setPaused] = useState(initialPaused);
  const [muted, setMuted] = useState(initialMuted);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const store = storeRef.current;
    const owner = new ReactNativeMediaStateOwner(elementRef, store);
    store.addOwner(owner);

    return () => {
      store.removeOwner(owner);
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && controls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, controls]);

  const handlePlayPause = async () => {
    const element = elementRef.current;
    if (!element) return;

    if (paused) {
      await element.play();
      setPaused(false);
      onPlay?.();
    } else {
      element.pause();
      setPaused(true);
      onPause?.();
    }
  };

  const handleVolumeToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    onVolumeChange?.(volume, newMuted);
  };

  const handleProgressPress = (progress: number) => {
    const element = elementRef.current;
    if (!element || !element.duration) return;

    const newTime = progress * element.duration;
    element.seek(newTime);
    onTimeUpdate?.(newTime);
  };

  const handleContainerPress = () => {
    if (controls) {
      setShowControls(true);
    }
  };

  const containerStyle = [
    styles.container,
    {
      width: typeof width === 'string' ? width : width,
      height,
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handleContainerPress}
      activeOpacity={1}
    >
      <VideoElement
        ref={elementRef}
        source={source}
        controls={false}
        paused={paused}
        muted={muted}
        volume={volume}
        rate={rate}
        repeat={repeat}
        resizeMode={resizeMode}
        onLoad={(data) => onLoadedMetadata?.(data.duration)}
        onProgress={(data) => onTimeUpdate?.(data.currentTime)}
        onEnd={onEnd}
        style={styles.video}
      />
      
      {controls && showControls && (
        <PlayerControls
          elementRef={elementRef}
          paused={paused}
          muted={muted}
          onPlayPause={handlePlayPause}
          onVolumeToggle={handleVolumeToggle}
          onProgressPress={handleProgressPress}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlButton: {
    padding: 5,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff0000',
    borderRadius: 2,
  },
});

export { MediaStore, MediaState, MediaStateOwner } from '@vjs-10/media-store';