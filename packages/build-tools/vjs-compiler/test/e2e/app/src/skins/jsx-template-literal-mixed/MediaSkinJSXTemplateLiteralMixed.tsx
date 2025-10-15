import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXTemplateLiteralMixed({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={`${styles.Container} ${className}`}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={`${styles.TestElement} ${styles.ExtraClass}`}>
            MIXED
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
