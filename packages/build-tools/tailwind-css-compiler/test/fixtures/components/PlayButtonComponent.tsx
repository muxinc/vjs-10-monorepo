import React from 'react';

export const PlayButton = ({ isPlaying, onClick }) => {
  return (
    <button
      className={`
        relative inline-flex min-w-0 cursor-pointer select-none items-center
        justify-center rounded-full p-2 transition-all duration-150
        ${isPlaying ? 'hover:bg-blue-600 data-[playing=true]:bg-blue-500' : 'hover:bg-gray-600'}
        focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed
      `}
      onClick={onClick}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        {isPlaying ? (
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        ) : (
          <path d="M8 5v14l11-7z" />
        )}
      </svg>
    </button>
  );
};