import type { PropsWithChildren } from 'react';
import {
  CurrentTimeDisplay,
  DurationDisplay,
  FullscreenButton,
  MediaContainer,
  MuteButton,
  PlayButton,
  Popover,
  PreviewTimeDisplay,
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
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinProduction({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <Tooltip.Root delay={500}>
          <Tooltip.Trigger>
            <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
              <PlayIcon className={`${styles.PlayIcon} ${styles.Icon}`} />
              <PauseIcon className={`${styles.PauseIcon} ${styles.Icon}`} />
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
          <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className={styles.TimeDisplay}
          />

          <Tooltip.Root trackCursorAxis="x">
            <Tooltip.Trigger>
              <TimeSlider.Root className={styles.SliderRoot}>
                <TimeSlider.Track className={styles.SliderTrack}>
                  <TimeSlider.Progress className={styles.SliderProgress} />
                  <TimeSlider.Pointer className={styles.SliderPointer} />
                </TimeSlider.Track>
                <TimeSlider.Thumb className={styles.SliderThumb} />
              </TimeSlider.Root>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="top" sideOffset={18} collisionPadding={12}>
                <Tooltip.Popup className={`${styles.TooltipPopup}`}>
                  <PreviewTimeDisplay />
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>

          <DurationDisplay className={styles.TimeDisplay} />
        </div>

        <Popover.Root openOnHover delay={200} closeDelay={100}>
          <Popover.Trigger>
            <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.MuteButton}`}>
              <VolumeHighIcon className={`${styles.VolumeHighIcon} ${styles.Icon}`} />
              <VolumeLowIcon className={`${styles.VolumeLowIcon} ${styles.Icon}`} />
              <VolumeOffIcon className={`${styles.VolumeOffIcon} ${styles.Icon}`} />
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

        <Tooltip.Root delay={500}>
          <Tooltip.Trigger>
            <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullscreenButton}`}>
              <FullscreenEnterIcon className={`${styles.FullscreenEnterIcon} ${styles.Icon}`} />
              <FullscreenExitIcon className={`${styles.FullscreenExitIcon} ${styles.Icon}`} />
            </FullscreenButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={12} collisionPadding={12}>
              <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.FullscreenTooltipPopup}`}>
                <span className={styles.FullscreenEnterTooltip}>Enter Fullscreen</span>
                <span className={styles.FullscreenExitTooltip}>Exit Fullscreen</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </MediaContainer>
  );
}
