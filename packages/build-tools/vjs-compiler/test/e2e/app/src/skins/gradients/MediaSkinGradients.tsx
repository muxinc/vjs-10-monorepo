import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinGradients({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Overlay} />
    </MediaContainer>
  );
}
