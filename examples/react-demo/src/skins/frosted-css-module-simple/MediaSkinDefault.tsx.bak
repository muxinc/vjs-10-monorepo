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
} from '@vjs-10/react';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@vjs-10/react-icons';

import styles from './styles.module.css';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Simplified frosted skin using CSS modules with @apply
 *
 * NOTE: This version removes all problematic Tailwind patterns that don't work with @apply:
 * - Named groups/containers (group/root, @container/root)
 * - Arbitrary variants ([&_svg], [&_.icon])
 * - Complex interactive states
 *
 * Icon visibility is handled via inline classes since @apply can't handle
 * arbitrary child selectors like [&_.pause-icon]:opacity-100
 */
export default function MediaSkinDefault({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
              <PlayIcon className={styles.PlayIcon}></PlayIcon>
              <PauseIcon className={styles.PauseIcon}></PauseIcon>
            </PlayButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={12} collisionPadding={12}>
              <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.PlayTooltipPopup}`}>
                <span className={styles.PlayTooltip}>Play</span>
                <span className={styles.PauseTooltip}>Pause</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>

        <div className={styles.TimeControls}>
          <CurrentTimeDisplay className={styles.TimeDisplay} />

          <TimeSlider.Root className={styles.SliderRoot}>
            <TimeSlider.Track className={styles.SliderTrack}>
              <TimeSlider.Progress className={styles.SliderProgress} />
              <TimeSlider.Pointer className={styles.SliderPointer} />
            </TimeSlider.Track>
            <TimeSlider.Thumb className={styles.SliderThumb} />
          </TimeSlider.Root>

          <DurationDisplay className={styles.TimeDisplay} />
        </div>

        <Popover.Root openOnHover delay={200} closeDelay={100}>
          <Popover.Trigger>
            <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.MuteButton}`}>
              <VolumeHighIcon className={styles.VolumeHighIcon} />
              <VolumeLowIcon className={styles.VolumeLowIcon} />
              <VolumeOffIcon className={styles.VolumeOffIcon} />
            </MuteButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="top" sideOffset={12}>
              <Popover.Popup className={styles.PopoverPopup}>
                <VolumeSlider.Root className={styles.SliderRoot} orientation="vertical">
                  <VolumeSlider.Track className={styles.SliderTrack}>
                    <VolumeSlider.Progress className={styles.SliderProgress} />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className={styles.SliderThumb} />
                </VolumeSlider.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
              <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
              <FullscreenExitIcon className={styles.FullScreenExitIcon} />
            </FullscreenButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={12} collisionPadding={12}>
              <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.FullScreenTooltipPopup}`}>
                <span className={styles.FullScreenEnterTooltip}>Enter Fullscreen</span>
                <span className={styles.FullScreenExitTooltip}>Exit Fullscreen</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </MediaContainer>
  );
}
