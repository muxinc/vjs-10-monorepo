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

export default function MediaSkinDefault({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      <div className={styles.Controls} data-testid="media-controls">
        {/* <header className='py-2 px-2.5 text-shadow-sm text-shadow-black/10'>
          <h1 className="text-base font-medium">Example Video</h1>
          <p className="text-stone-400">This is just a description for the example video.</p>
        </header> */}

        <div className={styles.ControlsRow}>
          <TimeRange.Root className={styles.SliderRoot}>
            <TimeRange.Track className={styles.SliderTrack}>
              <TimeRange.Progress className={styles.SliderProgress} />
              <TimeRange.Pointer className={styles.SliderPointer} />
            </TimeRange.Track>
            <TimeRange.Thumb className={`${styles.SliderThumb} ${styles.TimeSliderThumb}`} />
          </TimeRange.Root>
        </div>

        <div className={styles.ControlsRow}>
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-0.5">
            <div className={styles.VolumeControls}>
              <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.VolumeButton}`}>
                <VolumeHighIcon className={styles.VolumeHighIcon} />
                <VolumeLowIcon className={styles.VolumeLowIcon} />
                <VolumeOffIcon className={styles.VolumeOffIcon} />
              </MuteButton>

              <div className={styles.VolumeSlider}>
                <VolumeRange.Root className={styles.SliderRoot}>
                  <VolumeRange.Track className={styles.SliderTrack}>
                    <VolumeRange.Progress className={styles.SliderProgress} />
                  </VolumeRange.Track>
                  <VolumeRange.Thumb className={styles.SliderThumb} />
                </VolumeRange.Root>
              </div>
            </div>

            <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
              <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
              <FullscreenExitIcon className={styles.FullScreenExitIcon} />
            </FullscreenButton>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
};
