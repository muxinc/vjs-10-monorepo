import { MediaSkin } from '../media-skin';

import '../media-container';
import '../components/media-play-button';
import '../components/media-mute-button';
import '../components/media-volume-range';
import '../components/media-time-range';
import '../components/media-fullscreen-button';
import '../components/media-duration-display';
import '../components/media-current-time-display';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
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
        background: rgb(20 20 30 / .7);
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
        background: rgb(20 20 30 / .7);
        padding: 4px;
        cursor: pointer;
        color: rgb(238 238 238);
      }

      .button .icon {
        width: 24px;
        height: 24px;
        display: none;
      }

      /* Media Play Button UI/Styles */
      media-play-button:not([data-paused]) .pause-icon,
      media-play-button[data-paused] .play-icon {
        display: inline-block;
      }

      /* Media Fullscreen Button UI/Styles */
      media-fullscreen-button:not([data-fullscreen]) .fullscreen-enter-icon,
      media-fullscreen-button[data-fullscreen] .fullscreen-exit-icon {
        display: inline-block;
      }

      /* One way to define the "default visible" icon (CJP) */
      media-mute-button:not([data-volume-level]) .volume-low-icon,
      media-mute-button[data-volume-level=high] .volume-high-icon,
      media-mute-button[data-volume-level=low] .volume-low-icon,
      media-mute-button[data-volume-level=medium] .volume-low-icon,
      media-mute-button[data-volume-level=off] .volume-off-icon {
        display: inline-block;
      }

      /* Media Control Bar UI/Styles */
      .control-bar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
      }

      .spacer {
        flex-grow: 1;
      }

      /* TimeRange Component Styles */
      media-time-range-root {
        display: flex;
        align-items: center;
        position: relative;
        min-width: 100px;
        width: 100%;
        padding-block: .75rem;
        margin: 0 .5rem;
      }

      media-time-range-track {
        position: relative;
        width: 100%;
        height: .375rem;
        background-color: #e0e0e0;
        border-radius: .25rem;
        overflow: hidden;
        pointer-events: none;
      }

      media-time-range-thumb {
        width: .75rem;
        height: .75rem;
        background-color: #fff;
        border-radius: 50%;
        pointer-events: none;
      }

      media-time-range-pointer {
        background-color: rgba(255, 255, 255, .5);
        pointer-events: none;
      }

      media-time-range-progress {
        background-color: #007bff;
        border-radius: inherit;
      }

      /* VolumeRange Component Styles */
      media-volume-range-root {
        display: flex;
        align-items: center;
        position: relative;
        min-width: 80px;
        width: 80px;
        padding-block: .75rem;
        margin: 0 .5rem;
      }

      media-volume-range-track {
        position: relative;
        width: 100%;
        height: .375rem;
        background-color: #e0e0e0;
        border-radius: .25rem;
        overflow: hidden;
        pointer-events: none;
      }

      media-volume-range-thumb {
        width: .75rem;
        height: .75rem;
        background-color: #fff;
        border-radius: 50%;
        pointer-events: none;
      }

      media-volume-range-progress {
        background-color: #007bff;
        border-radius: inherit;
      }
    </style>
    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="overlay">
        <div class="spacer"></div>
        <div class="control-bar">
          <!-- NOTE: We can decide if we further want to provide a further, "themed" media-play-button that comes with baked in default styles and icons. (CJP) -->
          <media-play-button class="button">
            <media-play-icon class="icon play-icon"></media-play-icon>
            <media-pause-icon class="icon pause-icon"></media-pause-icon>
          </media-play-button>
          <!-- Use the show-remaining attribute to show count down/remaining time -->
          <media-current-time-display show-remaining></media-current-time-display>
          <media-time-range-root>
            <media-time-range-track>
              <media-time-range-progress></media-time-range-progress>
              <media-time-range-pointer></media-time-range-pointer>
            </media-time-range-track>
            <media-time-range-thumb></media-time-range-thumb>
          </media-time-range-root>
          <media-duration-display></media-duration-display>
          <media-mute-button class="button">
            <media-volume-high-icon class="icon volume-high-icon"></media-volume-high-icon>
            <media-volume-low-icon class="icon volume-low-icon"></media-volume-low-icon>
            <media-volume-off-icon class="icon volume-off-icon"></media-volume-off-icon>
          </media-mute-button>
          <media-volume-range-root>
            <media-volume-range-track>
              <media-volume-range-progress></media-volume-range-progress>
            </media-volume-range-track>
            <media-volume-range-thumb></media-volume-range-thumb>
          </media-volume-range-root>
          <media-fullscreen-button class="button">
            <media-fullscreen-enter-icon class="icon fullscreen-enter-icon"></media-fullscreen-enter-icon>
            <media-fullscreen-exit-icon class="icon fullscreen-exit-icon"></media-fullscreen-exit-icon>
          </media-fullscreen-button>
        </div>
      </div>
    </media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-default', MediaSkinDefault);
