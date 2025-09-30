import * as React from 'react';
import styles from './styles.module.css';

export const Component = () => (
  <div className={styles.Container}>
    <button disabled className={`${styles.Button} ${styles.Primary}`}>
      Click
    </button>
    <CurrentTimeDisplay showRemaining aria-label="Current time" />
  </div>
);
