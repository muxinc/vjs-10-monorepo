/**
 * Level 1: Minimal Test Skin
 *
 * Purpose: Establish absolute minimum viable skin for E2E baseline validation
 *
 * Features:
 * - Single PlayButton with play/pause icons (standard icon behavior)
 * - Styles defined in separate styles.ts module (following MediaSkinDefault pattern)
 * - Simplest possible layout: centered button overlay
 *
 * Tailwind classes used (all basic utilities):
 * - Layout: relative, absolute, inset-0, flex, items-center, justify-center, pointer-events-none
 * - Spacing: p-3 (padding)
 * - Border: rounded-full
 * - Background: bg-white/80 (opacity variant)
 * - Interactivity: pointer-events-auto
 *
 * NOT included (for higher complexity levels):
 * - Hover states
 * - Data attributes
 * - Custom variants
 * - Multiple buttons
 * - Complex selectors
 *
 * Tests:
 * - React → WC transformation
 * - Basic Tailwind CSS compilation to inline vanilla CSS
 * - Browser loading (no errors)
 * - Custom element registration
 * - Icon rendering
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinMinimal({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Wrapper}>
        <div className={styles.Overlay}>
          <PlayButton className={styles.Button}>
            <PlayIcon />
          </PlayButton>
        </div>
      </div>
    </MediaContainer>
  );
}
