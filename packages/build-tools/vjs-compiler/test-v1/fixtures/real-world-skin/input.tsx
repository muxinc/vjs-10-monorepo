import * as React from 'react';

import { PauseIcon, PlayIcon, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';

import { CurrentTimeDisplay } from '../components/CurrentTimeDisplay';
import { DurationDisplay } from '../components/DurationDisplay';
import { MediaContainer } from '../components/MediaContainer';
import MuteButton from '../components/MuteButton';
import PlayButton from '../components/PlayButton';
import { TimeRange } from '../components/TimeRange';

export const MediaSkin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MediaContainer className="media-skin">
      {children}
      <div className="controls">
        <PlayButton className="play-btn">
          <PlayIcon />
          <PauseIcon />
        </PlayButton>
        <CurrentTimeDisplay showRemaining />
        <TimeRange.Root className="time-range">
          <TimeRange.Track>
            <TimeRange.Progress />
            <TimeRange.Pointer />
          </TimeRange.Track>
          <TimeRange.Thumb />
        </TimeRange.Root>
        <DurationDisplay />
        <MuteButton className="mute-btn">
          <VolumeHighIcon />
          <VolumeLowIcon />
          <VolumeOffIcon />
        </MuteButton>
      </div>
    </MediaContainer>
  );
};
