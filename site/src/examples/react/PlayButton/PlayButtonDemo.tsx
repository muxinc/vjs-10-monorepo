import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { BasicPlayButton } from './BasicPlayButton';

/**
 * Demo showing proper MediaProvider usage with PlayButton.
 * The MediaProvider wraps the entire media experience and provides
 * the necessary context for all media components.
 */
export function PlayButtonDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative' }}>
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 10 }}>
          <BasicPlayButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
