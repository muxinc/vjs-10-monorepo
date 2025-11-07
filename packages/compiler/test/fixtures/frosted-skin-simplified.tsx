/**
 * Simplified Frosted Skin for Testing
 *
 * Based on packages/react/src/skins/frosted/FrostedSkin.tsx
 * Simplified to focus on component structure without complex Tailwind classes
 */

import {
  CurrentTimeDisplay,
  DurationDisplay,
  FullscreenButton,
  MediaContainer,
  MuteButton,
  PlayButton,
  TimeSlider,
} from '@videojs/react';

import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@videojs/react/icons';

const styles = {
  MediaContainer: 'media-container',
  Overlay: 'overlay',
  Controls: 'controls',
  Button: 'button',
  IconButton: 'icon-button',
  PlayButton: 'play-button',
  Icon: 'icon',
  PlayIcon: 'play-icon',
  PauseIcon: 'pause-icon',
  TimeControls: 'time-controls',
  TimeDisplay: 'time-display',
  SliderRoot: 'slider-root',
  SliderTrack: 'slider-track',
  SliderProgress: 'slider-progress',
  SliderPointer: 'slider-pointer',
  SliderThumb: 'slider-thumb',
  MuteButton: 'mute-button',
  VolumeHighIcon: 'volume-high-icon',
  VolumeLowIcon: 'volume-low-icon',
  VolumeOffIcon: 'volume-off-icon',
  FullscreenButton: 'fullscreen-button',
  FullscreenEnterIcon: 'fullscreen-enter-icon',
  FullscreenExitIcon: 'fullscreen-exit-icon',
};

export default function FrostedSkinSimplified({ children }): JSX.Element {
  return (
    <MediaContainer className={styles.MediaContainer}>
      {children}

      <div className={styles.Overlay} />

      <div className={styles.Controls} data-testid="media-controls">
        {/* Play Button */}
        <PlayButton className={styles.PlayButton}>
          <PlayIcon className={styles.PlayIcon} />
          <PauseIcon className={styles.PauseIcon} />
        </PlayButton>

        {/* Time Controls */}
        <div className={styles.TimeControls}>
          <CurrentTimeDisplay className={styles.TimeDisplay} />

          <TimeSlider.Root className={styles.SliderRoot}>
            <TimeSlider.Track className={styles.SliderTrack}>
              <TimeSlider.Progress className={styles.SliderProgress} />
              <TimeSlider.Pointer className={styles.SliderPointer} />
            </TimeSlider.Track>
            <TimeSlider.Thumb className={styles.SliderThumb} />
          </TimeSlider.Root>

          <DurationDisplay className={styles.TimeDisplay} />
        </div>

        {/* Mute Button */}
        <MuteButton className={styles.MuteButton}>
          <VolumeHighIcon className={styles.VolumeHighIcon} />
          <VolumeLowIcon className={styles.VolumeLowIcon} />
          <VolumeOffIcon className={styles.VolumeOffIcon} />
        </MuteButton>

        {/* Fullscreen Button */}
        <FullscreenButton className={styles.FullscreenButton}>
          <FullscreenEnterIcon className={styles.FullscreenEnterIcon} />
          <FullscreenExitIcon className={styles.FullscreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>
  );
}
