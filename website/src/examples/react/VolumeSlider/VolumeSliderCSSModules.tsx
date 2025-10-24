import { VolumeSlider } from '@vjs-10/react';
import styles from './VolumeSlider.module.css';

export function VolumeSliderHorizontal() {
  return (
    <VolumeSlider.Root className={styles.root} orientation="horizontal">
      <VolumeSlider.Track className={styles.track}>
        <VolumeSlider.Progress className={styles.progress} />
      </VolumeSlider.Track>
      <VolumeSlider.Thumb className={styles.thumb} />
    </VolumeSlider.Root>
  );
}

export function VolumeSliderVertical() {
  return (
    <VolumeSlider.Root className={styles.root} orientation="vertical">
      <VolumeSlider.Track className={styles.track}>
        <VolumeSlider.Progress className={styles.progress} />
      </VolumeSlider.Track>
      <VolumeSlider.Thumb className={styles.thumb} />
    </VolumeSlider.Root>
  );
}
