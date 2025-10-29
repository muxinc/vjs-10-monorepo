import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { BasicFullscreenButton } from './BasicFullscreenButton';

/**
 * Demo showing proper MediaProvider usage with FullscreenButton.
 * The FullscreenButton automatically toggles fullscreen mode for
 * the containing MediaContainer.
 */
export function FullscreenButtonDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative' }}>
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicFullscreenButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
