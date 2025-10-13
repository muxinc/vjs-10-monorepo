/**
 * Level 1: Minimal Test Skin
 *
 * Purpose: Validate basic compilation pipeline
 * - Single button component
 * - Simple Tailwind utilities (padding, border-radius)
 * - No conditional styles, no variants
 *
 * Tests:
 * - React → WC transformation
 * - Basic CSS generation
 * - Browser loading (no errors)
 * - Custom element registration
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import { MediaPlayButton } from '@vjs-10/react';
import { MediaPlayIcon } from '@vjs-10/react-icons';

import { styles } from './styles.js';
import type { MediaSkinMinimalProps } from './types.js';

export function MediaSkinMinimal({ children }: PropsWithChildren<MediaSkinMinimalProps>) {
  return (
    <MediaContainer className={styles.Container}>
      {children}
      <div className={styles.Controls}>
        <MediaPlayButton className={styles.Button}>
          <MediaPlayIcon />
        </MediaPlayButton>
      </div>
    </MediaContainer>
  );
}
