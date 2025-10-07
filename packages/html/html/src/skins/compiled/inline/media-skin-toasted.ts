import { MediaSkin } from '../../../media-skin';
import '../../../components/media-current-time-display';
import '../../../components/media-duration-display';
import '../../../components/media-fullscreen-button';
import '../../../media-container';
import '../../../components/media-mute-button';
import '../../../components/media-play-button';
import '../../../components/media-time-range';
import '../../../components/media-volume-range';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>
      media-container {
        position: relative;
        overflow: clip;
        background-color: #000000;
        container-type: inline-size;
        container-name: root;
        border-radius: inherit;
      }
      media-container::after {
        content: '';
        position: absolute;
        inset: 0rem;
        box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 10%, transparent), 0 0 #0000;
        z-index: 10;
        pointer-events: none;
      }
      @media (prefers-color-scheme: dark) {
        media-container::after {
          content: '';
        }
      }
      media-container:fullscreen {
        border-radius: 0;
      }
      media-container:fullscreen video {
        height: 100%;
        width: 100%;
      }
      media-container video {
        width: 100%;
        height: auto;
        border-radius: inherit;
      }
      .controls {
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
      .controls:has(*[data-paused]) {
        translate: 0px 0rem;
        opacity: 100%;
        transition-delay: 0ms;
        pointer-events: auto;
      }
      @media (hover: hover) {
        media-container:hover .controls {
          translate: 0px 0rem;
        }
      }
      @media (hover: hover) {
        media-container:hover .controls {
          opacity: 100%;
        }
      }
      @media (hover: hover) {
        media-container:hover .controls {
          transition-delay: 0ms;
        }
      }
      @media (hover: hover) {
        media-container:hover .controls {
          pointer-events: auto;
        }
      }
      .controls-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .button {
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
        .button {
          color: color-mix(in oklab, #ffffff 90%, transparent);
        }
      }
      @media (hover: hover) {
        .button:hover {
          text-decoration-line: none;
        }
      }
      @media (hover: hover) {
        .button:hover {
          color: #ffffff;
        }
      }
      .button:focus-visible {
        text-decoration-line: none;
        color: #ffffff;
        outline-width: 2px;
        outline-offset: 2px;
      }
      .button[aria-disabled="true"] {
        filter: grayscale(100%);
        opacity: 50%;
        cursor: not-allowed;
      }
      .button[aria-busy="true"] {
        pointer-events: none;
        cursor: not-allowed;
      }
      .button[aria-expanded="true"] {
        color: #ffffff;
      }
      .button:active {
        scale: 95% 95%;
      }
      .icon-button {
        display: grid;
      }
      .icon-button svg {
        flex-shrink: 0;
        transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
        transition-timing-function: ease;
        transition-duration: 300ms;
        grid-area: 1/1;
        drop-shadow: 0 1px 0 var();
      }
      media-play-button .pause-icon {
        opacity: 100%;
      }
      media-play-button[data-paused] .pause-icon {
        opacity: 0%;
      }
      media-play-button .play-icon {
        opacity: 0%;
      }
      media-play-button[data-paused] .play-icon {
        opacity: 100%;
      }
      .volume-controls {
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
      }
      .volume-slider {
        width: 0rem;
        padding-inline: 0.75rem;
        overflow: hidden;
        pointer-events: none;
        opacity: 0%;
        transition-delay: 500ms;
        transition: opacity,width;
      }
      @media (hover: hover) {
        .volume-controls:hover .volume-slider {
          width: 7rem;
        }
      }
      @media (hover: hover) {
        .volume-controls:hover .volume-slider {
          pointer-events: auto;
        }
      }
      @media (hover: hover) {
        .volume-controls:hover .volume-slider {
          opacity: 100%;
        }
      }
      @media (hover: hover) {
        .volume-controls:hover .volume-slider {
          transition-delay: 0ms;
        }
      }
      .volume-controls:focus-within .volume-slider {
        width: 7rem;
        pointer-events: auto;
        opacity: 100%;
        transition-delay: 0ms;
      }
      .volume-button svg {
        display: none;
      }
      .volume-button[data-volume-level="high"] .volume-high-icon {
        display: inline;
      }
      .\[\&\[data-volume-level\=\\\"high\\\"\]_\.volume-high-icon\]\:inline[data-volume-level=\"high\"] .volume-high-icon {
        display: inline;
      }
      .volume-button[data-volume-level="medium"] .volume-low-icon {
        display: inline;
      }
      .\[\&\[data-volume-level\=\\\"medium\\\"\]_\.volume-low-icon\]\:inline[data-volume-level=\"medium\"] .volume-low-icon {
        display: inline;
      }
      .volume-button[data-volume-level="low"] .volume-low-icon {
        display: inline;
      }
      .\[\&\[data-volume-level\=\\\"low\\\"\]_\.volume-low-icon\]\:inline[data-volume-level=\"low\"] .volume-low-icon {
        display: inline;
      }
      .volume-button[data-volume-level="off"] .volume-off-icon {
        display: inline;
      }
      .\[\&\[data-volume-level\=\\\"off\\\"\]_\.volume-off-icon\]\:inline[data-volume-level=\"off\"] .volume-off-icon {
        display: inline;
      }
      .full-screen-button .fullscreen-enter-icon {
        opacity: 100%;
      }
      .full-screen-button[data-fullscreen] .fullscreen-enter-icon {
        opacity: 0%;
      }
      .full-screen-button .fullscreen-exit-icon {
        opacity: 0%;
      }
      .full-screen-button[data-fullscreen] .fullscreen-exit-icon {
        opacity: 100%;
      }
      .full-screen-button path {
        transition-property: transform, translate, scale, rotate;
        transition-timing-function: ease;
        transition-duration: 150ms;
      }
      @media (hover: hover) {
        .button:hover .full-screen-enter-icon .arrow-1 {
          translate: -1px 0px;
        }
      }
      @media (hover: hover) {
        .button:hover .full-screen-enter-icon .arrow-1 {
          translate: 0px -1px;
        }
      }
      @media (hover: hover) {
        .button:hover .full-screen-enter-icon .arrow-2 {
          translate: 1px 0px;
        }
      }
      @media (hover: hover) {
        .button:hover .full-screen-enter-icon .arrow-2 {
          translate: 0px 1px;
        }
      }
      .full-screen-exit-icon .arrow-1 {
        translate: -1px -1px;
      }
      .full-screen-exit-icon .arrow-2 {
        translate: 1px 1px;
      }
      @media (hover: hover) {
        .button:hover .full-screen-exit-icon .arrow-1 {
          translate: 0rem 0rem;
        }
      }
      @media (hover: hover) {
        .button:hover .full-screen-exit-icon .arrow-2 {
          translate: 0rem 0rem;
        }
      }
      .time-slider-thumb {
        opacity: 0%;
      }
      @media (hover: hover) {
        .slider-root:hover .time-slider-thumb {
          opacity: 100%;
        }
      }
      .slider-root:focus-within .time-slider-thumb {
        opacity: 100%;
      }
      .time-display {
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
      }
      .slider-root {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        position: relative;
      }
      .slider-root[data-orientation="horizontal"] {
        height: 1.25rem;
        min-width: 5rem;
      }
      .\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:h-5[data-orientation=\"horizontal\"] {
        height: 1.25rem;
      }
      .\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:min-w-20[data-orientation=\"horizontal\"] {
        min-width: 5rem;
      }
      .slider-root[data-orientation="vertical"] {
        width: 1.25rem;
        height: 5rem;
      }
      .\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:w-5[data-orientation=\"vertical\"] {
        width: 1.25rem;
      }
      .\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:h-20[data-orientation=\"vertical\"] {
        height: 5rem;
      }
      .slider-track {
        position: relative;
        -webkit-user-select: none;
        user-select: none;
        border-radius: calc(infinity * 1px);
        background-color: color-mix(in srgb, #ffffff 25%, transparent);
        -webkit-backdrop-filter: brightness(90%)      saturate(150%);
        backdrop-filter: brightness(90%) saturate(150%);
      }
      @supports (color: color-mix(in lab, red, red)) {
        .slider-track {
          background-color: color-mix(in oklab, #ffffff 25%, transparent);
        }
      }
      .slider-track[data-orientation="horizontal"] {
        width: 100%;
        height: 0.25rem;
      }
      .\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:w-full[data-orientation=\"horizontal\"] {
        width: 100%;
      }
      .\[\&\[data-orientation\=\\\"horizontal\\\"\]\]\:h-1[data-orientation=\"horizontal\"] {
        height: 0.25rem;
      }
      .slider-track[data-orientation="vertical"] {
        width: 0.25rem;
      }
      .\[\&\[data-orientation\=\\\"vertical\\\"\]\]\:w-1[data-orientation=\"vertical\"] {
        width: 0.25rem;
      }
      .slider-progress {
        border-radius: inherit;
      }
      .slider-pointer {
        border-radius: inherit;
      }
      .slider-thumb {
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
      .slider-thumb:focus-visible {
        outline-width: 2px;
        outline-offset: 2px;
      }
      .slider-thumb:active {
        width: 0.875rem;
        height: 0.875rem;
      }
      .slider-root:active .slider-thumb {
        width: 0.875rem;
        height: 0.875rem;
      }
      @media (hover: hover) {
        .slider-thumb:hover {
          cursor: ew-resize;
        }
      }
    </style>
    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="controls" data-testid="media-controls">
        <div class="controls-row">
          <media-time-range-root class="slider-root">
            <media-time-range-track class="slider-track">
              <media-time-range-progress class="slider-progress"></media-time-range-progress>
              <media-time-range-pointer class="slider-pointer"></media-time-range-pointer>
            </media-time-range-track>
            <media-time-range-thumb class="slider-thumb time-slider-thumb"></media-time-range-thumb>
          </media-time-range-root>
        </div>
        <div class="controls-row">
          <div class="flex items-center gap-3">
            <media-play-button class="button icon-button">
              <media-play-icon></media-play-icon>
              <media-pause-icon></media-pause-icon>
            </media-play-button>
            <div class="flex items-center gap-1">
              <media-current-time-display class="time-display"></media-current-time-display>
              <span class="opacity-50">/</span>
              <media-duration-display class="time-display opacity-50"></media-duration-display>
            </div>
          </div>
          <div class="flex items-center gap-0.5">
            <div class="volume-controls">
              <media-mute-button class="button icon-button volume-button">
                <media-volume-high-icon></media-volume-high-icon>
                <media-volume-low-icon></media-volume-low-icon>
                <media-volume-off-icon></media-volume-off-icon>
              </media-mute-button>
              <div class="volume-slider">
                <media-volume-range-root class="slider-root">
                  <media-volume-range-track class="slider-track">
                    <media-volume-range-progress class="slider-progress"></media-volume-range-progress>
                  </media-volume-range-track>
                  <media-volume-range-thumb class="slider-thumb"></media-volume-range-thumb>
                </media-volume-range-root>
              </div>
            </div>
            <media-fullscreen-button class="button icon-button">
              <media-fullscreen-enter-icon></media-fullscreen-enter-icon>
              <media-fullscreen-exit-icon></media-fullscreen-exit-icon>
            </media-fullscreen-button>
          </div>
        </div>
      </div>
    </media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-default', MediaSkinDefault);
