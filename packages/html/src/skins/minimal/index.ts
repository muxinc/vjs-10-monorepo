import { MediaSkin } from '@/media/media-skin';
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
  `;
}

export class MediaSkinMinimal extends MediaSkin {
  static getTemplateHTML: () => string = getTemplateHTML;
}

customElements.define('media-skin-minimal', MediaSkinMinimal);
