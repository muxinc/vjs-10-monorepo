import type { PropsWithChildren } from 'react';
import { FullscreenEnterIcon, FullscreenExitIcon, PauseIcon, PlayIcon, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import { CurrentTimeDisplay } from '../../../../components/CurrentTimeDisplay';
import { DurationDisplay } from '../../../../components/DurationDisplay';
import { FullscreenButton } from '../../../../components/FullscreenButton';
import { MediaContainer } from '../../../../components/MediaContainer';
import MuteButton from '../../../../components/MuteButton';
import { Popover } from '../../../../components/Popover';
import PlayButton from '../../../../components/PlayButton';
import { TimeRange } from '../../../../components/TimeRange';
import { VolumeRange } from '../../../../components/VolumeRange';
import styles from "./MediaSkinDefault.module.css";
type SkinProps = PropsWithChildren<{
  className?: string;
}>;
export default function MediaSkinDefault({
  children,
  className = ''
}: SkinProps): JSX.Element {
  return <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
          <PlayIcon className={styles.PlayIcon}></PlayIcon>
          <PauseIcon className={styles.PauseIcon}></PauseIcon>
        </PlayButton>

        <div className={styles.TimeControls}>
          <CurrentTimeDisplay
        // Use showRemaining to show count down/remaining time
        // showRemaining
        className={styles.TimeDisplay} />

          <TimeRange.Root className={styles.SliderRoot}>
            <TimeRange.Track className={styles.SliderTrack}>
              <TimeRange.Progress className={styles.SliderProgress} />
              <TimeRange.Pointer className={styles.SliderPointer} />
            </TimeRange.Track>
            <TimeRange.Thumb className={styles.SliderThumb} />
          </TimeRange.Root>

          <DurationDisplay className={styles.TimeDisplay} />
        </div>

        <Popover.Root openOnHover delay={200} closeDelay={100}>
          <Popover.Trigger>
            <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.VolumeButton}`}>
              <VolumeHighIcon className={styles.VolumeHighIcon} />
              <VolumeLowIcon className={styles.VolumeLowIcon} />
              <VolumeOffIcon className={styles.VolumeOffIcon} />
            </MuteButton>
          </Popover.Trigger>
          <Popover.Positioner side="top" sideOffset={8}>
            <Popover.Popup className={styles.PopoverPopup}>
              <VolumeRange.Root className={styles.SliderRoot} orientation="vertical">
                <VolumeRange.Track className={styles.SliderTrack}>
                  <VolumeRange.Progress className={styles.SliderProgress} />
                </VolumeRange.Track>
                <VolumeRange.Thumb className={styles.SliderThumb} />
              </VolumeRange.Root>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>

        <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullscreenButton}`}>
          <FullscreenEnterIcon className={styles.FullscreenEnterIcon} />
          <FullscreenExitIcon className={styles.FullscreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>;
}
;