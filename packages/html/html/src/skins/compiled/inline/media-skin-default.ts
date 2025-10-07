import { MediaSkin } from '../media-skin';
import '../components/media-current-time-display';
import '../components/media-duration-display';
import '../components/media-fullscreen-button';
import '../media-container';
import '../components/media-mute-button';
import '../components/media-popover';
import '../components/media-play-button';
import '../components/media-time-range';
import '../components/media-volume-range';
import '@vjs-10/html-icons';

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>
      media-container {
        position: relative;
        overflow: clip;
        container-type: inline-size;
        container-name: root;
        border-radius: inherit;
      }
      media-container:fullscreen {
        border-radius: 0;
      }
      media-container:fullscreen video {
        height: 100%;
        width: 100%;
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
      media-container::before {
        content: '';
        position: absolute;
        inset: 1px;
        box-shadow: 0 0 #0000, 0 0 #0000, inset 0 0 0 calc(1px + 0px) color-mix(in srgb, #ffffff 15%, transparent), 0 0 #0000;
        z-index: 10;
        pointer-events: none;
      }
      media-container video {
        width: 100%;
        height: auto;
        border-radius: inherit;
      }
      .overlay {
        opacity: 0%;
        transition-delay: 500ms;
        position: absolute;
        inset: 0rem;
        pointer-events: none;
        z-index: 10;
        background-image: linear-gradient(to top in oklab, color-mix(in srgb, #000000 50%, transparent) , color-mix(in srgb, #000000 20%, transparent) , transparent );
        transition-property: opacity;
        transition-timing-function: ease;
        transition-duration: 150ms;
        -webkit-backdrop-filter: brightness(90%)      saturate(150%);
        backdrop-filter: brightness(90%) saturate(150%);
        border-radius: inherit;
      }
      .overlay:has(+.controls [data-paused]) {
        opacity: 100%;
        transition-delay: 0ms;
      }
      @media (hover: hover) {
        media-container:hover .overlay {
          opacity: 100%;
        }
      }
      @media (hover: hover) {
        media-container:hover .overlay {
          transition-delay: 0ms;
        }
      }
      .controls {
        position: absolute;
        inset-inline: 0.75rem;
        bottom: 0.75rem;
        border-radius: calc(infinity * 1px);
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
        transition-duration: 150ms;
        will-change: transform;
        transform-origin: bottom;
        scale: 90% 90%;
        opacity: 0%;
        transition-delay: 500ms;
        container-type: inline-size;
        container-name: controls;
      }
      @supports (color: color-mix(in lab, red, red)) {
        .controls {
          background-color: color-mix(in oklab, #ffffff 10%, transparent);
        }
      }
      .controls:has(*[data-paused]) {
        scale: 100% 100%;
        opacity: 100%;
        transition-delay: 0ms;
      }
      @media (hover: hover) {
        media-container:hover .controls {
          scale: 100% 100%;
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
      .controls::after {
        content: '';
        position: absolute;
        inset: 0rem;
        box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 15%, transparent), 0 0 #0000;
        pointer-events: none;
        z-index: 10;
      }
      @media (prefers-contrast: more) {
        .controls {
          background-color: color-mix(in srgb, #000000 90%, transparent);
        }
        @supports (color: color-mix(in lab, red, red)) {
          .controls {
            background-color: color-mix(in oklab, #000000 90%, transparent);
          }
        }
      }
      @media (prefers-contrast: more) {
        .controls::after {
          content: '';
        }
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
        border-radius: calc(infinity * 1px);
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
          background-color: color-mix(in srgb, #ffffff 10%, transparent);
        }
        @supports (color: color-mix(in lab, red, red)) {
          .button:hover {
            background-color: color-mix(in oklab, #ffffff 10%, transparent);
          }
        }
      }
      @media (hover: hover) {
        .button:hover {
          color: #ffffff;
        }
      }
      .button:focus-visible {
        text-decoration-line: none;
        background-color: color-mix(in srgb, #ffffff 10%, transparent);
        color: #ffffff;
        outline-width: 2px;
        outline-offset: 2px;
        outline-color: rgb(59 130 246);
      }
      @supports (color: color-mix(in lab, red, red)) {
        .button:focus-visible {
          background-color: color-mix(in oklab, #ffffff 10%, transparent);
        }
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
        background-color: color-mix(in srgb, #ffffff 10%, transparent);
        color: #ffffff;
      }
      @supports (color: color-mix(in lab, red, red)) {
        .button[aria-expanded="true"] {
          background-color: color-mix(in oklab, #ffffff 10%, transparent);
        }
      }
      .button:active {
        scale: 95% 95%;
      }
      .icon-button {
        display: grid;
      }
      .icon-button svg {
        flex-shrink: 0;
        transition-property: opacity;
        transition-timing-function: ease;
        transition-duration: 300ms;
        filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
        grid-area: 1/1;
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
      .volume-button svg {
        opacity: 0%;
      }
      .volume-button[data-volume-level="high"] .volume-high-icon {
        opacity: 100%;
      }
      .volume-button[data-volume-level="medium"] .volume-low-icon {
        opacity: 100%;
      }
      .volume-button[data-volume-level="low"] .volume-low-icon {
        opacity: 100%;
      }
      .volume-button[data-volume-level="off"] .volume-off-icon {
        opacity: 100%;
      }
      media-fullscreen-button .fullscreen-enter-icon {
        opacity: 100%;
      }
      media-fullscreen-button[data-fullscreen] .fullscreen-enter-icon {
        opacity: 0%;
      }
      media-fullscreen-button .fullscreen-exit-icon {
        opacity: 0%;
      }
      media-fullscreen-button[data-fullscreen] .fullscreen-exit-icon {
        opacity: 100%;
      }
      media-fullscreen-button path {
        transition-property: transform, translate, scale, rotate;
        transition-timing-function: ease;
        transition-duration: 150ms;
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-enter-icon .arrow-1 {
          translate: -1px 0px;
        }
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-enter-icon .arrow-1 {
          translate: 0px -1px;
        }
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-enter-icon .arrow-2 {
          translate: 1px 0px;
        }
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-enter-icon .arrow-2 {
          translate: 0px 1px;
        }
      }
      media-fullscreen-exit-icon .arrow-1 {
        translate: -1px -1px;
      }
      media-fullscreen-exit-icon .arrow-2 {
        translate: 1px 1px;
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-exit-icon .arrow-1 {
          translate: 0rem 0rem;
        }
      }
      @media (hover: hover) {
        .button:hover media-fullscreen-exit-icon .arrow-2 {
          translate: 0rem 0rem;
        }
      }
      .time-controls {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-inline: 0.375rem;
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
        width: 100%;
        position: relative;
        -webkit-user-select: none;
        user-select: none;
        border-radius: calc(infinity * 1px);
        background-color: color-mix(in srgb, #ffffff 20%, transparent);
        box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 5%, transparent), 0 0 #0000;
      }
      @supports (color: color-mix(in lab, red, red)) {
        .slider-track {
          background-color: color-mix(in oklab, #ffffff 20%, transparent);
        }
      }
      .slider-track[data-orientation="horizontal"] {
        height: 0.25rem;
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
        background-color: #ffffff;
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
        opacity: 0%;
        outline-offset: calc(2px * -1);
        width: 0.625rem;
        height: 0.625rem;
        transition: opacity,height,width;
      }
      .slider-thumb:focus-visible {
        outline-width: 2px;
        outline-offset: 2px;
        outline-color: rgb(59 130 246);
      }
      @media (hover: hover) {
        .slider-root:hover .slider-thumb {
          opacity: 100%;
        }
      }
      .slider-root:focus-within .slider-thumb {
        opacity: 100%;
      }
      .slider-thumb:active {
        width: 0.75rem;
        height: 0.75rem;
      }
      .slider-root:active .slider-thumb {
        width: 0.75rem;
        height: 0.75rem;
      }
      @media (hover: hover) {
        .slider-thumb:hover {
          cursor: ew-resize;
        }
      }
      media-popover-popup {
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
        media-popover-popup {
          background-color: color-mix(in oklab, #ffffff 10%, transparent);
        }
      }
      media-popover-popup::after {
        content: '';
        position: absolute;
        inset: 0rem;
        box-shadow: 0 0 #0000, 0 0 #0000, 0 0 0 calc(1px + 0px) color-mix(in srgb, #000000 15%, transparent), 0 0 #0000;
        pointer-events: none;
        z-index: 10;
      }
      @media (prefers-contrast: more) {
        media-popover-popup {
          background-color: color-mix(in srgb, #000000 90%, transparent);
        }
        @supports (color: color-mix(in lab, red, red)) {
          media-popover-popup {
            background-color: color-mix(in oklab, #000000 90%, transparent);
          }
        }
      }
      @media (prefers-contrast: more) {
        media-popover-popup::after {
          content: '';
        }
      }
    </style>
    <media-container>
      <slot name="media" slot="media"></slot>
      <div class="overlay" aria-hidden="true"></div>
      <div class="controls" data-testid="media-controls">
        <media-play-button class="button icon-button">
          <media-play-icon></media-play-icon>
          <media-pause-icon></media-pause-icon>
        </media-play-button>
        <div class="time-controls">
          <media-current-time-display class="time-display"></media-current-time-display>
          <media-time-range-root class="slider-root">
            <media-time-range-track class="slider-track">
              <media-time-range-progress class="slider-progress"></media-time-range-progress>
              <media-time-range-pointer class="slider-pointer"></media-time-range-pointer>
            </media-time-range-track>
            <media-time-range-thumb class="slider-thumb"></media-time-range-thumb>
          </media-time-range-root>
          <media-duration-display class="time-display"></media-duration-display>
        </div>
        <media-popover-root open-on-hover delay close-delay>
          <media-popover-trigger>
            <media-mute-button class="button icon-button volume-button">
              <media-volume-high-icon></media-volume-high-icon>
              <media-volume-low-icon></media-volume-low-icon>
              <media-volume-off-icon></media-volume-off-icon>
            </media-mute-button>
          </media-popover-trigger>
          <media-popover-positioner side="top" side-offset>
            <media-popover-popup>
              <media-volume-range-root class="slider-root" orientation="vertical">
                <media-volume-range-track class="slider-track">
                  <media-volume-range-progress class="slider-progress"></media-volume-range-progress>
                </media-volume-range-track>
                <media-volume-range-thumb class="slider-thumb"></media-volume-range-thumb>
              </media-volume-range-root>
            </media-popover-popup>
          </media-popover-positioner>
        </media-popover-root>
        <media-fullscreen-button class="button icon-button">
          <media-fullscreen-enter-icon></media-fullscreen-enter-icon>
          <media-fullscreen-exit-icon></media-fullscreen-exit-icon>
        </media-fullscreen-button>
      </div>
    </media-container>
  `;
}

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-default', MediaSkinDefault);
