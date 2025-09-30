/**
 * MinimalTestSkin - External test fixture for E2E validation
 *
 * Purpose: Validate import transformations with @vjs-10 scoped imports
 * Location: Outside any package to force proper import resolution
 *
 * This skin uses:
 * - @vjs-10/react components (MediaContainer, PlayButton)
 * - @vjs-10/react-icons (PlayIcon, PauseIcon)
 * - Minimal styles to isolate CSS compilation
 */

import styles from './styles';

import type { PropsWithChildren } from 'react';

import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PauseIcon, PlayIcon } from '@vjs-10/react-icons';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MinimalTestSkin({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.Container} ${className}`}>
      {children}

      <div className={styles.Controls}>
        <PlayButton className={styles.Button}>
          <PlayIcon className={styles.PlayIcon} />
          <PauseIcon className={styles.PauseIcon} />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
