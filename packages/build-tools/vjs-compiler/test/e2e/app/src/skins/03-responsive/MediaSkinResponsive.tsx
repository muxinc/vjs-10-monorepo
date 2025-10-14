/**
 * Level 4: Responsive Test Skin
 *
 * Purpose: Test responsive design and complex arbitrary values
 *
 * Features:
 * - Responsive breakpoints at multiple screen sizes
 * - Complex arbitrary values (clamp, rgba, custom px values)
 * - CSS transitions and transforms
 * - Backdrop filters
 * - Hover state interactions
 *
 * Tailwind classes used (Level 4):
 * - Responsive: sm:, md:, lg: breakpoints
 * - Arbitrary values: [rgba(...)], [clamp(...)], [12px], [#hex]
 * - Transitions: transition-all, duration-*, ease-in-out
 * - Transforms: scale-*, hover:scale-*
 * - Filters: backdrop-blur-[Npx]
 * - Grid: grid, [grid-area:1/1]
 *
 * Tests:
 * - React → WC transformation of responsive utilities
 * - Media query generation
 * - Complex arbitrary value preservation
 * - Transition property combination
 * - Transform property combination
 * - Hover state CSS generation
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinResponsive({ children, className = '' }: SkinProps): JSX.Element {
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
