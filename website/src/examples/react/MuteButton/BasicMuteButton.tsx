import { MuteButton } from '@vjs-10/react';
import { VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import styles from './MuteButton.module.css';

/**
 * Basic MuteButton example demonstrating:
 * - Multi-state icon switching (high/medium/low/off)
 * - Volume level data attributes
 * - Smooth icon transitions
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicMuteButton() {
  return (
    <MuteButton className={styles.button}>
      <VolumeHighIcon className={styles.volumeHighIcon} />
      <VolumeLowIcon className={styles.volumeLowIcon} />
      <VolumeOffIcon className={styles.volumeOffIcon} />
    </MuteButton>
  );
}
