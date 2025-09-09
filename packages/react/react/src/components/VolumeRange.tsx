import React from 'react';
import {
  shallowEqual,
  useMediaSelector,
  useMediaStore,
} from '@vjs-10/react-media-store';
import { volumeRangeStateDefinition } from '@vjs-10/media-store';

interface VolumeRangeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const VolumeRange: React.FC<VolumeRangeProps> = ({
  className,
  style,
  ...props
}) => {
  const mediaStore = useMediaStore();

  // Use useMediaSelector to properly subscribe to state changes
  const mediaState = useMediaSelector(
    volumeRangeStateDefinition.stateTransform,
    shallowEqual,
  );

  const methods = React.useMemo(
    () => volumeRangeStateDefinition.createRequestMethods(mediaStore.dispatch),
    [mediaStore],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    methods.requestVolumeChange(parseFloat(e.target.value));
  };

  const displayValue = mediaState.muted ? 0 : mediaState.volume;

  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={displayValue}
      onChange={handleChange}
      aria-label="Volume"
      aria-valuetext={`${Math.round(displayValue * 100)}%`}
      data-muted={mediaState.muted}
      data-volume-level={mediaState.volumeLevel}
      className={className}
      style={style}
      {...props}
    />
  );
};
