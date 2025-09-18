import React from 'react';

export const MediaPlayerButton: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  return (
    <button className={`media-control-button ${isPlaying ? 'playing' : 'paused'} hover:bg-gray-100`}>
      <svg className="w-4 h-4 fill-current">
        {isPlaying ? (
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        ) : (
          <path d="M8 5v14l11-7z" />
        )}
      </svg>
    </button>
  );
};