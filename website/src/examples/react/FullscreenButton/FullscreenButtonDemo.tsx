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
      <MediaContainer style={{ maxWidth: '640px', position: 'relative' }}>
        <Video
          src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8"
          poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicFullscreenButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
