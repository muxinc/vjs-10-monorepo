/**
 * Level 11: ARIA States Test Skin
 *
 * Purpose: Test ARIA attribute selectors for accessibility-driven styling
 *
 * Features:
 * - aria-disabled: for disabled state styling
 * - aria-busy: for loading/busy state styling
 * - aria-pressed: for toggle button states
 * - Multiple ARIA states on same element
 *
 * Tailwind classes used (Level 11):
 * - aria-disabled:opacity-50 - disabled state opacity
 * - aria-disabled:cursor-not-allowed - disabled cursor
 * - aria-busy:opacity-70 - busy state opacity
 * - aria-busy:animate-pulse - busy state animation
 * - aria-pressed:bg-[color] - pressed state background
 * - aria-disabled:hover:property - disabled overrides hover
 *
 * Tests:
 * - React → WC transformation of aria-*: utilities
 * - [aria-disabled="true"] CSS generation
 * - [aria-busy="true"] CSS generation
 * - [aria-pressed="true"] CSS generation
 * - Multiple ARIA states work together
 * - ARIA disabled overrides hover states
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinAriaStates({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <PlayButton className={styles.Button}>
            <PlayIcon className={styles.PlayIcon} />
            <PauseIcon className={styles.PauseIcon} />
          </PlayButton>
        </div>
      </div>
    </MediaContainer>
  );
}
