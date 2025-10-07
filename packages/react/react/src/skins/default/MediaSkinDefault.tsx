import styles from './styles';

import type { PropsWithChildren } from 'react';
import { useRef } from 'react';

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
import { TimeRange } from '../../components/TimeRange';
import { Tooltip } from '../../components/Tooltip';
import { VolumeRange } from '../../components/VolumeRange';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinDefault({ children, className = '' }: SkinProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <MediaContainer ref={containerRef} className={`${styles.MediaContainer} ${className}`}>
      {children}

      {/* Background gradient to help with controls contrast. */}
      <div className={styles.Overlay} aria-hidden="true" />

      <div className={styles.Controls} data-testid="media-controls">
        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
              <PlayIcon className={styles.PlayIcon}></PlayIcon>
              <PauseIcon className={styles.PauseIcon}></PauseIcon>
            </PlayButton>
          </Tooltip.Trigger>
          <Tooltip.Portal container={portalRef.current}>
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
          <Popover.Portal container={portalRef.current}>
            <Popover.Positioner side="top" sideOffset={12}>
              <Popover.Popup className={styles.PopoverPopup}>
                <VolumeRange.Root className={styles.SliderRoot} orientation="vertical">
                  <VolumeRange.Track className={styles.SliderTrack}>
                    <VolumeRange.Progress className={styles.SliderProgress} />
                  </VolumeRange.Track>
                  <VolumeRange.Thumb className={styles.SliderThumb} />
                </VolumeRange.Root>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Tooltip.Root delay={600} closeDelay={0}>
          <Tooltip.Trigger>
            <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullScreenButton}`}>
              <FullscreenEnterIcon className={styles.FullScreenEnterIcon} />
              <FullscreenExitIcon className={styles.FullScreenExitIcon} />
            </FullscreenButton>
          </Tooltip.Trigger>
          <Tooltip.Portal container={portalRef.current}>
            <Tooltip.Positioner side="top" sideOffset={12} collisionPadding={12}>
              <Tooltip.Popup className={`${styles.TooltipPopup} ${styles.FullScreenTooltipPopup}`}>
                <span className={styles.FullScreenEnterTooltip}>Enter Fullscreen</span>
                <span className={styles.FullScreenExitTooltip}>Exit Fullscreen</span>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      <div ref={portalRef} className="absolute z-10" />
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
