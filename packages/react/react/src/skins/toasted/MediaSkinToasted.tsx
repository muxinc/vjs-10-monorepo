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

      <div className={styles.Controls} data-testid="media-controls">
        {/* <header className='py-2 px-4 text-shadow-sm text-shadow-black/10'>
          <h1 className="text-base font-medium">View From a Blue Moon</h1>
          <p className="text-stone-400">A story about Jon Jon Florence, a surfer from Hawaii.</p>
        </header> */}

        <div className={styles.ControlsRow}>
          <TimeRange.Root className={styles.RangeRoot}>
            <TimeRange.Track className={styles.RangeTrack}>
              <TimeRange.Progress className={styles.RangeProgress} />
              <TimeRange.Pointer className={styles.RangePointer} />
            </TimeRange.Track>
            <TimeRange.Thumb className={`${styles.RangeThumb} ${styles.TimeRangeThumb}`} />
          </TimeRange.Root>
        </div>

        <div className={styles.ControlsRow}>
          <div className='flex items-center gap-3'>
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
              <span className='opacity-50'>/</span>
              <DurationDisplay className={`${styles.TimeDisplay} opacity-50`} />
            </div>
          </div>


          <div className='flex items-center gap-0.5'>
            <div className={styles.VolumeControls}>
              <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.MuteButton}`}>
                <VolumeHighIcon className={styles.VolumeHighIcon} />
                <VolumeLowIcon className={styles.VolumeLowIcon} />
                <VolumeOffIcon className={styles.VolumeOffIcon} />
              </MuteButton>

              <div className={styles.VolumeSlider}>
                <VolumeRange.Root className={styles.RangeRoot}>
                  <VolumeRange.Track className={styles.RangeTrack}>
                    <VolumeRange.Progress className={styles.RangeProgress} />
                  </VolumeRange.Track>
                  <VolumeRange.Thumb className={styles.RangeThumb} />
                </VolumeRange.Root>
              </div>
            </div>

            <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullscreenButton}`}>
              <FullscreenEnterIcon className={styles.FullscreenEnterIcon} />
              <FullscreenExitIcon className={styles.FullscreenExitIcon} />
            </FullscreenButton>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
};
