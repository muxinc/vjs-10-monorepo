import type { PropsWithChildren } from 'react';
import { MediaContainer, PlayButton } from '@vjs-10/react';
import { PlayIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXStaticClassName({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className="wrapper">
        <PlayButton className={styles.Button}>
          <PlayIcon />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
