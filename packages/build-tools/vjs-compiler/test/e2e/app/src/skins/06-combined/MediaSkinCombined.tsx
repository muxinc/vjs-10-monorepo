/**
 * Level 6: Combined Features Test Skin
 *
 * Purpose: Test ALL Tailwind features working together
 *
 * Features (combines Levels 3, 4, 5):
 * - Hover/focus/active pseudo-classes (Level 3)
 * - Arbitrary values for colors, sizing, filters (Level 4)
 * - Responsive breakpoints (Level 5)
 * - Complex feature interactions
 *
 * Tailwind classes used (Level 6):
 * - Hover: hover:bg-*, hover:scale-*
 * - Responsive: sm:, md:, lg: breakpoints
 * - Arbitrary values: [rgba(...)], [clamp(...)], [12px], [#hex]
 * - Transitions: transition-all, duration-*, ease-in-out
 * - Transforms: scale-*, hover:scale-*
 * - Filters: backdrop-blur-[Npx]
 * - Grid: grid, [grid-area:1/1]
 *
 * Tests:
 * - All features compile without conflicts
 * - Container queries + hover work together
 * - Responsive arbitrary values work
 * - Complex selector combinations generate correct CSS
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinCombined({ children, className = '' }: SkinProps): JSX.Element {
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
