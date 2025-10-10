
// MediaSkinDefault - Compiled for E2E Testing
// Base class stub for browser testing
class MediaSkin extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const constructor = this.constructor;
    if (this.shadowRoot && typeof constructor.getTemplateHTML === 'function') {
      this.shadowRoot.innerHTML = constructor.getTemplateHTML();
    }
  }
}

// Compiled web component (imports removed for browser use)

export class MediaSkinDefault extends MediaSkin {
  static getTemplateHTML = getTemplateHTML;
}

export function getTemplateHTML() {
  return /* html */ `
    ${MediaSkin.getTemplateHTML()}
    <style>
      :host {
        --spacing-0: 0px;
        --spacing-1: 0.25rem;
        --spacing-2: 0.5rem;
        --spacing-3: 0.75rem;
        --spacing-4: 1rem;
        --spacing-5: 1.25rem;
        --spacing-6: 1.5rem;
        --spacing-8: 2rem;
        --spacing-10: 2.5rem;
        --spacing-12: 3rem;
        --spacing-16: 4rem;
        --radius: 0.25rem;
        --radius-sm: 0.125rem;
        --radius-md: 0.375rem;
        --radius-lg: 0.5rem;
        --radius-xl: 0.75rem;
        --radius-2xl: 1rem;
        --radius-full: 9999px;
      }
      
      media-container {
        position: relative;
        overflow: clip
      }
      
      media-container::after {
        content: var(--tw-content);
        position: absolute
      }
      
      media-container::after {
        content: var(--tw-content);
        inset: var(--spacing-0)
      }
      
      media-container::after {
        content: var(--tw-content);
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)
      }
      
      media-container::after {
        content: var(--tw-content);
        --tw-ring-inset: inset
      }
      
      media-container::after {
        content: var(--tw-content);
        z-index: 10
      }
      
      media-container::after {
        content: var(--tw-content);
        pointer-events: none
      }
      
      media-container::after {
        content: var(--tw-content);
        border-radius: inherit
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          media-container::before {
          --tw-ring-color: color-mix(in oklab, var(--color-white) 15%, transparent)
          }
      }
      
      .overlay {
        opacity: 0%;
        transition-delay: 500ms;
        border-radius: inherit;
        position: absolute;
        inset: var(--spacing-0);
        pointer-events: none;
        --tw-gradient-position: to top in oklab;
        background-image: linear-gradient(var(--tw-gradient-stops));
        --tw-gradient-to: transparent;
        --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
        transition-property: opacity;
        transition-timing-function: var(--tw-ease, ease);
        transition-duration: var(--tw-duration, 0s);
        --tw-backdrop-saturate: saturate(150%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-backdrop-brightness: brightness(90%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)
      }
      
      @media (hover: hover) {
          .overlay:is(:where(.group\/root):hover *) {
          opacity: 100%
          }
          .overlay:is(:where(.group\/root):hover *) {
          transition-delay: 0ms
          }
      }
      
      .controls {
        position: absolute;
        inset-inline: var(--spacing-3);
        bottom: var(--spacing-3);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        padding: var(--spacing-1);
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
        --tw-ring-inset: inset;
        color: var(--color-white);
        --tw-backdrop-saturate: saturate(150%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-backdrop-brightness: brightness(90%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
        transition-timing-function: var(--tw-ease, ease);
        transition-duration: var(--tw-duration, 0s);
        will-change: transform;
        transform-origin: bottom;
        --tw-scale-x: 90%;
        --tw-scale-y: 90%;
        --tw-scale-z: 90%;
        scale: var(--tw-scale-x) var(--tw-scale-y);
        opacity: 0%;
        transition-delay: 500ms
      }
      
      .controls:has(*:is([data-paused])) {
        opacity: 100%
      }
      
      .controls:has(*:is([data-paused])) {
        transition-delay: 0ms
      }
      
      .controls::after {
        content: var(--tw-content);
        position: absolute
      }
      
      .controls::after {
        content: var(--tw-content);
        inset: var(--spacing-0)
      }
      
      .controls::after {
        content: var(--tw-content);
        border-radius: inherit
      }
      
      .controls::after {
        content: var(--tw-content);
        pointer-events: none
      }
      
      .controls::after {
        content: var(--tw-content);
        z-index: 10
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          .controls {
          --tw-ring-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          .controls {
          background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          .controls::after {
            --tw-ring-color: color-mix(in oklab, var(--color-white) 20%, transparent)
          }
      }
      
      @media (hover: hover) {
          .controls:is(:where(.group\/root):hover *) {
          --tw-scale-x: 100%;
          --tw-scale-y: 100%;
          --tw-scale-z: 100%;
          scale: var(--tw-scale-x) var(--tw-scale-y)
          }
          .controls:is(:where(.group\/root):hover *) {
          opacity: 100%
          }
          .controls:is(:where(.group\/root):hover *) {
          transition-delay: 0ms
          }
      }
      
      .Icon {
        /* Tailwind classes: icon */
        /* No CSS generated */
      }
      
      .button {
        cursor: pointer;
        position: relative;
        flex-shrink: 0;
        transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
        transition-timing-function: var(--tw-ease, ease);
        transition-duration: var(--tw-duration, 0s);
        -webkit-user-select: none;
        user-select: none;
        padding: var(--spacing-2);
        border-radius: var(--radius-full);
        background-color: transparent;
        outline-offset: calc(2px * -1)
      }
      
      .button:focus-visible {
        text-decoration-line: none
      }
      
      .button:focus-visible {
        color: var(--color-white)
      }
      
      .button:focus-visible {
        outline-style: var(--tw-outline-style);
        outline-width: 2px
      }
      
      .button:focus-visible {
        outline-offset: 2px
      }
      
      .button:focus-visible {
        outline-color: var(--color-blue-500)
      }
      
      .button[aria-disabled="true"] {
        --tw-grayscale: grayscale(100%);
        filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)
      }
      
      .button[aria-disabled="true"] {
        opacity: 50%
      }
      
      .button[aria-disabled="true"] {
        cursor: not-allowed
      }
      
      .button[aria-busy="true"] {
        pointer-events: none
      }
      
      .button[aria-busy="true"] {
        cursor: not-allowed
      }
      
      .button[aria-expanded="true"] {
        color: var(--color-white)
      }
      
      .button:active {
        --tw-scale-x: 95%;
        --tw-scale-y: 95%;
        --tw-scale-z: 95%;
        scale: var(--tw-scale-x) var(--tw-scale-y)
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          .button {
          color: color-mix(in oklab, var(--color-white) 90%, transparent)
          }
          .button:hover {
            background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          .button[aria-expanded="true"] {
          background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
      }
      
      @media (hover: hover) {
          .button:hover {
          text-decoration-line: none
          }
          .button:hover {
          color: var(--color-white)
          }
      }
      
      .icon-button {
        display: grid
      }
      
      .PlayButton {
        /* Tailwind classes: [&_.pause-icon]:opacity-100 [&[data-paused]_.pause-icon]:opacity-0 [&_.play-icon]:opacity-0 [&[data-paused]_.play-icon]:opacity-100 */
        /* No CSS generated */
      }
      
      .PlayIcon {
        /* Tailwind classes: play-icon */
        /* No CSS generated */
      }
      
      .PauseIcon {
        /* Tailwind classes: pause-icon */
        /* No CSS generated */
      }
      
      media-tooltip-popup {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-md);
        color: var(--color-white);
        padding-inline: var(--spacing-2);
        padding-block: var(--spacing-1);
        --tw-backdrop-saturate: saturate(150%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-backdrop-brightness: brightness(90%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
        --tw-ring-inset: inset
      }
      
      media-tooltip-popup::after {
        content: var(--tw-content);
        position: absolute
      }
      
      media-tooltip-popup::after {
        content: var(--tw-content);
        inset: var(--spacing-0)
      }
      
      media-tooltip-popup::after {
        content: var(--tw-content);
        border-radius: inherit
      }
      
      media-tooltip-popup::after {
        content: var(--tw-content);
        pointer-events: none
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          media-tooltip-popup {
          background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          media-tooltip-popup {
          --tw-ring-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
      }
      
      .PlayTooltipPopup {
        /* Tailwind classes: [&_.pause-tooltip]:inline [&[data-paused]_.pause-tooltip]:hidden [&_.play-tooltip]:hidden [&[data-paused]_.play-tooltip]:inline */
        /* No CSS generated */
      }
      
      .PlayTooltip {
        /* Tailwind classes: play-tooltip */
        /* No CSS generated */
      }
      
      .PauseTooltip {
        /* Tailwind classes: pause-tooltip */
        /* No CSS generated */
      }
      
      .MuteButton {
        /* Tailwind classes: [&_.icon]:opacity-0 [&[data-volume-level="high"]_.volume-high-icon]:opacity-100 [&[data-volume-level="medium"]_.volume-low-icon]:opacity-100 [&[data-volume-level="low"]_.volume-low-icon]:opacity-100 [&[data-volume-level="off"]_.volume-off-icon]:opacity-100 */
        /* No CSS generated */
      }
      
      .VolumeHighIcon {
        /* Tailwind classes: volume-high-icon */
        /* No CSS generated */
      }
      
      .VolumeLowIcon {
        /* Tailwind classes: volume-low-icon */
        /* No CSS generated */
      }
      
      .VolumeOffIcon {
        /* Tailwind classes: volume-off-icon */
        /* No CSS generated */
      }
      
      .FullscreenButton {
        /* Tailwind classes: [&_.fullscreen-enter-icon]:opacity-100 [&[data-fullscreen]_.fullscreen-enter-icon]:opacity-0 [&_.fullscreen-exit-icon]:opacity-0 [&[data-fullscreen]_.fullscreen-exit-icon]:opacity-100 [&_path]:transition-transform ease-out */
        /* No CSS generated */
      }
      
      .FullscreenEnterIcon {
        /* Tailwind classes: fullscreen-enter-icon group-hover/button:[&_.arrow-1]:-translate-x-px group-hover/button:[&_.arrow-1]:-translate-y-px group-hover/button:[&_.arrow-2]:translate-x-px group-hover/button:[&_.arrow-2]:translate-y-px */
        /* No CSS generated */
      }
      
      .FullscreenExitIcon {
        /* Tailwind classes: fullscreen-exit-icon [&_.arrow-1]:-translate-x-px [&_.arrow-1]:-translate-y-px [&_.arrow-2]:translate-x-px [&_.arrow-2]:translate-y-px group-hover/button:[&_.arrow-1]:translate-0 group-hover/button:[&_.arrow-2]:translate-0 */
        /* No CSS generated */
      }
      
      .FullscreenTooltipPopup {
        /* Tailwind classes: [&_.fullscreen-enter-tooltip]:inline [&[data-fullscreen]_.fullscreen-enter-tooltip]:hidden [&_.fullscreen-exit-tooltip]:hidden [&[data-fullscreen]_.fullscreen-exit-tooltip]:inline */
        /* No CSS generated */
      }
      
      .FullscreenEnterTooltip {
        /* Tailwind classes: fullscreen-enter-tooltip */
        /* No CSS generated */
      }
      
      .FullscreenExitTooltip {
        /* Tailwind classes: fullscreen-exit-tooltip */
        /* No CSS generated */
      }
      
      .time-controls {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-3)
      }
      
      .time-display {
        --tw-numeric-spacing: tabular-nums;
        font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,)
      }
      
      .slider-root {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        position: relative
      }
      
      .slider-track {
        width: 100%;
        position: relative;
        -webkit-user-select: none;
        user-select: none;
        border-radius: var(--radius-full);
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          .slider-track {
          background-color: color-mix(in oklab, var(--color-white) 20%, transparent)
          }
      }
      
      .slider-progress {
        background-color: var(--color-white);
        border-radius: inherit
      }
      
      media-time-slider-pointer {
        border-radius: inherit
      }
      
      .slider-thumb {
        background-color: var(--color-white);
        z-index: 10;
        -webkit-user-select: none;
        user-select: none;
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
        border-radius: var(--radius-full);
        opacity: 0%;
        outline-offset: calc(2px * -1)
      }
      
      .slider-thumb:focus-visible {
        outline-style: var(--tw-outline-style);
        outline-width: 2px
      }
      
      .slider-thumb:focus-visible {
        outline-offset: 2px
      }
      
      .slider-thumb:focus-visible {
        outline-color: var(--color-blue-500)
      }
      
      .slider-thumb:is(:where(.group\/slider):focus-within *) {
        opacity: 100%
      }
      
      .slider-thumb:active {
        width: var(--spacing-3);
        height: var(--spacing-3)
      }
      
      .slider-thumb:is(:where(.group\/slider):active *) {
        width: var(--spacing-3);
        height: var(--spacing-3)
      }
      
      @media (hover: hover) {
          .slider-thumb:is(:where(.group\/slider):hover *) {
          opacity: 100%
          }
          .slider-thumb:hover {
          cursor: ew-resize
          }
      }
      
      media-popover-popup {
        position: relative;
        padding-inline: var(--spacing-2);
        padding-block: var(--spacing-4);
        border-radius: var(--radius-2xl);
        --tw-backdrop-saturate: saturate(150%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-backdrop-brightness: brightness(90%);
        -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
        --tw-ring-inset: inset
      }
      
      media-popover-popup::after {
        content: var(--tw-content);
        position: absolute
      }
      
      media-popover-popup::after {
        content: var(--tw-content);
        inset: var(--spacing-0)
      }
      
      media-popover-popup::after {
        content: var(--tw-content);
        border-radius: inherit
      }
      
      media-popover-popup::after {
        content: var(--tw-content);
        pointer-events: none
      }
      
      media-popover-popup::after {
        content: var(--tw-content);
        z-index: 10
      }
      
      @supports (color: color-mix(in lab, red, red)) {
          media-popover-popup {
          background-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          media-popover-popup {
          --tw-ring-color: color-mix(in oklab, var(--color-white) 10%, transparent)
          }
          media-popover-popup::after {
            --tw-ring-color: color-mix(in oklab, var(--color-white) 20%, transparent)
          }
      }
    </style>

    <media-container>
          <slot name="media" slot="media"></slot>


          <div class="overlay" aria-hidden="true"></div>

          <div class="controls" data-testid="media-controls">
            <media-tooltip-root delay="600" closeDelay="0">
              <media-tooltip-trigger>
                <media-play-button class="button icon-button">
                  <media-play-icon class="icon"></media-play-icon>
                  <media-pause-icon class="icon"></media-pause-icon>
                </media-play-button>
              </media-tooltip-trigger>
              <media-tooltip-portal>
                <media-tooltip-positioner side="top" sideOffset="12" collisionPadding="12">
                  <media-tooltip-popup class="play-tooltip-popup">
                    <span class="play-tooltip">Play</span>
                    <span class="pause-tooltip">Pause</span>
                  </media-tooltip-popup>
                </media-tooltip-positioner>
              </media-tooltip-portal>
            </media-tooltip-root>

            <div class="time-controls">
              <media-current-time-display class="time-display"></media-current-time-display>

              <media-time-slider-root class="slider-root">
                <media-time-slider-track class="slider-track">
                  <media-time-slider-progress class="slider-progress"></media-time-slider-progress>
                  <media-time-slider-pointer></media-time-slider-pointer>
                </media-time-slider-track>
                <media-time-slider-thumb class="slider-thumb"></media-time-slider-thumb>
              </media-time-slider-root>

              <media-duration-display class="time-display"></media-duration-display>
            </div>

            <media-popover-root openOnHover delay="200" closeDelay="100">
              <media-popover-trigger>
                <media-mute-button class="button icon-button">
                  <media-volume-high-icon class="icon"></media-volume-high-icon>
                  <media-volume-low-icon class="icon"></media-volume-low-icon>
                  <media-volume-off-icon class="icon"></media-volume-off-icon>
                </media-mute-button>
              </media-popover-trigger>
              <media-popover-portal>
                <media-popover-positioner side="top" sideOffset="12">
                  <media-popover-popup>
                    <media-volume-slider-root class="slider-root" orientation="vertical">
                      <media-volume-slider-track class="slider-track">
                        <media-volume-slider-progress class="slider-progress"></media-volume-slider-progress>
                      </media-volume-slider-track>
                      <media-volume-slider-thumb class="slider-thumb"></media-volume-slider-thumb>
                    </media-volume-slider-root>
                  </media-popover-popup>
                </media-popover-positioner>
              </media-popover-portal>
            </media-popover-root>

            <media-tooltip-root delay="600" closeDelay="0">
              <media-tooltip-trigger>
                <media-fullscreen-button class="button icon-button">
                  <media-fullscreen-enter-icon class="icon"></media-fullscreen-enter-icon>
                  <media-fullscreen-exit-icon class="icon"></media-fullscreen-exit-icon>
                </media-fullscreen-button>
              </media-tooltip-trigger>
              <media-tooltip-portal>
                <media-tooltip-positioner side="top" sideOffset="12" collisionPadding="12">
                  <media-tooltip-popup class="fullscreen-tooltip-popup">
                    <span class="fullscreen-enter-tooltip">Enter Fullscreen</span>
                    <span class="fullscreen-exit-tooltip">Exit Fullscreen</span>
                  </media-tooltip-popup>
                </media-tooltip-positioner>
              </media-tooltip-portal>
            </media-tooltip-root>
          </div>
        </media-container>
  `;
}

// Self-register the component
if (!customElements.get('media-skin-default')) {
  customElements.define('media-skin-default', MediaSkinDefault);
}

