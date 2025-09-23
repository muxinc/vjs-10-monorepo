import styles from './styles';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@vjs-10/react-icons';

import { CurrentTimeDisplay } from '../components/CurrentTimeDisplay';
import { DurationDisplay } from '../components/DurationDisplay';
import { FullscreenButton } from '../components/FullscreenButton';
import { MediaContainer } from '../components/MediaContainer';
import MuteButton from '../components/MuteButton';
import PlayButton from '../components/PlayButton';
// import { VolumeRange } from '../components/VolumeRange';
import { TimeRange } from '../components/TimeRange';

export const MediaSkinDefault: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MediaContainer className={styles.MediaContainer}>
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

        {/* TODO: Volume slider in a popover (requires building a popover and vertical orientation slider) or we just inline it on larger displays? */}
        {/* <VolumeRange className={legacyStyles.VolumeRange} /> */}

        <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
          <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
          <FullscreenExitIcon className={styles.FullScreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>
  );
};
