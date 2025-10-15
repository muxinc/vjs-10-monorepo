import type { JSX } from 'react';
import { MediaContainer } from '@vjs-10/react';
import { MediaPlayButton } from '@vjs-10/react';
import { MediaPlayIcon } from '@vjs-10/react-icons';
import styles from './styles';

export interface SkinProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Level 10: Named Groups Test Skin
 *
 * Tests Tailwind's named group feature for nested group interactions.
 *
 * Key features being tested:
 * - Named groups: group/root, group/controls
 * - Named group hover: group-hover/root:bg-[#000]/50
 * - Multiple independent groups in same component
 * - Nested group interactions
 *
 * Expected CSS output:
 * - .group\/root class on wrapper
 * - .group\/controls class on controls container
 * - .group-hover\/root\:bg-\[\#000\]\/50 generates: .group\/root:hover .overlay { ... }
 * - .group-hover\/controls\:ring-2 generates: .group\/controls:hover .button { ... }
 */
export default function MediaSkinNamedGroups({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={styles.ControlsContainer}>
            <MediaPlayButton className={styles.Button}>
              <MediaPlayIcon className={`${styles.PlayIcon} ${styles.Icon}`} />
            </MediaPlayButton>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
