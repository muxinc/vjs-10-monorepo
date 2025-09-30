import styles from './styles.module.css';

import * as React from 'react';

export function Component() {
  return (
    <div className={styles.Container}>
      <button disabled className={`${styles.Button} ${styles.Primary}`}>
        Click
      </button>
      <CurrentTimeDisplay showRemaining aria-label="Current time" />
    </div>
  );
}
