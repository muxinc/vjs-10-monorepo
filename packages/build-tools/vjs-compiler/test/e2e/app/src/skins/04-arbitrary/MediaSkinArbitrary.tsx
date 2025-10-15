/**
 * Level 4: Arbitrary Values Test Skin
 *
 * Purpose: Test arbitrary value support in Tailwind classes
 *
 * Features:
 * - Arbitrary colors (hex, rgba)
 * - Arbitrary sizing with CSS functions (clamp, calc)
 * - Arbitrary border radius
 * - Arbitrary filters (backdrop-blur)
 * - Arbitrary grid areas
 *
 * Tailwind classes used (Level 4):
 * - Arbitrary colors: bg-[#hex], bg-[rgba(...)]
 * - Arbitrary sizing: w-[clamp(...)], h-[...]
 * - Arbitrary radius: rounded-[12px]
 * - Arbitrary filters: backdrop-blur-[2px]
 *
 * Tests:
 * - React → WC transformation of arbitrary values
 * - Bracket notation parsing
 * - Complex CSS functions preserved
 * - Hover states with arbitrary values
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinArbitrary({ children, className = '' }: SkinProps): JSX.Element {
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
