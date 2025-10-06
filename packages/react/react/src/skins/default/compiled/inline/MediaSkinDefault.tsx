import type { PropsWithChildren } from 'react';
import { FullscreenEnterIcon, FullscreenExitIcon, PauseIcon, PlayIcon, VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import { CurrentTimeDisplay } from '../../../../components/CurrentTimeDisplay';
import { DurationDisplay } from '../../../../components/DurationDisplay';
import { FullscreenButton } from '../../../../components/FullscreenButton';
import { MediaContainer } from '../../../../components/MediaContainer';
import MuteButton from '../../../../components/MuteButton';
import { Popover } from '../../../../components/Popover';
import PlayButton from '../../../../components/PlayButton';
import { TimeRange } from '../../../../components/TimeRange';
import { VolumeRange } from '../../../../components/VolumeRange';
// Inline CSS
const inlineStyles = `.MediaContainer {
  position: relative;
  overflow: clip;
  container-type: inline-size;
  container-name: root;
  border-radius: inherit;
}
.MediaContainer:fullscreen {
  border-radius: 0;
}
.MediaContainer:fullscreen video {
  height: 100%;
  width: 100%;
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
.MediaContainer::before {
  content: '';
  position: absolute;
  inset: 1px;
  box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #ffffff 15%, transparent), 0 0 #0000;
  z-index: 10;
  pointer-events: none;
}
.MediaContainer video {
  width: 100%;
  height: auto;
  border-radius: inherit;
}
.Overlay {
  opacity: 0%;
  transition-delay: 500ms;
  position: absolute;
  inset: 0rem;
  pointer-events: none;
  z-index: 10;
  background-image: linear-gradient(to top in oklab, color-mix(in srgb, #000000 50%, transparent) , color-mix(in srgb, #000000 20%, transparent) , transparent );
  transition-property: opacity;
  transition-timing-function: ease;
  transition-duration: 0s;
  -webkit-backdrop-filter: brightness(90%)      saturate(150%);
  backdrop-filter: brightness(90%) saturate(150%);
  border-radius: inherit;
}
.Overlay:has(+.controls [data-paused]) {
  opacity: 100%;
  transition-delay: 0ms;
}
@media (hover: hover) {
  .MediaContainer:hover .Overlay {
    opacity: 100%;
  }
}
@media (hover: hover) {
  .MediaContainer:hover .Overlay {
    transition-delay: 0ms;
  }
}
.Controls {position: absolute;
  inset-inline: 0.75rem;
  bottom: 0.75rem;
  
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #ffffff 10%, transparent), 0 0 #0000;
  gap: 0.125rem;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  background-color: color-mix(in srgb, #ffffff 10%, transparent);
  -webkit-backdrop-filter: brightness(90%)      saturate(150%);
  backdrop-filter: brightness(90%) saturate(150%);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: ease;
  transition-duration: 0s;
  will-change: transform;
  transform-origin: bottom;
  scale: 90% 90%;
  opacity: 0%;
  transition-delay: 500ms;
  container-type: inline-size;
  container-name: controls;
  border-radius: calc(infinity * 1px);
}
@supports (color: color-mix(in lab, red, red)) {
  .Controls {
    background-color: color-mix(in oklab, #ffffff 10%, transparent);
  }
}
.Controls:has(*[data-paused]) {
  scale: 100% 100%;
  opacity: 100%;
  transition-delay: 0ms;
}
@media (hover: hover) {
  .MediaContainer:hover .Controls {
    scale: 100% 100%;
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
.Controls::after {
  content: '';
  position: absolute;
  inset: 0rem;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 15%, transparent), 0 0 #0000;
  pointer-events: none;
  z-index: 10;
}
@media (prefers-contrast: more) {
  .Controls {
    background-color: color-mix(in srgb, #000000 90%, transparent);
  }
  @supports (color: color-mix(in lab, red, red)) {
    .Controls {
      background-color: color-mix(in oklab, #000000 90%, transparent);
    }
  }
}
@media (prefers-contrast: more) {
  .Controls::after {
    content: '';
  }
}
.Button {
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: ease;
  transition-duration: 0s;
  -webkit-user-select: none;
  user-select: none;
  padding: 0.5rem;
  border-radius: calc(infinity * 1px);
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
    background-color: color-mix(in srgb, #ffffff 10%, transparent);
  }
  @supports (color: color-mix(in lab, red, red)) {
    .Button:hover {
      background-color: color-mix(in oklab, #ffffff 10%, transparent);
    }
  }
}
@media (hover: hover) {
  .Button:hover {
    color: #ffffff;
  }
}
.Button:focus-visible {
  text-decoration-line: none;
  background-color: color-mix(in srgb, #ffffff 10%, transparent);
  color: #ffffff;
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: rgb(59 130 246);
}
@supports (color: color-mix(in lab, red, red)) {
  .Button:focus-visible {
    background-color: color-mix(in oklab, #ffffff 10%, transparent);
  }
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
  background-color: color-mix(in srgb, #ffffff 10%, transparent);
  color: #ffffff;
}
@supports (color: color-mix(in lab, red, red)) {
  .Button[aria-expanded="true"] {
    background-color: color-mix(in oklab, #ffffff 10%, transparent);
  }
}
.Button:active {
  scale: 95% 95%;
}
.IconButton {
  display: grid;
}
.IconButton svg {
  flex-shrink: 0;
  transition-property: opacity;
  transition-timing-function: ease;
  transition-duration: 300ms;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
  grid-area: 1/1;
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
.VolumeButton svg {
  opacity: 0%;
}
.VolumeButton[data-volume-level="high"] .volume-high-icon {
  opacity: 100%;
}
.VolumeButton[data-volume-level="medium"] .volume-low-icon {
  opacity: 100%;
}
.VolumeButton[data-volume-level="low"] .volume-low-icon {
  opacity: 100%;
}
.VolumeButton[data-volume-level="off"] .volume-off-icon {
  opacity: 100%;
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
  transition-duration: 0s;
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon * .arrow-1 {
    translate: -1px 0px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon * .arrow-1 {
    translate: 0px -1px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon * .arrow-2 {
    translate: 1px 0px;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenEnterIcon * .arrow-2 {
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
  .Button:hover .FullscreenExitIcon * .arrow-1 {
    translate: 0rem 0rem;
  }
}
@media (hover: hover) {
  .Button:hover .FullscreenExitIcon * .arrow-2 {
    translate: 0rem 0rem;
  }
}
.TimeControls {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-inline: 0.375rem;
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
.SliderRoot[data-orientation="vertical"] {
  width: 1.25rem;
  height: 5rem;
}
.SliderTrack {
  width: 100%;
  position: relative;
  -webkit-user-select: none;
  user-select: none;
  border-radius: calc(infinity * 1px);
  background-color: color-mix(in srgb, #ffffff 20%, transparent);
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 5%, transparent), 0 0 #0000;
}
@supports (color: color-mix(in lab, red, red)) {
  .SliderTrack {
    background-color: color-mix(in oklab, #ffffff 20%, transparent);
  }
}
.SliderTrack[data-orientation="horizontal"] {
  height: 0.25rem;
}
.SliderTrack[data-orientation="vertical"] {
  width: 0.25rem;
}
.SliderProgress {
  background-color: #ffffff;
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
  opacity: 0%;
  outline-offset: calc(2px * -1);
  width: 0.625rem;
  height: 0.625rem;
  transition: opacity,height,width;
}
.SliderThumb:focus-visible {
  outline-width: 2px;
  outline-offset: 2px;
  outline-color: rgb(59 130 246);
}
@media (hover: hover) {
  .SliderRoot:hover .SliderThumb {
    opacity: 100%;
  }
}
.SliderRoot:focus-within .SliderThumb {
  opacity: 100%;
}
.SliderThumb:active {
  width: 0.75rem;
  height: 0.75rem;
}
.SliderRoot:active .SliderThumb {
  width: 0.75rem;
  height: 0.75rem;
}
@media (hover: hover) {
  .SliderThumb:hover {
    cursor: ew-resize;
  }
}
.PopoverPopup {
  position: relative;
  z-index: 30;
  padding-inline: 0.5rem;
  padding-block: 1rem;
  background-color: color-mix(in srgb, #ffffff 10%, transparent);
  -webkit-backdrop-filter: brightness(90%)      saturate(150%);
  backdrop-filter: brightness(90%) saturate(150%);
  box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #ffffff 10%, transparent), 0 0 #0000;
  border-radius: inherit;
}
@supports (color: color-mix(in lab, red, red)) {
  .PopoverPopup {
    background-color: color-mix(in oklab, #ffffff 10%, transparent);
  }
}
.PopoverPopup::after {
  content: '';
  position: absolute;
  inset: 0rem;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 15%, transparent), 0 0 #0000;
  pointer-events: none;
  z-index: 10;
}
@media (prefers-contrast: more) {
  .PopoverPopup {
    background-color: color-mix(in srgb, #000000 90%, transparent);
  }
  @supports (color: color-mix(in lab, red, red)) {
    .PopoverPopup {
      background-color: color-mix(in oklab, #000000 90%, transparent);
    }
  }
}
@media (prefers-contrast: more) {
  .PopoverPopup::after {
    content: '';
  }
}
`;

// Create styles object for className references
const styles: Record<string, string> = {
  'Button': 'Button',
  'Controls': 'Controls',
  'FullscreenButton': 'FullscreenButton',
  'FullscreenEnterIcon': 'FullscreenEnterIcon',
  'FullscreenExitIcon': 'FullscreenExitIcon',
  'IconButton': 'IconButton',
  'MediaContainer': 'MediaContainer',
  'Overlay': 'Overlay',
  'PlayButton': 'PlayButton',
  'PopoverPopup': 'PopoverPopup',
  'SliderPointer': 'SliderPointer',
  'SliderProgress': 'SliderProgress',
  'SliderRoot': 'SliderRoot',
  'SliderThumb': 'SliderThumb',
  'SliderTrack': 'SliderTrack',
  'TimeControls': 'TimeControls',
  'TimeDisplay': 'TimeDisplay',
  'VolumeButton': 'VolumeButton',
  'arrow-1': 'arrow-1',
  'Arrow1': 'arrow-1',
  'arrow-2': 'arrow-2',
  'Arrow2': 'arrow-2',
  'controls': 'controls',
  'fullscreen-enter-icon': 'fullscreen-enter-icon',
  'FullscreenEnterIcon': 'fullscreen-enter-icon',
  'fullscreen-exit-icon': 'fullscreen-exit-icon',
  'FullscreenExitIcon': 'fullscreen-exit-icon',
  'pause-icon': 'pause-icon',
  'PauseIcon': 'pause-icon',
  'play-icon': 'play-icon',
  'PlayIcon': 'play-icon',
  'volume-high-icon': 'volume-high-icon',
  'VolumeHighIcon': 'volume-high-icon',
  'volume-low-icon': 'volume-low-icon',
  'VolumeLowIcon': 'volume-low-icon',
  'volume-off-icon': 'volume-off-icon',
  'VolumeOffIcon': 'volume-off-icon'
};
type SkinProps = PropsWithChildren<{
  className?: string;
}>;
export default function MediaSkinDefault({
  children,
  className = ''
}: SkinProps): JSX.Element {
  return <>
    <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
    <MediaContainer className={`${styles.MediaContainer} ${className}`}>
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
        className={styles.TimeDisplay} />

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
          <Popover.Positioner side="top" sideOffset={8}>
            <Popover.Popup className={styles.PopoverPopup}>
              <VolumeRange.Root className={styles.SliderRoot} orientation="vertical">
                <VolumeRange.Track className={styles.SliderTrack}>
                  <VolumeRange.Progress className={styles.SliderProgress} />
                </VolumeRange.Track>
                <VolumeRange.Thumb className={styles.SliderThumb} />
              </VolumeRange.Root>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Root>

        <FullscreenButton className={`${styles.Button} ${styles.IconButton} ${styles.FullscreenButton}`}>
          <FullscreenEnterIcon className={styles.FullscreenEnterIcon} />
          <FullscreenExitIcon className={styles.FullscreenExitIcon} />
        </FullscreenButton>
      </div>
    </MediaContainer>
  </>;
}
;