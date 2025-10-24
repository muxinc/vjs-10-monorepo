import { MediaContainer, MediaProvider, Video } from '@vjs-10/react';
import { BasicTimeSlider } from './BasicTimeSlider';

/**
 * Demo showing proper MediaProvider usage with TimeSlider.
 * The MediaProvider wraps the entire media experience and provides
 * the necessary context for all media components.
 */
export function TimeSliderDemo() {
  return (
    <MediaProvider>
      <MediaContainer style={{ maxWidth: '640px', position: 'relative' }}>
        <Video
          src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8"
          poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 10 }}>
          <BasicTimeSlider />
        </div>
      </MediaContainer>
    </MediaProvider>
  );
}
