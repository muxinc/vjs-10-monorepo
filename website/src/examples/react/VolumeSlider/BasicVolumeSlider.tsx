import { VolumeSlider } from '@vjs-10/react';
import './VolumeSlider.css';

/**
 * Basic VolumeSlider example demonstrating:
 * - Volume level visualization
 * - Horizontal orientation
 * - Regular CSS for styling (compatible with Astro)
 * - Data attribute selectors for state-based styling
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicVolumeSlider() {
  return (
    <VolumeSlider.Root className="example-volume-slider" orientation="horizontal">
      <VolumeSlider.Track className="volume-slider-track">
        <VolumeSlider.Progress className="volume-slider-progress" />
      </VolumeSlider.Track>
      <VolumeSlider.Thumb className="volume-slider-thumb" />
    </VolumeSlider.Root>
  );
}
