import * as React from 'react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import PlayButton from '../../../../../../../packages/react/react/src/components/PlayButton';
import MuteButton from '../../../../../../../packages/react/react/src/components/MuteButton';
import { VolumeRange } from '../../../../../../../packages/react/react/src/components/VolumeRange';
import { TimeRange } from '../../../../../../../packages/react/react/src/components/TimeRange';
import { FullscreenButton } from '../../../../../../../packages/react/react/src/components/FullscreenButton';
import { DurationDisplay } from '../../../../../../../packages/react/react/src/components/DurationDisplay';
import { CurrentTimeDisplay } from '../../../../../../../packages/react/react/src/components/CurrentTimeDisplay';
import { MediaContainer } from '../../../../../../../packages/react/react/src/components/MediaContainer';
import {
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
} from '@vjs-10/react-icons';

export const MediaSkinTailwind: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MediaContainer className="inline-block relative text-white">
      {children}
      <div className="absolute top-0 left-0 bottom-0 right-0 flex flex-col items-start bg-none pointer-events-none">
        <div className="flex-1"></div>
        <div className="flex items-center justify-start w-full pointer-events-auto">
          <PlayButton className="border-0 bg-gray-800/70 p-1 cursor-pointer text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-400 [&[data-paused]_.play-icon]:block [&:not([data-paused])_.pause-icon]:block">
            <PlayIcon className="play-icon w-6 h-6 hidden"></PlayIcon>
            <PauseIcon className="pause-icon w-6 h-6 hidden"></PauseIcon>
          </PlayButton>
          <CurrentTimeDisplay className="bg-gray-800/70 px-2 py-1 text-white font-mono text-sm rounded-sm min-w-12 text-center" />
          <TimeRange.Root className="flex items-center relative min-w-25 w-full py-3 mx-2">
            <TimeRange.Track className="relative w-full h-1.5 bg-gray-300 rounded overflow-hidden">
              <TimeRange.Progress className="bg-blue-500 rounded-inherit" />
              <TimeRange.Pointer className="bg-white/50 pointer-events-none" />
            </TimeRange.Track>
            <TimeRange.Thumb className="w-3 h-3 bg-white rounded-full pointer-events-none" />
          </TimeRange.Root>
          <DurationDisplay className="bg-gray-800/70 px-2 py-1 text-white font-mono text-sm rounded-sm min-w-12 text-center" />
          <MuteButton className="border-0 bg-gray-800/70 p-1 cursor-pointer text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-400 data-[muted]:bg-red-600/80 [&:not([data-volume-level])_.volume-low]:block [&[data-volume-level=high]_.volume-high]:block [&[data-volume-level=low]_.volume-low]:block [&[data-volume-level=medium]_.volume-low]:block [&[data-volume-level=off]_.volume-off]:block">
            <VolumeHighIcon className="volume-high w-6 h-6 hidden" />
            <VolumeLowIcon className="volume-low w-6 h-6 hidden" />
            <VolumeOffIcon className="volume-off w-6 h-6 hidden" />
          </MuteButton>
          <VolumeRange className="w-16 mx-2" />
          <FullscreenButton className="border-0 bg-gray-800/70 p-1 cursor-pointer text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-400 data-[fullscreen]:bg-green-600/80 [&:not([data-fullscreen])_.fullscreen-enter]:block [&[data-fullscreen]_.fullscreen-exit]:block">
            <FullscreenEnterIcon className="fullscreen-enter w-6 h-6 hidden" />
            <FullscreenExitIcon className="fullscreen-exit w-6 h-6 hidden" />
          </FullscreenButton>
        </div>
      </div>
    </MediaContainer>
  );
};