import { FullscreenButton } from '@vjs-10/react';
import { FullscreenEnterIcon, FullscreenExitIcon } from '@vjs-10/react-icons';
import styles from './FullscreenButton.module.css';

/**
 * Basic FullscreenButton example demonstrating:
 * - Icon switching based on fullscreen state
 * - Data attribute state selectors
 * - Enter/exit fullscreen functionality
 *
 * Note: This component must be used within a MediaProvider context.
 * See the usage example in the documentation.
 */
export function BasicFullscreenButton() {
  return (
    <FullscreenButton className={styles.button}>
      <FullscreenEnterIcon className={styles.fullscreenEnterIcon} />
      <FullscreenExitIcon className={styles.fullscreenExitIcon} />
    </FullscreenButton>
  );
}
