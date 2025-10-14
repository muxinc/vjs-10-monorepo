/**
 * Level 3: Interactive Test Skin
 *
 * Purpose: Test icon stacking and data-attribute conditional styling
 *
 * Features:
 * - Grid-based icon overlay (play/pause icons stacked in same position)
 * - Data attribute selectors for state-dependent visibility
 * - Child combinators ([&_.icon] patterns)
 *
 * Tailwind classes used (Level 3):
 * - Layout: relative, absolute, inset-0, flex, items-center, justify-center
 * - Spacing: p-3
 * - Border: rounded-full
 * - Interactivity: pointer-events-none, pointer-events-auto
 * - Grid: grid
 * - Child selectors: [&_.icon]:[grid-area:1/1]
 * - Data attribute selectors: [&[data-paused]_.play-icon]:opacity-100
 * - Opacity: opacity-0, opacity-100
 *
 * Tests:
 * - React → WC transformation of complex selectors
 * - Grid layout compilation
 * - Data attribute selector transformation
 * - Child combinator transformation
 * - Icon visibility toggling based on playback state
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinInteractive({ children, className = '' }: SkinProps): JSX.Element {
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
