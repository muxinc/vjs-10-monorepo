import * as React from 'react';
import PlayButton from '../components/PlayButton';
import MuteButton from '../components/MuteButton';
import FullscreenButton from '../components/FullscreenButton';
import DurationDisplay from '../components/DurationDisplay';
import CurrentTimeDisplay from '../components/CurrentTimeDisplay';
import { MediaContainer } from '../components/MediaContainer';
import {
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from '@vjs-10/react-icons';

export const MediaSkinTest: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MediaContainer>
      {children}
      <div>
        <CurrentTimeDisplay showRemaining />
        <DurationDisplay />
        <FullscreenButton>
          <PlayIcon />
          <PauseIcon />
        </FullscreenButton>
        <PlayButton>
          <FullscreenEnterIcon />
          <FullscreenExitIcon />
        </PlayButton>
        <MuteButton>
          <VolumeHighIcon />
          <VolumeLowIcon />
          <VolumeOffIcon />
        </MuteButton>
      </div>
    </MediaContainer>
  );
};

export default MediaSkinTest;
