import type { PropsWithChildren } from 'react';
import { MediaContainer } from '../../components/MediaContainer';
import PlayButton from '../../components/PlayButton';
import { PlayIcon, PauseIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXTemplateLiteralTwoKeys({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Wrapper}>
        <PlayButton className={`${styles.Button} ${styles.IconButton}`}>
          <PlayIcon />
          <PauseIcon />
        </PlayButton>
      </div>
    </MediaContainer>
  );
}
