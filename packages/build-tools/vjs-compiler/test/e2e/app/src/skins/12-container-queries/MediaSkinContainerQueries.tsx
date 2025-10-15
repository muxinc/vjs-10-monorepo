/**
 * Level 12: Container Queries Test Skin
 *
 * Purpose: Test container query support (@container, @Nxl/name)
 *
 * Features:
 * - Container definition (@container/name)
 * - Container query size conditions (@sm/name:, @md/name:, etc.)
 * - Named containers for nested queries
 * - Container-based responsive design
 *
 * Tailwind classes used (Level 12):
 * - Container: @container/name
 * - Container queries: @sm/name:*, @md/name:*, @lg/name:*, @xl/name:*
 * - Multiple named containers: @container/root, @container/controls
 *
 * Tests:
 * - React → WC transformation of container query utilities
 * - @container at-rule generation
 * - Named container support
 * - Container size breakpoints
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinContainerQueries({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={styles.ControlsContainer}>
            <PlayButton className={styles.Button}>
              <PlayIcon className={`${styles.PlayIcon} ${styles.Icon}`} />
              <PauseIcon className={`${styles.PauseIcon} ${styles.Icon}`} />
            </PlayButton>
            <div className={styles.Label}>Play</div>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
