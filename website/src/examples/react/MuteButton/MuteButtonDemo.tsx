import { MediaContainer, MediaProvider, Video } from '@vjs-10/react';
import { BasicMuteButton } from './BasicMuteButton';

/**
 * Demo showing proper MediaProvider usage with MuteButton.
 * The MuteButton automatically reflects the current volume state
 * and toggles mute/unmute on click.
 */
export function MuteButtonDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ maxWidth: '640px', position: 'relative' }}>
        <Video
          src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8"
          poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 10 }}>
          <BasicMuteButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
