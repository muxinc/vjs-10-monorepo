import { TimeSlider } from '@vjs-10/react';
import './TimeSlider.css';

/**
 * Basic TimeSlider example demonstrating:
 * - Progress and pointer visualization
 * - Horizontal orientation
 * - Regular CSS for styling (compatible with Astro)
 * - Data attribute selectors for state-based styling
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicTimeSlider() {
  return (
    <TimeSlider.Root className="example-time-slider" orientation="horizontal">
      <TimeSlider.Track className="time-slider-track">
        <TimeSlider.Progress className="time-slider-progress" />
        <TimeSlider.Pointer className="time-slider-pointer" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="time-slider-thumb" />
    </TimeSlider.Root>
  );
}
