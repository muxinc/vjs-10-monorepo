import { MuteButton } from '@vjs-10/react';
import { VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import styles from './MuteButton.module.css';

/**
 * MuteButton example using CSS Modules for styling.
 * CSS Modules provide scoped class names to avoid conflicts.
 */
export function MuteButtonCSSModules() {
  return (
    <MuteButton className={styles.muteButton}>
      <VolumeHighIcon className={styles.volumeHighIcon} />
      <VolumeLowIcon className={styles.volumeLowIcon} />
      <VolumeOffIcon className={styles.volumeOffIcon} />
    </MuteButton>
  );
}
