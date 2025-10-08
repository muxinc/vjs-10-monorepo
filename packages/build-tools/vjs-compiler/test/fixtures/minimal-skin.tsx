import { MediaContainer, PlayButton } from '@vjs-10/react';
import styles from './styles';

export default function MinimalSkin({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <MediaContainer className={styles.Container}>
      {children}
      <div className={styles.Controls}>
        <PlayButton className={styles.Button} />
      </div>
    </MediaContainer>
  );
}
