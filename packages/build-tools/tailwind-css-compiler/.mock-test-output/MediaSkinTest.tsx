import React from 'react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';

export const MediaSkinTest: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="media-container">
      {children}
      <button className="play-button">
        <PlayIcon />
        <PauseIcon />
      </button>
    </div>
  );
};

export default MediaSkinTest;