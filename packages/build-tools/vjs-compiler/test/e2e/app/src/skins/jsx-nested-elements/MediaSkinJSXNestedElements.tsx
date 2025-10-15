import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXNestedElements({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Controls}>
        <div className={styles.LeftControls}>
          <div className={styles.ButtonGroup}>
            <PlayButton className={styles.Button}>
              <PlayIcon />
              <PauseIcon />
            </PlayButton>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
