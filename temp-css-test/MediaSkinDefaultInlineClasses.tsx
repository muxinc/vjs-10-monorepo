import * as React from 'react';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@vjs-10/react-icons';

import { CurrentTimeDisplay } from '../../../../../react/react/src/components/CurrentTimeDisplay';
import { DurationDisplay } from '../../../../../react/react/src/components/DurationDisplay';
import { FullscreenButton } from '../../../../../react/react/src/components/FullscreenButton';
import { MediaContainer } from '../../../../../react/react/src/components/MediaContainer';
import MuteButton from '../../../../../react/react/src/components/MuteButton';
import PlayButton from '../../../../../react/react/src/components/PlayButton';
// import { VolumeRange } from '../../../../../react/react/src/components/VolumeRange';
import { TimeRange } from '../../../../../react/react/src/components/TimeRange';

export const MediaSkinDefault: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MediaContainer className="relative overflow-clip rounded-4xl antialiased font-[510] font-sans text-[0.8125rem] leading-normal tracking-[-0.0125em] [&:fullscreen]:rounded-none [&:fullscreen]:[&_video]:h-full [&:fullscreen]:[&_video]:w-full after:absolute after:inset-0 after:ring-black/10 after:ring-1 dark:after:ring-black/40 after:ring-inset after:z-10 after:pointer-events-none after:rounded-[inherit] before:absolute before:inset-px before:rounded-[inherit] before:ring-white/15 before:ring-1 before:ring-inset before:z-10 before:pointer-events-none">
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div
        className="opacity-0 delay-500 rounded-[inherit] absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition-opacity backdrop-saturate-150 backdrop-brightness-90"
        aria-hidden="true"
      />

      <div
        className="absolute inset-x-3 bottom-3 rounded-full z-20 flex items-center p-1 ring ring-white/10 ring-inset gap-0.5 text-white text-shadow shadow-sm shadow-black/15 bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90 transition will-change-transform origin-bottom ease-out after:absolute after:inset-0 after:ring after:rounded-[inherit] after:ring-black/15 after:pointer-events-none after:z-10 contrast-more:bg-black/90 contrast-more:ring-black contrast-more:after:ring-white/20"
        data-testid="media-controls"
      >
        <PlayButton className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:no-underline hover:bg-white/10 hover:text-white -outline-offset-2 focus-visible:no-underline focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:grayscale aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-busy:pointer-events-none aria-busy:cursor-not-allowed aria-expanded:bg-white/10 aria-expanded:text-white active:scale-95 grid [&_svg]:[grid-area:1/1] [&_svg]:shrink-0 [&_svg]:transition-opacity [&_svg]:duration-300 [&_svg]:ease-out [&_svg]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] [&_svg]:shadow-black/20 [&_.pause-icon]:opacity-100 [&[data-paused]_.pause-icon]:opacity-0 [&_.play-icon]:opacity-0 [&[data-paused]_.play-icon]:opacity-100 [&_svg]:opacity-0">
          <PlayIcon className="play-icon"></PlayIcon>
          <PauseIcon className="pause-icon"></PauseIcon>
        </PlayButton>

        <div className="flex-1 flex items-center gap-3 px-1.5">
          <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className="tabular-nums text-shadow-2xs shadow-black/50"
          />

          <TimeRange.Root className="flex h-5 items-center flex-1 relative">
            <TimeRange.Track className="h-1 w-full relative select-none rounded-full bg-white/20 ring-1 ring-black/5">
              <TimeRange.Progress className="bg-white rounded-[inherit]" />
              <TimeRange.Pointer className="rounded-[inherit]" />
            </TimeRange.Track>
            <TimeRange.Thumb className="bg-white z-10 select-none ring ring-black/10 rounded-full shadow-sm shadow-black/15 opacity-0 transition-[opacity,height,width] ease-in-out -outline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100 size-2.5 active:size-3 group-active/slider:size-3" />
          </TimeRange.Root>

          <DurationDisplay className="tabular-nums text-shadow-2xs shadow-black/50" />
        </div>

        <MuteButton className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:no-underline hover:bg-white/10 hover:text-white -outline-offset-2 focus-visible:no-underline focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:grayscale aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-busy:pointer-events-none aria-busy:cursor-not-allowed aria-expanded:bg-white/10 aria-expanded:text-white active:scale-95 grid [&_svg]:[grid-area:1/1] [&_svg]:shrink-0 [&_svg]:transition-opacity [&_svg]:duration-300 [&_svg]:ease-out [&_svg]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] [&_svg]:shadow-black/20 [&_svg]:opacity-0 [&[data-volume-level=high]_.volume-high-icon]:opacity-100 [&[data-volume-level=medium]_.volume-low-icon]:opacity-100 [&[data-volume-level=low]_.volume-low-icon]:opacity-100 [&[data-volume-level=off]_.volume-off-icon]:opacity-100">
          <VolumeHighIcon className="volume-high-icon" />
          <VolumeLowIcon className="volume-low-icon" />
          <VolumeOffIcon className="volume-off-icon" />
        </MuteButton>

        {/* TODO: Volume slider in a popover (requires building a popover and vertical orientation slider) or we just inline it on larger displays? */}
        {/* <VolumeRange className={legacyStyles.VolumeRange} /> */}

        <FullscreenButton className="cursor-pointer relative shrink-0 transition select-none p-2 rounded-full bg-transparent text-white/90 hover:no-underline hover:bg-white/10 hover:text-white -outline-offset-2 focus-visible:no-underline focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:grayscale aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-busy:pointer-events-none aria-busy:cursor-not-allowed aria-expanded:bg-white/10 aria-expanded:text-white active:scale-95 grid [&_svg]:[grid-area:1/1] [&_svg]:shrink-0 [&_svg]:transition-opacity [&_svg]:duration-300 [&_svg]:ease-out [&_svg]:drop-shadow-[0_1px_0_var(--tw-shadow-color)] [&_svg]:shadow-black/20 [&_.fullscreen-enter-icon]:opacity-100 [&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0 [&_.fullscreen-exit-icon]:opacity-0 [&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100 [&_path]:transition-transform ease-out">
          <FullscreenEnterIcon className="fullscreen-enter-icon group-hover/button:[&_.arrow-1]:-translate-x-px group-hover/button:[&_.arrow-1]:-translate-y-px group-hover/button:[&_.arrow-2]:translate-x-px group-hover/button:[&_.arrow-2]:translate-y-px" />
          <FullscreenExitIcon className="fullscreen-exit-icon [&_.arrow-1]:-translate-x-px [&_.arrow-1]:-translate-y-px [&_.arrow-2]:translate-x-px [&_.arrow-2]:translate-y-px group-hover/button:[&_.arrow-1]:translate-0 group-hover/button:[&_.arrow-2]:translate-0" />
        </FullscreenButton>
      </div>
    </MediaContainer>
  );
};
