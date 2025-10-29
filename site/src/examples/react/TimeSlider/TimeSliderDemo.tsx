import { MediaContainer, MediaProvider, Video } from '@videojs/react';
import { BasicTimeSlider } from './BasicTimeSlider';

/**
 * Demo showing proper MediaProvider usage with TimeSlider.
 * The MediaProvider wraps the entire media experience and provides
 * the necessary context for all media components.
 */
export function TimeSliderDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ position: 'relative' }}>
        <Video
          src="https://stream.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA.m3u8"
          poster="https://image.mux.com/UZMwOY6MgmhFNXLbSFXAuPKlRPss5XNA/thumbnail.webp"
          muted
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicTimeSlider />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
