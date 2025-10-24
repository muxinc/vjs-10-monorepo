import { VolumeSlider } from '@vjs-10/react';
import styles from './VolumeSlider.module.css';

/**
 * Basic VolumeSlider example demonstrating:
 * - Volume level visualization
 * - Horizontal orientation
 * - CSS Modules for scoped styling
 * - Data attribute selectors for state-based styling
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicVolumeSlider() {
  return (
    <VolumeSlider.Root className={styles.root} orientation="horizontal">
      <VolumeSlider.Track className={styles.track}>
        <VolumeSlider.Progress className={styles.progress} />
      </VolumeSlider.Track>
      <VolumeSlider.Thumb className={styles.thumb} />
    </VolumeSlider.Root>
  );
}
