import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { BasicMuteButton } from './BasicMuteButton';

/**
 * Demo showing proper MediaProvider usage with MuteButton.
 * The MuteButton automatically reflects the current volume state
 * and toggles mute/unmute on click.
 */
export function MuteButtonDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative' }}>
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 10 }}>
          <BasicMuteButton />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
