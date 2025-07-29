import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { MediaElementLike, createMediaElementAdapter } from '@vjs-10/media';
import { PlaybackEngine, NativePlaybackEngine, MediaSource } from '@vjs-10/playback-engine';

export interface MediaElementProps {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onEnded?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface MediaElementRef extends MediaElementLike {
  element: HTMLVideoElement | HTMLAudioElement | null;
}

export const VideoElement = forwardRef<MediaElementRef, MediaElementProps>(
  ({
    src,
    controls = false,
    autoplay = false,
    preload = 'metadata',
    muted = false,
    loop = false,
    playsInline = true,
    crossOrigin,
    onPlay,
    onPause,
    onTimeUpdate,
    onLoadedMetadata,
    onVolumeChange,
    onEnded,
    className,
    style,
  }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const engineRef = useRef<PlaybackEngine>(new NativePlaybackEngine());
    const adapterRef = useRef<MediaElementLike | null>(null);

    useEffect(() => {
      const video = videoRef.current;
      const engine = engineRef.current;
      
      if (!video) return;

      engine.attach(video);
      adapterRef.current = createMediaElementAdapter(video);

      const handlePlay = () => onPlay?.();
      const handlePause = () => onPause?.();
      const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);
      const handleLoadedMetadata = () => onLoadedMetadata?.(video.duration);
      const handleVolumeChange = () => onVolumeChange?.(video.volume, video.muted);
      const handleEnded = () => onEnded?.();

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('volumechange', handleVolumeChange);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('volumechange', handleVolumeChange);
        video.removeEventListener('ended', handleEnded);
        engine.detach();
      };
    }, [onPlay, onPause, onTimeUpdate, onLoadedMetadata, onVolumeChange, onEnded]);

    useEffect(() => {
      if (src && engineRef.current) {
        engineRef.current.load({ src, type: 'video/mp4' });
      }
    }, [src]);

    useImperativeHandle(ref, () => ({
      element: videoRef.current,
      get currentTime() {
        return adapterRef.current?.currentTime ?? 0;
      },
      set currentTime(value: number) {
        if (adapterRef.current) {
          adapterRef.current.currentTime = value;
        }
      },
      get duration() {
        return adapterRef.current?.duration ?? 0;
      },
      get paused() {
        return adapterRef.current?.paused ?? true;
      },
      get ended() {
        return adapterRef.current?.ended ?? false;
      },
      get volume() {
        return adapterRef.current?.volume ?? 1;
      },
      set volume(value: number) {
        if (adapterRef.current) {
          adapterRef.current.volume = value;
        }
      },
      get muted() {
        return adapterRef.current?.muted ?? false;
      },
      set muted(value: boolean) {
        if (adapterRef.current) {
          adapterRef.current.muted = value;
        }
      },
      get playbackRate() {
        return adapterRef.current?.playbackRate ?? 1;
      },
      set playbackRate(value: number) {
        if (adapterRef.current) {
          adapterRef.current.playbackRate = value;
        }
      },
      get readyState() {
        return adapterRef.current?.readyState ?? 0;
      },
      get networkState() {
        return adapterRef.current?.networkState ?? 0;
      },
      play: () => adapterRef.current?.play() ?? Promise.resolve(),
      pause: () => adapterRef.current?.pause(),
      load: () => adapterRef.current?.load(),
    }), []);

    return (
      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoplay}
        preload={preload}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        crossOrigin={crossOrigin}
        className={className}
        style={style}
      />
    );
  }
);

VideoElement.displayName = 'VideoElement';

export const AudioElement = forwardRef<MediaElementRef, MediaElementProps>(
  ({
    src,
    controls = false,
    autoplay = false,
    preload = 'metadata',
    muted = false,
    loop = false,
    crossOrigin,
    onPlay,
    onPause,
    onTimeUpdate,
    onLoadedMetadata,
    onVolumeChange,
    onEnded,
    className,
    style,
  }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const engineRef = useRef<PlaybackEngine>(new NativePlaybackEngine());
    const adapterRef = useRef<MediaElementLike | null>(null);

    useEffect(() => {
      const audio = audioRef.current;
      const engine = engineRef.current;
      
      if (!audio) return;

      engine.attach(audio);
      adapterRef.current = createMediaElementAdapter(audio);

      const handlePlay = () => onPlay?.();
      const handlePause = () => onPause?.();
      const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
      const handleLoadedMetadata = () => onLoadedMetadata?.(audio.duration);
      const handleVolumeChange = () => onVolumeChange?.(audio.volume, audio.muted);
      const handleEnded = () => onEnded?.();

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('volumechange', handleVolumeChange);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('volumechange', handleVolumeChange);
        audio.removeEventListener('ended', handleEnded);
        engine.detach();
      };
    }, [onPlay, onPause, onTimeUpdate, onLoadedMetadata, onVolumeChange, onEnded]);

    useEffect(() => {
      if (src && engineRef.current) {
        engineRef.current.load({ src, type: 'audio/mp3' });
      }
    }, [src]);

    useImperativeHandle(ref, () => ({
      element: audioRef.current,
      get currentTime() {
        return adapterRef.current?.currentTime ?? 0;
      },
      set currentTime(value: number) {
        if (adapterRef.current) {
          adapterRef.current.currentTime = value;
        }
      },
      get duration() {
        return adapterRef.current?.duration ?? 0;
      },
      get paused() {
        return adapterRef.current?.paused ?? true;
      },
      get ended() {
        return adapterRef.current?.ended ?? false;
      },
      get volume() {
        return adapterRef.current?.volume ?? 1;
      },
      set volume(value: number) {
        if (adapterRef.current) {
          adapterRef.current.volume = value;
        }
      },
      get muted() {
        return adapterRef.current?.muted ?? false;
      },
      set muted(value: boolean) {
        if (adapterRef.current) {
          adapterRef.current.muted = value;
        }
      },
      get playbackRate() {
        return adapterRef.current?.playbackRate ?? 1;
      },
      set playbackRate(value: number) {
        if (adapterRef.current) {
          adapterRef.current.playbackRate = value;
        }
      },
      get readyState() {
        return adapterRef.current?.readyState ?? 0;
      },
      get networkState() {
        return adapterRef.current?.networkState ?? 0;
      },
      play: () => adapterRef.current?.play() ?? Promise.resolve(),
      pause: () => adapterRef.current?.pause(),
      load: () => adapterRef.current?.load(),
    }), []);

    return (
      <audio
        ref={audioRef}
        controls={controls}
        autoPlay={autoplay}
        preload={preload}
        muted={muted}
        loop={loop}
        crossOrigin={crossOrigin}
        className={className}
        style={style}
      />
    );
  }
);

AudioElement.displayName = 'AudioElement';

export { MediaElementLike, createMediaElementAdapter } from '@vjs-10/media';