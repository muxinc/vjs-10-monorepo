import { PlayButton } from '@vjs-10/react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';
import styles from './PlayButton.module.css';

/**
 * PlayButton example using CSS Modules for styling.
 * CSS Modules provide scoped class names to avoid conflicts.
 */
export function PlayButtonCSSModules() {
  return (
    <PlayButton className={styles.playButton}>
      <PlayIcon className={styles.playIcon} />
      <PauseIcon className={styles.pauseIcon} />
    </PlayButton>
  );
}
