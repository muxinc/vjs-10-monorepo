/**
 * Level 0: Structural Test Skin (No Styling)
 *
 * Purpose: Establish baseline for structure-only E2E validation
 *
 * Features:
 * - Single PlayButton with play/pause icons
 * - NO className attributes (pure structure)
 * - Simplest possible layout: centered button overlay
 *
 * Tests:
 * - React → WC JSX transformation
 * - Element naming (PlayButton → media-play-button)
 * - Icon imports and usage
 * - Component hierarchy
 * - Browser loading (no errors)
 * - Custom element registration
 *
 * NOT included:
 * - Any styling (Tailwind or otherwise)
 * - Data attributes
 * - Complex layout
 * - Multiple buttons
 *
 * Visual comparison:
 * - Structure/hierarchy only
 * - No visual styling expectations
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';

export default function MediaSkinStructural({ children }: PropsWithChildren): JSX.Element {
  return (
    <MediaContainer>
      {children}
      <div>
        <PlayButton>
          <PlayIcon />
          <PauseIcon />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
