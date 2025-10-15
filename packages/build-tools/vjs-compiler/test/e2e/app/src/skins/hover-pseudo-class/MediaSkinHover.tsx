/**
 * Level 3: Hover and Pseudo-Classes Test Skin
 *
 * Purpose: Test hover, focus, and active pseudo-class support
 *
 * Features:
 * - Hover states with @media (hover: hover) wrapper
 * - Focus states with ring and outline control
 * - Active states with transform
 * - Smooth transitions
 *
 * Tailwind classes used (Level 3):
 * - Hover: hover:bg-*
 * - Focus: focus:ring-*, focus:outline-none
 * - Active: active:scale-*
 * - Transitions: transition-all, duration-*, ease-in-out
 *
 * Tests:
 * - React → WC transformation of pseudo-class utilities
 * - @media (hover: hover) wrapper generation
 * - Focus ring rendering
 * - Active state transform
 * - Transition property combination
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinHover({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Wrapper}>
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
