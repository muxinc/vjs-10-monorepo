import { FullscreenButton } from '@vjs-10/react';
import { FullscreenEnterIcon, FullscreenExitIcon } from '@vjs-10/react-icons';
import styles from './FullscreenButton.module.css';

/**
 * FullscreenButton example using CSS Modules for styling.
 * CSS Modules provide scoped class names to avoid conflicts.
 */
export function FullscreenButtonCSSModules() {
  return (
    <FullscreenButton className={styles.fullscreenButton}>
      <FullscreenEnterIcon className={styles.fullscreenEnterIcon} />
      <FullscreenExitIcon className={styles.fullscreenExitIcon} />
    </FullscreenButton>
  );
}
