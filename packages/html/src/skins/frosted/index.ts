import { MediaSkin } from '@/media/media-skin';
import styles from './styles.css';
import '@/media/media-container';
import '@/media/media-provider';
import '@/components/media-play-button';
import '@/components/media-mute-button';
import '@/components/media-volume-slider';
import '@/components/media-time-slider';
import '@/components/media-fullscreen-button';
import '@/components/media-duration-display';
import '@/components/media-current-time-display';
import '@/components/media-preview-time-display';
import '@/components/media-popover';
import '@/components/media-tooltip';

import '@/icons';

export function getTemplateHTML() {
  return /* html */`
    ${MediaSkin.getTemplateHTML()}
    <style>${styles}</style>

    <media-container>
      <slot name="media" slot="media"></slot>

      <div class="overlay"></div>

      <div class="control-bar surface">
        <!-- NOTE: We can decide if we further want to provide a further, "themed" media-play-button that comes with baked in default styles and icons. (CJP) -->
        <media-tooltip-root delay="500" close-delay="0">
          <media-tooltip-trigger>
            <media-play-button class="button">
              <media-play-icon class="icon play-icon"></media-play-icon>
              <media-pause-icon class="icon pause-icon"></media-pause-icon>
            </media-play-button>
          </media-tooltip-trigger>
          <media-tooltip-portal>
            <media-tooltip-positioner side="top" side-offset="12" collision-padding="12">
              <media-tooltip-popup class="surface popup-animation">
                <span class="tooltip play-tooltip">Play</span>
                <span class="tooltip pause-tooltip">Pause</span>
              </media-tooltip-popup>
            </media-tooltip-positioner>
          </media-tooltip-portal>
        </media-tooltip-root>

        <div class="time-controls">
          <!-- Use the show-remaining attribute to show count down/remaining time -->
          <media-current-time-display></media-current-time-display>

          <media-tooltip-root track-cursor-axis="x">
            <media-tooltip-trigger>
              <media-time-slider-root class="slider-root">
                <media-time-slider-track class="slider-track">
                  <media-time-slider-progress class="slider-progress"></media-time-slider-progress>
                  <media-time-slider-pointer class="slider-pointer"></media-time-slider-pointer>
                </media-time-slider-track>
                <media-time-slider-thumb class="slider-thumb"></media-time-slider-thumb>
              </media-time-slider-root>
            </media-tooltip-trigger>
            <media-tooltip-portal>
              <media-tooltip-positioner side="top" side-offset="18" collision-padding="12">
                <media-tooltip-popup class="surface popup-animation">
                  <preview-time-display></preview-time-display>
                </media-tooltip-popup>
              </media-tooltip-positioner>
            </media-tooltip-portal>
          </media-tooltip-root>

          <media-duration-display></media-duration-display>
        </div>

        <media-popover-root open-on-hover delay="200" close-delay="100">
          <media-popover-trigger>
            <media-mute-button class="button">
              <media-volume-high-icon class="icon volume-high-icon"></media-volume-high-icon>
              <media-volume-low-icon class="icon volume-low-icon"></media-volume-low-icon>
              <media-volume-off-icon class="icon volume-off-icon"></media-volume-off-icon>
            </media-mute-button>
          </media-popover-trigger>
          <media-popover-portal>
            <media-popover-positioner side="top" side-offset="12" collision-padding="12">
              <media-popover-popup class="surface popup-animation">
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

        <media-tooltip-root delay="500" close-delay="0">
          <media-tooltip-trigger>
            <media-fullscreen-button class="button">
              <media-fullscreen-enter-icon class="icon fullscreen-enter-icon"></media-fullscreen-enter-icon>
              <media-fullscreen-exit-icon class="icon fullscreen-exit-icon"></media-fullscreen-exit-icon>
            </media-fullscreen-button>
          </media-tooltip-trigger>
          <media-tooltip-portal>
            <media-tooltip-positioner side="top" side-offset="12" collision-padding="12">
              <media-tooltip-popup class="surface popup-animation">
                <span class="tooltip fullscreen-enter-tooltip">Enter Fullscreen</span>
                <span class="tooltip fullscreen-exit-tooltip">Exit Fullscreen</span>
              </media-tooltip-popup>
            </media-tooltip-positioner>
          </media-tooltip-portal>
        </media-tooltip-root>
      </div>
    </media-container>
  `;
}

export class MediaSkinFrosted extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-frosted', MediaSkinFrosted);
