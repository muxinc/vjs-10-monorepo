import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { VJS8_DEMO_VIDEO } from '@/consts';
import { BasicTimeSlider } from './BasicTimeSlider';

/**
 * Demo showing proper MediaProvider usage with TimeSlider.
 * The MediaProvider wraps the entire media experience and provides
 * the necessary context for all media components.
 */
export function TimeSliderDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative', zIndex: 10 }}>
        <Video
          src={VJS8_DEMO_VIDEO.hls}
          poster={VJS8_DEMO_VIDEO.poster}
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicTimeSlider />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
