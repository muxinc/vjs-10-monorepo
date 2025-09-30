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

export const MediaSkinTestReference: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <MediaContainer>
      {children}
      <div>
        <div></div>
        <div>
          {/* "inline-flex items-center justify-center cursor-pointer relative min-w-0 transition select-none [&_svg]:shrink-0 hocus:no-underline p-2 rounded-full" */}
          <PlayButton className="inline-flex items-center justify-center cursor-pointer relative min-w-0 transition select-none p-2 rounded-full">
            <PlayIcon />
            <PauseIcon />
          </PlayButton>
          <CurrentTimeDisplay showRemaining />
          <DurationDisplay />
          <MuteButton>
            <VolumeHighIcon />
            <VolumeLowIcon />
            <VolumeOffIcon />
          </MuteButton>
          <FullscreenButton>
            <FullscreenEnterIcon />
            <FullscreenExitIcon />
          </FullscreenButton>
        </div>
      </div>
    </MediaContainer>
  );
};

export default MediaSkinTestReference;
