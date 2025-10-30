import { FrostedSkin, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import '@videojs/react/skins/frosted.css';

/**
 * Live demo of the FrostedSkin design.
 *
 * Features demonstrated:
 * - Glassmorphic controls with backdrop blur
 * - Tooltips on hover for all buttons
 * - Vertical volume slider in a popover
 * - Time preview on timeline hover
 * - Smooth animations and transitions
 */
export function FrostedSkinDemo() {
  return (
    <MediaProvider>
      <FrostedSkin className="w-full aspect-video rounded-3xl">
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          playsInline
        />
      </FrostedSkin>
    </MediaProvider>
  );
}
