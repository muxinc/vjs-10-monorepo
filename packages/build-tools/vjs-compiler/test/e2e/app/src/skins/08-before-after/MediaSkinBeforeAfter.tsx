/**
 * Level 8: Before/After Pseudo-Elements Test Skin
 *
 * Purpose: Test ::before and ::after pseudo-element support
 *
 * Features:
 * - Before pseudo-element for inner decorative border
 * - After pseudo-element for outer glow effect
 * - Pseudo-element positioning and styling
 * - Rounded corners with inherit
 * - Hover animations on pseudo-elements
 *
 * Tailwind classes used (Level 8):
 * - before:absolute, before:inset-px, before:rounded-[inherit]
 * - after:absolute, after:inset-0, after:bg-[#hex]/opacity
 * - hover:after:bg-[#hex]/opacity - hover affecting after pseudo-element
 * - before:pointer-events-none, after:pointer-events-none
 *
 * Tests:
 * - React → WC transformation of before:/after: utilities
 * - ::before and ::after CSS generation
 * - Content property added automatically
 * - Pseudo-elements layer correctly (z-index handling)
 * - Hover states work on pseudo-elements
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinBeforeAfter({ children, className = '' }: SkinProps): JSX.Element {
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
