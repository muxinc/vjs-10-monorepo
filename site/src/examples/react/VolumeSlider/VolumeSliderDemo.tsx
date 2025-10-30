import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { BasicVolumeSlider } from './BasicVolumeSlider';

/**
 * Demo showing proper MediaProvider usage with VolumeSlider.
 * The MediaProvider wraps the entire media experience and provides
 * the necessary context for all media components.
 */
export function VolumeSliderDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative' }}>
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicVolumeSlider />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
