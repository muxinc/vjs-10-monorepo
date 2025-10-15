import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinDataAttributePresence({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={styles.Button}>
          <PlayIcon className={styles.Icon} />
          <PauseIcon className={styles.Icon} />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
