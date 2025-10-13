/**
 * Level 1: Minimal Test Skin
 *
 * Purpose: Establish absolute minimum viable skin for E2E baseline validation
 *
 * Features:
 * - Single PlayButton with play/pause icons (standard icon behavior)
 * - Inline Tailwind classes (no styles object, no imports needed)
 * - Simplest possible layout: centered button overlay
 *
 * Tailwind classes used (all basic utilities):
 * - Layout: absolute, inset-0, flex, items-center, justify-center
 * - Spacing: p-4 (padding)
 * - Border: rounded-full
 * - Background: bg-white/90 (opacity variant)
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
 * - Basic Tailwind CSS compilation
 * - Browser loading (no errors)
 * - Custom element registration
 * - Icon rendering
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinMinimal({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayButton className="p-4 rounded-full bg-white/90">
          <PlayIcon />
          <PauseIcon />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
