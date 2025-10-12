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
import { Popover } from '../../components/Popover';
import { TimeSlider } from '../../components/TimeSlider';
import { Tooltip } from '../../components/Tooltip';
import { VolumeSlider } from '../../components/VolumeSlider';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinDefault({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <Tooltip.Root delay={400} closeDelay={0}>
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

        <Tooltip.Root delay={400} closeDelay={0}>
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

// function ArrowSvg(props: React.ComponentProps<'svg'>) {
//   return (
//     <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
//       <path
//         d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
//         className={styles.ArrowFill}
//       />
//       <path
//         d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
//         className={styles.ArrowOuterStroke}
//       />
//       <path
//         d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
//         className={styles.ArrowInnerStroke}
//       />
//     </svg>
//   );
// }
