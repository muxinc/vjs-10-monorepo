import styles from './styles';

import type { DefaultSkinIcons } from './icons';
import type { ReactNode } from 'react';

import { CurrentTimeDisplay } from '../../components/CurrentTimeDisplay';
import { DurationDisplay } from '../../components/DurationDisplay';
import { FullscreenButton } from '../../components/FullscreenButton';
import { MediaContainer } from '../../components/MediaContainer';
import MuteButton from '../../components/MuteButton';
import PlayButton from '../../components/PlayButton';
import { TimeRange } from '../../components/TimeRange';
import { VolumeRange } from '../../components/VolumeRange';

export type MediaSkinDefaultProps = {
  icons: DefaultSkinIcons;
  className?: string;
  children?: ReactNode;
};

export default function MediaSkinDefault({
  icons: Icon,
  children,
  className = '',
}: MediaSkinDefaultProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
          <Icon.PlayButton.Play className={styles.PlayIcon} />
          <Icon.PlayButton.Pause className={styles.PauseIcon} />
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
          <Icon.MuteButton.VolumeHigh className={styles.VolumeHighIcon} />
          <Icon.MuteButton.VolumeLow className={styles.VolumeLowIcon} />
          <Icon.MuteButton.VolumeOff className={styles.VolumeOffIcon} />
        </MuteButton>

        <VolumeRange.Root className={styles.VolumeRangeRoot}>
          <VolumeRange.Track className={styles.VolumeRangeTrack}>
            <VolumeRange.Progress className={styles.VolumeRangeProgress} />
          </VolumeRange.Track>
          <VolumeRange.Thumb className={styles.VolumeRangeThumb} />
        </VolumeRange.Root>

        <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
          <Icon.FullscreenButton.Enter className={styles.FullScreenEnterIcon} />
          <Icon.FullscreenButton.Exit className={styles.FullScreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>
  );
}
