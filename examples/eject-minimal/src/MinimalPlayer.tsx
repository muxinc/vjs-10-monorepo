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
  FullscreenEnterAltIcon,
  FullscreenExitAltIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@videojs/react/icons';

import './minimal.css';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MinimalSkin({
  children,
  className = '',
}: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`vjs media-container ${className}`}>
      {children}

      <div className="overlay" aria-hidden="true" />

      <div className="controls">
        <Tooltip.Root delay={500} closeDelay={0}>
          <Tooltip.Trigger>
            <PlayButton className="button icon-button play-button">
              <PlayIcon className="play-icon icon" />
              <PauseIcon className="pause-icon icon" />
            </PlayButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner
              side="top-start"
              sideOffset={6}
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
          <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className="time-display"
          />

          <span className="duration-display">
            /
            <DurationDisplay className="time-display" />
          </span>
        </div>

        <TimeSlider.Root className="slider-root time-slider-root">
          <TimeSlider.Track className="slider-track">
            <TimeSlider.Progress className="slider-progress" />
            <TimeSlider.Pointer className="slider-pointer" />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="slider-thumb" />
        </TimeSlider.Root>

        <div className="button-group">
          <Popover.Root openOnHover delay={200} closeDelay={300}>
            <Popover.Trigger>
              <MuteButton className="button icon-button mute-button">
                <VolumeHighIcon className="volume-high-icon icon" />
                <VolumeLowIcon className="volume-low-icon icon" />
                <VolumeOffIcon className="volume-off-icon icon" />
              </MuteButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="top" sideOffset={2}>
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

          <Tooltip.Root delay={500} closeDelay={0}>
            <Tooltip.Trigger>
              <FullscreenButton className="button icon-button fullscreen-button">
                <FullscreenEnterAltIcon className="fullscreen-enter-icon icon" />
                <FullscreenExitAltIcon className="fullscreen-exit-icon icon" />
              </FullscreenButton>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="top-end"
                sideOffset={6}
                collisionPadding={12}
              >
                <Tooltip.Popup className="tooltip-popup fullscreen-tooltip-popup">
                  <span className="fullscreen-enter-tooltip">
                    Enter Fullscreen
                  </span>
                  <span className="fullscreen-exit-tooltip">
                    Exit Fullscreen
                  </span>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </MediaContainer>
  );
}
