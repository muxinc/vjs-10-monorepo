import type { PropsWithChildren } from 'react';
import { MediaContainer } from '@vjs-10/react';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinJSXNestedElements({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      <div className={styles.Wrapper}>
        {children}
        <div className={styles.Overlay}>
          <div className={styles.Outer}>
            <div className={styles.Middle}>
              <div className={styles.TestElement}>
                NESTED
              </div>
            </div>
          </div>
        </div>
      </div>
    </MediaContainer>
  );
}
