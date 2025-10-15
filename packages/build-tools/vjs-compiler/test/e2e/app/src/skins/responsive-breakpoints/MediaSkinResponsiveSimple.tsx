/**
 * Level 5: Responsive Variants Test Skin (Simplified)
 *
 * Purpose: Test responsive breakpoint support in isolation
 *
 * Features:
 * - Responsive breakpoints at multiple screen sizes
 * - Container query generation
 * - Multiple responsive properties per breakpoint
 *
 * Tailwind classes used (Level 5):
 * - Responsive: sm:, md:, lg: breakpoints
 * - Container queries: @container (min-width: Xrem)
 *
 * Tests:
 * - React → WC transformation of responsive utilities
 * - Container query generation
 * - Multiple breakpoints working together
 *
 * NOTE: This is simplified to test ONLY responsive variants.
 * For combined features (hover + arbitrary + responsive), see Level 6.
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinResponsiveSimple({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <PlayButton className={styles.Button}>
            <PlayIcon className={`${styles.PlayIcon} ${styles.Icon}`} />
            <PauseIcon className={`${styles.PauseIcon} ${styles.Icon}`} />
          </PlayButton>
        </div>
      </div>
    </MediaContainer>
  );
}
