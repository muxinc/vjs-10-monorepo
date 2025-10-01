import type { PropsWithChildren } from 'react';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@vjs-10/react-icons';

import { CurrentTimeDisplay } from '../../components/CurrentTimeDisplay';
import { DurationDisplay } from '../../components/DurationDisplay';
import { FullscreenButton } from '../../components/FullscreenButton';
import { MediaContainer } from '../../components/MediaContainer';
import MuteButton from '../../components/MuteButton';
import PlayButton from '../../components/PlayButton';
import { TimeRange } from '../../components/TimeRange';
import { VolumeRange } from '../../components/VolumeRange';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinToasted({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
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
            className={styles.TimeDisplay}
          />

          <TimeRange.Root className={styles.TimeRangeRoot}>
            <TimeRange.Track className={styles.TimeRangeTrack}>
              <TimeRange.Progress className={styles.TimeRangeProgress} />
              <TimeRange.Pointer className={styles.TimeRangePointer} />
            </TimeRange.Track>
            <TimeRange.Thumb className={styles.TimeRangeThumb} />
          </TimeRange.Root>

          <DurationDisplay className={styles.TimeDisplay} />
        </div>

        <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.VolumeButton}`}>
          <VolumeHighIcon className={styles.VolumeHighIcon} />
          <VolumeLowIcon className={styles.VolumeLowIcon} />
          <VolumeOffIcon className={styles.VolumeOffIcon} />
        </MuteButton>

        <VolumeRange.Root className={styles.VolumeRangeRoot}>
          <VolumeRange.Track className={styles.VolumeRangeTrack}>
            <VolumeRange.Progress className={styles.VolumeRangeProgress} />
          </VolumeRange.Track>
          <VolumeRange.Thumb className={styles.VolumeRangeThumb} />
        </VolumeRange.Root>

        <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
          <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
          <FullscreenExitIcon className={styles.FullScreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>
  );
};
