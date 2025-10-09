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
import { TimeSlider } from '../../components/TimeSlider';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinDefault({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls}>
        <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
          <PlayIcon className={styles.PlayIcon}></PlayIcon>
          <PauseIcon className={styles.PauseIcon}></PauseIcon>
        </PlayButton>

        <div className="flex items-center gap-1">
          <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className={styles.TimeDisplay}
          />
          <span className="opacity-50">/</span>
          <DurationDisplay className={`${styles.TimeDisplay} opacity-50`} />
        </div>

        <TimeSlider.Root className={`${styles.SliderRoot} ${styles.TimeSliderRoot}`}>
          <TimeSlider.Track className={styles.SliderTrack}>
            <TimeSlider.Progress className={styles.SliderProgress} />
            <TimeSlider.Pointer className={styles.SliderPointer} />
          </TimeSlider.Track>
          <TimeSlider.Thumb className={`${styles.SliderThumb} ${styles.TimeSliderThumb}`} />
        </TimeSlider.Root>

        <div className={styles.ButtonGroup}>
          <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.MuteButton}`}>
            <VolumeHighIcon className={styles.VolumeHighIcon} />
            <VolumeLowIcon className={styles.VolumeLowIcon} />
            <VolumeOffIcon className={styles.VolumeOffIcon} />
          </MuteButton>

          <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
            <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
            <FullscreenExitIcon className={styles.FullScreenExitIcon} />
          </FullscreenButton>
        </div>
      </div>
    </MediaContainer>
  );
};
