import { MediaSkin } from '../media-skin';

import '../media-container';
import '../components/media-play-button';
import '../components/media-mute-button';
import '../components/media-volume-slider';
import '../components/media-time-slider';
import '../components/media-fullscreen-button';
import '../components/media-duration-display';
import '../components/media-current-time-display';
import '../components/media-preview-time-display';
import '../components/media-popover';
import '../components/media-tooltip';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */`
    ${MediaSkin.getTemplateHTML()}
    <style>
      /** @TODO: Improve/Polish CSS Here */
      /* Media Container UI/Styles */
      media-container {
        display: inline-block;
        position: relative;
        /* NOTE: Setting color here for generic inheritance, including SVG fill: currentColor defaults (CJP) */
        color: rgb(238 238 238);
      }

      media-container > ::slotted([slot=media]) {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Media Container UI Overlay Styling */
      media-container > .overlay {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        /* pointer-events: none; */
        background: none;
      }

      /* Time Display Styling */
      media-current-time-display,
      media-duration-display {
        padding: 4px 8px;
        color: rgb(238 238 238);
        font-family: monospace;
        font-size: 14px;
        border-radius: 2px;
        min-width: 3em;
        text-align: center;
        display: inline-block;
      }

      /* Generic Media Button Styling */
      .button {
        border: none;
        padding: 8px;
        cursor: pointer;
        color: rgb(238 238 238);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        min-height: 24px;
      }

      .button .icon {
        width: 18px;
        height: 18px;
        display: none;
      }

      /* Media Play Button UI/Styles */
      media-play-button:not([data-paused]) .pause-icon,
      media-play-button[data-paused] .play-icon {
        display: block;
      }

      /* Media Fullscreen Button UI/Styles */
      media-fullscreen-button:not([data-fullscreen]) .fullscreen-enter-icon,
      media-fullscreen-button[data-fullscreen] .fullscreen-exit-icon {
        display: block;
      }

      /* One way to define the "default visible" icon (CJP) */
      media-mute-button:not([data-volume-level]) .volume-low-icon,
      media-mute-button[data-volume-level=high] .volume-high-icon,
      media-mute-button[data-volume-level=low] .volume-low-icon,
      media-mute-button[data-volume-level=medium] .volume-low-icon,
      media-mute-button[data-volume-level=off] .volume-off-icon {
        display: block;
      }

      /* Media Control Bar UI/Styles */
      .control-bar {
        background: rgb(20 20 30 / .7);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
      }

      .spacer {
        flex-grow: 1;
      }

      /* TimeSlider Component Styles */
      media-time-slider-root {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-width: 100px;
        width: 100%;
        margin: 0 .5rem;
      }

      /* Horizontal orientation styles */
      media-time-slider-root[data-orientation="horizontal"] {
        min-width: 100px;
        width: 100%;
        height: 20px;
      }

      /* Vertical orientation styles */
      media-time-slider-root[data-orientation="vertical"] {
        min-width: 20px;
        width: 20px;
        height: 100px;
        flex-direction: column;
      }

      media-time-slider-track {
        position: relative;
        width: 100%;
        height: .375rem;
        background-color: #e0e0e0;
        border-radius: .25rem;
        overflow: hidden;
        pointer-events: none;
      }

      /* Horizontal track styles */
      media-time-slider-track[data-orientation="horizontal"] {
        width: 100%;
        height: .375rem;
      }

      /* Vertical track styles */
      media-time-slider-track[data-orientation="vertical"] {
        width: .375rem;
        height: 100%;
      }

      media-time-slider-thumb {
        width: .75rem;
        height: .75rem;
        background-color: #fff;
        border-radius: 50%;
        pointer-events: none;
      }

      media-time-slider-pointer {
        background-color: rgba(255, 255, 255, .5);
        pointer-events: none;
      }

      media-time-slider-progress {
        background-color: #007bff;
        border-radius: inherit;
      }

      media-popover-popup {
        background: rgb(20 20 30 / .7);
        padding: 14px 0;
      }

      /* VolumeSlider Component Styles */
      media-volume-slider-root {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-width: 80px;
        width: 80px;
        margin: 0 .5rem;
      }

      /* Horizontal orientation styles */
      media-volume-slider-root[data-orientation="horizontal"] {
        min-width: 80px;
        width: 80px;
        height: 20px;
      }

      /* Vertical orientation styles */
      media-volume-slider-root[data-orientation="vertical"] {
        min-width: 20px;
        width: 20px;
        height: 80px;
        flex-direction: column;
      }

      media-volume-slider-track {
        position: relative;
        width: 100%;
        height: .375rem;
        background-color: #e0e0e0;
        border-radius: .25rem;
        overflow: hidden;
        pointer-events: none;
      }

      /* Horizontal track styles */
      media-volume-slider-track[data-orientation="horizontal"] {
        width: 100%;
        height: .375rem;
      }

      /* Vertical track styles */
      media-volume-slider-track[data-orientation="vertical"] {
        width: .375rem;
        height: 100%;
      }

      media-volume-slider-thumb {
        width: .75rem;
        height: .75rem;
        background-color: #fff;
        border-radius: 50%;
        pointer-events: none;
      }

      media-volume-slider-progress {
        background-color: #007bff;
        border-radius: inherit;
      }

      /* Tooltip Component Styles */
      media-tooltip-popup {
        background: rgb(20 20 30 / .9);
        color: rgb(238 238 238);
        padding: 6px 8px;
        border-radius: 4px;
        font-size: 13px;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --transition: .15s ease-in-out;
        transition: transform var(--transition), scale var(--transition), opacity var(--transition);
      }

      media-tooltip-popup[data-starting-style] {
        transition-duration: 0s;
        transform: scale(0.9);
        opacity: 0;
      }

      media-tooltip-popup[data-ending-style] {
        transform: scale(0.9);
        opacity: 0;
      }

      .tooltip {
        display: none;
        white-space: nowrap;
      }

      media-tooltip-popup[data-paused] .play-tooltip,
      media-tooltip-popup:not([data-paused]) .pause-tooltip {
        display: block;
      }

      media-tooltip-popup[data-fullscreen] .fullscreen-exit-tooltip,
      media-tooltip-popup:not([data-fullscreen]) .fullscreen-enter-tooltip {
        display: block;
      }
    </style>
    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="overlay">
        <div class="spacer"></div>
        <div class="control-bar">
          <!-- NOTE: We can decide if we further want to provide a further, "themed" media-play-button that comes with baked in default styles and icons. (CJP) -->
          <media-tooltip-root delay="600" close-delay="0">
            <media-tooltip-trigger>
              <media-play-button class="button">
                <media-play-icon class="icon play-icon"></media-play-icon>
                <media-pause-icon class="icon pause-icon"></media-pause-icon>
              </media-play-button>
            </media-tooltip-trigger>
            <media-tooltip-portal>
              <media-tooltip-positioner side="top" side-offset="8" collision-padding="8">
                <media-tooltip-popup>
                  <span class="tooltip play-tooltip">Play</span>
                  <span class="tooltip pause-tooltip">Pause</span>
                </media-tooltip-popup>
              </media-tooltip-positioner>
            </media-tooltip-portal>
          </media-tooltip-root>
          <!-- Use the show-remaining attribute to show count down/remaining time -->
          <media-current-time-display show-remaining></media-current-time-display>

          <media-tooltip-root track-cursor-axis="x">
            <media-tooltip-trigger>
              <media-time-slider-root>
                <media-time-slider-track>
                  <media-time-slider-progress></media-time-slider-progress>
                  <media-time-slider-pointer></media-time-slider-pointer>
                </media-time-slider-track>
                <media-time-slider-thumb></media-time-slider-thumb>
              </media-time-slider-root>
            </media-tooltip-trigger>
            <media-tooltip-portal>
              <media-tooltip-positioner side="top" side-offset="18" collision-padding="12">
                <media-tooltip-popup>
                  <preview-time-display></preview-time-display>
                </media-tooltip-popup>
              </media-tooltip-positioner>
            </media-tooltip-portal>
          </media-tooltip-root>

          <media-duration-display></media-duration-display>
          <media-popover-root open-on-hover delay="200" close-delay="100">
            <media-popover-trigger>
              <media-mute-button class="button">
                <media-volume-high-icon class="icon volume-high-icon"></media-volume-high-icon>
                <media-volume-low-icon class="icon volume-low-icon"></media-volume-low-icon>
                <media-volume-off-icon class="icon volume-off-icon"></media-volume-off-icon>
              </media-mute-button>
            </media-popover-trigger>
            <media-popover-portal>
              <media-popover-positioner side="top">
                <media-popover-popup>
                  <media-volume-slider-root orientation="vertical">
                    <media-volume-slider-track>
                      <media-volume-slider-progress></media-volume-slider-progress>
                    </media-volume-slider-track>
                    <media-volume-slider-thumb></media-volume-slider-thumb>
                  </media-volume-slider-root>
                </media-popover-popup>
              </media-popover-positioner>
            </media-popover-portal>
          </media-popover-root>
          <media-tooltip-root delay="600" close-delay="0">
            <media-tooltip-trigger>
              <media-fullscreen-button class="button">
                <media-fullscreen-enter-icon class="icon fullscreen-enter-icon"></media-fullscreen-enter-icon>
                <media-fullscreen-exit-icon class="icon fullscreen-exit-icon"></media-fullscreen-exit-icon>
              </media-fullscreen-button>
            </media-tooltip-trigger>
            <media-tooltip-portal>
              <media-tooltip-positioner side="top" side-offset="8" collision-padding="8">
                <media-tooltip-popup>
                  <span class="tooltip fullscreen-enter-tooltip">Enter Fullscreen</span>
                  <span class="tooltip fullscreen-exit-tooltip">Exit Fullscreen</span>
                </media-tooltip-popup>
              </media-tooltip-positioner>
            </media-tooltip-portal>
          </media-tooltip-root>
        </div>
      </div>
    </media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-default', MediaSkinDefault);
