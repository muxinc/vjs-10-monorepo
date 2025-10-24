import { TimeSlider } from '@vjs-10/react';
import styles from './TimeSlider.module.css';

export function TimeSliderHorizontal() {
  return (
    <TimeSlider.Root className={styles.root} orientation="horizontal">
      <TimeSlider.Track className={styles.track}>
        <TimeSlider.Progress className={styles.progress} />
        <TimeSlider.Pointer className={styles.pointer} />
      </TimeSlider.Track>
      <TimeSlider.Thumb className={styles.thumb} />
    </TimeSlider.Root>
  );
}

export function TimeSliderVertical() {
  return (
    <TimeSlider.Root className={styles.root} orientation="vertical">
      <TimeSlider.Track className={styles.track}>
        <TimeSlider.Progress className={styles.progress} />
        <TimeSlider.Pointer className={styles.pointer} />
      </TimeSlider.Track>
      <TimeSlider.Thumb className={styles.thumb} />
    </TimeSlider.Root>
  );
}
