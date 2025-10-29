import { MediaContainer, MediaProvider, Video } from '@videojs/react';
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
          src="https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA.m3u8"
          poster="https://image.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/thumbnail.webp"
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicFullscreenButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
