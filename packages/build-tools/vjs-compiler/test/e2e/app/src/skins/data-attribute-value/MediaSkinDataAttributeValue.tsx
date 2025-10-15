import type { PropsWithChildren } from 'react';
import { MediaContainer } from '../../components/MediaContainer';
import MuteButton from '../../components/MuteButton';
import { VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from '@vjs-10/react-icons';
import styles from './styles';

type SkinProps = PropsWithChildren<{ className?: string }>;

export default function MediaSkinDataAttributeValue({ children, className = '' }: SkinProps): JSX.Element {
  return (
    <MediaContainer className={className}>
      {children}
      <div className={styles.Controls}>
        <MuteButton className={styles.Button}>
          <VolumeHighIcon className={styles.Icon} />
          <VolumeLowIcon className={styles.Icon} />
          <VolumeOffIcon className={styles.Icon} />
        </MuteButton>
      </div>
    </MediaContainer>
  );
}
