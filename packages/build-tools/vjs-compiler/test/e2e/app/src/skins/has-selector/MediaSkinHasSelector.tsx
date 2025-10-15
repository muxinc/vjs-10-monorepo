/**
 * Level 9: Has Selector Test Skin
 *
 * Purpose: Test :has() parent selector support for conditional styling
 *
 * Features:
 * - :has() selector for parent styling based on child state
 * - Conditional scaling based on data attributes
 * - Conditional backdrop blur on hover
 * - Modern CSS feature (2023+)
 *
 * Tailwind classes used (Level 9):
 * - has-[[data-paused]]:scale-105 - parent scales when contains paused element
 * - has-[.button:hover]:backdrop-blur-md - parent changes when child hovered
 * - has-[selector]:property - parent conditional styling
 *
 * Tests:
 * - React → WC transformation of has-[...]: utilities
 * - :has(selector) CSS generation
 * - Parent styling based on child state works
 * - Hover states with :has() work
 * - Data attribute selectors with :has() work
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinHasSelector({ children, className = '' }: SkinProps): JSX.Element {
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
