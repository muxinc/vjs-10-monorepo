import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Video, { VideoRef, OnLoadData, OnProgressData } from 'react-native-video';
import { MediaReadyState, MediaNetworkState, READY_STATE, NETWORK_STATE } from '@vjs-10/media';

export interface MediaElementProps {
  source?: { uri: string };
  controls?: boolean;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  rate?: number;
  repeat?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  onLoad?: (data: OnLoadData) => void;
  onProgress?: (data: OnProgressData) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  style?: ViewStyle;
}

export interface MediaElementRef {
  currentTime: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readyState: MediaReadyState;
  networkState: MediaNetworkState;
  
  play(): Promise<void>;
  pause(): void;
  load(): void;
  seek(time: number): void;
}

export const VideoElement = forwardRef<MediaElementRef, MediaElementProps>(
  ({
    source,
    controls = false,
    paused = true,
    muted = false,
    volume = 1.0,
    rate = 1.0,
    repeat = false,
    resizeMode = 'contain',
    onLoad,
    onProgress,
    onEnd,
    onError,
    style,
  }, ref) => {
    const videoRef = useRef<VideoRef>(null);
    const stateRef = useRef({
      currentTime: 0,
      duration: 0,
      paused: true,
      ended: false,
      volume: 1.0,
      muted: false,
      playbackRate: 1.0,
      readyState: READY_STATE.HAVE_NOTHING,
      networkState: NETWORK_STATE.EMPTY,
    });

    const handleLoad = (data: OnLoadData) => {
      stateRef.current.duration = data.duration;
      stateRef.current.readyState = READY_STATE.HAVE_METADATA;
      stateRef.current.networkState = NETWORK_STATE.IDLE;
      onLoad?.(data);
    };

    const handleProgress = (data: OnProgressData) => {
      stateRef.current.currentTime = data.currentTime;
      onProgress?.(data);
    };

    const handleEnd = () => {
      stateRef.current.ended = true;
      stateRef.current.paused = true;
      onEnd?.();
    };

    const handleError = (error: any) => {
      stateRef.current.networkState = NETWORK_STATE.NO_SOURCE;
      onError?.(error);
    };

    useImperativeHandle(ref, () => ({
      get currentTime() {
        return stateRef.current.currentTime;
      },
      get duration() {
        return stateRef.current.duration;
      },
      get paused() {
        return stateRef.current.paused;
      },
      get ended() {
        return stateRef.current.ended;
      },
      get volume() {
        return stateRef.current.volume;
      },
      get muted() {
        return stateRef.current.muted;
      },
      get playbackRate() {
        return stateRef.current.playbackRate;
      },
      get readyState() {
        return stateRef.current.readyState;
      },
      get networkState() {
        return stateRef.current.networkState;
      },
      play: async () => {
        stateRef.current.paused = false;
        stateRef.current.ended = false;
      },
      pause: () => {
        stateRef.current.paused = true;
      },
      load: () => {
        stateRef.current.networkState = NETWORK_STATE.LOADING;
      },
      seek: (time: number) => {
        videoRef.current?.seek(time);
        stateRef.current.currentTime = time;
      },
    }), []);

    React.useEffect(() => {
      stateRef.current.paused = paused;
    }, [paused]);

    React.useEffect(() => {
      stateRef.current.volume = volume;
    }, [volume]);

    React.useEffect(() => {
      stateRef.current.muted = muted;
    }, [muted]);

    React.useEffect(() => {
      stateRef.current.playbackRate = rate;
    }, [rate]);

    return (
      <Video
        ref={videoRef}
        source={source}
        controls={controls}
        paused={paused}
        muted={muted}
        volume={volume}
        rate={rate}
        repeat={repeat}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onEnd={handleEnd}
        onError={handleError}
        style={[styles.video, style]}
      />
    );
  }
);

VideoElement.displayName = 'VideoElement';

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 200,
  },
});

export { MediaReadyState, MediaNetworkState, READY_STATE, NETWORK_STATE } from '@vjs-10/media';