/**
 * Level 7: Semantic Colors Test Skin
 *
 * Purpose: Test semantic Tailwind color class support
 *
 * Features:
 * - Semantic color classes: bg-blue-500, bg-blue-600
 * - Semantic outline colors: outline-blue-500
 * - Semantic ring colors: ring-blue-300
 * - Semantic text colors: text-white (if used)
 *
 * CURRENT STATUS: ❌ NOT YET SUPPORTED
 *
 * This skin intentionally uses semantic Tailwind color classes to test
 * and document the current limitation in programmatic Tailwind v4 PostCSS usage.
 *
 * Expected Behavior:
 * 1. Compiler will process the skin successfully (no errors)
 * 2. Output will compile to valid TypeScript
 * 3. Output CSS will have empty color values:
 *    - background-color: (empty)
 *    - outline-color: (empty)
 *    - --tw-ring-color: (empty)
 * 4. Visual appearance will be broken (no colors rendered)
 *
 * Comparison with Level 3:
 * - Level 3 uses arbitrary colors: bg-[#3b82f6]
 * - Level 7 uses semantic colors: bg-blue-500
 * - Both compile successfully
 * - Level 3 generates correct CSS, Level 7 generates empty CSS
 *
 * See:
 * - processCSS.ts lines 286-298 for technical details
 * - TEST_SKIN_PROGRESSION.md for Level 7 documentation
 *
 * Tailwind classes used (Level 7):
 * - Semantic colors: bg-blue-500, bg-blue-600
 * - Semantic hover: hover:bg-blue-600
 * - Semantic ring: ring-blue-300
 *
 * Tests:
 * - React → WC transformation compiles without errors
 * - Output is syntactically valid TypeScript
 * - Visual comparison shows colors are missing (expected failure)
 * - Documents the semantic color limitation clearly
 */

import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{
  className?: string;
}>;

export default function MediaSkinSemanticColors({ children, className = '' }: SkinProps): JSX.Element {
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
