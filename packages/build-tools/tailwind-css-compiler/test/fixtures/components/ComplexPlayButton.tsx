import React from 'react';

export interface ComplexPlayButtonProps {
  isPlaying: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ComplexPlayButton: React.FC<ComplexPlayButtonProps> = ({
  isPlaying,
  disabled = false,
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        cursor-pointer select-none p-2 rounded-full
        transition-all duration-150 ease-in-out
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
        ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
      `}
      data-playing={isPlaying}
      data-disabled={disabled}
      disabled={disabled}
    >
      <PlayIcon
        className={`w-6 h-6 ${isPlaying ? 'hidden' : 'block'}`}
        data-state="play"
      />
      <PauseIcon
        className={`w-6 h-6 ${isPlaying ? 'block' : 'hidden'}`}
        data-state="pause"
      />
    </button>
  );
};

const PlayIcon: React.FC<{ className?: string; 'data-state'?: string }> = ({ className, ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string; 'data-state'?: string }> = ({ className, ...props }) => (
  <svg className={className} {...props} viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);