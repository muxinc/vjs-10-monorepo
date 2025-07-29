import React, { useRef, useEffect } from 'react';

export * from '@vjs-10/react-icons';
export * from '@vjs-10/react-media-elements';
export * from '@vjs-10/react-media-store';

import { VideoElement, AudioElement, MediaElementRef } from '@vjs-10/react-media-elements';
import { MediaStoreProvider, useMediaElementStore, useCurrentTime, useVolume, usePlaybackState } from '@vjs-10/react-media-store';
import { PlayIcon, PauseIcon, VolumeUpIcon, VolumeOffIcon, FullscreenIcon } from '@vjs-10/react-icons';

export interface PlayerProps {
  src?: string;
  type?: 'video' | 'audio';
  controls?: boolean;
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  muted?: boolean;
  loop?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onEnded?: () => void;
}

const PlayerControls: React.FC<{ elementRef: React.RefObject<MediaElementRef> }> = ({ elementRef }) => {
  const [currentTime, setCurrentTime] = useCurrentTime();
  const [volume, muted, setVolume, setMuted] = useVolume();
  const [paused, play, pause] = usePlaybackState();

  const handlePlayPause = () => {
    if (paused) {
      play();
      elementRef.current?.play();
    } else {
      pause();
      elementRef.current?.pause();
    }
  };

  const handleVolumeToggle = () => {
    setMuted(!muted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const duration = elementRef.current?.duration || 0;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
  };

  const duration = elementRef.current?.duration || 0;
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
      className="vjs-control-bar"
    >
      <button
        onClick={handlePlayPause}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {paused ? <PlayIcon size={20} /> : <PauseIcon size={20} />}
      </button>

      <div
        onClick={handleProgressClick}
        style={{
          flex: 1,
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#ff0000',
            borderRadius: '2px',
            width: `${progressPercentage}%`,
            transition: 'width 0.1s ease',
          }}
        />
      </div>

      <button
        onClick={handleVolumeToggle}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {muted ? <VolumeOffIcon size={20} /> : <VolumeUpIcon size={20} />}
      </button>
    </div>
  );
};

export const Player: React.FC<PlayerProps> = ({
  src,
  type = 'video',
  controls = true,
  width = '100%',
  height = type === 'video' ? '300px' : '60px',
  className,
  style,
  ...props
}) => {
  const elementRef = useRef<MediaElementRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useMediaElementStore(elementRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !controls) return;

    const handleMouseEnter = () => {
      const controlBar = container.querySelector('.vjs-control-bar') as HTMLElement;
      if (controlBar) {
        controlBar.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      const controlBar = container.querySelector('.vjs-control-bar') as HTMLElement;
      if (controlBar) {
        controlBar.style.opacity = '0';
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [controls]);

  const MediaElement = type === 'video' ? VideoElement : AudioElement;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        background: '#000',
        ...style,
      }}
    >
      <MediaElement
        ref={elementRef}
        src={src}
        controls={false}
        style={{ width: '100%', height: '100%' }}
        {...props}
      />
      {controls && <PlayerControls elementRef={elementRef} />}
    </div>
  );
};

export const MediaPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MediaStoreProvider>{children}</MediaStoreProvider>;
};