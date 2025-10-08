import type { PropsWithChildren } from 'react';
import { FullscreenEnterIcon, FullscreenExitIcon, PauseIcon, PlayIcon, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import { CurrentTimeDisplay } from '../../../../components/CurrentTimeDisplay';
import { DurationDisplay } from '../../../../components/DurationDisplay';
import { FullscreenButton } from '../../../../components/FullscreenButton';
import { MediaContainer } from '../../../../components/MediaContainer';
import MuteButton from '../../../../components/MuteButton';
import PlayButton from '../../../../components/PlayButton';
import { TimeRange } from '../../../../components/TimeRange';
import { VolumeRange } from '../../../../components/VolumeRange';
// Inline CSS
const inlineStyles = `.MediaContainer {
  position: relative;
  overflow: clip;
  background-color: #000000;
  container-type: inline-size;
  container-name: root;
  border-radius: inherit;
}
.MediaContainer::after {
  content: '';
  position: absolute;
  inset: 0rem;
  box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 10%, transparent), 0 0 #0000;
  z-index: 10;
  pointer-events: none;
}
@media (prefers-color-scheme: dark) {
  .MediaContainer::after {
    content: '';
  }
}
.MediaContainer:fullscreen {
  border-radius: 0;
}
.MediaContainer:fullscreen video {
  height: 100%;
  width: 100%;
}
.MediaContainer video {
  width: 100%;
  height: auto;
  border-radius: inherit;
}
.Controls {
  position: absolute;
  inset-inline: 0rem;
  bottom: 0rem;
  top: calc(1/3 * 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 20;
  padding-inline: 0.625rem;
  padding-bottom: 0.625rem;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  background-image: linear-gradient();
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: ease;
  transition-duration: 150ms;
  translate: 0px 100%;
  opacity: 0%;
  transition-delay: 500ms;
  pointer-events: none;
  container-type: inline-size;
  container-name: controls;
}
.Controls:has(*[data-paused]) {
  translate: 0px 0rem;
  opacity: 100%;
  transition-delay: 0ms;
  pointer-events: auto;
}
@media (hover: hover) {
  .MediaContainer:hover .Controls {
    translate: 0px 0rem;
  }
}
@media (hover: hover) {
  .MediaContainer:hover .Controls {
    opacity: 100%;
  }
}
@media (hover: hover) {
  .MediaContainer:hover .Controls {
    transition-delay: 0ms;
  }
}
@media (hover: hover) {
  .MediaContainer:hover .Controls {
    pointer-events: auto;
  }
}
.ControlsRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.Button {
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: ease;
  transition-duration: 150ms;
  -webkit-user-select: none;
  user-select: none;
  padding: 0.5rem;
  background-color: transparent;
  color: color-mix(in srgb, #ffffff 90%, transparent);
  outline-offset: calc(2px * -1);
}
@supports (color: color-mix(in lab, red, red)) {
  .Button {
    color: color-mix(in oklab, #ffffff 90%, transparent);
  }
}
@media (hover: hover) {
  .Button:hover {
    text-decoration-line: none;
  }
}
@media (hover: hover) {
  .Button:hover {
    color: #ffffff;
  }
}
.Button:focus-visible {
  text-decoration-line: none;
  color: #ffffff;
  outline-width: 2px;
  outline-offset: 2px;
}
.Button[aria-disabled="true"] {
  filter: grayscale(100%);
  opacity: 50%;
  cursor: not-allowed;
}
.Button[aria-busy="true"] {
  pointer-events: none;
  cursor: not-allowed;
}
.Button[aria-expanded="true"] {
  color: #ffffff;
}
.Button:active {
  scale: 95% 95%;
}
.IconButton {
  display: grid;
}
.IconButton svg {
  flex-shrink: 0;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: ease;
  transition-duration: 300ms;
  grid-area: 1/1;
  drop-shadow: 0 1px 0 var();
}
.PlayButton .pause-icon {
  opacity: 100%;
}
.PlayButton[data-paused] .pause-icon {
  opacity: 0%;
}
.PlayButton .play-icon {
  opacity: 0%;
}
.PlayButton[data-paused] .play-icon {
  opacity: 100%;
}
.VolumeControls {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}
.VolumeSlider {
  width: 0rem;
  padding-inline: 0.75rem;
  overflow: hidden;
  pointer-events: none;
  opacity: 0%;
  transition-delay: 500ms;
  transition: opacity,width;
}
@media (hover: hover) {
  .VolumeControls:hover .VolumeSlider {
    width: 7rem;
  }
}
@media (hover: hover) {
  .VolumeControls:hover .VolumeSlider {
    pointer-events: auto;
  }
}
@media (hover: hover) {
  .VolumeControls:hover .VolumeSlider {
    opacity: 100%;
  }
}
@media (hover: hover) {
  .VolumeControls:hover .VolumeSlider {
    transition-delay: 0ms;
  }
}
.VolumeControls:focus-within .VolumeSlider {
  width: 7rem;
  pointer-events: auto;
  opacity: 100%;
  transition-delay: 0ms;
}
.MuteButton svg {
  display: none;
}
.FullscreenButton .fullscreen-enter-icon {
  opacity: 100%;
}
.FullscreenButton[data-fullscreen] .fullscreen-enter-icon {
  opacity: 0%;
}
.FullscreenButton .fullscreen-exit-icon {
  opacity: 0%;
}
.FullscreenButton[data-fullscreen] .fullscreen-exit-icon {
  opacity: 100%;
}
.FullscreenButton path {
  transition-property: transform, translate, scale, rotate;
  transition-timing-function: ease;
  transition-duration: 150ms;
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon .arrow-1 {
    translate: -1px 0px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon .arrow-1 {
    translate: 0px -1px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon .arrow-2 {
    translate: 1px 0px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon .arrow-2 {
    translate: 0px 1px;
  }
}
.FullscreenExitIcon .arrow-1 {
  translate: -1px -1px;
}
.FullscreenExitIcon .arrow-2 {
  translate: 1px 1px;
}
@media (hover: hover) {
  .Button:hover .FullscreenExitIcon .arrow-1 {
    translate: 0rem 0rem;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenExitIcon .arrow-2 {
    translate: 0rem 0rem;
  }
}
.TimeSliderThumb {
  opacity: 0%;
}
@media (hover: hover) {
  .SliderRoot:hover .TimeSliderThumb {
    opacity: 100%;
  }
}
.SliderRoot:focus-within .TimeSliderThumb {
  opacity: 100%;
}
.TimeDisplay {
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}
.SliderRoot {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
}
.SliderRoot[data-orientation="horizontal"] {
  height: 1.25rem;
  min-width: 5rem;
}
.\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:h-5[data-orientation=\"horizontal\"] {
  height: 1.25rem;
}
.\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:min-w-20[data-orientation=\"horizontal\"] {
  min-width: 5rem;
}
.SliderRoot[data-orientation="vertical"] {
  width: 1.25rem;
  height: 5rem;
}
.\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:w-5[data-orientation=\"vertical\"] {
  width: 1.25rem;
}
.\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:h-20[data-orientation=\"vertical\"] {
  height: 5rem;
}
.SliderTrack {
  position: relative;
  -webkit-user-select: none;
  user-select: none;
  border-radius: calc(infinity * 1px);
  background-color: color-mix(in srgb, #ffffff 25%, transparent);
  -webkit-backdrop-filter: brightness(90%)      saturate(150%);
  backdrop-filter: brightness(90%) saturate(150%);
}
@supports (color: color-mix(in lab, red, red)) {
  .SliderTrack {
    background-color: color-mix(in oklab, #ffffff 25%, transparent);
  }
}
.SliderTrack[data-orientation="horizontal"] {
  width: 100%;
  height: 0.25rem;
}
.\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:w-full[data-orientation=\"horizontal\"] {
  width: 100%;
}
.\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:h-1[data-orientation=\"horizontal\"] {
  height: 0.25rem;
}
.SliderTrack[data-orientation="vertical"] {
  width: 0.25rem;
}
.\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:w-1[data-orientation=\"vertical\"] {
  width: 0.25rem;
}
.SliderProgress {
  border-radius: inherit;
}
.SliderPointer {
  border-radius: inherit;
}
.SliderThumb {
  background-color: #ffffff;
  z-index: 10;
  -webkit-user-select: none;
  user-select: none;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 10%, transparent), 0 0 #0000;
  border-radius: calc(infinity * 1px);
  outline-offset: calc(2px * -1);
  width: 0.75rem;
  height: 0.75rem;
  transition: opacity,height,width;
}
.SliderThumb:focus-visible {
  outline-width: 2px;
  outline-offset: 2px;
}
.SliderThumb:active {
  width: 0.875rem;
  height: 0.875rem;
}
.SliderRoot:active .SliderThumb {
  width: 0.875rem;
  height: 0.875rem;
}
@media (hover: hover) {
  .SliderThumb:hover {
    cursor: ew-resize;
  }
}
`;

// Create styles object for className references
const styles: Record<string, string> = {
  'Button': 'Button',
  'Controls': 'Controls',
  'ControlsRow': 'ControlsRow',
  'FullscreenButton': 'FullscreenButton',
  'FullscreenEnterIcon': 'FullscreenEnterIcon',
  'FullscreenExitIcon': 'FullscreenExitIcon',
  'IconButton': 'IconButton',
  'MediaContainer': 'MediaContainer',
  'MuteButton': 'MuteButton',
  'PlayButton': 'PlayButton',
  'SliderPointer': 'SliderPointer',
  'SliderProgress': 'SliderProgress',
  'SliderRoot': 'SliderRoot',
  'SliderThumb': 'SliderThumb',
  'SliderTrack': 'SliderTrack',
  'TimeDisplay': 'TimeDisplay',
  'TimeSliderThumb': 'TimeSliderThumb',
  'VolumeControls': 'VolumeControls',
  'VolumeSlider': 'VolumeSlider',
  'arrow-1': 'arrow-1',
  'Arrow1': 'arrow-1',
  'arrow-2': 'arrow-2',
  'Arrow2': 'arrow-2',
  'fullscreen-enter-icon': 'fullscreen-enter-icon',
  'FullscreenEnterIcon': 'fullscreen-enter-icon',
  'fullscreen-exit-icon': 'fullscreen-exit-icon',
  'FullscreenExitIcon': 'fullscreen-exit-icon',
  'pause-icon': 'pause-icon',
  'PauseIcon': 'pause-icon',
  'play-icon': 'play-icon',
  'PlayIcon': 'play-icon'
};
type SkinProps = PropsWithChildren<{
  className?: string;
}>;
export default function MediaSkinToasted({
  children,
  className = ''
}: SkinProps): JSX.Element {
  return <>
    <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
      {children}

      <div className={styles.Controls} data-testid="media-controls">
        {/* <header className='py-2 px-4 text-shadow-sm text-shadow-black/10'>
          <h1 className="text-base font-medium">View From a Blue Moon</h1>
          <p className="text-stone-400">A story about Jon Jon Florence, a surfer from Hawaii.</p>
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
          <div className='flex items-center gap-3'>
            <PlayButton className={`${styles.Button} ${styles.IconButton} ${styles.PlayButton}`}>
              <PlayIcon className={styles.PlayIcon}></PlayIcon>
              <PauseIcon className={styles.PauseIcon}></PauseIcon>
            </PlayButton>

            <div className="flex items-center gap-1">
              <CurrentTimeDisplay
            // Use showRemaining to show count down/remaining time
            // showRemaining
            className={styles.TimeDisplay} />
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
                <VolumeRange.Root className={styles.SliderRoot}>
                  <VolumeRange.Track className={styles.SliderTrack}>
                    <VolumeRange.Progress className={styles.SliderProgress} />
                  </VolumeRange.Track>
                  <VolumeRange.Thumb className={styles.SliderThumb} />
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
  </>;
}
;