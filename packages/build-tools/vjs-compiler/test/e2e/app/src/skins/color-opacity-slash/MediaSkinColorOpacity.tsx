/**
 * Level 7: Color Opacity Modifiers Test Skin
 *
 * Purpose: Test Tailwind's slash opacity syntax for semi-transparent colors
 *
 * Features:
 * - Color with opacity: bg-[#000]/50, bg-[#1da1f2]/90
 * - Hover with opacity: hover:bg-[#1da1f2]/100
 * - Ring with opacity: ring-[#fff]/30
 * - Text with opacity: text-[#fff]/95
 * - Multiple opacity levels
 *
 * Tailwind classes used (Level 7):
 * - Opacity modifiers: color/10, color/50, color/90, color/95, color/100
 * - With arbitrary colors: bg-[#hex]/opacity
 * - With hover: hover:bg-[#hex]/opacity
 * - With ring: ring-[#hex]/opacity
 *
 * Tests:
 * - React → WC transformation of opacity modifiers
 * - Slash syntax generates correct alpha values
 * - Opacity works with arbitrary colors
 * - Hover + opacity combination works
 * - Semi-transparent overlays render correctly
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinColorOpacity({ children, className = '' }: SkinProps): JSX.Element {
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
