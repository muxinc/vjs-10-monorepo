import type { PropsWithChildren } from 'react';

import {
  CurrentTimeDisplay,
  DurationDisplay,
  FullscreenButton,
  MediaContainer,
  MuteButton,
  PlayButton,
  Popover,
  TimeSlider,
  Tooltip,
  VolumeSlider,
} from '@videojs/react';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@videojs/react/icons';

import './frosted.css';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function FrostedPlayer({
  children,
  className = '',
}: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`vjs media-container ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className="overlay" aria-hidden="true" />

      <div className="controls" data-testid="media-controls">
        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <PlayButton className="button icon-button play-button">
              <PlayIcon className="icon play-icon"></PlayIcon>
              <PauseIcon className="icon pause-icon"></PauseIcon>
            </PlayButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner
              side="top"
              sideOffset={12}
              collisionPadding={12}
            >
              <Tooltip.Popup className="tooltip-popup play-tooltip-popup">
                <span className="play-tooltip">Play</span>
                <span className="pause-tooltip">Pause</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>

        <div className="time-controls">
          <CurrentTimeDisplay className="time-display" />

          <TimeSlider.Root className="slider-root">
            <TimeSlider.Track className="slider-track">
              <TimeSlider.Progress className="slider-progress" />
              <TimeSlider.Pointer className="slider-pointer" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="slider-thumb" />
          </TimeSlider.Root>

          <DurationDisplay className="time-display" />
        </div>

        <Popover.Root openOnHover delay={200} closeDelay={100}>
          <Popover.Trigger>
            <MuteButton className="button icon-button mute-button">
              <VolumeHighIcon className="icon volume-high-icon" />
              <VolumeLowIcon className="icon volume-low-icon" />
              <VolumeOffIcon className="icon volume-off-icon" />
            </MuteButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="top" sideOffset={12}>
              <Popover.Popup className="popover-popup">
                <VolumeSlider.Root
                  className="slider-root"
                  orientation="vertical"
                >
                  <VolumeSlider.Track className="slider-track">
                    <VolumeSlider.Progress className="slider-progress" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="slider-thumb" />
                </VolumeSlider.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <FullscreenButton className="button icon-button fullscreen-button">
              <FullscreenEnterIcon className="icon fullscreen-enter-icon" />
              <FullscreenExitIcon className="icon fullscreen-exit-icon" />
            </FullscreenButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner
              side="top"
              sideOffset={12}
              collisionPadding={12}
            >
              <Tooltip.Popup className="tooltip-popup fullscreen-tooltip-popup">
                <span className="fullscreen-enter-tooltip">
                  Enter Fullscreen
                </span>
                <span className="fullscreen-exit-tooltip">Exit Fullscreen</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </MediaContainer>
  );
}
