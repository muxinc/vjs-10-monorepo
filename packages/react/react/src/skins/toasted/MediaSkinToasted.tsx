import type { PropsWithChildren } from 'react';

import {
  MicroFullscreenEnterIcon,
  MicroFullscreenExitIcon,
  MicroPauseIcon,
  MicroPlayIcon,
  MicroVolumeHighIcon,
  MicroVolumeLowIcon,
  MicroVolumeOffIcon,
} from '@vjs-10/react-icons';

import Popover from '@/components/Popover';

import Tooltip from '@/components/Tooltip';
import VolumeSlider from '@/components/VolumeSlider';
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
        <Tooltip.Root delay={500} closeDelay={0}>
          <Tooltip.Trigger>
            <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
              <MicroPlayIcon className={`${styles.PlayIcon} ${styles.Icon}`} />
              <MicroPauseIcon className={`${styles.PauseIcon} ${styles.Icon}`} />
            </PlayButton>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="top-start" sideOffset={6} collisionPadding={12}>
              <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.PlayTooltipPopup}`}>
                <span className={styles.PlayTooltip}>Play</span>
                <span className={styles.PauseTooltip}>Pause</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>

        <div className="flex items-center gap-1">
          <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className={styles.TimeDisplay}
          />

          <span className={styles.DurationDisplay}>
            /
            <DurationDisplay className={`${styles.TimeDisplay}`} />
          </span>
        </div>

        <TimeSlider.Root className={`${styles.SliderRoot} ${styles.TimeSliderRoot}`}>
          <TimeSlider.Track className={styles.SliderTrack}>
            <TimeSlider.Progress className={styles.SliderProgress} />
            <TimeSlider.Pointer className={styles.SliderPointer} />
          </TimeSlider.Track>
          <TimeSlider.Thumb className={styles.SliderThumb} />
        </TimeSlider.Root>

        <div className={styles.ButtonGroup}>
          <Popover.Root openOnHover delay={200} closeDelay={300}>
            <Popover.Trigger>
              <MuteButton className={`${styles.Button} ${styles.IconButton} ${styles.MuteButton}`}>
                <MicroVolumeHighIcon className={`${styles.VolumeHighIcon} ${styles.Icon}`} />
                <MicroVolumeLowIcon className={`${styles.VolumeLowIcon} ${styles.Icon}`} />
                <MicroVolumeOffIcon className={`${styles.VolumeOffIcon} ${styles.Icon}`} />
              </MuteButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="top" sideOffset={2}>
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

          <Tooltip.Root delay={500} closeDelay={0}>
            <Tooltip.Trigger>
              <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullscreenButton}`}>
                <MicroFullscreenEnterIcon className={`${styles.FullscreenEnterIcon} ${styles.Icon}`} />
                <MicroFullscreenExitIcon className={`${styles.FullscreenExitIcon} ${styles.Icon}`} />
              </FullscreenButton>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="top-end" sideOffset={6} collisionPadding={12}>
                <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.FullscreenTooltipPopup}`}>
                  <span className={styles.FullscreenEnterTooltip}>Enter Fullscreen</span>
                  <span className={styles.FullscreenExitTooltip}>Exit Fullscreen</span>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </MediaContainer>
  );
}
