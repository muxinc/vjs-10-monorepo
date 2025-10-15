import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXTemplateLiteralTwoKeys({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={`${styles.TestElement} ${styles.RoundedClass}`}>
            TWO KEYS
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
